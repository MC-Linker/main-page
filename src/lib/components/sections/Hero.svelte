<script lang="ts">
    import { onMount } from 'svelte';
    import { MediaQuery } from 'svelte/reactivity';
    import { isTextField, reducedMotion, scrollBehavior } from '$lib/browser';
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { links } from '$lib/data';
    import McChat from '$lib/mc/McChat.svelte';
    import McWorld from '$lib/mc/McWorld.svelte';
    import OreButton from '$lib/ore/OreButton.svelte';
    import { Bridge, type Direction, mcCommands } from './hero/bridge.svelte';
    import DemoChannel from './hero/DemoChannel.svelte';
    import { flyPacket } from './hero/packet';

    /*
     * The hero: a fullscreen split, Minecraft on the left (the game itself: the world
     * and its chat) and a Discord channel on the right. An intro screen
     * comes first over the split, out of focus. Try it live, the first scroll or swipe,
     * or a tap on the intro opens it (~1s). Scrolling up at the top closes it again and
     * pauses the demo until it opens.
     */

    const bridge = new Bridge();
    bridge.seed();

    const keyboard = new MediaQuery('(hover: hover) and (pointer: fine)', true);
    const stacked = new MediaQuery('(max-width: 760px)', false);

    let stage: HTMLElement;
    let logo: HTMLElement;
    let mcEnd: HTMLElement;
    let dcEnd: HTMLElement;
    let mcChat: McChat;
    let channel: DemoChannel;
    let introLogo: HTMLElement;
    let pulsing = $state(false);
    /** How far the intro's logo moves and scales to land on the chain at the seam. */
    let flight = $state({ x: 0, y: 0, s: 1 });
    /** 0 = the intro screen, 1 = the split in focus. */
    let p = $state(0);
    let started = false;
    /** How long the opening takes, in ms. */
    const OPEN_MS = 1100;

    async function transfer(dir: Direction) {
        if(reducedMotion.current || !stage) return;
        setTimeout(() => {
            pulsing = true;
            setTimeout(() => (pulsing = false), 240);
        }, 360);
        await flyPacket(stage, { mc: mcEnd, dc: dcEnd, logo }, dir);
    }

    function fromMinecraft(text: string) {
        if(stacked.current) (document.activeElement as HTMLElement | null)?.blur();
        void bridge.runMinecraft(text);
    }
    function fromDiscord(text: string) {
        if(stacked.current) (document.activeElement as HTMLElement | null)?.blur();
        void bridge.runDiscord(text);
    }

    function shortcuts(e: KeyboardEvent) {
        if(p < 1 || e.ctrlKey || e.metaKey || e.altKey || isTextField(e.target)) return;
        if(e.key === 't' || e.key === 'T') {
            e.preventDefault();
            mcChat.start();
        }
        else if(e.key === '/') {
            e.preventDefault();
            channel.start('/');
        }
    }

    function start() {
        if(started) return;
        started = true;
        void bridge.playScript(!reducedMotion.current);
    }

    /** Where the chain is, relative to the intro logo's own place (offsets ignore its transform). */
    function measure() {
        if(!introLogo || !logo || !stage) return;
        const box = stage.getBoundingClientRect();
        const chain = logo.getBoundingClientRect();
        flight = {
            x: chain.left - box.left - introLogo.offsetLeft,
            y: chain.top - box.top - introLogo.offsetTop,
            s: chain.width / introLogo.offsetWidth,
        };
    }

    /** Where the intro is heading: 1 = open, 0 = closed. */
    let target = 0;
    let frame = 0;

    /** Plays the intro towards open (1) or closed (0), from wherever it is now. */
    function animate(to: 0 | 1) {
        if(target === to && (p === to || frame)) return;
        target = to;
        cancelAnimationFrame(frame);
        frame = 0;
        if(to === 1) bridge.paused = false;
        else {
            // The demo waits while the intro shows, and nothing in the chats stays focused.
            bridge.paused = true;
            (document.activeElement as HTMLElement | null)?.blur();
        }
        if(reducedMotion.current) {
            p = to;
            if(to === 1) start();
            return;
        }
        const from = p;
        const t0 = performance.now();
        const duration = OPEN_MS * Math.abs(to - from);
        const step = (now: number) => {
            measure();
            const t = duration ? Math.min(1, (now - t0) / duration) : 1;
            p = from + (to - from) * t;
            if(to === 1 && p > 0.5) start();
            frame = t < 1 ? requestAnimationFrame(step) : 0;
        };
        frame = requestAnimationFrame(step);
    }

    /** Opens the split: the intro fades, the split comes into focus, the logo flies onto the chain. */
    const open = () => animate(1);
    /** Back to the intro, with the demo paused. */
    const close = () => animate(0);

    /** Scrolling back up to the intro (Home in the header): don't count as being past the hero. */
    let returning = false;

    /** Home, the header's logo or its up arrow: back to the top, and to the intro. */
    function showIntro() {
        returning = window.scrollY > 10;
        close();
        window.scrollTo({ top: 0, behavior: scrollBehavior() });
    }

    /** Already past the hero (a reload further down, a link to a section): just be open. */
    function onscroll() {
        if(returning) {
            if(window.scrollY <= 10) returning = false;
            return;
        }
        if(target === 0 && window.scrollY > 10) {
            target = 1;
            cancelAnimationFrame(frame);
            frame = 0;
            bridge.paused = false;
            p = 1;
            start();
        }
    }

    onMount(() => {
        bridge.transfer = transfer;
        onscroll();

        // At the top of the page, scrolling drives the intro instead of the page: down opens it
        // (and the page waits until it is open), up from the open split closes it again.
        const atTop = () => window.scrollY <= 10;
        /** Whether a scroll up there would scroll something inside the split (the Discord messages). */
        const scrollsInside = (t: EventTarget | null) => {
            const list = (t as HTMLElement | null)?.closest?.('.dc-list');
            return !!list && list.scrollTop > 0;
        };
        const go = (e: Event, down: boolean) => {
            if(!atTop()) return;
            if(down && target === 0) open();
            else if(down && p < 1) { /* still opening: let it finish */ }
            else if(!down && target === 1 && !scrollsInside(e.target)) close();
            else if(!down && p > 0) { /* still closing */ }
            else return;
            e.preventDefault();
        };
        const wheel = (e: WheelEvent) => {
            if(e.ctrlKey || !e.deltaY) return;
            go(e, e.deltaY > 0);
        };
        let touchY = 0;
        const touchstart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
        const touchmove = (e: TouchEvent) => {
            const dy = touchY - e.touches[0].clientY;
            if(Math.abs(dy) >= 6) go(e, dy > 0);
        };
        const keydown = (e: KeyboardEvent) => {
            if(isTextField(e.target)) return;
            if(e.key === ' ' && (e.target as HTMLElement | null)?.closest?.('a, button')) return;
            if(['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key)) go(e, true);
            else if(['ArrowUp', 'PageUp', 'Home'].includes(e.key)) go(e, false);
        };
        // Links to the top of the page bring the intro back.
        const click = (e: MouseEvent) => {
            if(e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const a = (e.target as HTMLElement | null)?.closest?.('a[href="#top"], a[href="/#top"]');
            if(!a) return;
            e.preventDefault();
            e.stopPropagation();
            showIntro();
        };
        // Capture: before SvelteKit's router, which handles same-page hash links itself.
        window.addEventListener('click', click, true);
        window.addEventListener('show-intro', showIntro);
        window.addEventListener('wheel', wheel, { passive: false });
        window.addEventListener('touchstart', touchstart, { passive: true });
        window.addEventListener('touchmove', touchmove, { passive: false });
        window.addEventListener('keydown', keydown);
        return () => {
            window.removeEventListener('wheel', wheel);
            window.removeEventListener('touchstart', touchstart);
            window.removeEventListener('touchmove', touchmove);
            window.removeEventListener('keydown', keydown);
            window.removeEventListener('click', click, true);
            window.removeEventListener('show-intro', showIntro);
            cancelAnimationFrame(frame);
        };
    });

    const ease = (t: number) => t * t * (3 - 2 * t);
    const q = $derived(ease(p));
</script>

<svelte:window onkeydown={shortcuts} {onscroll} />

<section id="top" class="split" bind:this={stage} aria-labelledby="hero-title" style:--q={q} class:open={p >= 1}>
    <h1 id="hero-title" class="sr-only">MC Linker: Minecraft, linked with Discord</h1>

    <!-- ── Minecraft: the game itself ─────────────────────────────────── -->
    <div class="half mc" inert={p < 0.9}>
        <McWorld class="world" night={bridge.night} rain={bridge.rain} tile={stacked.current ? 22 : 36} hills />
        <div class="mc-top">
            <img class="mc-logo" src="/brands/minecraft-logo.png" alt="Minecraft" width="1499" height="261" />
            <span class="server mc-text">testing.mclinker.com · {bridge.online.length} online</span>
        </div>
        <div class="mc-hud">
            <div class="mc-chat" bind:this={mcEnd}>
                <McChat bind:this={mcChat} commands={mcCommands} lines={bridge.mc} max={stacked.current ? 6 : 12} onsubmit={fromMinecraft} label="Minecraft chat (demo)" placeholder={keyboard.current ? 'Press T to chat' : 'Tap to chat'} />
            </div>
        </div>
    </div>

    <!-- ── Discord: just the linked channel ───────────────────────────── -->
    <div class="half dc" inert={p < 0.9}>
        <!-- Discord's desktop title bar, with the server's name. Also room for the header's hanging banner. -->
        <div class="titlebar" aria-hidden="true"><span>Your server</span></div>
        <div class="dc-main" bind:this={dcEnd}>
            <DemoChannel bind:this={channel} {bridge} onsubmit={fromDiscord} />
        </div>
    </div>

    <!-- ── The seam: the chain joining both worlds. Messages pass through it. ── -->
    <div class="seam" class:landed={p >= 1}>
        <span class="chain" class:pulsing bind:this={logo}><img src="/logo-outlined.svg" alt="" width="1006" height="532" /></span>
    </div>

    <!-- ── Intro screen: over the split, out of focus, until it opens. A tap on it (not its buttons) opens it too. ── -->
    {#if p < 1}<div class="veil"></div>{/if}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (keyboard: Try it live, or a scroll key) -->
        <div class="intro" style:pointer-events={p > 0.4 ? 'none' : 'auto'} onclick={e => !(e.target as HTMLElement).closest('a, button') && open()}>
            <!-- Flies down into the seam as it opens, and becomes the chain between the chats. -->
            <img class="intro-logo" class:landed={p >= 1} bind:this={introLogo} src="/logo-outlined.svg" alt="MC Linker" width="1006" height="532"
                style:transform="translate({flight.x * q}px, {flight.y * q}px) scale({1 + (flight.s - 1) * q})" />
            <div class="intro-text" style:opacity={1 - Math.min(1, q * 2.5)}>
            <p class="eyebrow mc-text">Minecraft <span>⇄</span> Discord</p>
            <p class="headline ore-title">The easiest<br /><span class="nowrap">Minecraft–Discord</span> link.</p>
            <p class="sub">Chat both ways, run commands, see stats and inventories and more.<br />One plugin, one bot, one command to setup.</p>
            <div class="ctas">
                <OreButton href={links.invite} external variant="discord" hero size="lg"><BrandIcon brand="discord" size="1.15em" /> Add to Discord</OreButton>
                <OreButton onclick={open} hero size="lg">▶ Try it live</OreButton>
            </div>
            </div>
        </div>
</section>

<style>
    .split {
        --seam: 0px;
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        height: calc(100svh - var(--nav-h));
        min-height: 34rem;
        overflow: hidden;
        isolation: isolate;
    }

    .half { position: relative; min-width: 0; min-height: 0; overflow: hidden; }
    /* Intro: the split, out of focus and darkened behind the intro, comes into focus as you scroll. */
    .veil {
        position: absolute; inset: 0; z-index: 4; pointer-events: none;
        backdrop-filter: blur(calc((1 - var(--q)) * 12px));
        background: rgb(0 0 0 / calc((1 - var(--q)) * 0.5));
    }

    /* ── Minecraft ── */
    .half.mc :global(.world) { position: absolute; inset: 0; }
    .mc-top { position: absolute; top: 1rem; left: 1.25rem; z-index: 1; display: flex; flex-direction: column; gap: 0.35rem; }
    .mc-logo { width: clamp(9rem, 14vw, 13rem); height: auto; filter: drop-shadow(0 3px 0 rgb(0 0 0 / 0.4)); }
    .server { align-self: flex-start; padding: 0.2rem 0.45rem; background: rgb(0 0 0 / 0.45); font-size: 0.8rem; color: #fff; }
    .mc-hud { position: absolute; inset: auto 0 0 0; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 0.9rem; padding: 0 5.5rem 0.9rem; }
    /* Centred on its side, clear of the chain on the seam. */
    .mc-chat { width: min(100%, 42rem); height: min(36rem, calc(100svh - var(--nav-h) - 9rem)); display: flex; flex-direction: column; justify-content: flex-end; }
    .mc-chat :global(.chat) { font-size: 1.15rem; }
    .mc-chat :global(.chat) { flex: 1; min-height: 0; justify-content: flex-end; }
    .mc-chat :global(.lines) { flex: 1; min-height: 0; overflow: hidden; }

    /* ── Discord ── */
    .half.dc {
        display: flex;
        flex-direction: column;
        background: var(--color-dc);
        color: var(--color-dc-text);
        font-family: var(--font-discord);
    }
    .titlebar {
        flex: none; display: grid; place-items: center; height: 2rem; background: #1e1f22;
        font-size: 0.8rem; font-weight: 600; color: #949ba4;
    }
    .dc-main { flex: 1; display: flex; min-width: 0; min-height: 0; }
    .dc-main :global(.window) { border-radius: 0; box-shadow: none; }
    /* Keep the messages clear of the chain on the seam. */
    /* The messages in a centred column, clear of the chain on the seam. */
    .dc-main :global(.content), .dc-main :global(.footer) { padding-inline: max(5.5rem, calc((100% - 46rem) / 2)); }

    /* ── The seam ── */
    .split::after { content: ''; position: absolute; inset: 0 auto 0 50%; width: 4px; margin-left: -2px; background: #000; z-index: 2; pointer-events: none; }
    .seam { position: absolute; top: 50%; left: 50%; z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transform: translate(-50%, -50%); pointer-events: none; }
    .chain { width: clamp(7rem, 9.5vw, 10rem); animation: bob 4s ease-in-out infinite; }
    .chain img { width: 100%; height: auto; transition: transform 0.25s cubic-bezier(.3, 1.6, .5, 1); }
    .chain.pulsing img { transform: scale(1.14) rotate(-10deg); }
    @keyframes bob { 50% { transform: translateY(-4px); } }
    .seam:not(.landed) { visibility: hidden; }

    /* The message in flight (see hero/packet.ts). */
    .split :global(.packet) {
        position: absolute; left: -6px; top: -6px; z-index: 10; width: 12px; height: 12px; pointer-events: none;
        background: var(--color-ore-green-light); box-shadow: 0 0 0 2px var(--color-ore-green-dark), 0 0 18px 4px rgb(99 157 82 / 0.75);
    }
    .split :global(.packet.toMinecraft) { background: #8b95ff; box-shadow: 0 0 0 2px #1e2470, 0 0 18px 4px rgb(88 101 242 / 0.8); }

    /* ── Intro ── */
    .intro {
        position: absolute; inset: 0; z-index: 5; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
        padding: 1rem; text-align: center;
        background: radial-gradient(ellipse at center, rgb(0 0 0 / 0.45), transparent 70%);
    }
    /* The logo, big, with a black outline and shadow traced along its shapes (logo-outlined.svg),
       so it stands out from both worlds. */
    .intro-logo { position: relative; z-index: 1; display: block; width: clamp(11rem, 20vw, 17rem); height: auto; transform-origin: 0 0; will-change: transform; }
    .intro-logo.landed { visibility: hidden; }
    .intro-text { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .eyebrow { margin: 0; font-size: 1rem; color: var(--color-mc-yellow); text-shadow: 0.12em 0.12em 0 #3f3f00; }
    .eyebrow span { color: #fff; }
    .nowrap { white-space: nowrap; }
    .headline { margin: 0; font-size: clamp(2rem, 4.4vw, 3.6rem); line-height: 1.1; color: #fff; text-shadow: 0.08em 0.08em 0 rgb(0 0 0 / 0.6); text-wrap: balance; }
    .sub { max-width: 34rem; margin: 0; font-size: 1.05rem; line-height: 1.55; color: var(--color-ore-white); text-wrap: balance; }
    .ctas { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 0.5rem; }

    /* ── Phones: Minecraft on top, Discord below, the chain on the seam between ── */
    @media (max-width: 760px) {
        .titlebar { display: none; }
        .dc-main :global(.content), .dc-main :global(.footer) { padding-inline: 1rem; }
        .split { grid-template-columns: minmax(0, 1fr); grid-template-rows: 44fr 56fr; min-height: 0; }
        .split::after { inset: 44% 0 auto 0; width: auto; height: 4px; margin: -2px 0 0; }
        .seam { top: 44%; }
        .chain { width: 4.5rem; animation: none; }
        /* Below the header's hanging banner. */
        .mc-top { top: 2.4rem; left: 0.75rem; }
        .mc-logo { width: 7rem; }
        .mc-hud { padding: 0 0.5rem 1.4rem; gap: 0.4rem; }
        .mc-chat :global(.chat) { font-size: 1rem; }
        .mc-chat { width: 100%; }
        .mc-chat { height: auto; max-height: calc(44svh - 6rem); }
        .headline { font-size: 2rem; }
        .sub { font-size: 0.95rem; }
    }
</style>
