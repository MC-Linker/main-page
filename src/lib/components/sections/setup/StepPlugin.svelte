<script lang="ts">
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { platformNotes, platforms } from '$lib/data';
    import McButton from '$lib/mc/McButton.svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import StepHeading from './StepHeading.svelte';

    // Picking the server software, like the game's server list.
    let platform = $state(platforms[0].id);
    const current = $derived(platforms.find(p => p.id === platform)!);

    // The list works like one control: arrow keys move the selection.
    function listKeys(e: KeyboardEvent) {
        const i = platforms.findIndex(p => p.id === platform);
        if(e.key === 'ArrowDown') {
            e.preventDefault();
            platform = platforms[(i + 1) % platforms.length].id;
        }
        if(e.key === 'ArrowUp') {
            e.preventDefault();
            platform = platforms[(i - 1 + platforms.length) % platforms.length].id;
        }
    }
</script>

<!-- Step 2 happens in Minecraft: the server list screen. -->
<div id="install" class="band">
    <div class="copy">
        <StepHeading step={2} world="minecraft">Install the Discord-Linker plugin</StepHeading>
        <p>Pick your server software, download the file and drop it into your <code>{current.folder}</code> folder. Then restart the server.</p>
    </div>

    <p class="screen-title mc-text" id="software-title">Select your server software</p>
    <div class="screen">
        <ul class="list" role="listbox" aria-labelledby="software-title" tabindex="0" onkeydown={listKeys}>
            {#each platforms as p (p.id)}
                <li role="option" aria-selected={platform === p.id} class:selected={platform === p.id}>
                    <button type="button" onclick={() => (platform = p.id)} tabindex="-1">
                        <span class="icon"><PixelArt sprite={p.icon} width="100%" /></span>
                        <span class="info">
                            <span class="name mc-text">{p.name}</span>
                            <span class="motd mc-text">Minecraft {p.versions} · goes in <span class="folder">{p.folder}/</span></span>
                            {#if p.alsoWorksOn}<span class="motd mc-text dim">Also: {p.alsoWorksOn}</span>{/if}
                        </span>
                        <span class="ping" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
                    </button>
                </li>
            {/each}
        </ul>
    </div>

    <div class="downloads">
        <p class="get mc-text">Download for {current.name}</p>
        <div class="buttons">
            {#each current.downloads as d (d.name)}
                <McButton href={d.href} external color={d.color} badge={d.recommended ? 'Recommended' : undefined}>
                    {#if d.brand}<BrandIcon brand={d.brand} size="1em" />{/if}{d.name}
                </McButton>
            {/each}
        </div>
        <ul class="notes mc-text">{#each platformNotes as n (n)}<li>{n}</li>{/each}</ul>
    </div>
</div>

<style>
    .band {
        padding: clamp(3rem, 6vw, 4.5rem) 1rem;
        background: linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.55)), var(--tex-dirt) 0 0 / 64px 64px;
        image-rendering: pixelated;
    }
    .band :global(img), .band :global(svg) { image-rendering: auto; }
    .copy { max-width: 36rem; margin: 0 auto; text-align: center; }
    .copy p { margin: 0 0 1rem; color: #ced4da; line-height: 1.55; }
    code { padding: 0.05em 0.35em; border-radius: 5px; background: rgb(255 255 255 / 0.1); font-size: 0.9em; }
    .screen-title { margin: 1.5rem 0 0.75rem; text-align: center; font-size: 1.1rem; color: #fff; }
    /* The darker band the list sits in, like the game's multiplayer screen. */
    .screen { margin: 0 -1rem; padding: 0.75rem 1rem; background: rgb(0 0 0 / 0.55); border-block: 2px solid #000; box-shadow: inset 0 2px 0 rgb(255 255 255 / 0.06); }
    .list { max-width: 42rem; margin: 0 auto; padding: 0; list-style: none; }
    .list:focus-visible { outline: 2px solid var(--color-mc-yellow); }
    .list button {
        display: flex; align-items: center; gap: 0.9rem; width: 100%; padding: 0.4rem; border: 2px solid transparent;
        background: none; color: inherit; text-align: left; cursor: pointer; font: inherit;
    }
    .list li.selected button { border-color: #fff; background: rgb(0 0 0 / 0.5); }
    .list button:hover { background: rgb(255 255 255 / 0.06); }
    .icon { width: 3.5rem; height: 3.5rem; flex: none; padding: 0.4rem; background: rgb(255 255 255 / 0.08); }
    .info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .name { font-size: 1.1rem; color: #fff; }
    .motd { font-size: 0.9rem; color: #aaa; }
    .motd.dim { color: #777; }
    .folder { color: var(--color-mc-yellow); }
    /* The connection bars, always full. */
    .ping { display: inline-flex; align-items: flex-end; gap: 2px; height: 0.9rem; align-self: flex-start; margin-top: 0.3rem; }
    .ping i { width: 3px; background: #55ff55; box-shadow: 1px 1px 0 #153f15; }
    .ping i:nth-child(1) { height: 20%; }
    .ping i:nth-child(2) { height: 40%; }
    .ping i:nth-child(3) { height: 60%; }
    .ping i:nth-child(4) { height: 80%; }
    .ping i:nth-child(5) { height: 100%; }
    .downloads { max-width: 42rem; margin: 1.5rem auto 0; }
    .get { margin: 0 0 0.9rem; font-size: 0.95rem; color: #ddd; }
    .buttons { display: flex; flex-wrap: wrap; gap: 0.9rem 0.5rem; }
    .buttons > :global(*) { flex: 1 1 9rem; }
    .notes { margin: 1rem 0 0; padding-left: 1.2rem; font-size: 0.85rem; color: #aaa; }

    @media (max-width: 520px) {
        .list button { gap: 0.6rem; padding: 0.35rem; }
        .icon { width: 2.6rem; height: 2.6rem; padding: 0.3rem; }
        .name { font-size: 1rem; }
        .motd { font-size: 0.8rem; }
        .buttons > :global(*) { flex-basis: calc(50% - 0.25rem); }
    }
</style>
