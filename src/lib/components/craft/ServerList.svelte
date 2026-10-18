<script lang="ts">
    import { links, platforms, platformNotes } from '$lib/data';
    import { craftingTable, enchantedBook, letter, painting } from '$lib/pixel/items';
    import type { Sprite } from '$lib/pixel/sprites';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import McButton from '$lib/mc/McButton.svelte';
    import BrandIcon from '../BrandIcon.svelte';

    const icons: Record<string, Sprite> = { paper: letter, fabric: painting, neoforge: enchantedBook, forge: craftingTable };
    let selected = $state(platforms[0].id);
    const current = $derived(platforms.find(p => p.id === selected)!);

    function keys(e: KeyboardEvent) {
        const i = platforms.findIndex(p => p.id === selected);
        if(e.key === 'ArrowDown') { e.preventDefault(); selected = platforms[(i + 1) % platforms.length].id; }
        if(e.key === 'ArrowUp') { e.preventDefault(); selected = platforms[(i - 1 + platforms.length) % platforms.length].id; }
    }
</script>

<section id="servers" class="servers" aria-labelledby="servers-title">
    <h2 id="servers-title" class="mc-text">Play Multiplayer</h2>
    <p class="sub">Pick your server software to get the right Discord-Linker download.</p>

    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <ul class="list" role="listbox" aria-label="Server software" tabindex="0" onkeydown={keys}>
        {#each platforms as p (p.id)}
            <li role="option" aria-selected={selected === p.id} class:selected={selected === p.id}>
                <button type="button" onclick={() => (selected = p.id)} tabindex="-1">
                    <span class="icon"><PixelArt sprite={icons[p.id]} width="100%" /></span>
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

    <div class="buttons">
        <div class="row downloads">
            {#each current.downloads as d (d.name)}
                <McButton href={d.href} external>{#if d.brand}<BrandIcon brand={d.brand} size="1em" />{/if}{d.name}</McButton>
            {/each}
        </div>
        <div class="row">
            <a class="mc-btn-blurple mc-text" href={links.invite} target="_blank" rel="noopener"><BrandIcon brand="discord" size="1em" /> Direct Connect: add the bot</a>
            <McButton href="#craft">How do I connect?</McButton>
        </div>
        <ul class="notes mc-text">{#each platformNotes as n (n)}<li>{n}</li>{/each}</ul>
    </div>
</section>

<style>
    .servers { padding: clamp(4rem, 9vw, 7rem) 1rem; background: rgb(0 0 0 / 0.35); }
    h2 { margin: 0; text-align: center; font-size: clamp(2rem, 5vw, 3.25rem); color: #fff; }
    .sub { margin: 0.75rem auto 2rem; text-align: center; color: #ccc; }
    .list { max-width: 40rem; margin: 0 auto; padding: 0.4rem; list-style: none; background: rgb(0 0 0 / 0.45); border-top: 2px solid #000; border-bottom: 2px solid #000; }
    .list:focus-visible { outline: 2px solid var(--color-mc-yellow); }
    li button {
        display: flex; align-items: center; gap: 0.9rem; width: 100%; padding: 0.4rem; border: 2px solid transparent;
        background: none; color: inherit; text-align: left; cursor: pointer; font: inherit;
    }
    li.selected button { border-color: #fff; background: rgb(0 0 0 / 0.5); }
    li button:hover { background: rgb(255 255 255 / 0.06); }
    .icon { width: 3.5rem; height: 3.5rem; flex: none; padding: 0.4rem; background: rgb(255 255 255 / 0.08); }
    .info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .name { font-size: 1.1rem; color: #fff; }
    .motd { font-size: 0.9rem; color: #aaa; }
    .motd.dim { color: #777; }
    .folder { color: var(--color-mc-yellow); }
    .ping { display: inline-flex; align-items: flex-end; gap: 2px; height: 0.9rem; align-self: flex-start; margin-top: 0.3rem; }
    .ping i { width: 3px; background: #55ff55; box-shadow: 1px 1px 0 #153f15; }
    .ping i:nth-child(1) { height: 20%; } .ping i:nth-child(2) { height: 40%; } .ping i:nth-child(3) { height: 60%; } .ping i:nth-child(4) { height: 80%; } .ping i:nth-child(5) { height: 100%; }
    .buttons { max-width: 40rem; margin: 1.25rem auto 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .row > :global(*) { flex: 1 1 10rem; }
    .mc-btn-blurple {
        display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 2.5rem; padding: 0 1rem;
        border: 2px solid #000; color: #fff; text-decoration: none; font-size: 1.05rem;
        background: linear-gradient(#ffffff40, #ffffff40) top / 100% 2px no-repeat, linear-gradient(#00000055, #00000055) bottom / 100% 3px no-repeat, var(--color-dc-blurple);
    }
    .mc-btn-blurple:hover { outline: 2px solid #fff; outline-offset: -4px; }
    .notes { margin: 0.5rem 0 0; padding-left: 1.2rem; font-size: 0.85rem; color: #aaa; }
</style>
