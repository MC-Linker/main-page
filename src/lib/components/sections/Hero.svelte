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
     * The hero: a fullscreen split, Minecraft on the left (the game itself: the world,
     * chat bottom-left, a hotbar) and a Discord channel on the right. An intro screen
     * comes first over the split, out of focus; scrolling pulls the split into focus.
     */

    const bridge = new Bridge();
    bridge.seed();

    const keyboard = new MediaQuery('(hover: hover) and (pointer: fine)', true);
    const stacked = new MediaQuery('(max-width: 760px)', false);

    let stage: HTMLElement;
    let track: HTMLElement | undefined = $state();
    let logo: HTMLElement;
    let mcEnd: HTMLElement;
    let dcEnd: HTMLElement;
    let mcChat: McChat;
    let channel: DemoChannel;
    let pulsing = $state(false);
    /** 0 = the intro screen, 1 = the split in focus. */
    let p = $state(0);
    let started = false;

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

    function onscroll() {
        if(!track) return;
        const r = track.getBoundingClientRect();
        const run = r.height - window.innerHeight;
        p = Math.min(1, Math.max(0, -r.top / (run * 0.85)));
        if(p > 0.5) start();
    }

    /** "Try it live": scroll down to where the split is fully open. */
    function open() {
        if(!track) return;
        const r = track.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + r.top + (r.height - window.innerHeight), behavior: scrollBehavior() });
    }

    onMount(() => {
        bridge.transfer = transfer;
        onscroll();
    });

    const hotbar = ['iron_sword', 'compass', 'clock', 'writable_book', 'spyglass', 'name_tag', 'emerald', 'oak_sign', 'chain'];
    const ease = (t: number) => t * t * (3 - 2 * t);
    const q = $derived(ease(p));
</script>

<svelte:window onkeydown={shortcuts} onscroll={onscroll} onresize={onscroll} />

