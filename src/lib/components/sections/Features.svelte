<script lang="ts">
    import { MediaQuery } from 'svelte/reactivity';
    import { fade } from 'svelte/transition';
    import { scrollBehavior } from '$lib/browser';
    import { type Feature, features, featureTabs } from '$lib/data';
    import DcMessage from '$lib/discord/DcMessage.svelte';
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
    let page = $state(0);
    let followUp = $state<{ command: string; response: string } | null>(null);
    const paged = $derived.by<DcMsg | null>(() => {
        const p = selected.preview.paged;
        if(!p) return null;
        const current = p.pages[page];
        return {
            id: 1, author: p.author, interaction: p.interaction, embeds: current.embeds,
            buttons: p.pages.map((pg, i) => ({
                label: pg.label,
                style: i === page ? 'primary' : (pg.style ?? 'secondary'),
                onclick: () => { page = i; followUp = null; },
            })),
            buttonRows: current.actions && [current.actions.map(a => ({ label: a.label, style: a.style, onclick: () => { followUp = a.followUp ?? null; } }))],
        };
    });
    const followUpMsg = $derived<DcMsg | null>(followUp && {
        id: 2, author: bot, ephemeral: true,
        embeds: [{ color: colors.blue, title: 'Command Executed', description: `Command: \`${followUp.command}\`\n${followUp.response}` }],
    });
    const hasDiscord = $derived(!!(selected.preview.dc || selected.preview.paged || selected.preview.images));
    // The world a feature starts in comes first.
    const worlds = $derived((selected.from === 'discord' ? ['discord', 'minecraft'] : ['minecraft', 'discord']) as ('discord' | 'minecraft')[]);

    // Phones: the details are under the list, so picking something scrolls to them.
    const narrow = new MediaQuery('(max-width: 900px)', false);
    let detail = $state<HTMLElement>();
    function pick(item: Feature) {
        selected = item;
        page = 0;
        followUp = null;
        if(narrow.current) setTimeout(() => detail?.scrollIntoView({ block: 'start', behavior: scrollBehavior() }), 60);
    }
</script>

