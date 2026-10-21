<script lang="ts">
    import { onMount } from 'svelte';
    import { MediaQuery } from 'svelte/reactivity';
    import { fly } from 'svelte/transition';
    import { isTextField, reducedMotion, scrollBehavior } from '$lib/browser';
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { links } from '$lib/data';
    import DcBackdrop from '$lib/discord/DcBackdrop.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import McWorld from '$lib/mc/McWorld.svelte';
    import OreButton from '$lib/ore/OreButton.svelte';
    import GrassBlock from '$lib/pixel/GrassBlock.svelte';
    import { Bridge, type Direction } from './hero/bridge.svelte';
    import DemoChannel from './hero/DemoChannel.svelte';
    import { flyPacket } from './hero/packet';

    // The pretend server and channel behind both chats. The first messages are
    // there right away (and in the prerendered page); the rest plays on load.
    const bridge = new Bridge();
    bridge.seed();

    const keyboard = new MediaQuery('(hover: hover) and (pointer: fine)', true);
    /** Phones: the two chats are stacked, so the other one is usually off-screen. */
    const stacked = new MediaQuery('(max-width: 760px)', false);

    // Like Minecraft's yellow splash texts. A new one on every visit.
    const splashes = [
        'Also try Discord!', 'Chat both ways!', 'No config files!', '100% slash commands!', 'Bedrock friendly!',
        'Now with 26.2!', 'Creeper-proof!', 'Free!', 'Links!', 'Tab-completion!', 'Works on Aternos!',
        'Made with love!', 'Hello, Discord!', '/connect!', 'Inventories in Discord!', 'Not a bot you host!',
    ];
    let splash = $state(splashes[0]);

    let stage: HTMLElement;
    let logo: HTMLElement;
    let mcEnd: HTMLElement;
    let dcEnd: HTMLElement;
    let mcChat: McChat;
    let channel: DemoChannel;
    let pulsing = $state(false);

    /** Shows a message travelling from one chat, through the logo, to the other. */
    async function transfer(dir: Direction) {
        if(reducedMotion.current || !stage) return;
        // The logo pulses as the message passes through it.
        setTimeout(() => {
            pulsing = true;
            setTimeout(() => (pulsing = false), 240);
        }, 360);
        await flyPacket(stage, { mc: mcEnd, dc: dcEnd, logo }, dir);
    }

    /**
     * On phones, after sending: close the keyboard and, if the message went to the
     * other world, scroll there so you can watch it arrive.
     */
    function reveal(target?: HTMLElement) {
        if(!stacked.current) return;
        (document.activeElement as HTMLElement | null)?.blur();
        if(target) setTimeout(() => target.scrollIntoView({ block: 'center', behavior: scrollBehavior() }), 250);
    }

    function fromMinecraft(text: string) {
        // Chat and /dm show up in Discord; other commands change the world right here.
        reveal(!text.startsWith('/') || /^\/dm\b/i.test(text) ? dcEnd : undefined);
        void bridge.runMinecraft(text);
    }

    function fromDiscord(text: string) {
        // Chat and these commands act in Minecraft; the rest only answer in Discord.
        reveal(!text.startsWith('/') || /^\/(command|message|ban)\b/i.test(text) ? mcEnd : undefined);
        void bridge.runDiscord(text);
    }

    // T opens the Minecraft chat and / the Discord command list, like in the games.
    function shortcuts(e: KeyboardEvent) {
        if(e.ctrlKey || e.metaKey || e.altKey || isTextField(e.target)) return;
        if(e.key === 't' || e.key === 'T') {
            e.preventDefault();
            mcChat.start();
        }
        else if(e.key === '/') {
            e.preventDefault();
            channel.start('/');
        }
    }

    onMount(() => {
        splash = splashes[Math.floor(Math.random() * splashes.length)];
        bridge.transfer = transfer;
        void bridge.playScript(!reducedMotion.current);
    });
</script>

<svelte:window onkeydown={shortcuts} />

