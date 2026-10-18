<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { fly, fade } from 'svelte/transition';
    import { Bridge, demoCommands } from '$lib/bridge.svelte';
    import { links } from '$lib/data/links';
    import { reducedMotion } from '$lib/motion';
    import { MediaQuery } from 'svelte/reactivity';
    import McWorld from '$lib/mc/McWorld.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import McButton from '$lib/mc/McButton.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import DcComposer from '$lib/discord/DcComposer.svelte';
    import BrandIcon from './BrandIcon.svelte';

    const bridge = new Bridge();
    bridge.seed();
    const keyboard = new MediaQuery('(hover: hover) and (pointer: fine)', true);

    let stage: HTMLElement;
    let logo: HTMLElement;
    let mcEnd: HTMLElement;
    let dcEnd: HTMLElement;
    let dcList: HTMLElement;
    let mcChat: McChat;
    let composer: DcComposer;
    let pulsing = $state(false);

    /** Sends a little pixel from one chat, through the logo, to the other. */
    async function transfer(dir: 'toDiscord' | 'toMinecraft') {
        if(reducedMotion.current || !stage) return;
        const box = stage.getBoundingClientRect();
        const centre = (el: HTMLElement, side?: 'left' | 'right' | 'top' | 'bottom') => {
            const r = el.getBoundingClientRect();
            const x = side === 'left' ? r.left + 12 : side === 'right' ? r.right - 12 : r.left + r.width / 2;
            const y = side === 'top' ? r.top + 12 : side === 'bottom' ? r.bottom - 12 : r.top + r.height / 2;
            return [x - box.left, y - box.top];
        };
        const [mx, my] = centre(mcEnd, 'right');
        const [dx, dy] = centre(dcEnd, 'left');
        const [lx, ly] = centre(logo);
        const [x0, y0, x1, y1] = dir === 'toDiscord' ? [mx, my, dx, dy] : [dx, dy, mx, my];

        const packet = document.createElement('span');
        packet.className = `packet ${dir}`;
        stage.appendChild(packet);
        const anim = packet.animate([
            { transform: `translate(${x0}px, ${y0}px) scale(0.6)`, opacity: 0 },
            { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1, offset: 0.08 },
            { transform: `translate(${lx}px, ${ly}px) scale(1.6)`, opacity: 1, offset: 0.5 },
            { transform: `translate(${x1}px, ${y1}px) scale(1)`, opacity: 1, offset: 0.92 },
            { transform: `translate(${x1}px, ${y1}px) scale(0.6)`, opacity: 0 },
        ], { duration: 800, easing: 'cubic-bezier(.45,0,.55,1)' });
        setTimeout(() => { pulsing = true; setTimeout(() => (pulsing = false), 240); }, 360);
        await anim.finished.catch(() => {});
        packet.remove();
    }

    // Keep the newest Discord message in view.
    $effect(() => {
        bridge.dc.length;
        bridge.typing;
        tick().then(() => dcList?.scrollTo({ top: dcList.scrollHeight, behavior: reducedMotion.current ? 'auto' : 'smooth' }));
    });

    function shortcuts(e: KeyboardEvent) {
        const t = e.target as HTMLElement;
        if(e.ctrlKey || e.metaKey || e.altKey || t.closest('input, textarea, [contenteditable]')) return;
        if(e.key === 't' || e.key === 'T') { e.preventDefault(); mcChat.start(); }
        else if(e.key === '/') { e.preventDefault(); composer.start('/'); }
    }

    onMount(() => {
        bridge.transfer = transfer;
        void bridge.playScript(!reducedMotion.current);
    });
</script>

<svelte:window onkeydown={shortcuts} />

