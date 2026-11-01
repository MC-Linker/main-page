<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { MediaQuery } from 'svelte/reactivity';
    import { fade } from 'svelte/transition';
    import { scrollBehavior } from '$lib/browser';
    import { type Feature, features, featureTabs } from '$lib/data';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import { registerDiscord } from '$lib/discord/register';
    import { bot, colors, type DcMsg } from '$lib/discord/types';
    import { rarityColor } from '$lib/mc/item';
    import McChat from '$lib/mc/McChat.svelte';
    import McItemIcon from '$lib/mc/McItemIcon.svelte';
    import OreButton from '$lib/ore/OreButton.svelte';
    import OreRadioGroup from '$lib/ore/OreRadioGroup.svelte';

    type TabId = (typeof featureTabs)[number]['id'];
    let tab = $state<TabId>(featureTabs[0].id);
    let selected = $state<Feature>(features[0]);

    const shown = $derived(features.filter(f => f.tab === tab));
    const countOf = (id: TabId) => features.filter(f => f.tab === id).length;

    // Messages with pages (/userinfo, /serverinfo): the buttons switch the page and admin buttons answer privately.
    type FollowUp = { command: string; response: string };
    let page = $state(0);
    let followUp = $state<FollowUp | null>(null);
    function pagedMsg(item: Feature, pg: number): DcMsg | null {
        const p = item.preview.paged;
        if(!p) return null;
        const current = p.pages[pg];
        return {
            id: 1, author: p.author, interaction: p.interaction, embeds: current.embeds,
            buttons: p.pages.map((pg2, i) => ({
                label: pg2.label,
                style: i === pg ? 'primary' : (pg2.style ?? 'secondary'),
                onclick: () => { page = i; followUp = null; },
            })),
            buttonRows: current.actions && [current.actions.map(a => ({ label: a.label, style: a.style, onclick: () => { followUp = a.followUp ?? null; } }))],
        };
    }
    function followUpMsg(fu: FollowUp | null): DcMsg | null {
        return fu && {
            id: 2, author: bot, ephemeral: true,
            embeds: [{ color: colors.blue, title: 'Command Executed', description: `Command: \`${fu.command}\`\n${fu.response}` }],
        };
    }
    const hasDiscord = (item: Feature) => !!(item.preview.dc || item.preview.paged || item.preview.images);
    // The world a feature starts in comes first.
    const worldsOf = (item: Feature) => (item.from === 'discord' ? ['discord', 'minecraft'] : ['minecraft', 'discord']) as ('discord' | 'minecraft')[];

    // Every state the details panel can be in: each feature, each page of a paged message, and
    // each page with its longest private answer. The panel is kept as tall as the tallest, so picking
    // an item never resizes the section. To find that height, hidden copies of all of them are drawn
    // in the browser for a moment (not in the page's HTML), measured, and removed again; again
    // when the column's width changes.
    const sizes = features.flatMap(f => {
        const pages = f.preview.paged?.pages;
        if(!pages) return [{ item: f, pg: 0, fu: null as FollowUp | null }];
        return pages.flatMap((p, i) => {
            const answers = (p.actions ?? []).map(a => a.followUp).filter(Boolean) as FollowUp[];
            const longest = answers.sort((x, y) => y.response.length - x.response.length)[0];
            return [{ item: f, pg: i, fu: null as FollowUp | null }, ...(longest ? [{ item: f, pg: i, fu: longest }] : [])];
        });
    });

    // Phones: the details are under the list, so picking something scrolls to them.
    const narrow = new MediaQuery('(max-width: 900px)', false);
    let detail = $state<HTMLElement>();

    let cell: HTMLElement;
    let measuring = $state(false);
    let tallest = $state(0);
    const frame = () => new Promise(r => requestAnimationFrame(r));
    async function measure() {
        await Promise.all([registerDiscord(), document.fonts.ready]);
        measuring = true;
        await tick();
        // The Discord elements draw themselves a moment after they're added.
        const parts = [...cell.querySelectorAll('.sizer *')] as (Element & { updateComplete?: Promise<unknown> })[];
        await Promise.all(parts.map(el => el.updateComplete).filter(Boolean));
        await frame();
        await frame();
        tallest = Math.max(0, ...[...cell.querySelectorAll<HTMLElement>('.sizer')].map(el => el.offsetHeight));
        measuring = false;
    }

    onMount(() => {
        // When the page is idle, then whenever the column's width changes (that changes the heights).
        let width = 0;
        let timer = 0;
        const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
        const resize = new ResizeObserver(([entry]) => {
            const w = Math.round(entry.contentRect.width);
            if(w === width) return;
            const first = !width;
            width = w;
            clearTimeout(timer);
            timer = window.setTimeout(() => idle(() => void measure()), first ? 0 : 250);
        });
        resize.observe(cell);
        return () => {
            resize.disconnect();
            clearTimeout(timer);
        };
    });
    let tabBar: HTMLElement;
    function chooseTab(id: TabId) {
        tab = id;
        selected = features.find(f => f.tab === id)!;
        page = 0;
        followUp = null;
    }
    // The tabs move with the arrow keys, like the game's controller navigation.
    function tabKeys(e: KeyboardEvent) {
        const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if(!step) return;
        e.preventDefault();
        const i = (featureTabs.findIndex(t => t.id === tab) + step + featureTabs.length) % featureTabs.length;
        chooseTab(featureTabs[i].id);
        tabBar.querySelectorAll<HTMLElement>('[role="tab"]')[i]?.focus();
    }

    function pick(item: Feature) {
        selected = item;
        page = 0;
        followUp = null;
        if(narrow.current) setTimeout(() => detail?.scrollIntoView({ block: 'start', behavior: scrollBehavior() }), 60);
    }
