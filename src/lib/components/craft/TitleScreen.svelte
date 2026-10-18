<script lang="ts">
    import { onMount } from 'svelte';
    import { links } from '$lib/data/links';
    import McButton from '$lib/mc/McButton.svelte';
    import BrandIcon from '../BrandIcon.svelte';
    import Panorama from './Panorama.svelte';

    // Like Minecraft's yellow splash texts. A new one on every visit.
    const splashes = [
        'Also try Discord!', 'Chat both ways!', 'No config files!', '100% slash commands!', 'Bedrock friendly!',
        'Now with 26.2!', 'Creeper-proof!', 'Free!', 'Links!', 'Tab-completion!', 'Works on Aternos!',
        'Made with love!', 'Hello, Discord!', '/connect!', 'Inventories in Discord!', 'Not a bot you host!',
    ];
    let splash = $state(splashes[0]);
    onMount(() => { splash = splashes[Math.floor(Math.random() * splashes.length)]; });
</script>

<section id="title" class="title-screen" aria-labelledby="title-heading">
    <Panorama />
    <div class="shade" aria-hidden="true"></div>

    <div class="center">
        <div class="logo">
            <h1 id="title-heading" class="wordmark">
                <img src="/logo.svg" alt="" width="96" height="96" />
                <span class="mc-logo">MC LINKER</span>
            </h1>
            <p class="edition mojang">Discord Edition</p>
            <p class="splash mc-text" aria-hidden="true">{splash}</p>
        </div>

        <p class="motd mc-text">Link your Minecraft server with Discord.<br /><span>Chat, stats and moderation, both ways.</span></p>

        <nav class="menu" aria-label="Get started">
            <a class="mc-btn-primary mc-text" href={links.invite} target="_blank" rel="noopener">
                <BrandIcon brand="discord" size="1.15em" /> Add to Discord
            </a>
            <McButton href="#servers" size="lg">Get the Plugin</McButton>
            <div class="row">
                <McButton href={links.guide} size="lg">Guide</McButton>
                <McButton href={links.support} size="lg" external>Support…</McButton>
            </div>
            <McButton href="#craft" size="lg">How does it work?</McButton>
        </nav>
    </div>

    <p class="corner left mc-text">Discord-Linker 4.4.0</p>
    <p class="corner right mc-text">Not an official Minecraft product.</p>
</section>

<style>
    .title-screen {
        position: relative;
        display: grid;
        place-items: center;
        min-height: 100svh;
        padding: 3rem 1rem calc(var(--hud) + 3rem);
        overflow: hidden;
        isolation: isolate;
    }
    .title-screen :global(.panorama) { z-index: -2; }
    .shade { position: absolute; inset: 0; z-index: -1; background: radial-gradient(ellipse at center, rgb(0 0 0 / 0.15), rgb(0 0 0 / 0.55)); }
    .center { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; width: min(46rem, 100%); }

    .logo { position: relative; text-align: center; }
    .wordmark { display: flex; align-items: center; justify-content: center; gap: 0.6rem; margin: 0; font-weight: 400; white-space: nowrap; }
    .wordmark img { width: clamp(3.5rem, 9vw, 5.5rem); height: auto; filter: drop-shadow(0 4px 0 rgb(0 0 0 / 0.4)); }
    .wordmark span {
        font-size: clamp(2.6rem, 11vw, 6.25rem);
        line-height: 1;
        color: #e8e8e8;
        letter-spacing: 0.02em;
        /* Extruded stone letters, like the Minecraft logo. */
        text-shadow: 0 2px 0 #9a9a9a, 0 4px 0 #6f6f6f, 0 6px 0 #4a4a4a, 0 8px 0 #2b2b2b, 0 10px 14px rgb(0 0 0 / 0.6);
    }
    .edition { margin: 0.75rem 0 0; font-size: clamp(1rem, 2.6vw, 1.4rem); color: #fff; letter-spacing: 0.3em; text-shadow: 0.1em 0.1em 0 rgb(0 0 0 / 0.5); }
    .splash {
        position: absolute; right: -2.5rem; bottom: 0.6rem; margin: 0;
        color: var(--color-mc-yellow); font-size: clamp(0.85rem, 2.2vw, 1.15rem); white-space: nowrap;
        --mc-shadow: 0.1em;
        transform: rotate(-18deg);
        animation: splash 0.55s ease-in-out infinite alternate;
    }
    @keyframes splash { to { transform: rotate(-18deg) scale(1.08); } }

    .motd { margin: 0; text-align: center; color: #fff; font-size: 1.05rem; line-height: 1.5; }
    .motd span { color: #aaa; }

    .menu { display: flex; flex-direction: column; gap: 0.5rem; width: min(26rem, 100%); }
    .menu :global(.mc-btn) { width: 100%; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .mc-btn-primary {
        display: flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 3rem;
        border: 2px solid #000; color: #fff; font-size: 1.2rem; text-decoration: none;
        background: linear-gradient(#ffffff40, #ffffff40) top / 100% 2px no-repeat, linear-gradient(#00000055, #00000055) bottom / 100% 3px no-repeat, var(--color-dc-blurple);
    }
    .mc-btn-primary:hover, .mc-btn-primary:focus-visible { outline: 2px solid #fff; outline-offset: -4px; background-color: #6d78f5; }

    .corner { position: absolute; bottom: calc(var(--hud) + 0.5rem); margin: 0; font-size: 0.85rem; color: #fff; }
    .corner.left { left: 0.75rem; }
    .corner.right { right: 0.75rem; }
    @media (max-width: 560px) {
        .logo { padding-bottom: 1.6rem; }
        .splash { right: -0.25rem; bottom: -0.2rem; }
        .corner { display: none; }
    }
</style>