<section id="features" class="features" aria-labelledby="features-title">
    <header class="section-head">
        <p class="kicker ore-text">Features</p>
        <h2 id="features-title" class="ore-title">Everything MC Linker can do</h2>
        <p>Pick a feature to see how it looks in Minecraft and in Discord.</p>
    </header>

    <div class="browser">
        <OreSegments
            items={featureTabs.map(t => ({ id: t.id, label: t.name, title: t.name }))} selected={tab} onselect={id => (tab = id as TabId)}
            look="tabs" mode="tabs" label="Feature categories" controls="feature-list" fill class="tabs"
        >
            {#snippet icon(s)}<McItemIcon icon={featureTabs.find(t => t.id === s.id)!.icon} size="1.5rem" />{/snippet}
        </OreSegments>

        <div class="ore-card panel">
            <div class="catalog" id="feature-list" role="tabpanel" aria-label={tabName}>
                {#if tab === 'all'}
                    <label class="search">
                        <span class="sr-only">Search features</span>
                        <input class="ore-field" type="search" placeholder="Search..." bind:value={query} />
                    </label>
                {/if}
                <ul class="tiles">
                    {#each shown as item (item.id)}
                        {@const on = item.id === selected.id}
                        <li>
                            <button type="button" class="tile ore-face {on ? 'ore-green sunk marked' : 'ore-dark'}" aria-pressed={on} onclick={() => pick(item)}>
                                <span class="tile-in">
                                    <McItemIcon icon={item.icon} glint={item.glint} size="2.25rem" />
                                    <span class="tile-name ore-text">{item.name}</span>
                                </span>
                            </button>
                        </li>
                    {/each}
                </ul>
                {#if shown.length === 0}<p class="none">Nothing found. Try "chat", "roles" or "/ban".</p>{/if}
                <p class="count ore-text">{features.length} features · all free</p>
            </div>

            <!-- The selected feature: what it does, its commands, and how it looks in both worlds. -->
            {#key selected.id}
                <article class="ore-card dark raised detail" bind:this={detail} in:fade={{ duration: 160 }} aria-live="polite">
                    <header class="d-head">
                        <span class="slot"><McItemIcon icon={selected.icon} glint={selected.glint} size="2.5rem" /></span>
                        <div>
                            <h3 class="ore-title" style:color={rarityColor[selected.rarity ?? 'common']}>{selected.name}</h3>
                            <p class="lore">{selected.lore.join(' ')}</p>
                        </div>
                    </header>
                    {#if selected.commands.length}
                        <ul class="cmds">{#each selected.commands as c (c)}<li class="ore-tag">{c}</li>{/each}</ul>
                    {/if}
                    {#if selected.preview.options}
                        <div class="options">
                            {#each selected.preview.options as group (group.title)}
                                <div class="option">
                                    <p class="label ore-text">{group.title}</p>
                                    <OreRadioGroup label={group.title} choices={group.choices} />
                                </div>
                            {/each}
                        </div>
                    {/if}
                    <div class="worlds">
                        {#each worlds as world (world)}
                            {#if world === 'minecraft' && selected.preview.mc}
                                <div class="world">
                                    <p class="label ore-text">In Minecraft</p>
                                    <div class="mc-box"><McChat lines={selected.preview.mc.map((text, id) => ({ id, text: text.replace(/^> /, '&f') }))} /></div>
                                </div>
                            {:else if world === 'discord' && hasDiscord}
                                <div class="world">
                                    <p class="label ore-text">In Discord</p>
                                    {#if selected.preview.dc || paged}
                                        <discord-messages no-background class="dc-box">
                                            {#each selected.preview.dc ?? [] as msg, i (i)}<DcMessage msg={{ ...msg, id: i }} />{/each}
                                            {#if paged}<DcMessage msg={paged} />{/if}
                                            {#if followUpMsg}<DcMessage msg={followUpMsg} />{/if}
                                        </discord-messages>
                                    {/if}
                                    {#each selected.preview.images ?? [] as img (img.src)}
                                        <img class="shot" src={img.src} alt={img.alt} />
                                    {/each}
                                </div>
                            {/if}
                        {/each}
                    </div>
                    <OreButton href={selected.guide} class="guide">Read the guide</OreButton>
                </article>
            {/key}
        </div>
    </div>
</section>

<style>
    .features { padding: clamp(4rem, 9vw, 6.5rem) 1rem clamp(4rem, 8vw, 6rem); background: var(--color-ore-deep); }
    .section-head { margin-bottom: clamp(2rem, 5vw, 3rem); }

    .browser { max-width: 72rem; margin: 0 auto; }
    .browser :global(.tabs) { position: relative; z-index: 1; margin-bottom: calc(-1 * var(--t)); }
    .panel { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 1.25rem; align-items: start; padding: 1.25rem; }

    /* ── The list: a search field and a grid of tiles ─────────────────── */
    .search { display: block; margin-bottom: 0.9rem; }
    .search input { display: block; width: 100%; height: 2.75rem; padding: calc(2 * var(--t)) 0.75rem 0; }
    .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr)); gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
    .tile { display: block; width: 100%; height: 100%; min-height: 6rem; padding: 0.6rem 0.35rem; cursor: pointer; }
    .tile-in { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; height: 100%; }
    .tile-name { font-size: 0.875rem; line-height: 1.2; text-align: center; text-wrap: balance; }
    .none { margin: 0.75rem 0 0; color: var(--color-ore-white); }
    .count { margin: 1rem 0 0; font-size: 0.875rem; color: var(--color-ore-white); }

    /* ── The selected feature ──────────────────────────────────────────── */
    .detail { padding: 1.25rem 1.25rem calc(1.25rem + 3 * var(--t)); scroll-margin-top: 1rem; }
    .d-head { display: flex; align-items: center; gap: 1rem; }
    /* The item in an inventory slot. */
    .slot { display: grid; place-items: center; flex: none; width: 3.5rem; height: 3.5rem; border: var(--t) solid #1e1e1f; background: #8b8b8b; box-shadow: inset var(--t) var(--t) 0 #373737, inset calc(-1 * var(--t)) calc(-1 * var(--t)) 0 #fff; }
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
    .detail :global(.guide) { margin-top: 0.25rem; }

    /* Smaller screens: icons only on the tabs (the name stays for screen readers and as a tooltip). */
    @media (max-width: 1100px) {
        .browser :global(.tabs .label > span:last-child) { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    }
    @media (max-width: 900px) {
        .panel { grid-template-columns: 1fr; padding: 1rem; }
    }
    @media (max-width: 560px) {
        .panel { padding: 0.75rem; }
        .tiles { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.4rem; }
        .tile { min-height: 5.5rem; }
        .detail { padding: 1rem 0.9rem calc(1rem + 3 * var(--t)); }
    }
    /* The smallest phones: two tiles a row, so names like "Advancements" fit. */
    @media (max-width: 374px) {
        .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
</style>