</script>

{#snippet panel(item: Feature, pg: number, fu: FollowUp | null)}
    {@const paged = pagedMsg(item, pg)}
    {@const answer = followUpMsg(fu)}
    <header class="d-head">
        <span class="d-icon"><McItemIcon icon={item.icon} glint={item.glint} size={narrow.current ? '3rem' : '4rem'} /></span>
        <div class="d-text">
            <h3 class="ore-title" style:color={rarityColor[item.rarity ?? 'common']}>{item.name}</h3>
            <p class="lore">{item.lore.join(' ')}</p>
            {#if item.commands.length}
                <ul class="cmds" aria-label="Commands">{#each item.commands as c (c)}<li><code>{c}</code></li>{/each}</ul>
            {/if}
        </div>
    </header>
    <div class="d-body">
    {#if item.preview.options}
        <div class="options">
            {#each item.preview.options as group (group.title)}
                <div class="option">
                    <p class="label ore-label">{group.title}</p>
                    <OreRadioGroup label={group.title} choices={group.choices} />
                </div>
            {/each}
        </div>
    {/if}
    <div class="worlds">
        {#each worldsOf(item) as world (world)}
            {#if world === 'minecraft' && item.preview.mc}
                <div class="world">
                    <p class="label ore-label">In Minecraft</p>
                    <div class="mc-box"><McChat lines={item.preview.mc.map((text, id) => ({ id, text: text.replace(/^> /, '&f') }))} /></div>
                </div>
            {:else if world === 'discord' && hasDiscord(item)}
                <div class="world">
                    <p class="label ore-label">In Discord</p>
                    {#if item.preview.dc || paged}
                        <discord-messages no-background class="dc-box">
                            {#each item.preview.dc ?? [] as msg, i (i)}<DcMessage msg={{ ...msg, id: i }} />{/each}
                            {#if paged}<DcMessage msg={paged} />{/if}
                            {#if answer}<DcMessage msg={answer} />{/if}
                        </discord-messages>
                    {/if}
                    {#each item.preview.images ?? [] as img (img.src)}
                        <img class="shot" src={img.src} alt={img.alt} width={img.width} height={img.height} loading="lazy" />
                    {/each}
                </div>
            {/if}
        {/each}
    </div>
    <OreButton href={item.guide} external class="guide">Read the guide</OreButton>
    </div>
{/snippet}

<section id="features" class="features" aria-labelledby="features-title">
    <header class="section-head">
        <p class="kicker ore-text">Features</p>
        <h2 id="features-title" class="ore-title">Everything MC Linker can do</h2>
        <p>Pick a feature to see how it looks in Minecraft and in Discord.</p>
    </header>

    <div class="browser">
        <!-- Ore UI tabs, one per category, each with its icon, name and how many features it has. -->
        <div class="tabs" role="tablist" aria-label="Feature categories" bind:this={tabBar} onkeydown={tabKeys} tabindex="-1">
            {#each featureTabs as t (t.id)}
                {@const on = t.id === tab}
                <button
                    type="button" role="tab" id="tab-{t.id}" class="tab ore-face ore-dark" class:sunk={on} class:marked={on}
                    aria-selected={on} aria-controls="feature-list" tabindex={on ? 0 : -1} onclick={() => chooseTab(t.id)}
                >
                    <span class="tab-label">
                        <McItemIcon icon={t.icon} size="1.5rem" />
                        <span class="ore-text">{t.name}</span>
                        <span class="tab-count ore-text" aria-label="({countOf(t.id)} features)">{countOf(t.id)}</span>
                    </span>
                </button>
            {/each}
        </div>

        <div class="cols">
            <!-- The category's features, each with its icon, name and what it does, so nothing has to be hovered to be read. -->
            <div id="feature-list" role="tabpanel" aria-labelledby="tab-{tab}">
                <ul class="list">
                    {#each shown as item (item.id)}
                        {@const on = item.id === selected.id}
                        <li>
                            <button type="button" class="row" class:on aria-pressed={on} onclick={() => pick(item)}>
                                <span class="row-icon"><McItemIcon icon={item.icon} glint={item.glint} size="2.75rem" /></span>
                                <span class="row-text">
                                    <span class="row-name ore-text">{item.name}</span>
                                    <span class="row-lore">{item.lore.join(' ')}</span>
                                </span>
                            </button>
                        </li>
                    {/each}
                </ul>
            </div>

            <!-- The selected feature: what it does, its commands, and how it looks in both worlds. -->
            <!-- On phones the details are last in the section, so they can change height freely. -->
            <div class="detail-cell" bind:this={cell} style:min-height={tallest && !narrow.current ? `${tallest}px` : undefined}>
                {#if measuring}
                    {#each sizes as v, i (i)}
                        <div class="ore-card raised detail sizer" aria-hidden="true" inert>{@render panel(v.item, v.pg, v.fu)}</div>
                    {/each}
                {/if}
                {#key selected.id}
                    <article class="ore-card raised detail" bind:this={detail} in:fade={{ duration: 160 }} aria-live="polite">
                        {@render panel(selected, page, followUp)}
                    </article>
                {/key}
            </div>
        </div>
    </div>
</section>

<style>
    .features { padding: clamp(4rem, 9vw, 6.5rem) 1rem clamp(4rem, 8vw, 6rem); background: var(--color-ore-deep); }
    .section-head { margin-bottom: clamp(2rem, 5vw, 3rem); }
    .browser { max-width: 72rem; margin: 0 auto; }

    /* ── The category tabs ─────────────────────────────────────────────── */
    .tabs { display: flex; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .tabs:focus { outline: none; }
    .tab { flex: 1 1 auto; display: inline-flex; align-items: center; justify-content: center; min-height: 3rem; padding-inline: 1rem; cursor: pointer; }
    .tab + .tab { margin-left: calc(-1 * var(--t)); }
    .tab:focus-visible { z-index: 1; }
    .tab-label { display: inline-flex; align-items: center; gap: 0.6rem; font-size: 1rem; line-height: 1; white-space: nowrap; }
    .tab-count { color: var(--color-ore-mid); }
    .tab:not(.sunk):hover .tab-label { transform: translateY(calc(-1 * var(--t))); }

    .cols { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.25fr); gap: 1.5rem; align-items: start; }

    /* ── The feature list ─────────────────────────────────────────────── */
    .list { display: flex; flex-direction: column; gap: calc(2 * var(--t)); margin: 0; padding: 0; list-style: none; }
    .row {
        display: flex; align-items: center; gap: 0.9rem; width: 100%; padding: 0.7rem 0.9rem;
        border: var(--t) solid var(--color-ore-outline); background: var(--color-ore-card); color: #fff; font: inherit; text-align: left; cursor: pointer;
        box-shadow: inset var(--t) var(--t) 0 #5a5b5c, inset 0 calc(-2 * var(--t)) 0 var(--color-ore-dark);
    }
    .row:hover { background: #58585a; }
    .row.on { background: var(--color-ore-dark); box-shadow: inset 0 0 0 var(--t) #5a5b5c; }
    .row.on .row-name { color: #55ffff; }
    .row:focus-visible { position: relative; z-index: 1; outline-offset: 0; }
    .row-icon { display: grid; place-items: center; flex: none; width: 2.75rem; height: 2.75rem; }
    .row-text { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
    .row-name { font-size: 1.05rem; line-height: 1; }
    .row-lore { font-size: 0.875rem; line-height: 1.4; color: var(--color-ore-silver); }

    /* ── The selected feature ──────────────────────────────────────────── */
    .detail-cell { display: grid; }
    .detail-cell > * { grid-area: 1 / 1; min-width: 0; }
    /* The hidden copies only hold the cell's height; the shown panel keeps its own size. */
    .sizer { visibility: hidden; }
    .detail-cell > article { align-self: start; }
    .detail { padding: 0 0 calc(3 * var(--t)); scroll-margin-top: 4.5rem; background: var(--color-ore-dark); }
    .d-head { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem 1.5rem 1.25rem; background: var(--color-ore-card); border-bottom: var(--t) solid var(--color-ore-outline); }
    .d-icon { display: grid; place-items: center; flex: none; width: 4.5rem; height: 4.5rem; }
    .d-text { min-width: 0; }
    h3 { margin: 0; font-size: 1.75rem; line-height: 1.1; text-transform: uppercase; }
    .lore { margin: 0.45rem 0 0; color: var(--color-ore-white); line-height: 1.5; }
    .cmds { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.75rem 0 0; padding: 0; list-style: none; }
    .cmds code { display: inline-block; padding: 0.3rem 0.5rem; background: var(--color-ore-outline); color: var(--color-mc-green); font-family: var(--font-pixel); font-size: 0.875rem; line-height: 1; }
    .d-body { padding: 1.25rem 1.5rem; }
    .d-body :global(.guide) { margin-top: 0.25rem; }
    .label { margin: 0 0 0.6rem; font-size: 0.8rem; color: var(--color-ore-mid); }
    .options { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }
    .worlds { display: flex; flex-direction: column; gap: 1.25rem; margin: 0 0 1.25rem; }
    .worlds:empty { display: none; }
    .mc-box { padding: 0.75rem; border: var(--t) solid #1e1e1f; background: linear-gradient(#78a6f7, #b4d3ff); font-size: 0.9rem; }
    .dc-box { display: block; padding: 0.5rem 1rem; background: var(--color-dc); border: 1px solid #1e1f22; border-radius: 8px; line-height: 1.375; }
    .shot { display: block; max-width: 100%; height: auto; margin-top: 0.5rem; border-radius: 8px; }

    @media (max-width: 900px) {
        .cols { grid-template-columns: minmax(0, 1fr); }
    }
    @media (max-width: 560px) {
        .tab { padding-inline: 0.7rem; min-height: 2.75rem; }
        .tab-label { gap: 0.45rem; font-size: 0.9rem; }
        .d-head { padding: 1.1rem 1rem 1rem; gap: 0.9rem; }
        .d-icon { width: 3rem; height: 3rem; }
        /* Two tabs a row, the last one alone across the whole row. */
        .tabs { display: grid; grid-template-columns: 1fr 1fr; }
        .tab + .tab { margin-left: 0; }
        .tab { margin-bottom: calc(-1 * var(--t)); }
        .tab:nth-child(even) { margin-left: calc(-1 * var(--t)); }
        .tab:last-child:nth-child(odd) { grid-column: span 2; }
        h3 { font-size: 1.35rem; }
        .d-body { padding: 1rem; }
    }
</style>
