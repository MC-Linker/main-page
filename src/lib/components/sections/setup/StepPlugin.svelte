<script lang="ts">
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { platformNotes, platforms } from '$lib/data';
    import OreButton from '$lib/ore/OreButton.svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
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
<StepCard step={2} world="minecraft" id="install">
    {#snippet title()}Install the Discord-Linker plugin{/snippet}
    <div class="split">
        <!-- The server list: an Ore UI panel with one entry per server software. -->
        <div class="ore-card dark servers">
            <p class="ore-header list-title ore-title" id="software-title">Servers</p>
            <!-- svelte-ignore a11y_interactive_supports_focus -->
            <div class="list" role="radiogroup" aria-labelledby="software-title" bind:this={list} onkeydown={listKeys}>
                {#each platforms as p (p.id)}
                    {@const on = platform === p.id}
                    <button type="button" class="server" class:on role="radio" aria-checked={on} tabindex={on ? 0 : -1} onclick={() => (platform = p.id)}>
                        <span class="icon"><PixelArt sprite={p.icon} width="100%" /></span>
                        <span class="info">
                            <span class="name ore-text">{p.name}</span>
                            <span class="motd ore-text">Minecraft {p.versions}</span>
                            <span class="motd ore-text">Goes in <span class="folder">{p.folder}/</span></span>
                        </span>
                        <span class="ping" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
                    </button>
                {/each}
            </div>
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
                    <p class="drop">Drop the file into your <code class="ore-tag">{p.folder}/</code> folder, then restart the server.</p>
                    <ul class="notes">
                        {#if p.alsoWorksOn}<li>Also works on {p.alsoWorksOn}.</li>{/if}
                        {#each platformNotes as n (n)}<li>{n}</li>{/each}
                    </ul>
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
    .servers { align-self: start; }
    .list-title { margin: 0; padding: 0.65rem 0.9rem calc(0.65rem + 3 * var(--t)); font-size: 1.1rem; }
    .list { display: flex; flex-direction: column; gap: calc(2 * var(--t)); padding: 0.6rem; }
    /* One server: its icon, name and two lines of MOTD, the connection bars on the right. */
    .server {
        position: relative; display: flex; align-items: center; gap: 0.8rem; width: 100%; padding: 0.5rem;
        border: var(--t) solid #1e1e1f; background: #48494a; color: #fff; font: inherit; text-align: left; cursor: pointer;
        box-shadow: inset 0 calc(-2 * var(--t)) 0 #313233;
    }
    .server:hover { background: #58585a; }
    /* The chosen one: a white frame, as the game marks the selected server. */
    .server.on { background: #242425; box-shadow: none; outline: calc(2 * var(--t)) solid #fff; outline-offset: calc(-1 * var(--t)); }
    .server:focus-visible { z-index: 1; }
    .icon { flex: none; width: 3.5rem; height: 3.5rem; padding: 0.35rem; border: var(--t) solid #1e1e1f; background: #313233; }
    .info { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; min-width: 0; }
    .name { font-size: 1rem; line-height: 1.2; }
    .motd { font-size: 0.875rem; line-height: 1.25; color: var(--color-ore-white); }
    .folder { color: var(--color-mc-yellow); }
    /* The connection bars, always full. */
    .ping { display: inline-flex; align-items: flex-end; gap: var(--t); align-self: flex-start; height: 1rem; margin: 0.15rem 0.2rem 0 0; }
    .ping i { width: calc(2 * var(--t)); background: #55ff55; box-shadow: var(--t) var(--t) 0 #1d4d13; }
    .ping i:nth-child(1) { height: 20%; }
    .ping i:nth-child(2) { height: 40%; }
    .ping i:nth-child(3) { height: 60%; }
    .ping i:nth-child(4) { height: 80%; }
    .ping i:nth-child(5) { height: 100%; }
    /* The recommended download on its own row; the others share rows, and one left alone fills its row. */
    .buttons { display: flex; flex-wrap: wrap; gap: 1.1rem 0.6rem; margin-top: 1rem; }
    .buttons > :global(*) { flex: 1 1 8.5rem; }
    .buttons > :global(.wide) { flex-basis: 100%; }
    .drop { margin: 1.25rem 0 0; color: var(--color-ore-white); line-height: 1.8; }
    .drop code { font-size: 0.9rem; color: var(--color-mc-yellow); }
    .notes { margin: 0.75rem 0 0; padding-left: 1.1rem; font-size: 0.875rem; line-height: 1.55; color: #c4c5c8; }

    @media (max-width: 860px) {
        .split { grid-template-columns: minmax(0, 1fr); }
    }
</style>
