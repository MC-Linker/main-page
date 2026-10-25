<script lang="ts">
    import type { Snippet } from 'svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import type { Sprite } from '$lib/pixel/sprites';
    import { createHills, STRIP_BLOCKS } from './hillsGl';

    type Props = {
        night?: boolean;
        rain?: boolean;
        /** Size of one block on screen: px, or any CSS length (e.g. a variable a media query sets, so SSR and phones agree). */
        tile?: number | string;
        /** Height of the ground, in blocks. Columns can add bumps on top. */
        ground?: number;
        clouds?: boolean;
        /**
         * Rolling hills with trees that slowly pan by, like the title screen's
         * panorama, instead of flat ground.
         */
        hills?: boolean;
        /** Blur in px, for a soft, out-of-focus backdrop (the title screen look). */
        blur?: number;
        class?: string;
        children?: Snippet;
    };
    let { night = false, rain = false, tile = 32, ground = 2, clouds = true, hills = false, blur = 0, class: className = '', children }: Props = $props();

    // A stepped skyline like the edge of the logo: mostly flat, with a hill on each side.
    const bumps = [2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2];

    // The panorama: column heights in blocks, drawn twice so the loop is seamless.
    const heights = [5, 5, 6, 6, 7, 7, 7, 6, 6, 5, 4, 4, 4, 5, 5, 6, 8, 9, 9, 8, 7, 6, 6, 5, 5, 5, 6, 6, 5, 4, 3, 3, 4, 4, 5, 6, 7, 7, 6, 5];
    const trees = new Set([3, 12, 19, 27, 34]);
    const tree: Sprite = {
        rows: ['.LLL.', 'LLlLL', 'LlLLL', 'LLLlL', '..T..', '..T..', '..T..'],
        palette: { L: '#3f7a1f', l: '#4f8f28', T: '#6b4a26' },
    };

    const cloud: Sprite = {
        rows: ['....wwwww.....', '..wwwwwwwwww..', 'wwwwwwwwwwwwww', '.wwwwwwwwwww..'],
        palette: { w: '#ffffff' },
    };
    const sun: Sprite = {
        rows: ['yyyyyyyy', 'yYYYYYYy', 'yYllllYy', 'yYllllYy', 'yYllllYy', 'yYllllYy', 'yYYYYYYy', 'yyyyyyyy'],
        palette: { y: '#fcc419', Y: '#ffd43b', l: '#fff3bf' },
    };
    const moon: Sprite = {
        rows: ['mmmmmmmm', 'mMmmmmmm', 'mmmmmcmm', 'mmcmmmmm', 'mmmmmmmm', 'mmmmcmMm', 'mMmmmmmm', 'mmmmmmmm'],
        palette: { m: '#e9ecef', M: '#ced4da', c: '#adb5bd' },
    };

    /** Seconds for the hills to pan by one loop, like the old CSS animation. */
    const PAN_SECONDS = 160;

    // Draws the hills with WebGL. The DOM strip stays as the fallback (and the first paint) until it works.
    let gl = $state(false);
    /** The canvas has faded in fully, so the DOM strip under it can go. */
    let glDone = $state(false);
    function hillsCanvas(canvas: HTMLCanvasElement) {
        const hills = createHills(canvas, { heights, trees, tree });
        if(!hills) return;
        let frame = 0;
        let visible = false;
        const motion = matchMedia('(prefers-reduced-motion: reduce)');
        let revealFrame = 0;
        let revealTimer = 0;
        // A lost context stays lost (no restore): stop drawing and keep the DOM strip.
        let dead = false;
        const lost = () => {
            dead = true;
            gl = glDone = false;
            cancelAnimationFrame(frame);
            cancelAnimationFrame(revealFrame);
            clearTimeout(revealTimer);
        };
        // Swap the DOM strip for the canvas only once a real frame is drawn: until then (or if the
        // GPU context is lost, e.g. on quick reloads) the canvas can show up blank or white.
        /** Fades the canvas in over the strip a few frames after it first drew, then drops the strip. */
        const reveal = () => {
            if(gl || revealFrame || dead) return;
            let frames = 0;
            const wait = () => {
                if(hills.lost()) { revealFrame = 0; return; }
                if(++frames < 4) { revealFrame = requestAnimationFrame(wait); return; }
                gl = true;
                revealTimer = window.setTimeout(() => (glDone = gl), 450);
            };
            revealFrame = requestAnimationFrame(wait);
        };
        canvas.addEventListener('webglcontextlost', lost);

        let start = performance.now();
        let offset = 0;
        const render = () => { if(!dead) hills.draw(offset); };
        // The pan is slow, so 30 frames a second look the same as 120 and cost a quarter.
        let last = 0;
        const tick = (now: number) => {
            frame = requestAnimationFrame(tick);
            if(now - last < 32) return;
            last = now;
            offset = ((now - start) / 1000) * (hills.loop / PAN_SECONDS);
            render();
        };
        // Only animate while on screen, and not at all for reduced motion.
        const update = () => {
            cancelAnimationFrame(frame);
            if(dead) return;
            if(visible && !motion.matches) {
                start = performance.now() - (offset / hills.loop) * PAN_SECONDS * 1000;
                frame = requestAnimationFrame(tick);
            }
            else render();
        };

        const resize = new ResizeObserver(([entry]) => {
            // Under a blur, extra device pixels can't be seen but still cost GPU time.
            const dpr = blur > 0 ? Math.min(devicePixelRatio, 1) : devicePixelRatio;
            // The exact device pixel box when the browser gives one that matches the zoom (emulators may not).
            const w = Math.round(entry.contentRect.width * dpr);
            const h = Math.round(entry.contentRect.height * dpr);
            const box = dpr === devicePixelRatio ? entry.devicePixelContentBoxSize?.[0] : undefined;
            const exact = box && Math.abs(box.inlineSize - w) <= 1 && Math.abs(box.blockSize - h) <= 1;
            canvas.width = exact ? box.inlineSize : w;
            canvas.height = exact ? box.blockSize : h;
            render();
            if(canvas.width && canvas.height) reveal();
        });
        try { resize.observe(canvas, { box: 'device-pixel-content-box' }); }
        catch { resize.observe(canvas); }
        const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
        seen.observe(canvas);
        motion.addEventListener('change', update);

        return () => {
            cancelAnimationFrame(frame);
            resize.disconnect();
            seen.disconnect();
            motion.removeEventListener('change', update);
            canvas.removeEventListener('webglcontextlost', lost);
            cancelAnimationFrame(revealFrame);
            clearTimeout(revealTimer);
            hills.destroy();
        };
    }

    // Fixed star positions so server and client render the same sky.
    const stars = Array.from({ length: 36 }, (_, i) => ({
        x: (i * 37.3 + (i % 3) * 11) % 100,
        y: (i * 23.7 + (i % 5) * 7) % 55,
        s: i % 4 === 0 ? 3 : 2,
    }));
