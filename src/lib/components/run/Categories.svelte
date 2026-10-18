<script lang="ts">
    import { features, links } from '$lib/data';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import type { Sprite } from '$lib/pixel/sprites';
    import { commandBlock } from '$lib/pixel/sprites';
    import * as I from '$lib/pixel/items';

    // Speedrun-style category names for each feature.
    const meta: Record<string, { cat: string; icon: Sprite; tint: string }> = {
        'chat-bridge': { cat: 'Chat%', icon: I.sign, tint: '#e9f4dc' },
        console: { cat: 'Console%', icon: I.repeatingCommandBlock, tint: '#ece7f8' },
        command: { cat: 'Command%', icon: commandBlock, tint: '#f8ecdf' },
        'player-info': { cat: 'Inventory%', icon: I.chest, tint: '#f6efdc' },
        info: { cat: 'Info%', icon: I.map, tint: '#e3eef9' },
        moderation: { cat: 'Ban%', icon: I.sword, tint: '#f6e3e1' },
        'stat-channels': { cat: 'Stats%', icon: I.clock, tint: '#f8f1d6' },
        'role-sync': { cat: 'Roles%', icon: I.nameTag, tint: '#eef0f3' },
        accounts: { cat: 'Link%', icon: I.chain, tint: '#e6eaf2' },
        'join-requirements': { cat: 'Whitelist%', icon: I.door, tint: '#efefef' },
        'linked-roles': { cat: 'Badge%', icon: I.emerald, tint: '#e1f5e8' },
        dms: { cat: 'DM%', icon: I.letter, tint: '#f7f3ea' },
        customize: { cat: 'Style%', icon: I.painting, tint: '#e3eefc' },
    };
</script>

<section id="categories" class="cats" aria-labelledby="cats-title">
    <header class="head">
        <h2 id="cats-title">Pick a category.</h2>
        <p>Every feature is one or two slash commands away. All of them are free.</p>
    </header>
    <ul class="grid">
        {#each features as f, i (f.id)}
            {@const m = meta[f.id]}
            <li style:--tint={m.tint} style:--tilt="{(i % 3 - 1) * 0.6}deg">
                <a class="card sticker" href={f.guide}>
                    <span class="top">
                        <span class="cat">{m.cat}</span>
                        <span class="icon"><PixelArt sprite={m.icon} width="100%" /></span>
                    </span>
                    <span class="title">{f.title}</span>
                    <span class="text">{f.description}</span>
                    {#if f.commands.length}<span class="cmds">{#each f.commands as c (c)}<code>{c}</code>{/each}</span>{/if}
                </a>
            </li>
        {/each}
        <li style:--tint="var(--color-gold)" style:--tilt="0deg">
            <a class="card sticker hundred" href={links.guide}>
                <span class="top"><span class="cat">100%</span></span>
                <span class="title">All of the above</span>
                <span class="text">Free, hosted for you, set up in Discord. The guide covers every command.</span>
                <span class="cmds"><code>/help</code></span>
            </a>
        </li>
    </ul>
</section>

<style>
    .cats { padding: clamp(4rem, 9vw, 7rem) clamp(1rem, 4vw, 2rem); }
    .head { max-width: 40rem; margin: 0 auto 2.5rem; text-align: center; }
    h2 { margin: 0; font-size: clamp(2.2rem, 5vw, 3.6rem); font-weight: 900; letter-spacing: -0.03em; }
    .head p { margin: 1rem 0 0; font-size: 1.1rem; color: var(--color-ink-soft); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 16.5rem), 1fr)); gap: 1.4rem; max-width: 72rem; margin: 0 auto; padding: 0; list-style: none; }
    .card {
        display: flex; flex-direction: column; gap: 0.5rem; height: 100%; padding: 1.1rem 1.2rem 1.2rem;
        background: var(--tint); color: inherit; text-decoration: none;
        transform: rotate(var(--tilt)); transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .card:hover { transform: rotate(0deg) translate(-2px, -2px); box-shadow: 7px 7px 0 var(--color-ink); }
    .top { display: flex; align-items: center; justify-content: space-between; }
    .cat { font-family: var(--font-pixel); font-weight: 700; font-size: 1.6rem; }
    .icon { width: 2.2rem; }
    .title { font-weight: 800; font-size: 1.1rem; }
    .text { font-size: 0.95rem; line-height: 1.5; color: var(--color-ink-soft); }
    .cmds { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: auto; padding-top: 0.4rem; }
    code { padding: 0.1rem 0.45rem; border: 2px solid var(--color-ink); border-radius: 6px; background: #fff; font-size: 0.8rem; }
    .hundred .cat { font-size: 2.2rem; }
</style>
