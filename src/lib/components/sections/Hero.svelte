<script lang="ts">
    import { onMount } from 'svelte';
    import { MediaQuery } from 'svelte/reactivity';
    import { isTextField, reducedMotion, scrollBehavior } from '$lib/browser';
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import DcBackdrop from '$lib/discord/DcBackdrop.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import McWorld from '$lib/mc/McWorld.svelte';
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

    <h1 id="hero-title" class="sr-only">MC Linker: Minecraft, linked with Discord</h1>

    <!-- Two chats, each under its own logo, with the MC Linker chain joining them across the seam. -->
    <div class="layout">
        <div class="brand mc">
            <img class="wordmark" src="/brands/minecraft-logo.png" alt="Minecraft" width="1499" height="261" />
            <span class="splash mc-text" aria-hidden="true">{splash}</span>
        </div>
        <div class="brand dc">
            <img class="wordmark" src="/brands/discord-logo.svg" alt="Discord" width="635" height="96" />
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

        <!-- The chain on the seam, hooked into both windows. Messages pass through it. -->
        <div class="link">
            <span class="cable mc" aria-hidden="true"></span>
            <span class="cable dc" aria-hidden="true"></span>
            <span class="chain" class:pulsing bind:this={logo}>
                <img src="/logo-horizontal.svg" alt="" width="980" height="472" />
            </span>
            <span class="link-label ore-title">Linked by<br /><span class="brand-name">MC Linker</span></span>
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

    <p class="motd">The easiest Minecraft–Discord link. Chat bridges, stats, inventories, commands and more. <a href="#setup">How does it work?</a></p>

    <p class="corner left mc-text">MC Linker · Minecraft 1.8 – 26.2</p>
    <p class="corner right mc-text">Not an official Minecraft product.</p>
</section>