<section id="top" class="hero" bind:this={stage} aria-labelledby="hero-title">
    <!-- Like the title screen: both worlds out of focus behind the panels. -->
    <McWorld class="mc-bg" night={bridge.night} rain={bridge.rain} tile={34} hills blur={3} />
    <div class="dc-bg" aria-hidden="true"><DcBackdrop /></div>

    <!-- Three clear parts: Minecraft's chat, the title and menu in the middle, Discord's channel. -->
    <div class="layout">
        <div class="center">
            <!-- The title panel: both logos, linked by MC Linker, and what it does. -->
            <div class="ore-card raised title-card">
                <h1 id="hero-title" class="title">
                    <span class="word mc">
                        <img class="wordmark" src="/brands/minecraft-logo.png" alt="Minecraft" width="1499" height="261" />
                        <span class="splash mc-text" aria-hidden="true">{splash}</span>
                    </span>
                    <span class="link-logo" class:pulsing bind:this={logo}>
                        <img src="/logo-horizontal.svg" alt="" width="980" height="472" />
                        <span class="sr-only">linked with</span>
                    </span>
                    <span class="word dc">
                        <img class="wordmark" src="/brands/discord-logo.svg" alt="Discord" width="635" height="96" />
                    </span>
                </h1>
                <hr class="ore-divider" />
                <p class="edition mojang">Linked by <span class="brand">MC Linker</span></p>
                <p class="motd">The easiest Minecraft–Discord link. Chat bridges, stats, inventories, commands and more.</p>
            </div>

            <!-- The game's title menu. The header bar takes over once it scrolls away. -->
            <nav class="menu" aria-label="Get started" data-title-menu in:fly={{ y: 16, duration: 500, delay: 150 }}>
                <OreButton href={links.invite} external variant="discord" hero size="lg"><BrandIcon brand="discord" size="1.15em" /> Add to Discord</OreButton>
                <OreButton href="#install" hero size="lg">Get the Plugin</OreButton>
                <div class="row">
                    <OreButton href={links.guide} variant="secondary" size="lg">Guide</OreButton>
                    <OreButton href={links.support} external variant="secondary" size="lg">Support</OreButton>
                </div>
                <OreButton href="#setup" variant="secondary" size="lg">How does it work?</OreButton>
            </nav>
        </div>

        <!-- Minecraft: the game's chat, in a window over the world. -->
        <div class="ore-card raised panel mc">
            <div class="ore-header p-head">
                <GrassBlock size={20} />
                <span class="p-title ore-title">Minecraft</span>
                <span class="p-sub ore-text">testing.mclinker.com</span>
            </div>
            <div class="p-body mc-body">
                <div class="mc-chat" bind:this={mcEnd}>
                    <McChat bind:this={mcChat} lines={bridge.mc} max={40} onsubmit={fromMinecraft} label="Minecraft chat (demo)" placeholder={keyboard.current ? 'Press T to chat' : 'Tap to chat'} />
                </div>
            </div>
            <p class="hint ore-text">{#if keyboard.current}<kbd>T</kbd> to chat · {/if}try <code>/time set night</code></p>
        </div>

        <!-- Discord: the linked channel. -->
        <div class="ore-card raised panel dc">
            <div class="ore-header p-head">
                <span class="dc-icon"><BrandIcon brand="discord" size="1.2rem" /></span>
                <span class="p-title ore-title">Discord</span>
                <span class="p-sub ore-text">Your server</span>
            </div>
            <div class="p-body dc-body">
                <div class="dc-end" bind:this={dcEnd}>
                    <DemoChannel bind:this={channel} {bridge} onsubmit={fromDiscord} />
                </div>
            </div>
            <p class="hint ore-text">{#if keyboard.current}<kbd>/</kbd> for commands · {/if}try <code>/command weather rain</code></p>
        </div>
    </div>

    <p class="corner left mc-text">MC Linker · Minecraft 1.8 – 26.2</p>
    <p class="corner right mc-text">Not an official Minecraft product.</p>
</section>

<style>
    .hero {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: max(100svh, 44rem);
        padding: clamp(1.5rem, 5svh, 3.5rem) clamp(1rem, 2.5vw, 2.5rem) clamp(2.5rem, 6svh, 4rem);
        isolation: isolate;
        overflow: hidden;
    }
    .hero :global(.mc-bg) {
        position: absolute;
        inset: 0 50% 0 0;
        z-index: -1;
        mask: var(--seam-mask);
    }
    .dc-bg {
        position: absolute;
        inset: 0 0 0 calc(50% - var(--seam-width));
        z-index: -2;
        overflow: hidden;
        background: #313338;
    }
    /* Darken the blurred app a little so the real window stands out. */
    .dc-bg::after { content: ''; position: absolute; inset: 0; background: radial-gradient(60rem 30rem at 85% 0%, rgb(88 101 242 / 0.2), transparent 60%), rgb(17 18 20 / 0.35); }

    /* Minecraft | title and menu | Discord. The side panels are as tall as the middle. */
    .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(24rem, 31rem) minmax(0, 1fr);
        grid-template-areas: 'mc center dc';
        gap: clamp(1rem, 2.2vw, 2.5rem);
        align-items: stretch;
        width: 100%;
        max-width: 96rem;
        margin: 0 auto;
    }
    .center { grid-area: center; display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; }
    .panel.mc { grid-area: mc; }
    .panel.dc { grid-area: dc; }

    /* ── The title panel ───────────────────────────────────────────────── */
    .title-card {
        --face: rgb(49 50 51 / 0.92);
        --edge: #242425;
        padding: 1.4rem 1.25rem calc(1.25rem + 3 * var(--t));
        text-align: center;
        backdrop-filter: blur(6px);
    }
    .title {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) auto minmax(0, 1fr);
        align-items: center;
        gap: 0.6rem;
        margin: 0 0 1.5rem;
        font-weight: 400;
        line-height: 1;
    }
    .word { position: relative; display: block; }
    .wordmark { display: block; width: 100%; height: auto; filter: drop-shadow(0 3px 0 rgb(0 0 0 / 0.35)); }
    /* The yellow splash text, on the corner of the Minecraft logo like in the game. */
    .splash {
        position: absolute;
        right: 0.3rem;
        bottom: -1.35rem;
        font-size: 0.85rem;
        white-space: nowrap;
        color: #ffff00;
        text-shadow: 0.1em 0.1em 0 #3f3f00;
        transform: rotate(-16deg);
        animation: splash 0.55s ease-in-out infinite alternate;
        pointer-events: none;
    }
    @keyframes splash { to { transform: rotate(-16deg) scale(1.1); } }
    .link-logo {
        position: relative;
        display: grid;
        place-items: center;
        width: clamp(3.5rem, 5vw, 4.5rem);
        animation: bob 4s ease-in-out infinite;
    }
    .link-logo img {
        width: 100%;
        height: auto;
        filter: drop-shadow(0 4px 0 rgb(0 0 0 / 0.35));
        transition: transform 0.25s cubic-bezier(.3, 1.6, .5, 1);
    }
    .link-logo.pulsing img { transform: scale(1.14) rotate(-10deg); }
    @keyframes bob { 50% { transform: translateY(-4px); } }
    .edition { margin: 1rem 0 0; font-size: 1rem; letter-spacing: 0.24em; color: #fff; }
    .edition .brand { color: var(--color-mc-green); }
    .motd { max-width: 26rem; margin: 0.6rem auto 0; font-size: 0.95rem; line-height: 1.55; color: var(--color-ore-white); text-wrap: balance; }

    /* ── Menu: plain stacked buttons, as on the title screen ───────────── */
    .menu { display: flex; flex-direction: column; gap: 0.6rem; }
    .menu :global(.ore-btn) { width: 100%; padding-inline: 0.75rem; }
    .menu :global(.ore-btn.lg) { min-height: clamp(3rem, 5.4vh, 3.5rem); font-size: clamp(1.05rem, 0.6vw + 0.6rem, 1.2rem); }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }

    /* The game's version and copyright lines, in the bottom corners. */
    .corner { position: absolute; bottom: 0.6rem; z-index: 3; margin: 0; font-size: 0.85rem; color: #fff; }
    .corner.left { left: 0.8rem; }
    .corner.right { right: 0.8rem; }
    @media (max-width: 1399px) { .corner { display: none; } }

    /* ── The two side panels: a title bar, the chat, a hint ────────────── */
    .panel { display: flex; flex-direction: column; min-width: 0; min-height: 0; padding-bottom: calc(3 * var(--t)); }
    /* The Minecraft window is see-through: its chat floats over the world, like in the game. */
    .panel.mc { --face: rgb(30 30 31 / 0.3); }
    .p-head { display: flex; align-items: center; gap: 0.6rem; flex: none; padding: 0.6rem 0.85rem calc(0.6rem + 3 * var(--t)); }
    .p-title { font-size: 1.1rem; color: #000; }
    .p-sub { margin-left: auto; overflow: hidden; font-size: 0.85rem; color: #48494a; text-overflow: ellipsis; white-space: nowrap; }
    .dc-icon { display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 50%; background: #5865f2; color: #fff; }
    .p-body { position: relative; flex: 1; display: flex; flex-direction: column; min-height: 22rem; }
    /* The Minecraft chat sits over the world, which shows through the window. */
    .mc-body { justify-content: flex-end; padding: 0.75rem; }
    .dc-body { background: var(--color-dc); }
    .dc-body :global(.window) { border-radius: 0; box-shadow: none; }
    /* Size to the space the panel gives, never grow it as messages arrive. */
    .p-body > * { contain: size; }
    .mc-body > .mc-chat { contain: none; }
    .hint {
        flex: none; margin: 0; padding: 0.55rem 0.85rem;
        border-top: var(--t) solid #1e1e1f; background: #313233;
        font-size: 0.85rem; color: var(--color-ore-white);
    }

    /* New lines push older ones up; the oldest drop off the top. Room around the chat bar for its
       focus rings, which overflow would clip; the negative margin keeps it in line. */
    .mc-chat {
        flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden;
        padding: 0 calc(3 * var(--t)) calc(3 * var(--t)); margin: 0 calc(-3 * var(--t)) calc(-3 * var(--t));
    }
    .mc-chat :global(.chat) { flex: 1; min-height: 0; justify-content: flex-end; }
    .mc-chat :global(.lines) { flex: 1; min-height: 0; overflow: hidden; }
    .dc-end { flex: 1; min-height: 0; display: flex; flex-direction: column; }
    /* A key, like the game's keyboard hints: a small light keycap. */
    .hint kbd {
        display: inline-grid; place-items: center; min-width: 1.5em; height: 1.5em; padding: 0 0.3em var(--t);
        border: var(--t) solid #1e1e1f; background: #d0d1d4; box-shadow: inset 0 calc(-1 * var(--t)) 0 #58585a;
        color: #000; font-family: var(--font-pixel); font-size: 0.85em;
    }
    .hint code { font-family: var(--font-pixel); color: var(--color-mc-yellow); }

    /* The message in flight between the chats (see hero/packet.ts). */
    .hero :global(.packet) {
        position: absolute; left: -6px; top: -6px; z-index: 10;
        width: 12px; height: 12px; pointer-events: none;
        background: var(--color-ore-green-light);
        box-shadow: 0 0 0 2px var(--color-ore-green-dark), 0 0 18px 4px rgb(99 157 82 / 0.75);
    }
    .hero :global(.packet.toMinecraft) {
        background: #8b95ff;
        box-shadow: 0 0 0 2px #1e2470, 0 0 18px 4px rgb(88 101 242 / 0.8);
    }

    /* Tablets: the title and menu on top, the two chats side by side under them. */
    @media (max-width: 1100px) {
        .hero { justify-content: flex-start; min-height: 0; }
        .layout { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-areas: 'center center' 'mc dc'; }
        .center { justify-self: center; width: min(31rem, 100%); }
        .p-body { flex: none; min-height: 0; height: clamp(18rem, 45svh, 26rem); }
    }

    /* Phones: one column. Title and menu, then Minecraft over its world, then Discord over Discord. */
    @media (max-width: 760px) {
        .hero { padding-bottom: 1.5rem; }
        .hero :global(.mc-bg) { inset: 0; mask: none; }
        .dc-bg { display: none; }
        .layout { grid-template-columns: minmax(0, 1fr); grid-template-areas: 'center' 'mc' 'dc'; gap: 1.25rem; }
        .title-card { padding-inline: 1rem; }
        .splash { right: 0; font-size: 0.75rem; }
        .p-body { height: 18rem; }
        .dc-body { height: 22rem; }
    }
</style>
