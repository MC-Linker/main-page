<script lang="ts">
    import { onMount } from 'svelte';
    import { team, type Member } from '$lib/data';
    import { dirt, stone } from '$lib/pixel/sprites';
    import { spriteUri } from '$lib/pixel/uri';
    import McWorld from '$lib/mc/McWorld.svelte';
    import McLogo from '$lib/mc/McLogo.svelte';
    import BrandIcon from '$lib/components/BrandIcon.svelte';

    // Role colours, like rank tags on a Minecraft server.
    const rankColor: Record<string, string> = {
        'Team Lead': '#ffaa00',
        Developer: '#55ff55',
        Marketing: '#ff55ff',
        Designer: '#55ffff',
        DevOps: '#5555ff',
        Donator: '#ffff55',
        Supporter: '#aaaaaa',
    };

    const splashes = ['Made with love!', 'Hi there!', 'Also try Discord!', 'Creeper-proof!', 'Linked!'];
    let splash = $state(splashes[0]);
    onMount(() => { splash = splashes[Math.floor(Math.random() * splashes.length)]; });

    const texture = spriteUri(dirt);
    const grain = spriteUri(stone);
</script>

<svelte:head>
    <title>The team · MC Linker</title>
    <meta name="description" content="The people who build MC Linker." />
</svelte:head>

