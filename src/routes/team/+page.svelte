<script lang="ts">
    import { onMount } from 'svelte';
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import LinkPreview from '$lib/components/LinkPreview.svelte';
    import { type Member, roleColors, team } from '$lib/data';
    import { teamEmbed } from '$lib/linkPreview';
    import McWorld from '$lib/mc/McWorld.svelte';
    import OreButton from '$lib/ore/OreButton.svelte';

    // A random yellow splash text next to the title, like the game's.
    const splashes = ['Made with love!', 'Hi there!', 'Also try Discord!', 'Creeper-proof!', 'Linked!'];
    let splash = $state(splashes[0]);
    onMount(() => {
        splash = splashes[Math.floor(Math.random() * splashes.length)];
    });
</script>

<svelte:head>
    <title>The team · MC Linker</title>
    <meta name="description" content="The people who build MC Linker." />
</svelte:head>
<LinkPreview title="The team · MC Linker" description="The people who build MC Linker." path="/team" embed={teamEmbed()} />

{#snippet card(m: Member, small = false)}
    <!-- An Ore UI panel per member: a banner in their colour, the avatar framed like a world's thumbnail, then their about text and roles. -->
    <article class="ore-card raised member" class:small aria-labelledby="member-{m.username}">
        <div class="banner" style:--accent={m.color} aria-hidden="true"></div>
        <div class="who">
            <img class="avatar" src="/profiles/{m.username}.png" alt="" width="88" height="88" loading="lazy" />
            <div class="name">
                <h3 id="member-{m.username}" class="ore-title">{m.username}</h3>
                <p class="status ore-text" class:offline={m.status === 'offline'}><i aria-hidden="true"></i>{m.status === 'offline' ? 'Offline' : 'Online'}</p>
            </div>
        </div>
        <div class="body">
            {#if m.about}<p class="about">{m.about}</p>{/if}
            <ul class="roles" aria-label="Roles">
                {#each m.roles as r (r)}<li class="ore-tag"><i style:background={roleColors[r] ?? m.color} aria-hidden="true"></i>{r}</li>{/each}
            </ul>
            {#if m.github}
                <OreButton href="https://github.com/{m.github}" external variant="secondary" size="sm" class="gh" label="{m.username} on GitHub ({m.github})">
                    <BrandIcon brand="github" size="1em" /> {m.github}
                </OreButton>
            {/if}
        </div>
    </article>
{/snippet}

<section class="team" aria-labelledby="team-title">
    <!-- Like a title screen: a title panel over the out-of-focus world. -->
    <header class="head">
        <McWorld class="world" tile={30} hills blur={3} />
        <div class="ore-card raised title-card">
            <h1 id="team-title" class="title">
                <img class="logo" src="/the-team.png" alt="The Team" width="1270" height="261" />
                <span class="splash mc-text" aria-hidden="true">{splash}</span>
            </h1>
            <hr class="ore-divider" />
            <p class="edition mojang">The people behind <span class="brand">MC Linker</span></p>
            <p class="lead">A small crew who like Minecraft, Discord and building things that link the two.</p>
        </div>
    </header>

    <div class="cards">
        <header class="section-head">
            <p class="kicker ore-text">Core team</p>
            <h2 class="ore-title">Who builds it</h2>
        </header>
        <div class="grid">
            {#each team.core as m (m.username)}{@render card(m)}{/each}
        </div>

        <header class="section-head thanks">
            <p class="kicker ore-text">Special thanks</p>
            <h2 class="ore-title">Who helped along the way</h2>
        </header>
        <div class="grid small-grid">
            {#each team.specialThanks as m (m.username)}{@render card(m, true)}{/each}
        </div>
    </div>
</section>

<style>
    .team { background: var(--color-ore-dark); }

    /* ── Header ─────────────────────────────────────────────────────────── */
    .head {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        display: flex;
        justify-content: center;
        padding: clamp(3rem, 8vh, 5rem) 1rem;
        border-bottom: var(--t) solid var(--color-ore-outline);
    }
    .head :global(.world) { position: absolute; inset: 0; z-index: -1; }
    /* A see-through Ore UI panel, so the world shows faintly behind it. */
    .title-card {
        --face: rgb(49 50 51 / 0.92);
        --edge: #242425;
        width: min(100%, 36rem);
        padding: 1.5rem 1.25rem calc(1.25rem + 3 * var(--t));
        text-align: center;
        backdrop-filter: blur(6px);
    }
    .title { position: relative; margin: 0 0 1.5rem; font-weight: 400; line-height: 1; }
    .logo { display: block; width: 100%; height: auto; filter: drop-shadow(0 3px 0 rgb(0 0 0 / 0.35)); }
    /* The yellow splash text on the logo's corner, like in the game. */
    .splash {
        position: absolute; right: -0.75rem; bottom: -0.5rem;
        font-size: 0.85rem; white-space: nowrap; color: #ffff00; text-shadow: 0.1em 0.1em 0 #3f3f00;
        transform: rotate(-16deg); transform-origin: right center;
        animation: splash 0.55s ease-in-out infinite alternate;
    }
    @keyframes splash { to { transform: rotate(-16deg) scale(1.1); } }
    @media (prefers-reduced-motion: reduce) { .splash { animation: none; } }
    .edition { margin: 1rem 0 0; font-size: 1rem; letter-spacing: 0.24em; color: #fff; }
    .edition .brand { color: var(--color-mc-green); white-space: nowrap; }
    .lead { max-width: 26rem; margin: 0.6rem auto 0; font-size: 0.95rem; line-height: 1.55; color: var(--color-ore-white); text-wrap: balance; }

    /* ── Cards ──────────────────────────────────────────────────────────── */
    .cards { padding: clamp(3rem, 7vw, 5rem) 1rem clamp(4rem, 8vw, 6rem); }
    .section-head { margin-bottom: clamp(1.75rem, 4vw, 2.5rem); }
    .section-head h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); }
    .thanks { margin-top: clamp(3.5rem, 7vw, 5rem); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18.5rem), 1fr)); gap: 1.25rem; max-width: 66rem; margin: 0 auto; }
    .small-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 18rem)); justify-content: center; }

    .member { display: flex; flex-direction: column; min-width: 0; }
    /* The member's colour with a stone grain, so it keeps its hue. */
    .banner {
        height: 4.5rem;
        border-bottom: var(--t) solid var(--color-ore-outline);
        background: var(--tex-stone) 0 0 / 32px 32px, var(--accent);
        background-blend-mode: soft-light;
        image-rendering: pixelated;
    }
    .who { display: flex; align-items: flex-start; gap: 0.85rem; padding: 0 1rem; margin-top: -2.5rem; }
    /* Square and outlined, like a world's thumbnail in the Play screen. */
    .avatar {
        display: block; flex: none; width: 5rem; height: 5rem; object-fit: cover;
        border: var(--t) solid var(--color-ore-outline);
        background: var(--color-ore-dark);
        box-shadow: inset 0 0 0 var(--t) var(--color-ore-line), 0 calc(2 * var(--t)) 0 var(--color-ore-outline);
    }
    .name { min-width: 0; padding-top: 2.95rem; }
    h3 { margin: 0; font-size: 1.3rem; line-height: 1.2; color: #fff; overflow-wrap: anywhere; }
    .status { display: flex; align-items: center; gap: 0.4rem; margin: 0.3rem 0 0; font-size: 0.8rem; color: var(--color-mc-gray); }
    .status i { width: calc(4 * var(--t)); height: calc(4 * var(--t)); background: var(--color-mc-green); box-shadow: 0 0 0 var(--t) var(--color-ore-outline); }
    .status.offline i { background: var(--color-mc-dark-gray); }

    .body { display: flex; flex-direction: column; gap: 1rem; flex: 1; padding: 1rem 1rem 1.1rem; }
    .about { margin: 0; font-size: 0.92rem; line-height: 1.6; color: var(--color-ore-white); }
    .roles { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0; padding: 0; list-style: none; }
    .roles li { font-size: 0.85rem; padding: 0.3em 0.55em 0.35em; }
    .roles i { width: calc(3 * var(--t)); height: calc(3 * var(--t)); flex: none; }
    /* The button sits at the bottom, so buttons line up across a row. */
    .body :global(.gh) { margin-top: auto; align-self: flex-start; }

    .small .banner { height: 3.5rem; }
    .small .who { margin-top: -2rem; }
    .small .name { padding-top: 2.4rem; }
    .small .avatar { width: 4rem; height: 4rem; }

    @media (max-width: 560px) {
        .edition { font-size: 0.85rem; letter-spacing: 0.12em; }
        .small-grid { grid-template-columns: 1fr; }
        .splash { right: 0; font-size: 0.75rem; }
    }
</style>