<div id="top" class="track" bind:this={track}>
<section class="split" bind:this={stage} aria-labelledby="hero-title" style:--q={q} class:open={p >= 1}>
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
            <div class="hotbar" aria-hidden="true">
                {#each hotbar as item, i (item)}<span class="slot" class:sel={i === 0}><img src="/mc/items/{item}.png" alt="" /></span>{/each}
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
    <div class="seam">
        <span class="chain" class:pulsing bind:this={logo}><img src="/logo-outlined.svg" alt="" width="1006" height="518" /></span>
    </div>

    <!-- ── Intro screen: over the split, out of focus, until you scroll ── -->
    {#if p < 1}<div class="veil"></div>{/if}
        <div class="intro" style:opacity={1 - Math.min(1, q * 2.5)} style:pointer-events={p > 0.4 ? 'none' : 'auto'}>
            <img class="intro-logo" src="/logo-outlined.svg" alt="MC Linker" width="1006" height="518" />
            <p class="eyebrow mc-text">Minecraft <span>⇄</span> Discord</p>
            <p class="headline ore-title">The easiest<br /><span class="nowrap">Minecraft–Discord</span> link.</p>
            <p class="sub">Chat both ways, run commands, see stats and inventories. One plugin, one slash command, no config files.</p>
            <div class="ctas">
                <OreButton href={links.invite} external variant="discord" hero size="lg"><BrandIcon brand="discord" size="1.15em" /> Add to Discord</OreButton>
                <OreButton onclick={open} hero size="lg">Try it live ↓</OreButton>
            </div>
        </div>
</section>
</div>

<style>
    /* The track is taller than the screen; the split sticks while you scroll through it. */
    .track { position: relative; height: calc(2.2 * (100svh - var(--nav-h))); }
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
    .split { position: sticky; top: var(--nav-h); }

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
    .mc-hud { position: absolute; inset: auto 0 0 0; z-index: 1; display: flex; flex-direction: column; gap: 0.75rem; padding: 0 1rem 0.9rem; }
    .mc-chat { width: min(100%, 36rem); height: min(26rem, calc(100svh - var(--nav-h) - 16rem)); display: flex; flex-direction: column; justify-content: flex-end; }
    .mc-chat :global(.chat) { flex: 1; min-height: 0; justify-content: flex-end; }
    .mc-chat :global(.lines) { flex: 1; min-height: 0; overflow: hidden; }
    .hotbar { align-self: center; display: flex; padding: 3px; background: rgb(0 0 0 / 0.55); border: 2px solid #1e1e1f; }
    .slot { display: grid; place-items: center; width: clamp(2.1rem, 3.2vw, 2.9rem); aspect-ratio: 1; border: 2px solid #8b8b8b; border-right-color: #373737; border-bottom-color: #373737; background: rgb(139 139 139 / 0.35); }
    .slot.sel { outline: 3px solid #fff; outline-offset: -1px; position: relative; z-index: 1; }
    .slot img { width: 70%; image-rendering: pixelated; }

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
    .dc-main :global(.content), .dc-main :global(.footer) { padding-left: 5.25rem; }

    /* ── The seam ── */
    .split::after { content: ''; position: absolute; inset: 0 auto 0 50%; width: 4px; margin-left: -2px; background: #000; z-index: 2; pointer-events: none; }
    .seam { position: absolute; top: 50%; left: 50%; z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transform: translate(-50%, -50%); pointer-events: none; }
    .chain { width: clamp(7rem, 9.5vw, 10rem); animation: bob 4s ease-in-out infinite; }
    .chain img { width: 100%; height: auto; transition: transform 0.25s cubic-bezier(.3, 1.6, .5, 1); }
    .chain.pulsing img { transform: scale(1.14) rotate(-10deg); }
    @keyframes bob { 50% { transform: translateY(-4px); } }
    .seam { opacity: calc((var(--q) - 0.6) * 2.5); }

    /* The message in flight (see hero/packet.ts). */
    .split :global(.packet) {
        position: absolute; left: -6px; top: -6px; z-index: 10; width: 12px; height: 12px; pointer-events: none;
        background: var(--color-ore-green-light); box-shadow: 0 0 0 2px var(--color-ore-green-dark), 0 0 18px 4px rgb(99 157 82 / 0.75);
    }
    .split :global(.packet.toMinecraft) { background: #8b95ff; box-shadow: 0 0 0 2px #1e2470, 0 0 18px 4px rgb(88 101 242 / 0.8); }

    /* ── Intro ── */
    .intro {
        position: absolute; inset: 0; z-index: 5;
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
        padding: 1rem; text-align: center;
        background: radial-gradient(ellipse at center, rgb(0 0 0 / 0.45), transparent 70%);
    }
    /* The logo, big, with a black outline and shadow traced along its shapes (logo-outlined.svg),
       so it stands out from both worlds. */
    .intro-logo { position: relative; display: block; width: clamp(11rem, 20vw, 17rem); height: auto; }
    .eyebrow { margin: 0; font-size: 1rem; color: var(--color-mc-yellow); text-shadow: 0.12em 0.12em 0 #3f3f00; }
    .eyebrow span { color: #fff; }
    .nowrap { white-space: nowrap; }
    .headline { margin: 0; font-size: clamp(2rem, 4.4vw, 3.6rem); line-height: 1.1; color: #fff; text-shadow: 0.08em 0.08em 0 rgb(0 0 0 / 0.6); text-wrap: balance; }
    .sub { max-width: 34rem; margin: 0; font-size: 1.05rem; line-height: 1.55; color: var(--color-ore-white); text-wrap: balance; }
    .ctas { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 0.5rem; }

    /* ── Phones: Minecraft on top, Discord below, the chain on the seam between ── */
    @media (max-width: 760px) {
        .titlebar { display: none; }
        .dc-main :global(.content), .dc-main :global(.footer) { padding-left: 1rem; }
        .split { grid-template-columns: minmax(0, 1fr); grid-template-rows: 44fr 56fr; min-height: 0; }
        .split::after { inset: 44% 0 auto 0; width: auto; height: 4px; margin: -2px 0 0; }
        .seam { top: 44%; }
        .chain { width: 4.5rem; animation: none; }
        /* Below the header's hanging banner. */
        .mc-top { top: 2.4rem; left: 0.75rem; }
        .mc-logo { width: 7rem; }
        .mc-hud { padding: 0 0.5rem 1.4rem; gap: 0.4rem; }
        .mc-chat { height: auto; max-height: calc(44svh - 6rem); }
        .hotbar { display: none; }
        .headline { font-size: 2rem; }
        .sub { font-size: 0.95rem; }
    }
</style>