{#snippet card(m: Member, small = false)}
    <article class="profile" class:small>
        <!-- The banner in the member's colour, with a block texture. -->
        <div class="banner" style:--accent={m.color}>
            <span class="nametag mc-text" aria-hidden="true">{m.username}</span>
        </div>
        <div class="avatar-wrap">
            <img class="avatar" src="/profiles/{m.username}.png" alt="" width="88" height="88" loading="lazy" />
            <span class="status" aria-label="Online"></span>
        </div>
        <div class="body">
            <h2>{m.username}</h2>
            {#if m.github}
                <a class="gh" href="https://github.com/{m.github}" target="_blank" rel="noopener"><BrandIcon brand="github" size="0.95em" /> {m.github}</a>
            {/if}
            <div class="box">
                {#if m.about}
                    <h3>About me</h3>
                    <p>{m.about}</p>
                {/if}
                <h3>Roles</h3>
                <ul class="roles">
                    {#each m.roles as r (r)}<li><i style:background={rankColor[r] ?? m.color}></i>{r}</li>{/each}
                </ul>
            </div>
        </div>
    </article>
{/snippet}

<section class="team" style:--texture={texture} style:--grain={grain} aria-labelledby="team-title">
    <!-- Like the game's title screen: the logo over an out-of-focus world. -->
    <header class="head">
        <McWorld class="world" tile={30} hills blur={3} />
        <h1 id="team-title" class="title">
            <McLogo text="The Team" />
            <span class="splash mc-text" aria-hidden="true">{splash}</span>
        </h1>
        <p class="edition mojang">The people behind <span class="brand">MC Linker</span></p>
        <p class="lead mc-text">A small crew who like Minecraft, Discord and building things that link the two.</p>
    </header>

    <div class="cards">
        <div class="grid" aria-label="Core team">
            {#each team.core as m (m.username)}{@render card(m)}{/each}
        </div>

        <h2 class="thanks mc-text">Special thanks</h2>
        <div class="grid small-grid" aria-label="Special thanks">
            {#each team.specialThanks as m (m.username)}{@render card(m, true)}{/each}
        </div>
    </div>
</section>

<style>
    .team { background: linear-gradient(rgb(0 0 0 / 0.62), rgb(0 0 0 / 0.62)), var(--texture) 0 0 / 64px 64px; image-rendering: pixelated; }
    .team :global(img) { image-rendering: auto; }

    /* ── Header ─────────────────────────────────────────────────────────── */
    .head {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: clamp(3.5rem, 9vh, 6rem) 1rem clamp(3rem, 7vh, 4.5rem);
        text-align: center;
        border-bottom: 2px solid #000;
    }
    .head :global(.world) { position: absolute; inset: 0; z-index: -1; }
    .title { position: relative; margin: 0; font-size: clamp(2.8rem, 8vw, 6rem); font-weight: 400; line-height: 1; }
    .splash {
        position: absolute; left: calc(100% - 0.6em); bottom: 0.1em;
        font-size: max(0.2em, 0.95rem); white-space: nowrap; color: #ffff00; text-shadow: 0.1em 0.1em 0 #3f3f00;
        transform: rotate(-20deg); transform-origin: left center;
        animation: splash 0.55s ease-in-out infinite alternate;
    }
    @keyframes splash { to { transform: rotate(-20deg) scale(1.1); } }
    .edition { margin: clamp(0.6rem, 1.5vh, 1rem) 0 0; font-size: clamp(0.95rem, 1.4vw, 1.35rem); letter-spacing: 0.24em; color: #fff; text-shadow: 0.1em 0.1em 0 rgb(0 0 0 / 0.6); }
    .edition .brand { color: var(--color-grass-light); }
    .lead { max-width: 34rem; margin: 0.8rem 0 0; font-size: clamp(0.95rem, 0.4vw + 0.75rem, 1.1rem); color: #f1f3f5; text-wrap: balance; }

    /* ── Cards ──────────────────────────────────────────────────────────── */
    .cards { padding: clamp(2.5rem, 6vw, 4rem) 1rem calc(var(--hud-space) + 2.5rem); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18.5rem), 1fr)); gap: 1.25rem; max-width: 66rem; margin: 0 auto; }
    .small-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 18rem)); justify-content: center; }
    .thanks { margin: 3.5rem 0 1.5rem; text-align: center; font-size: clamp(1.6rem, 3.5vw, 2.1rem); font-weight: 400; color: #fff; }

    /* A Discord profile... */
    .profile {
        position: relative; display: flex; flex-direction: column; border-radius: 10px; overflow: hidden;
        background: #232428; color: var(--color-dc-text); font-family: var(--font-discord);
        box-shadow: 0 0 0 1px rgb(255 255 255 / 0.06), 0 16px 36px rgb(0 0 0 / 0.4);
    }
    /* ...with a blocky banner and a Minecraft nametag. */
    .banner {
        position: relative; height: 6rem;
        /* Stone grain blended into the colour, so it keeps its hue. */
        background: var(--grain) 0 0 / 32px 32px, var(--accent);
        background-blend-mode: soft-light;
    }
    .nametag {
        position: absolute; left: 1.2rem; top: 0.6rem; padding: 0.1rem 0.4rem;
        background: rgb(0 0 0 / 0.45); color: #fff; font-size: 0.9rem;
    }
    .avatar-wrap { position: absolute; top: 2.6rem; left: 1rem; }
    .avatar { display: block; width: 5.5rem; height: 5.5rem; border-radius: 50%; border: 6px solid #232428; background: #232428; object-fit: cover; }
    .status { position: absolute; right: 0.2rem; bottom: 0.2rem; width: 1.25rem; height: 1.25rem; border-radius: 50%; background: #23a55a; border: 4px solid #232428; }
    .body { display: flex; flex-direction: column; flex: 1; padding: 3.6rem 1rem 1rem; }
    h2 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #fff; }
    .gh { display: inline-flex; align-items: center; gap: 0.35rem; align-self: flex-start; font-size: 0.875rem; color: var(--color-dc-muted); text-decoration: none; }
    .gh:hover { color: #fff; }
    .box { flex: 1; margin-top: 0.85rem; padding: 0.75rem; border-radius: 8px; background: #111214; }
    h3 { margin: 0 0 0.35rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-dc-header); }
    h3:not(:first-child) { margin-top: 0.9rem; }
    p { margin: 0; font-size: 0.9rem; line-height: 1.5; }
    .roles { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0; padding: 0; list-style: none; }
    .roles li { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: #2e3035; font-size: 0.8rem; }
    .roles i { width: 0.65rem; height: 0.65rem; border-radius: 50%; }

    .small .banner { height: 4.5rem; }
    .small .avatar-wrap { top: 1.75rem; }
    .small .avatar { width: 4.5rem; height: 4.5rem; }
    .small .body { padding-top: 3rem; }

    @media (max-width: 560px) {
        .splash { left: auto; bottom: auto; right: -0.5rem; top: -0.55em; transform-origin: center; }
        .edition { font-size: 0.85rem; letter-spacing: 0.12em; }
    }
</style>
