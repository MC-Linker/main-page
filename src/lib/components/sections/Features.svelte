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
    import OreSegments from '$lib/ore/OreSegments.svelte';

    type TabId = (typeof featureTabs)[number]['id'];
    let tab = $state<TabId>('all');
    let query = $state('');
    let selected = $state<Feature>(features[0]);

    const tabName = $derived(featureTabs.find(t => t.id === tab)!.name);
    const shown = $derived(features.filter(f => {
        if(tab !== 'all') return f.tab === tab;
        const q = query.trim().toLowerCase();
        if(!q) return true;
        return [f.name, ...f.lore, ...f.commands].join(' ').toLowerCase().includes(q);
    }));

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

    // Phones: the details are under the inventory, so picking something scrolls to them.
    const narrow = new MediaQuery('(max-width: 900px)', false);
    // Phones get six bigger slots per row instead of nine, so they're easy to tap.
    const small = new MediaQuery('(max-width: 560px)', false);
    const cols = $derived(small.current ? 6 : 9);
    // Always fill whole rows, like a real inventory.
    const slots = $derived.by<(Feature | null)[]>(() => {
        // Every tab and search gets as many rows as the full inventory, so the panel keeps its height.
        const rows = Math.max(2, Math.ceil(features.length / cols), Math.ceil(shown.length / cols));
        return [...shown, ...Array(rows * cols - shown.length).fill(null)];
    });
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
    // The item's details next to the pointer, like hover text in the game: its name, what it
    // does and its commands. Keyboard focus puts it beside the slot. Touch never shows it.
    let tip = $state<{ item: Feature; x: number; y: number } | null>(null);
    let tipW = $state(0);
    let tipH = $state(0);
    let vw = $state(1200);
    let vh = $state(800);
    const tipLeft = $derived(tip ? (tip.x + 16 + tipW > vw - 8 ? Math.max(8, tip.x - 16 - tipW) : tip.x + 16) : 0);
    const tipTop = $derived(tip ? Math.min(Math.max(8, tip.y - 24), vh - tipH - 8) : 0);
    function tipHandlers(item: Feature) {
        const atPointer = (e: PointerEvent) => {
            if(e.pointerType === 'mouse') tip = { item, x: e.clientX, y: e.clientY };
        };
        return {
            onpointerenter: atPointer,
            onpointermove: atPointer,
            onpointerleave: () => (tip = null),
            onfocus: (e: FocusEvent) => {
                const el = e.currentTarget as HTMLElement;
                if(!el.matches(':focus-visible')) return;
                const r = el.getBoundingClientRect();
                tip = { item, x: r.right, y: r.top };
            },
            onblur: () => (tip = null),
        };
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
        <span class="slot big"><McItemIcon icon={item.icon} glint={item.glint} size="2.5rem" /></span>
        <div>
            <h3 class="ore-title" style:color={rarityColor[item.rarity ?? 'common']}>{item.name}</h3>
            <p class="lore">{item.lore.join(' ')}</p>
        </div>
    </header>
    {#if item.commands.length}
        <ul class="cmds">{#each item.commands as c (c)}<li class="ore-tag">{c}</li>{/each}</ul>
    {/if}
    {#if item.preview.options}
        <div class="options">
            {#each item.preview.options as group (group.title)}
                <div class="option">
                    <p class="label ore-text">{group.title}</p>
                    <OreRadioGroup label={group.title} choices={group.choices} />
                </div>
            {/each}
        </div>
    {/if}
    <div class="worlds">
        {#each worldsOf(item) as world (world)}
            {#if world === 'minecraft' && item.preview.mc}
                <div class="world">
                    <p class="label ore-text">In Minecraft</p>
                    <div class="mc-box"><McChat lines={item.preview.mc.map((text, id) => ({ id, text: text.replace(/^> /, '&f') }))} /></div>
                </div>
            {:else if world === 'discord' && hasDiscord(item)}
                <div class="world">
                    <p class="label ore-text">In Discord</p>
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
{/snippet}

<svelte:window bind:innerWidth={vw} bind:innerHeight={vh} onscroll={() => (tip = null)} />

{#if tip}
    <div class="item-tip" role="tooltip" bind:offsetWidth={tipW} bind:offsetHeight={tipH} style:left="{tipLeft}px" style:top="{tipTop}px">
        <p class="t-name" style:color={rarityColor[tip.item.rarity ?? 'common']}>{tip.item.name}</p>
        {#each tip.item.lore as line, i (i)}<p class="t-lore">{line}</p>{/each}
        {#each tip.item.commands as c (c)}<p class="t-cmd">{c}</p>{/each}
        {#if tip.item.id !== selected.id}<p class="t-hint">Click to preview</p>{/if}
    </div>
{/if}

<section id="features" class="features" aria-labelledby="features-title">
    <header class="section-head">
        <p class="kicker ore-text">Features</p>
        <h2 id="features-title" class="ore-title">Everything MC Linker can do</h2>
        <p>Pick a feature to see how it looks in Minecraft and in Discord.</p>
    </header>

    <div class="browser">
        <div class="inv-col">
            <OreSegments
                items={featureTabs.map(t => ({ id: t.id, label: t.name, title: t.name }))} selected={tab} onselect={id => { tab = id as TabId; tip = null; }}
                look="tabs" mode="tabs" label="Feature categories" controls="feature-list" fill iconOnly class="tabs"
            >
                {#snippet icon(s)}<McItemIcon icon={featureTabs.find(t => t.id === s.id)!.icon} size="1.5rem" />{/snippet}
            </OreSegments>
            <!-- The inventory: an Ore UI container with the game's item slots, one feature per slot. -->
            <div class="ore-card raised inventory" id="feature-list" role="tabpanel" aria-label={tabName}>
                <div class="ore-header inv-head">
                    <p class="inv-title ore-title">{tab === 'all' ? 'Inventory' : tabName}</p>
                    <!-- Only the full inventory can be searched; the other tabs keep its space so the panel doesn't resize. -->
                    <label class="search" class:off={tab !== 'all'} inert={tab !== 'all'}>
                        <span class="sr-only">Search features</span>
                        <input class="ore-field" type="search" placeholder="Search..." bind:value={query} oninput={() => (tip = null)} />
                    </label>
                </div>
                <ul class="slots" style:--cols={cols}>
                    {#each slots as item, i (item?.id ?? `empty-${i}`)}
                        <li>
                            {#if item}
                                <button
                                    type="button" class="slot" class:on={item.id === selected.id}
                                    aria-label={item.name} aria-pressed={item.id === selected.id} onclick={() => pick(item)}
                                    {...tipHandlers(item)}
                                >
                                    <McItemIcon icon={item.icon} glint={item.glint} size="72%" />
                                </button>
                            {:else}
                                <span class="slot empty" aria-hidden="true"></span>
                            {/if}
                        </li>
                    {/each}
                </ul>
                {#if shown.length === 0}<p class="none">Nothing found. Try "chat", "roles" or "/ban".</p>{/if}
                <p class="count ore-text">{features.length} features · all free</p>
            </div>
        </div>

            <!-- The selected feature: what it does, its commands, and how it looks in both worlds. -->
            <div class="detail-cell" bind:this={cell} style:min-height={tallest ? `${tallest}px` : undefined}>
                {#if measuring}
                    {#each sizes as v, i (i)}
                        <div class="ore-card dark raised detail sizer" aria-hidden="true" inert>{@render panel(v.item, v.pg, v.fu)}</div>
                    {/each}
                {/if}
                {#key selected.id}
                    <article class="ore-card dark raised detail" bind:this={detail} in:fade={{ duration: 160 }} aria-live="polite">
                        {@render panel(selected, page, followUp)}
                    </article>
                {/key}
            </div>
    </div>
</section>

<style>
    .features { padding: clamp(4rem, 9vw, 6.5rem) 1rem clamp(4rem, 8vw, 6rem); background: var(--color-ore-deep); }
    .section-head { margin-bottom: clamp(2rem, 5vw, 3rem); }

    .browser { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 1.5rem; align-items: start; max-width: 72rem; margin: 0 auto; }
    /* Creative-style tabs on top of the inventory: icons, the chosen one's name in the title bar. */
    .inv-col :global(.tabs) { position: relative; z-index: 1; margin-bottom: calc(-1 * var(--t)); }
    /* Pointing at a tab lights it up and lifts its icon a little. */
    .inv-col :global(.tabs .seg:not(.sunk):hover) { --face: #6d6d6e; --hi: #8c8d90; --shade: #7a7a7c; }
    .inv-col :global(.tabs .seg:not(.sunk):hover .label) { transform: translateY(calc(-1 * var(--t))); }

    /* ── The inventory ─────────────────────────────────────────────────── */
    .inventory { padding-inline: 0; }
    .inv-head { display: flex; align-items: center; gap: 0.75rem; min-height: 3.25rem; padding: 0.5rem 0.75rem calc(0.5rem + 3 * var(--t)); }
    .inv-title { flex: 1; margin: 0; font-size: 1.1rem; color: #000; white-space: nowrap; }
    .search { flex: 0 1 11rem; min-width: 0; }
    .search.off { visibility: hidden; }
    .search input { display: block; width: 100%; height: 2.25rem; padding: calc(2 * var(--t)) 0.6rem 0; font-size: 1rem; }
    .slots { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: var(--t); margin: 0; padding: 0.75rem 0.75rem 0; list-style: none; }
    /* The game's item slot: grey, shaded in at the top left. */
    .slot {
        position: relative; display: grid; place-items: center; width: 100%; aspect-ratio: 1; padding: 0;
        border: 0; background: #8b8b8b; box-shadow: inset var(--t) var(--t) 0 #373737, inset calc(-1 * var(--t)) calc(-1 * var(--t)) 0 #fff;
        cursor: pointer;
    }
    .slot.empty { cursor: default; }
    .slot:not(.empty, .big):hover::before { content: ''; position: absolute; inset: var(--t); background: rgb(255 255 255 / 0.35); }
    /* The chosen one: a white frame, like the selected hotbar slot. */
    .slot.on { z-index: 1; outline: calc(2 * var(--t)) solid #fff; outline-offset: calc(-1 * var(--t)); box-shadow: 0 0 0 calc(3 * var(--t)) #1e1e1f; }
    .slot:focus-visible { z-index: 2; }
    /* The item's hover text: the same dark box as the tabs' names, with the item's details. */
    .item-tip {
        position: fixed; z-index: 90; max-width: 18rem; padding: 0.45rem 0.6rem; pointer-events: none;
        border: var(--t) solid #1e1e1f; background: rgb(49 50 51 / 0.97); box-shadow: inset 0 0 0 var(--t) #48494a;
        font-family: var(--font-pixel); font-size: 0.9rem; line-height: 1.35; color: #fff;
    }
    .item-tip p { margin: 0; }
    .t-name { margin-bottom: 0.15rem !important; font-size: 1rem; }
    .t-lore { color: #d0d1d4; }
    .t-cmd { color: var(--color-mc-yellow); }
    .t-hint { margin-top: 0.25rem !important; color: #8c8d90; }
    .slot.big { width: 3.5rem; flex: none; cursor: default; border: var(--t) solid #1e1e1f; }
    .none { margin: 0.75rem 0.75rem 0; color: var(--color-ore-white); }
    .count { margin: 0.75rem 0.75rem 0.25rem; font-size: 0.875rem; color: var(--color-ore-white); }

    /* ── The selected feature ──────────────────────────────────────────── */
    .detail-cell { display: grid; }
    .detail-cell > * { grid-area: 1 / 1; min-width: 0; }
    /* The hidden copies only hold the cell's height; the shown panel keeps its own size. */
    .sizer { visibility: hidden; }
    .detail-cell > article { align-self: start; }
    .detail { padding: 1.25rem 1.25rem calc(1.25rem + 3 * var(--t)); scroll-margin-top: 1rem; }
    .detail :global(.guide) { margin-top: 0.25rem; }
    .d-head { display: flex; align-items: center; gap: 1rem; }
    /* The item in an inventory slot. */
    h3 { margin: 0; font-size: 1.5rem; line-height: 1.2; }
    .lore { margin: 0.3rem 0 0; color: #d0d1d4; line-height: 1.5; }
    .cmds { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 1rem 0 0; padding: 0; list-style: none; }
    .cmds li { color: var(--color-mc-yellow); font-size: 0.875rem; }
    .label { margin: 0 0 0.45rem; font-size: 0.875rem; color: var(--color-mc-gray); }
    .options { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.25rem; }
    .worlds { display: flex; flex-direction: column; gap: 1rem; margin: 1.25rem 0; }
    .worlds:empty { display: none; }
    .mc-box { padding: 0.75rem; border: var(--t) solid #1e1e1f; background: linear-gradient(#78a6f7, #b4d3ff); font-size: 0.9rem; }
    .dc-box { display: block; padding: 0.5rem 1rem; background: var(--color-dc); border-radius: 8px; line-height: 1.375; }
    .shot { display: block; max-width: 100%; height: auto; margin-top: 0.5rem; border-radius: 8px; }

    @media (max-width: 900px) {
        .browser { grid-template-columns: minmax(0, 1fr); }
    }
    @media (max-width: 560px) {
        .detail { padding: 1rem 0.9rem calc(1rem + 3 * var(--t)); }
        .inv-head { flex-wrap: wrap; }
        .search { flex: 1 1 100%; }
    }
</style>