<style>
    .hero {
        --seam: clamp(6.5rem, 9vw, 9rem);
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: clamp(1rem, 2.5svh, 1.75rem);
        min-height: max(calc(100svh - var(--nav-h)), 40rem);
        padding: clamp(1.25rem, 3.5svh, 2.5rem) clamp(1rem, 2.5vw, 2.5rem) clamp(2.5rem, 5svh, 3.5rem);
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

    /* Minecraft | the chain | Discord. Both sides are the same width, so the chain sits on the seam. */
    .layout {
        flex: 1;
        display: grid;
        grid-template-columns: minmax(0, 1fr) var(--seam) minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr);
        grid-template-areas: 'mclogo . dclogo' 'mc link dc';
        row-gap: clamp(0.9rem, 2.2svh, 1.5rem);
        width: 100%;
        max-height: 54rem;
        max-width: 112rem;
        margin: 0 auto;
    }
    .brand.mc { grid-area: mclogo; }
    .brand.dc { grid-area: dclogo; }
    .panel.mc { grid-area: mc; }
    .panel.dc { grid-area: dc; }
    .link { grid-area: link; }

    /* ── Each logo over its own side ───────────────────────────────────── */
    /* Above the window under it, so the splash text can hang over its edge. */
    .brand { position: relative; z-index: 1; justify-self: center; display: flex; align-items: center; height: clamp(2.6rem, 4.2vw, 4rem); }
    .wordmark { display: block; width: auto; height: 100%; filter: drop-shadow(0 3px 0 rgb(0 0 0 / 0.4)); }
    .brand.dc .wordmark { height: 80%; filter: drop-shadow(0 3px 0 rgb(0 0 0 / 0.5)); }
    /* The yellow splash text, on the corner of the Minecraft logo like in the game. */
    .splash {
        position: absolute;
        right: -1.5rem;
        bottom: -0.9rem;
        font-size: clamp(0.8rem, 1vw, 1rem);
        white-space: nowrap;
        color: #ffff00;
        text-shadow: 0.1em 0.1em 0 #3f3f00;
        transform: rotate(-16deg);
        animation: splash 0.55s ease-in-out infinite alternate;
        pointer-events: none;
    }
    @keyframes splash { to { transform: rotate(-16deg) scale(1.1); } }

    /* ── The chain: hooked into both windows' frames, on the seam ──────── */
    .link { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.7rem; }
    /* Phones: a cable from each side into the chain, in that side's colour. */
    .cable { display: none; }
    .chain {
        position: relative;
        display: grid;
        place-items: center;
        /* A little wider than the gap, so each end overlaps a window's edge. */
        width: calc(100% + 1.5rem);
        margin-top: 2.3rem;
        animation: bob 4s ease-in-out infinite;
    }
    .chain img {
        width: 100%;
        height: auto;
        filter: drop-shadow(0 4px 0 rgb(0 0 0 / 0.45));
        transition: transform 0.25s cubic-bezier(.3, 1.6, .5, 1);
    }
    .chain.pulsing img { transform: scale(1.14) rotate(-10deg); }
    @keyframes bob { 50% { transform: translateY(-4px); } }
    .link-label {
        margin: 0; padding: 0.35rem 0.5rem; background: rgb(0 0 0 / 0.6);
        font-size: clamp(0.7rem, 0.8vw, 0.85rem); line-height: 1.35; text-align: center; letter-spacing: 0.08em;
        color: #fff; text-shadow: 0.12em 0.12em 0 rgb(0 0 0 / 0.6);
    }
    .brand-name { font-size: 1.2em; color: var(--color-mc-green); }

    .motd {
        max-width: 46rem; margin: 0 auto; padding: 0.45rem 0.9rem;
        background: rgb(0 0 0 / 0.55); font-size: 0.95rem; line-height: 1.55; text-align: center; color: var(--color-ore-white); text-wrap: balance;
    }
    .motd a { color: var(--color-mc-yellow); white-space: nowrap; }

    /* The game's version and copyright lines, in the bottom corners. */
    .corner { position: absolute; bottom: 0.6rem; z-index: 3; margin: 0; font-size: 0.85rem; color: #fff; }
    .corner.left { left: 0.8rem; }
    .corner.right { right: 0.8rem; }
    @media (max-width: 1399px) { .corner { display: none; } }

    /* ── The two windows: a title bar, the chat, a hint ────────────────── */
    .panel { display: flex; flex-direction: column; min-width: 0; min-height: 0; padding-bottom: calc(3 * var(--t)); }
    /* The Minecraft window is see-through: its chat floats over the world, like in the game. */
    .panel.mc { --face: rgb(30 30 31 / 0.3); }
    .p-head { display: flex; align-items: center; gap: 0.6rem; flex: none; padding: 0.6rem 0.85rem calc(0.6rem + 3 * var(--t)); }
    .p-title { font-size: 1.1rem; color: #000; }
    .p-sub { margin-left: auto; overflow: hidden; font-size: 0.85rem; color: #48494a; text-overflow: ellipsis; white-space: nowrap; }
    .dc-icon { display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 50%; background: #5865f2; color: #fff; }
    .p-body { position: relative; flex: 1; display: flex; flex-direction: column; min-height: 24rem; }
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

    /* Tablets: the same, with a narrower gap. */
    @media (max-width: 1100px) {
        .hero { --seam: 5.5rem; justify-content: flex-start; min-height: 0; }
        .layout { flex: none; }
        .p-body { flex: none; min-height: 0; height: clamp(22rem, 55svh, 32rem); }
        .p-sub { display: none; }
    }

    /* Phones: one column. Minecraft over its world, the chain hanging down from it, then Discord. */
    @media (max-width: 760px) {
        .hero { padding-bottom: 1.5rem; }
        .hero :global(.mc-bg) { inset: 0; mask: none; }
        .dc-bg { display: none; }
        .layout {
            grid-template-columns: minmax(0, 1fr);
            grid-template-rows: none;
            grid-template-areas: 'mclogo' 'mc' 'link' 'dclogo' 'dc';
            row-gap: 0.9rem;
            /* Stacked, the windows are taller than the desktop cap; capping cut off the Discord composer. */
            max-height: none;
        }
        .brand { height: 2.6rem; }
        .splash { right: -0.5rem; }
        .p-sub { display: block; }
        .link { flex-direction: row; gap: 0.9rem; height: 5.5rem; margin-block: -0.9rem; }
        .cable { display: block; position: absolute; left: 50%; width: calc(3 * var(--t)); margin-left: calc(-1.5 * var(--t)); }
        .cable.mc { top: 0; bottom: 50%; background: var(--color-ore-green-light); box-shadow: 0 0 0 var(--t) var(--color-ore-green-dark); }
        .cable.dc { top: 50%; bottom: 0; background: #5865f2; box-shadow: 0 0 0 var(--t) #1e2470; }
        .chain { width: 4rem; margin: 0; }
        .chain img { transform: rotate(90deg); }
        .chain.pulsing img { transform: rotate(90deg) scale(1.14); }
        /* The label beside the chain, not on top of it. */
        .link-label { position: absolute; left: calc(50% + 2.5rem); text-align: left; font-size: 0.8rem; }
        .chain { animation: none; }
        .p-body { height: 20rem; }
        .dc-body { height: 24rem; }
    }
</style>
