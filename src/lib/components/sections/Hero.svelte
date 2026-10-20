<script lang="ts">
    import { onMount } from 'svelte';
    import { MediaQuery } from 'svelte/reactivity';
    import { fly } from 'svelte/transition';
    import { isTextField, reducedMotion, scrollBehavior } from '$lib/browser';
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { links } from '$lib/data';
    import DcBackdrop from '$lib/discord/DcBackdrop.svelte';
    import McButton from '$lib/mc/McButton.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import McWorld from '$lib/mc/McWorld.svelte';
    import { Bridge, type Direction } from './hero/bridge.svelte';
    import DemoChannel from './hero/DemoChannel.svelte';
    import { flyPacket } from './hero/packet';

    // The pretend server and channel behind both chats. The first messages are
    // there right away (and in the prerendered page); the rest plays on load.
    const bridge = new Bridge();
    bridge.seed();

    const keyboard = new MediaQuery('(hover: hover) and (pointer: fine)', true);
    /** Phones: the two chats are stacked, so the other one is usually off-screen. */
    const stacked = new MediaQuery('(max-width: 860px)', false);

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
    <!-- Like the title screen: both worlds out of focus behind the menu. -->
    <McWorld class="mc-bg" night={bridge.night} rain={bridge.rain} tile={34} hills blur={3} />
    <div class="dc-bg" aria-hidden="true"><DcBackdrop /></div>

    <h1 id="hero-title" class="title">
        <span class="word mc">
            <img class="wordmark" src="/brands/minecraft-logo.png" alt="Minecraft" width="1499" height="261" />
            <span class="splash on-mc mc-text" aria-hidden="true">{splash}</span>
        </span>
        <span class="link-logo" class:pulsing bind:this={logo}>
            <img src="/logo-horizontal.svg" alt="" width="980" height="472" />
            <span class="sr-only">linked with</span>
        </span>
        <span class="word dc">
            <img class="wordmark" src="/brands/discord-logo.svg" alt="Discord" width="635" height="96" />
        </span>
    </h1>
    <p class="edition mojang">Linked by <span class="brand">MC Linker</span></p>
    <p class="motd mc-text">Easiest Minecraft–Discord link! NO bot setup or configuration files! Add chat bridges, view stats and inventories, run commands and more!</p>

    <!-- The game's title menu, right between the two worlds. -->
    <nav class="menu" aria-label="Get started" in:fly={{ y: 16, duration: 500, delay: 150 }}>
        <McButton href={links.invite} external size="lg" variant="discord"><BrandIcon brand="discord" size="1.15em" /> Add to Discord</McButton>
        <McButton href="#install" size="lg">Get the Plugin</McButton>
        <div class="row">
            <McButton href={links.guide} size="lg">Guide</McButton>
            <McButton href={links.support} external size="lg">Support...</McButton>
        </div>
        <McButton href="#setup" size="lg">How does it work?</McButton>
        <p class="fine mc-text">Free · Paper, Spigot, Fabric, Forge &amp; NeoForge · <span class="nowrap">1.8 – 26.2</span></p>
    </nav>

    <div class="mc-side">
        <p class="hint mc-text">{#if keyboard.current}<kbd>T</kbd> to chat · {/if}try <code>/time set night</code></p>
        <div class="mc-chat" bind:this={mcEnd}>
            <McChat bind:this={mcChat} lines={bridge.mc} max={40} onsubmit={fromMinecraft} label="Minecraft chat (demo)" placeholder={keyboard.current ? 'Press T to chat' : 'Tap to chat'} />
        </div>
    </div>

    <div class="dc-side">
        <p class="hint">{#if keyboard.current}<kbd>/</kbd> for commands · {/if}try <code>/command weather rain</code></p>
        <div class="dc-end" bind:this={dcEnd}>
            <DemoChannel bind:this={channel} {bridge} onsubmit={fromDiscord} />
        </div>
    </div>

    <p class="corner left mc-text">MC Linker · Minecraft 1.8 – 26.2</p>
    <p class="corner right mc-text">Not an official Minecraft product.</p>
</section>

<style>
    .hero {
        --logo: clamp(5rem, 7.5vw, 9rem);
        /* Space between a chat and the menu, and between a chat and the screen edge. */
        --gutter: clamp(1rem, 2.5vw, 3rem);
        --edge: clamp(1rem, 2vw, 2.5rem);
        position: relative;
        display: grid;
        /* Two equal middle columns put the seam (and the logo) at exactly 50%. */
        grid-template-columns: 1fr minmax(9.5rem, 13.5rem) minmax(9.5rem, 13.5rem) 1fr;
        /* The last row takes all the height that's left, so the chats can fill it. */
        grid-template-rows: auto auto auto 1fr;
        min-height: max(100svh, 46rem);
        padding: clamp(1.5rem, 4svh, 3rem) 0 var(--hud-space);
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

    /* ── Title, like the game's logo ───────────────────────────────────── */
    .title {
        grid-column: 1 / -1;
        grid-row: 1;
        display: grid;
        /* The logo sits on the seam and overlaps both halves; each word is centred in its own half. */
        grid-template-columns: 1fr 0 1fr;
        align-items: center;
        margin: 0;
        font-weight: 400;
        line-height: 1;
    }
    /* font-size only scales the splash text; the logos are sized by width. */
    .word { position: relative; display: block; color: #fff; font-size: clamp(2.5rem, 5.8vw, 6.6rem); }
    .word.mc, .word.dc { justify-self: center; }
    .wordmark { display: block; height: auto; filter: drop-shadow(0 6px 0 rgb(0 0 0 / 0.3)); }
    .word.mc .wordmark { width: clamp(15rem, 30vw, 40rem); }
    .word.dc .wordmark { width: clamp(12rem, 25vw, 34rem); }
    /* The yellow splash text, at the end of the logo like in the game. */
    .splash {
        position: absolute;
        font-family: var(--font-pixel);
        font-size: max(0.2em, 0.95rem);
        font-weight: 400;
        letter-spacing: 0;
        white-space: nowrap;
        color: #ffff00;
        text-shadow: 0.1em 0.1em 0 #3f3f00;
        transform: rotate(-20deg);
        animation: splash 0.55s ease-in-out infinite alternate;
        pointer-events: none;
    }
    .splash.on-mc { right: 0.5rem; bottom: -0.3em; }
    @keyframes splash { to { transform: rotate(-20deg) scale(1.1); } }
    .link-logo {
        position: relative;
        display: grid;
        place-items: center;
        justify-self: center;
        width: calc(var(--logo) * 1.3);
        height: var(--logo);
        animation: bob 4s ease-in-out infinite;
    }
    .link-logo img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 6px 0 rgb(0 0 0 / 0.35));
        transition: transform 0.25s cubic-bezier(.3, 1.6, .5, 1);
    }
    .link-logo.pulsing img { transform: scale(1.14) rotate(-10deg); }
    @keyframes bob { 50% { transform: translateY(-6px); } }

    /* Like "Java Edition" under the game's logo. */
    .edition {
        grid-column: 1 / -1;
        grid-row: 2;
        justify-self: center;
        margin: clamp(0.4rem, 1.5vh, 1rem) 0 0;
        font-size: clamp(1rem, 1.5vw, 1.5rem);
        letter-spacing: 0.28em;
        color: #fff;
        text-shadow: 0.1em 0.1em 0 rgb(0 0 0 / 0.6);
    }
    .edition .brand { color: var(--color-grass-light); }
    .motd {
        grid-column: 2 / 4;
        grid-row: 3;
        justify-self: center;
        max-width: 36rem;
        margin: 0.6rem 1rem 0;
        text-align: center;
        font-size: clamp(0.95rem, 0.4vw + 0.75rem, 1.15rem);
        color: #e8e8e8;
        text-wrap: balance;
    }

    /* ── Menu: plain stacked buttons, as on the title screen ───────────── */
    .menu {
        grid-column: 2 / 4;
        grid-row: 4;
        align-self: center;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        margin-top: clamp(1.5rem, 5vh, 3.5rem);
    }
    .menu :global(.mc-btn) { width: 100%; padding: 0 0.75rem; }
    .menu :global(.mc-btn.lg) { min-height: clamp(3rem, 5.6vh, 3.75rem); font-size: clamp(1.1rem, 1.1vw + 0.4rem, 1.35rem); }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.55rem; }
    .fine { display: none; margin: 0.4rem 0 0; text-align: center; font-size: 0.8rem; color: #e0e0e0; }
    .nowrap { white-space: nowrap; }

    /* The game's version and copyright lines, in the bottom corners. */
    .corner { position: absolute; bottom: 0.6rem; z-index: 3; margin: 0; font-size: 0.85rem; color: #fff; }
    .corner.left { left: 0.8rem; }
    .corner.right { right: 0.8rem; }
    @media (max-width: 1399px) { .corner { display: none; } }

    /* ── The two chats ─────────────────────────────────────────────────── */
    /* Each chat fills its half, from under the subtitle down to the hotbar. */
    .mc-side, .dc-side {
        grid-row: 3 / 5;
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: min(100%, 60rem);
        min-width: 0;
        /* Size to the space the grid gives, never grow it as messages arrive. */
        contain: size;
        min-height: 20rem;
        margin-top: clamp(1rem, 3vh, 2rem);
    }
    .mc-side { grid-column: 1; justify-self: end; justify-content: flex-end; padding: 0 var(--gutter) 0 var(--edge); }
    .dc-side { grid-column: 4; justify-self: start; padding: 0 var(--edge) 0 var(--gutter); position: relative; }
    /* New lines push older ones up; the oldest drop off the top. */
    .mc-chat { flex: 0 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden; }
    .mc-chat :global(.chat) { flex: 1; min-height: 0; }
    .mc-chat :global(.lines) { flex: 1; min-height: 0; overflow: hidden; }
    .dc-end { flex: 1; min-height: 0; display: flex; flex-direction: column; }
    .hint { margin: 0; font-size: 0.85rem; color: #e9ecef; text-shadow: 0 1px 2px rgb(0 0 0 / 0.6); }
    .mc-side .hint { color: #fff; }
    .hint kbd {
        display: inline-grid; place-items: center; min-width: 1.4em; height: 1.4em; padding: 0 0.3em;
        border-radius: 4px; background: rgb(0 0 0 / 0.45); border: 1px solid rgb(255 255 255 / 0.25);
        font-family: var(--font-pixel); font-size: 0.85em;
    }
    .hint code { font-family: var(--font-pixel); color: var(--color-mc-yellow); }
    .dc-side .hint code { font-family: var(--font-sans); color: #c9cdfb; }

    /* The message in flight between the chats (see hero/packet.ts). */
    .hero :global(.packet) {
        position: absolute; left: -6px; top: -6px; z-index: 10;
        width: 12px; height: 12px; pointer-events: none;
        background: var(--color-grass-light);
        box-shadow: 0 0 0 2px #233d0c, 0 0 18px 4px rgb(140 191 63 / 0.7);
    }
    .hero :global(.packet.toMinecraft) {
        background: #8b95ff;
        box-shadow: 0 0 0 2px #1e2470, 0 0 18px 4px rgb(88 101 242 / 0.8);
    }

    /* Smaller laptops: a narrower menu leaves the chats enough room. */
    @media (max-width: 1279px) {
        .hero { grid-template-columns: 1fr 9.75rem 9.75rem 1fr; }
    }

    /* Tablets: the menu under the title, the chats side by side below it. */
    @media (max-width: 1023px) {
        .hero { grid-template-columns: 1fr 1fr; grid-template-rows: auto auto auto auto auto; align-content: start; padding-top: 2rem; }
        .motd { grid-column: 1 / -1; }
        .menu { grid-column: 1 / -1; grid-row: 4; justify-self: center; width: min(25rem, calc(100% - 2rem)); }
        .mc-side, .dc-side { grid-row: 5; align-self: start; width: 100%; contain: none; min-height: 0; }
        .mc-chat { flex: none; max-height: clamp(16rem, 50svh, 28rem); }
        .mc-side { grid-column: 1; }
        .dc-side { grid-column: 2; }
    }

    /* Phones: Minecraft on top (logo, menu, chat), Discord below, the link on the seam between them. */
    @media (max-width: 860px) {
        .hero {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(7, auto);
            min-height: 0;
            padding: 0 0 var(--hud-space);
        }
        .hero :global(.mc-bg) { position: relative; inset: auto; grid-column: 1; grid-row: 1 / 6; mask: none; }
        .dc-bg { position: relative; inset: auto; grid-column: 1; grid-row: 6 / -1; margin-bottom: calc(-1 * var(--hud-space)); }
        .title { display: contents; }
        .title > * { grid-column: 1; }
        .word.mc { grid-row: 1; justify-self: center; padding: 3.5rem 0 0; font-size: clamp(2.6rem, 13vw, 4rem); }
        .word.mc .wordmark { width: min(82vw, 24rem); }
        .word.dc .wordmark { width: min(58vw, 17rem); }
        .splash.on-mc { display: block; right: -0.6rem; bottom: auto; top: 2.4rem; transform-origin: center; }
        .edition { grid-row: 2; font-size: 0.9rem; letter-spacing: 0.14em; }
        .motd { grid-row: 3; font-size: 0.95rem; }
        .menu { grid-column: 1; grid-row: 4; justify-self: center; width: min(24rem, calc(100% - 2rem)); margin-top: 1.75rem; }
        .fine { display: block; }
        .mc-side { grid-column: 1; grid-row: 5; justify-self: stretch; width: auto; margin: 2rem 0 0; padding: 0 1rem calc(var(--logo) / 2 + 1.5rem); }
        .mc-chat { max-height: 16rem; }
        .link-logo { grid-row: 6; justify-self: center; align-self: start; margin-top: calc(var(--logo) / -2); z-index: 2; }
        .word.dc { grid-row: 6; justify-self: center; padding: calc(var(--logo) / 2 + 0.75rem) 0 0; }
        .dc-side { grid-column: 1; grid-row: 7; justify-self: stretch; width: auto; margin: 1.25rem 0 0; padding: 0 1rem 1rem; }
    }
</style>
