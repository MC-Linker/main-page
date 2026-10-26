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
     * comes first over the split, out of focus; the first bit of scrolling (or Try it live,
     * or a tap on it) opens it, and scrolling back up closes it and pauses the demo.
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
    let track: HTMLElement | undefined = $state();
    let pulsing = $state(false);
    /** How far the intro's logo moves and scales to land on the chain at the seam. */
    let flight = $state({ x: 0, y: 0, s: 1 });
    /** 0 = the intro screen, 1 = the split in focus. */
    let p = $state(0);
    let started = false;

    async function transfer(dir: Direction) {
        if(reducedMotion.current || !stage) return;
        setTimeout(() => {
            pulsing = true;
            setTimeout(() => (pulsing = false), 240);
        }, 360);
        const dc = dcEnd.querySelector<HTMLElement>('.dc-list') ?? dcEnd;
        await flyPacket(stage, { mc: mcEnd, dc, logo }, dir);
    }

    /** The visitor has typed in a chat: from then on, screen readers hear the replies. */
    let joined = $state(false);

    function fromMinecraft(text: string) {
        joined = true;
        if(stacked.current) (document.activeElement as HTMLElement | null)?.blur();
        void bridge.runMinecraft(text);
    }
    function fromDiscord(text: string) {
        joined = true;
        if(stacked.current) (document.activeElement as HTMLElement | null)?.blur();
        void bridge.runDiscord(text);
    }

    function shortcuts(e: KeyboardEvent) {
        if(p < 1 || e.ctrlKey || e.metaKey || e.altKey || isTextField(e.target)) return;
        // Only while the split is on screen: further down, T and / are the browser's again.
        if(stage.getBoundingClientRect().bottom < window.innerHeight / 2) return;
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

    /**
     * The intro is driven by the page's own scroll: the hero sits in a taller track, and the first
     * stretch of scrolling through it (RUN of the screen) opens the split. CSS scroll-snap settles
     * it closed or open. Nothing is blocked, so every way of scrolling works.
     */
    /** How far the page can scroll while the split stays stuck: the opening's length. */
    const run = () => track!.offsetHeight - stage.offsetHeight;
    /** How far into that it is (the stuck split's offset in the track). */
    const scrolled = () => stage.getBoundingClientRect().top - track!.getBoundingClientRect().top;

    /** Scroll and resize: at most once a frame. */
    let queued = false;
    function onscroll() {
        if(queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            update();
        });
    }

    function update() {
        if(!track || !stage) return;
        // Past the hero with the split open: nothing changes until it comes back.
        if(p === 1 && track.getBoundingClientRect().bottom < 0) return;
        const next = run() > 0 ? Math.min(1, Math.max(0, scrolled() / run())) : 1;
        if(next < 1) measure();
        // Closing: nothing in the chats stays focused.
        if(next < 0.9 && p >= 0.9 && stage.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
        p = next;
        // The demo plays while the split is open and waits while the intro shows.
        bridge.paused = p < 0.9;
        if(p > 0.5) start();
        // Snap only around the opening, so the rest of the page scrolls freely.
        document.documentElement.classList.toggle('hero-snap', scrolled() < run() + 40);
    }

    /** The page's scroll position where the split is open and fills the screen under the header. */
    const openY = () => window.scrollY + track!.getBoundingClientRect().top + run() - parseFloat(getComputedStyle(stage).top);

    /** "Try it live": scroll to where the split is open. */
    function open() {
        if(!track || !stage) return;
        window.scrollTo({ top: openY(), behavior: scrollBehavior() });
    }

    /** The chat field being typed in, if it's one of the hero's. */
    function heroField() {
        const el = document.activeElement;
        return el instanceof HTMLElement && stage?.contains(el) && isTextField(el) ? el : null;
    }

    /*
     * Phones: the keyboard makes the browser scroll the page to show the field, often too far,
     * so the split slides off. While typing, the field sits just above the keyboard instead;
     * once the keyboard closes (a message sent, or Done), the split goes back to its place.
     */
    function fitKeyboard() {
        const vv = window.visualViewport;
        const field = heroField();
        if(!stacked.current || !vv || !field || !track) return;
        // No keyboard open.
        if(vv.height > document.documentElement.clientHeight * 0.85) return;
        const box = (field.closest('.composer, .bar') ?? field).getBoundingClientRect();
        const delta = box.bottom + 8 - (vv.offsetTop + vv.height);
        if(Math.abs(delta) < 4) return;
        // Never above the open split: further up the intro closes it.
        window.scrollTo({ top: Math.max(openY(), window.scrollY + delta) });
    }

    let refocus: ReturnType<typeof setTimeout> | undefined;
    function onfocusin() {
        if(!stacked.current || !heroField()) return;
        clearTimeout(refocus);
        // After the keyboard has opened and the browser has done its own scrolling.
        refocus = setTimeout(fitKeyboard, 350);
    }
    function onfocusout(e: FocusEvent) {
        if(!stacked.current || !track || (e.relatedTarget instanceof Node && stage.contains(e.relatedTarget) && isTextField(e.relatedTarget))) return;
        clearTimeout(refocus);
        // After the keyboard has closed. Not if they scrolled away from the hero on purpose.
        refocus = setTimeout(() => {
            if(heroField()) return;
            const y = openY();
            if(Math.abs(window.scrollY - y) > 4 && Math.abs(window.scrollY - y) < window.innerHeight * 0.75) window.scrollTo({ top: y, behavior: scrollBehavior() });
        }, 350);
    }

    onMount(() => {
        bridge.transfer = transfer;
        update();
        window.visualViewport?.addEventListener('resize', fitKeyboard);
        return () => {
            clearTimeout(refocus);
            window.visualViewport?.removeEventListener('resize', fitKeyboard);
            bridge.destroy();
            document.documentElement.classList.remove('hero-snap');
        };
    });

    const ease = (t: number) => t * t * (3 - 2 * t);
    const q = $derived(ease(p));
</script>

<svelte:window onkeydown={shortcuts} {onscroll} onresize={onscroll} />

<!-- The track: the hero sticks in it while the first stretch of scrolling opens the split.
     The header's progress bar skips this stretch (data-progress-skip). -->
<div id="top" class="track" bind:this={track} data-progress-skip>
<span class="snap closed" aria-hidden="true"></span>
<span class="snap opened" aria-hidden="true"></span>
<section class="split" bind:this={stage} aria-labelledby="hero-title" style:--q={q} class:open={p >= 1} {onfocusin} {onfocusout}>

    <!-- ── Minecraft: the game itself ─────────────────────────────────── -->
    <div class="half mc" inert={p < 0.9}>
        <McWorld class="world" night={bridge.night} rain={bridge.rain} tile="var(--hero-tile)" hills />
        <div class="mc-top">
            <img class="mc-logo" src="/brands/minecraft-logo.png" alt="Minecraft" width="1499" height="261" />
            <span class="server mc-text">testing.mclinker.com · {bridge.online.length} online</span>
        </div>
        <div class="mc-hud">
            <div class="mc-chat" bind:this={mcEnd}>
                <McChat bind:this={mcChat} commands={mcCommands} lines={bridge.mc} max={stacked.current ? 6 : 12} onsubmit={fromMinecraft} label="Minecraft chat (demo)" live={joined} placeholder={keyboard.current ? 'Press T to chat' : 'Tap to chat'} />
            </div>
        </div>
    </div>

    <!-- ── Discord: just the linked channel ───────────────────────────── -->
    <div class="half dc" inert={p < 0.9}>
        <!-- Discord's desktop title bar, with the server's name. Also room for the header's hanging banner. -->
        <div class="titlebar" aria-hidden="true"><span>Your server</span></div>
        <div class="dc-main" bind:this={dcEnd}>
            <DemoChannel bind:this={channel} {bridge} onsubmit={fromDiscord} live={joined} />
        </div>
    </div>

    <!-- ── The seam: the chain joining both worlds. Messages pass through it. ── -->
    <div class="seam" class:landed={p >= 1}>
        <span class="chain" class:pulsing bind:this={logo}><img src="/logo-outlined.svg" alt="" width="1006" height="532" /></span>
    </div>

    <!-- ── Intro screen: over the split, out of focus, until it opens. A tap on its empty background opens it too. ── -->
    {#if p < 1}<div class="veil"></div>{/if}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (keyboard: Try it live, or a scroll key) -->
        <div class="intro" style:pointer-events={p > 0.4 ? 'none' : 'auto'} onclick={e => e.target === e.currentTarget && open()}>
            <!-- Flies down into the seam as it opens, and becomes the chain between the chats. -->
            <img class="intro-logo" class:landed={p >= 1} bind:this={introLogo} src="/logo-outlined.svg" alt="MC Linker" width="1006" height="532"
                style:transform="translate({flight.x * q}px, {flight.y * q}px) scale({1 + (flight.s - 1) * q})" />
            <div class="intro-text" style:opacity={1 - Math.min(1, q * 2.5)}>
            <h1 id="hero-title" class="headline ore-title"><span class="sr-only">{'MC Linker: '}</span>The easiest<br /><span class="worlds">Minecraft <span class="arrows">⇄</span> Discord</span> link.</h1>
            <p class="sub">Chat both ways, run commands, see stats and inventories and more.<br />One plugin, one bot, one command to setup.</p>
            <!-- Faded out once the split opens: then they can't be tabbed to either. -->
            <div class="ctas" inert={p >= 0.5}>
                <OreButton href={links.invite} external variant="discord" hero size="lg"><BrandIcon brand="discord" size="1.15em" /> Add to Discord</OreButton>
                <OreButton onclick={open} hero size="lg">▶ Try it live</OreButton>
            </div>
            </div>
        </div>
</section>
</div>

<style>
    /* One screen for the hero, plus the stretch of scrolling that opens it. */
    .track { --run: 40svh; position: relative; height: calc(100svh - var(--nav-h) + var(--run)); }
    /* Where the page settles: the intro, or the open split. */
    .snap { position: absolute; left: 0; width: 1px; height: 1px; scroll-snap-align: start; pointer-events: none; }
    .snap.closed { top: 0; }
    .snap.opened { top: var(--run); }
    :global(html.hero-snap) { scroll-snap-type: y proximity; }
    .split {
        --seam: 0px;
        /* The world's block size, set here so the prerendered page and phones agree (no shift on load). */
        --hero-tile: 36px;
        position: sticky;
        top: var(--nav-h);
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
    /* The two worlds in the game's yellow, like a splash text. */
    .worlds { white-space: nowrap; color: var(--color-mc-yellow); text-shadow: 0.08em 0.08em 0 #3f3f00; }
    .worlds .arrows { color: #fff; text-shadow: 0.08em 0.08em 0 rgb(0 0 0 / 0.6); }
    /* Only the empty background opens the split; the text stays selectable. */
    .intro > :global(*) { cursor: auto; }
    .headline { margin: 0; font-size: clamp(2rem, 4.4vw, 3.6rem); line-height: 1.1; color: #fff; text-shadow: 0.08em 0.08em 0 rgb(0 0 0 / 0.6); text-wrap: balance; }
    .sub { max-width: 34rem; margin: 0; font-size: 1.05rem; line-height: 1.55; color: var(--color-ore-white); text-wrap: balance; }
    .ctas { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 0.5rem; }

    /* ── Phones: Minecraft on top, Discord below, the chain on the seam between ── */
    @media (max-width: 760px) {
        .split { --hero-tile: 22px; }
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
        /* Under the Minecraft logo and server name, whatever the screen height. */
        .mc-chat { height: auto; max-height: calc((100svh - var(--nav-h)) * 0.44 - 8rem); }
        .headline { font-size: 2rem; }
        .sub { font-size: 0.95rem; }
    }
</style>