<section class="hero" bind:this={stage} aria-labelledby="hero-title">
    <McWorld class="mc-bg" night={bridge.night} rain={bridge.rain} tile={34} />
    <div class="dc-bg" aria-hidden="true"></div>

    <h1 id="hero-title" class="title">
        <span class="word mc mc-text">Minecraft</span>
        <span class="link-logo" class:pulsing bind:this={logo}>
            <img src="/logo.svg" alt="" width="160" height="160" />
            <span class="sr-only">linked with</span>
        </span>
        <span class="word dc">Discord</span>
    </h1>

    <div class="pitch" in:fly={{ y: 16, duration: 500, delay: 150 }}>
        <p class="lead">
            MC Linker connects your Minecraft server to your Discord server.
            Chat, stats and moderation, <em>both ways</em>. No bot to host, no config files.
        </p>
        <div class="ctas">
            <McButton href="#setup" size="lg">Get the plugin</McButton>
            <a class="dc-btn" href={links.invite} target="_blank" rel="noopener">
                <BrandIcon brand="discord" size="1.3em" />
                Add to Discord
            </a>
        </div>
        <p class="fine">Free · Paper, Spigot, Fabric, Forge &amp; NeoForge · 1.8 → 26.2</p>
    </div>

    <div class="mc-side">
        <p class="hint mc-text">{#if keyboard.current}<kbd>T</kbd> to chat · {/if}try <code>/time set night</code></p>
        <div class="mc-chat" bind:this={mcEnd}>
            <McChat bind:this={mcChat} lines={bridge.mc} onsubmit={t => bridge.runMinecraft(t)} label="Minecraft chat (demo)" placeholder={keyboard.current ? 'Press T to chat' : 'Tap to chat'} />
        </div>
    </div>

    <div class="dc-side">
        <p class="hint">{#if keyboard.current}<kbd>/</kbd> for commands · {/if}try <code>/command weather rain</code></p>
        <div bind:this={dcEnd}>
            <DcWindow channel="minecraft-chat" topic="Linked with play.example.net · {bridge.online.length} online" class="dc-window">
                <div class="dc-list" bind:this={dcList} aria-live="polite" aria-label="Discord channel (demo)">
                    {#each bridge.dc as msg (msg.id)}
                        <div in:fly={{ y: 10, duration: 220 }}><DcMessage {msg} compact /></div>
                    {/each}
                </div>
                {#snippet footer()}
                    <DcComposer bind:this={composer} placeholder="Message #minecraft-chat" commands={demoCommands} onsubmit={t => bridge.runDiscord(t)} label="Discord message (demo)" />
                    <div class="typing" aria-live="polite">
                        {#if bridge.typing}<span transition:fade={{ duration: 150 }}><i></i><i></i><i></i> <b>{bridge.typing}</b> is typing…</span>{/if}
                    </div>
                {/snippet}
            </DcWindow>
            {#if bridge.dmToast}
                <div class="dm-toast" role="status" transition:fly={{ y: -12, duration: 250 }}>
                    <span class="dm-icon" aria-hidden="true">📬</span>
                    <span><b>New DM from You</b><br />{bridge.dmToast}</span>
                </div>
            {/if}
        </div>
    </div>
</section>

<style>
    .hero {
        --logo: clamp(5rem, 8.5vw, 8rem);
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 5rem auto auto 1fr;
        min-height: max(100svh, 46rem);
        isolation: isolate;
        overflow: hidden;
    }
    .hero :global(.mc-bg) {
        grid-column: 1;
        grid-row: 1 / -1;
        z-index: -1;
        /* Pixel-stepped edge along the seam, like the grass edge in the logo. */
        mask:
            linear-gradient(#000 0 0) left / calc(100% - 12px) 100% no-repeat,
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 8' width='12' height='32'%3E%3Cpath d='M0 0h3v2H2v2h1v1H1v3H0z'/%3E%3C/svg%3E") right top / 12px 32px repeat-y;
    }
    .dc-bg {
        grid-column: 2;
        grid-row: 1 / -1;
        z-index: -2;
        margin-left: -12px;
        background:
            radial-gradient(60rem 30rem at 85% 0%, rgb(88 101 242 / 0.22), transparent 60%),
            var(--color-dc-3);
    }

    .title {
        grid-column: 1 / -1;
        grid-row: 2;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        margin: 0;
        padding-top: clamp(0.5rem, 3vh, 2.5rem);
        font-weight: 400;
        line-height: 1;
    }
    .word { font-size: clamp(2.6rem, 6.2vw, 5.75rem); color: #fff; }
    .word.mc { justify-self: end; padding-right: 1.25rem; --mc-shadow: 0.07em; font-weight: 700; }
    .word.dc { justify-self: start; padding-left: 1.25rem; font-family: var(--font-sans); font-weight: 800; letter-spacing: -0.03em; }
    .link-logo {
        position: relative;
        display: grid;
        place-items: center;
        width: var(--logo);
        height: var(--logo);
        animation: bob 4s ease-in-out infinite;
    }
    .link-logo img {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 6px 0 rgb(0 0 0 / 0.35));
        transition: transform 0.25s cubic-bezier(.3, 1.6, .5, 1);
    }
    .link-logo.pulsing img { transform: scale(1.14) rotate(-10deg); }
    @keyframes bob {
        50% { transform: translateY(-6px); }
    }

    .pitch {
        grid-column: 1 / -1;
        grid-row: 3;
        justify-self: center;
        width: min(40rem, calc(100% - 2rem));
        margin-top: clamp(0.5rem, 2vh, 1.5rem);
        padding: 1.1rem 1.5rem 0.9rem;
        border-radius: 16px;
        background: rgb(13 16 20 / 0.78);
        backdrop-filter: blur(10px);
        box-shadow: 0 0 0 2px rgb(255 255 255 / 0.06), 0 20px 50px rgb(0 0 0 / 0.35);
        text-align: center;
    }
    .lead { margin: 0; font-size: clamp(1.05rem, 1.6vw, 1.25rem); line-height: 1.5; color: #e9ecef; text-wrap: balance; }
    .lead em { font-style: normal; color: var(--color-grass-light); font-weight: 700; }
    .ctas { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 1rem; }
    .dc-btn {
        display: inline-flex; align-items: center; gap: 0.6rem;
        min-height: 3rem; padding: 0 1.5rem; border-radius: 8px;
        background: var(--color-dc-blurple); color: #fff; font-weight: 700; font-size: 1.05rem; text-decoration: none;
        transition: background 0.15s ease, transform 0.15s ease;
    }
    .dc-btn:hover { background: var(--color-dc-blurple-dark); }
    .dc-btn:active { transform: translateY(1px); }
    .fine { margin: 0.75rem 0 0; font-size: 0.8rem; color: #adb5bd; }

    .mc-side, .dc-side {
        grid-row: 4;
        align-self: end;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.5rem clamp(1rem, 3vw, 2.5rem) clamp(1rem, 3vh, 2rem);
        min-width: 0;
    }
    .mc-side { grid-column: 1; }
    .dc-side { grid-column: 2; position: relative; }
    .mc-chat { max-width: 34rem; }
    .hint { margin: 0; font-size: 0.85rem; color: #e9ecef; }
    .mc-side .hint { color: #fff; }
    .hint kbd {
        display: inline-grid; place-items: center; min-width: 1.4em; height: 1.4em; padding: 0 0.3em;
        border-radius: 4px; background: rgb(0 0 0 / 0.45); border: 1px solid rgb(255 255 255 / 0.25);
        font-family: var(--font-pixel); font-size: 0.85em;
    }
    .hint code { font-family: var(--font-pixel); color: var(--color-mc-yellow); }
    .dc-side .hint code { font-family: var(--font-sans); color: #c9cdfb; }

    .dc-side :global(.dc-window) { max-width: 34rem; }
    .dc-list {
        height: clamp(10rem, calc(100svh - 41rem), 18rem);
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: #1a1b1e transparent;
        display: flex;
        flex-direction: column;
    }
    .dc-list > :first-child { margin-top: auto; }
    .typing { height: 1.25rem; padding-top: 0.25rem; font-size: 0.75rem; color: var(--color-dc-text); }
    .typing b { font-weight: 700; }
    .typing i {
        display: inline-block; width: 5px; height: 5px; margin-right: 2px; border-radius: 50%;
        background: var(--color-dc-text); animation: blink 1s infinite;
    }
    .typing i:nth-child(2) { animation-delay: 0.15s; }
    .typing i:nth-child(3) { animation-delay: 0.3s; }
    @keyframes blink { 50% { opacity: 0.3; } }

    .dm-toast {
        position: absolute; top: 3.5rem; right: clamp(1rem, 3vw, 2.5rem); z-index: 3;
        display: flex; gap: 0.6rem; align-items: flex-start; max-width: 16rem; padding: 0.6rem 0.8rem;
        border-radius: 8px; background: #111214; box-shadow: 0 8px 24px rgb(0 0 0 / 0.5);
        font-size: 0.85rem; line-height: 1.35;
    }
    .dm-icon { font-size: 1.25rem; }

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

    @media (max-width: 860px) {
        .hero {
            grid-template-columns: 1fr;
            grid-template-rows: 4.5rem auto auto auto auto auto;
            min-height: 0;
        }
        .hero :global(.mc-bg) { grid-column: 1; grid-row: 1 / 4; mask: none; }
        .dc-bg { grid-column: 1; grid-row: 4 / -1; margin-left: 0; }
        .title { display: contents; }
        .title > * { grid-column: 1; }
        .word.mc { grid-row: 2; justify-self: center; padding: 1rem 0 0; }
        .link-logo { grid-row: 4; justify-self: center; align-self: start; margin-top: calc(var(--logo) / -2); z-index: 2; }
        .word.dc { grid-row: 4; justify-self: center; padding: calc(var(--logo) / 2 + 0.75rem) 0 0; }
        .pitch { grid-column: 1; grid-row: 5; margin: 1.25rem 0 0; }
        .mc-side { grid-column: 1; grid-row: 3; padding-top: 1.5rem; padding-bottom: calc(var(--logo) / 2 + 2.5rem); }
        .dc-side { grid-column: 1; grid-row: 6; padding-top: 1.5rem; }
        .mc-chat, .dc-side :global(.dc-window) { max-width: none; }
    }
</style>