</script>

<div class="world {className}" class:night class:rain class:hills class:blurred={blur > 0} style:--tile={typeof tile === 'number' ? `${tile}px` : tile} style:--ground="calc({ground} * var(--tile))" style:--blur="{blur}px">
    <div class="sky day" aria-hidden="true"></div>
    <div class="sky dusk" aria-hidden="true"></div>
    <div class="stars" aria-hidden="true">
        {#each stars as s, i (i)}<span style:left="{s.x}%" style:top="{s.y}%" style:width="{s.s}px" style:height="{s.s}px"></span>{/each}
    </div>
    <div class="orb sun" aria-hidden="true"><PixelArt sprite={sun} width="100%" /></div>
    <div class="orb moon" aria-hidden="true"><PixelArt sprite={moon} width="100%" /></div>
    {#if clouds}
        <div class="clouds" aria-hidden="true">
            <div class="cloud c1"><PixelArt sprite={cloud} width="100%" /></div>
            <div class="cloud c2"><PixelArt sprite={cloud} width="100%" /></div>
            <div class="cloud c3"><PixelArt sprite={cloud} width="100%" /></div>
        </div>
    {/if}
    {#if hills}
        <div class="terrain hill-terrain" class:gl class:gl-done={glDone} aria-hidden="true" style:--strip={STRIP_BLOCKS}>
            <canvas class="gl" {@attach hillsCanvas}></canvas>
            <div class="strip">
                {#each [0, 1] as copy (copy)}
                    <div class="land">
                        {#each heights as h, i (i)}
                            <span class="col" style:height="calc({h} * var(--tile))">
                                {#if trees.has(i)}<span class="tree"><PixelArt sprite={tree} width="calc(var(--tile) * 2.5)" /></span>{/if}
                            </span>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <div class="terrain" aria-hidden="true">
            {#each bumps as b, i (i)}<span class="flat" style:height="calc(var(--ground) + {b} * var(--tile))"></span>{/each}
        </div>
    {/if}
    <div class="rainfall" aria-hidden="true"></div>
    <div class="content">{@render children?.()}</div>
</div>

<style>
    .world {
        /* Tone and blur for the scenery, changed by night, rain and the blur prop. */
        --bright: 1;
        --sat: 1;
        position: relative;
        overflow: hidden;
        isolation: isolate;
        background: #78a6f7;
        container-type: inline-size;
    }
    .sky { position: absolute; inset: 0; z-index: -3; transition: opacity 1.2s ease; }
    .day { background: linear-gradient(#5f93f2, #9cc2ff 70%, #c4dbff); }
    .dusk { background: linear-gradient(#060a1c, #141c3d 65%, #24305a); opacity: 0; }
    .rain .day { filter: saturate(0.35) brightness(0.8); }
    .night .dusk { opacity: 1; }

    .stars { position: absolute; inset: 0; z-index: -2; opacity: 0; transition: opacity 1.2s ease; filter: blur(calc(var(--blur) / 3)); }
    .stars span { position: absolute; background: #fff; }
    .night .stars { opacity: 0.9; }
    .rain .stars { opacity: 0.2; }

    .orb {
        position: absolute; z-index: -2; width: clamp(2.25rem, 4.5vw, 3.75rem); top: var(--orb-top, 7%);
        filter: blur(var(--blur)) brightness(var(--orb-bright, 1));
        transition: transform 1.2s cubic-bezier(.5, 0, .3, 1.2), opacity 0.8s ease, filter 1s ease;
    }
    /* Pages can move the sun and moon with --orb-left / --orb-right (e.g. away from a title on phones). */
    .sun, .moon { left: var(--orb-left, 9%); right: var(--orb-right, auto); }
    .moon { transform: translateY(160%); opacity: 0; }
    .night .sun { transform: translateY(160%); opacity: 0; }
    .night .moon { transform: none; opacity: 1; }
    .rain .orb { --orb-bright: 0.7; }

    .clouds { position: absolute; inset: 0 0 auto; height: 45%; z-index: -1; filter: blur(var(--blur)); }
    .cloud { position: absolute; left: 0; opacity: 0.9; animation: drift linear infinite; transition: filter 1s ease; }
    .rain .cloud, .night .cloud { filter: brightness(0.55); }
    .c1 { top: 12%; width: clamp(5rem, 11vw, 9rem); animation-duration: 80s; animation-delay: -20s; }
    .c2 { top: 30%; width: clamp(3.5rem, 7vw, 6rem); animation-duration: 110s; animation-delay: -70s; opacity: 0.75; }
    .c3 { top: 5%; width: clamp(4rem, 8vw, 7rem); animation-duration: 95s; animation-delay: -45s; opacity: 0.8; }
    @keyframes drift {
        from { transform: translateX(-12rem); }
        to { transform: translateX(calc(100cqw + 12rem)); }
    }

    .terrain {
        position: absolute; left: 0; right: 0; bottom: 0; z-index: 0;
        display: flex; align-items: flex-end;
        filter: blur(var(--blur)) brightness(var(--bright)) saturate(var(--sat));
        transition: filter 1.2s ease;
    }
    /* Blur lets the sky show through at the edges; reach past them. */
    .blurred .terrain { left: calc(var(--blur) * -3); right: calc(var(--blur) * -3); bottom: calc(var(--blur) * -3); }
    .night { --bright: 0.45; --sat: 0.8; }
    .rain { --bright: 0.75; --sat: 0.8; }
    .night.rain { --bright: 0.4; --sat: 0.7; }

    .flat {
        flex: none;
        width: var(--tile);
        background: var(--tex-grass-side) top / var(--tile) var(--tile) no-repeat, var(--tex-dirt) 0 var(--tile) / var(--tile) var(--tile) repeat;
        image-rendering: pixelated;
    }

    /* Panorama hills */
    /* Static: it is the first paint and the no-WebGL fallback. The canvas does the panning. */
    .strip { display: flex; width: max-content; }
    .land { display: flex; align-items: flex-end; }
    .col {
        position: relative;
        flex: none;
        width: var(--tile);
        background-image: var(--tex-grass-side), var(--tex-dirt), var(--tex-dirt), var(--tex-stone);
        background-size: var(--tile) var(--tile);
        background-repeat: no-repeat, no-repeat, no-repeat, repeat;
        background-position: 0 0, 0 var(--tile), 0 calc(var(--tile) * 2), 0 calc(var(--tile) * 3);
        image-rendering: pixelated;
    }
    .tree { position: absolute; bottom: 100%; left: calc(var(--tile) * -0.75); }
    .hill-terrain { height: calc(var(--strip) * var(--tile)); }
    .hill-terrain .strip { position: absolute; left: 0; bottom: 0; }
    /* Transparent, not display: none, so it has a size to draw at before it is shown. It fades in
       over the DOM strip a few frames after its first draw (a fresh WebGL canvas can flash white),
       and the strip goes once it is fully in. */
    canvas.gl { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; opacity: 0; transition: opacity 0.4s ease; }
    .hill-terrain.gl canvas.gl { opacity: 1; }
    .hill-terrain.gl-done .strip { display: none; }

    .rainfall {
        position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' fill='rgb%28175%2C200%2C255%29' fill-opacity='0.6'%3E%3Crect x='60' y='38' width='2' height='16'/%3E%3Crect x='123' y='12' width='2' height='11'/%3E%3Crect x='156' y='137' width='2' height='11'/%3E%3Crect x='69' y='149' width='2' height='10'/%3E%3Crect x='174' y='129' width='2' height='13'/%3E%3Crect x='6' y='22' width='2' height='16'/%3E%3Crect x='78' y='17' width='2' height='13'/%3E%3Crect x='15' y='141' width='2' height='16'/%3E%3Crect x='9' y='144' width='2' height='11'/%3E%3Crect x='42' y='161' width='2' height='10'/%3E%3Crect x='108' y='149' width='2' height='16'/%3E%3Crect x='9' y='56' width='2' height='10'/%3E%3Crect x='105' y='34' width='2' height='14'/%3E%3Crect x='78' y='36' width='2' height='18'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='130' height='130' fill='rgb%28175%2C200%2C255%29' fill-opacity='0.4'%3E%3Crect x='21' y='78' width='2' height='18'/%3E%3Crect x='129' y='46' width='2' height='11'/%3E%3Crect x='111' y='48' width='2' height='15'/%3E%3Crect x='18' y='16' width='2' height='10'/%3E%3Crect x='117' y='52' width='2' height='17'/%3E%3Crect x='129' y='109' width='2' height='15'/%3E%3Crect x='87' y='116' width='2' height='15'/%3E%3Crect x='57' y='63' width='2' height='12'/%3E%3Crect x='45' y='20' width='2' height='14'/%3E%3C/svg%3E");
        background-size: 180px 180px, 130px 130px;
        filter: blur(calc(var(--blur) / 3));
        transition: opacity 0.8s ease;
        /* Only falls while it rains (it stays running through the fade out, then stops). */
        animation: fall 0.5s linear infinite paused;
    }
    .rain .rainfall { opacity: 1; animation-play-state: running; }
    @keyframes fall {
        from { background-position: 0 0, 40px 0; }
        to { background-position: -12px 180px, 32px 130px; }
    }

    .content { position: relative; z-index: 2; height: 100%; }
</style>
