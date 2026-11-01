<script lang="ts">
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { platformNotes, platforms } from '$lib/data';
    import OreButton from '$lib/ore/OreButton.svelte';
    import StepCard from './StepCard.svelte';

    // Picking the server software from a server list, like the Servers tab of the game's Play screen.
    let platform = $state(platforms[0].id);
    let list: HTMLElement;

    // The list works like one control: arrow keys move the choice (and focus) up and down.
    function listKeys(e: KeyboardEvent) {
        const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if(!step) return;
        e.preventDefault();
        const i = (platforms.findIndex(p => p.id === platform) + step + platforms.length) % platforms.length;
        platform = platforms[i].id;
        list.querySelectorAll<HTMLElement>('[role="radio"]')[i]?.focus();
    }
</script>

<!-- Step 2 happens in Minecraft: pick your server software and download the plugin or mod. -->
<StepCard step={2} id="install">
    {#snippet title()}Install the Discord-Linker plugin{/snippet}
    <div class="split">
        <!-- The server list: one entry per server software. -->
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <div class="list" role="radiogroup" aria-label="Server software" bind:this={list} onkeydown={listKeys}>
            {#each platforms as p (p.id)}
                {@const on = platform === p.id}
                <button type="button" class="server" class:on role="radio" aria-checked={on} tabindex={on ? 0 : -1} onclick={() => (platform = p.id)}>
                    <span class="icon"><img src={p.icon.src} alt="" width="48" height="48" class:pixelated={p.icon.pixelated} /></span>
                    <span class="info">
                        <span class="name ore-text">{p.name}</span>
                        <span class="motd ore-text">Minecraft {p.versions}</span>
                        <span class="motd ore-text">Goes in <span class="folder">{p.folder}/</span></span>
                    </span>
                </button>
            {/each}
        </div>

        <!-- Every platform's downloads share one grid cell and only the chosen one shows, so switching never changes the step's height. -->
        <div class="downloads">
            {#each platforms as p (p.id)}
                {@const on = platform === p.id}
                <div class="dl" class:on aria-hidden={!on} inert={!on}>
                    <p class="label ore-text">Download for {p.name}</p>
                    <div class="buttons">
                        {#each p.downloads as d (d.name)}
                            <OreButton
                                href={d.href} external disabled={d.disabled}
                                variant={d.recommended ? 'primary' : 'secondary'} hero={d.recommended} size={d.recommended ? 'lg' : 'md'}
                                badge={d.disabled ? 'Coming soon' : d.recommended ? 'Recommended' : undefined}
                                class={d.recommended ? 'wide' : ''}
                            >
                                {#if d.brand}<BrandIcon brand={d.brand} size="1.1em" />{/if}{d.name}
                            </OreButton>
                        {/each}
                    </div>
                    <p class="drop">Drop it into <code class="ore-tag">{p.folder}/</code> and restart the server.</p>
                    <aside class="notes" aria-label="Notes">
                        <ul>
                            {#if p.alsoWorksOn}<li>Also works on {p.alsoWorksOn}.</li>{/if}
                            {#each platformNotes as n (n)}<li>{n}</li>{/each}
                            <li>Aternos: add Discord-Linker from the {p.folder === 'plugins' ? 'plugin' : 'mod'} list.</li>
                        </ul>
                    </aside>
                </div>
            {/each}
        </div>
    </div>
</StepCard>

<style>
    .split { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 1.5rem 2rem; }
    .downloads { display: grid; }
    .dl { grid-area: 1 / 1; min-width: 0; }
    .dl:not(.on) { visibility: hidden; }
    .label { margin: 0 0 0.6rem; font-size: 0.95rem; color: var(--color-ore-white); }
    /* ── The server list ─────────────────────────────────────────────── */
    .list { display: flex; flex-direction: column; gap: calc(2 * var(--t)); align-self: start; }
    /* One server: its logo, name and two lines of MOTD. */
    .server {
        position: relative; display: flex; align-items: center; gap: 0.8rem; width: 100%; padding: 0.5rem;
        border: var(--t) solid #1e1e1f; background: #48494a; color: #fff; font: inherit; text-align: left; cursor: pointer;
        box-shadow: inset 0 calc(-2 * var(--t)) 0 #313233;
    }
    .server:hover { background: #58585a; }
    /* The chosen one: a white frame, as the game marks the selected server. */
    .server.on { background: #242425; box-shadow: none; outline: calc(2 * var(--t)) solid #fff; outline-offset: calc(-1 * var(--t)); }
    .server:focus-visible { z-index: 1; }
    .icon { display: grid; place-items: center; flex: none; width: 3.5rem; height: 3.5rem; padding: 0.3rem; border: var(--t) solid #1e1e1f; background: #313233; }
    .icon img { display: block; width: 100%; height: 100%; object-fit: contain; }
    .icon img.pixelated { image-rendering: pixelated; }
    .info { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; min-width: 0; }
    .name { font-size: 1rem; line-height: 1.2; }
    .motd { font-size: 0.875rem; line-height: 1.25; color: var(--color-ore-white); }
    .folder { color: var(--color-mc-yellow); }
    /* The recommended download on its own row; the others share rows, and one left alone fills its row. */
    .buttons { display: flex; flex-wrap: wrap; gap: 1.1rem 0.6rem; margin-top: 1rem; }
    .buttons > :global(*) { flex: 1 1 8.5rem; }
    .buttons > :global(.wide) { flex-basis: 100%; }
    .drop { margin: 0.6rem 0 0; color: var(--color-ore-white); line-height: 1.6; }
    .drop code { font-size: 0.9rem; color: var(--color-mc-yellow); }
    /* Small notes with square bullets, kept tight so the step doesn't grow taller than the server list. */
    .notes { margin: 0.35rem 0 0; padding: 0.1rem 0 0.1rem 0.7rem; border-left: 3px solid var(--color-ore-line); }
    .notes ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.1rem; font-size: 0.8rem; line-height: 1.35; color: #c4c5c8; }
    .notes li { position: relative; padding-left: 0.85rem; }
    .notes li::before { content: ''; position: absolute; left: 0; top: 0.55em; width: 0.3rem; height: 0.3rem; background: var(--color-ore-mid); }

    @media (max-width: 860px) {
        .split { grid-template-columns: minmax(0, 1fr); }
    }
</style>
