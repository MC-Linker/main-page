<script lang="ts">
    import type { Snippet } from 'svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import { dirt, grassSide, type Sprite } from '$lib/pixel/sprites';
    import { spriteUri } from '$lib/pixel/uri';

    type Props = {
        night?: boolean;
        rain?: boolean;
        /** Size of one block on screen. */
        tile?: number;
        /** Height of the ground, in blocks. Columns can add bumps on top. */
        ground?: number;
        clouds?: boolean;
        class?: string;
        children?: Snippet;
    };
    let { night = false, rain = false, tile = 32, ground = 2, clouds = true, class: className = '', children }: Props = $props();

    const grass = spriteUri(grassSide);
    const soil = spriteUri(dirt);

    // A stepped skyline like the edge of the logo: mostly flat, with a hill on each side.
    const bumps = [2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2];

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

    // Fixed star positions so server and client render the same sky.
    const stars = Array.from({ length: 36 }, (_, i) => ({
        x: (i * 37.3 + (i % 3) * 11) % 100,
        y: (i * 23.7 + (i % 5) * 7) % 55,
        s: i % 4 === 0 ? 3 : 2,
    }));
</script>

<div class="world {className}" class:night class:rain style:--tile="{tile}px" style:--ground="{ground * tile}px">
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
    <div class="terrain" aria-hidden="true" style:--grass={grass} style:--dirt={soil}>
        {#each bumps as b, i (i)}<span style:height="calc(var(--ground) + {b} * var(--tile))"></span>{/each}
    </div>
    <div class="rainfall" aria-hidden="true"></div>
    <div class="content">{@render children?.()}</div>
</div>

<style>
    .world {
        position: relative;
        overflow: hidden;
        isolation: isolate;
        background: #78a6f7;
    }
    .sky { position: absolute; inset: 0; z-index: -3; transition: opacity 1.2s ease; }
    .day { background: linear-gradient(#5f93f2, #9cc2ff 70%, #c4dbff); }
    .dusk { background: linear-gradient(#060a1c, #141c3d 65%, #24305a); opacity: 0; }
    .rain .day { filter: saturate(0.35) brightness(0.8); }
    .night .dusk { opacity: 1; }

    .stars { position: absolute; inset: 0; z-index: -2; opacity: 0; transition: opacity 1.2s ease; }
    .stars span { position: absolute; background: #fff; }
    .night .stars { opacity: 0.9; }
    .rain .stars { opacity: 0.2; }

    .orb {
        position: absolute; z-index: -2; width: clamp(2.25rem, 4.5vw, 3.75rem); top: var(--orb-top, 7%);
        transition: transform 1.2s cubic-bezier(.5, 0, .3, 1.2), opacity 0.8s ease;
    }
    /* Pages can move the sun and moon with --orb-left / --orb-right (e.g. away from a title on phones). */
    .sun, .moon { left: var(--orb-left, 9%); right: var(--orb-right, auto); }
    .moon { transform: translateY(160%); opacity: 0; }
    .night .sun { transform: translateY(160%); opacity: 0; }
    .night .moon { transform: none; opacity: 1; }
    .rain .orb { filter: brightness(0.7); }

    .clouds { position: absolute; inset: 0 0 auto; height: 45%; z-index: -1; }
    .cloud { position: absolute; left: 0; opacity: 0.9; animation: drift linear infinite; transition: filter 1s ease; }
    .rain .cloud, .night .cloud { filter: brightness(0.55); }
    .c1 { top: 12%; width: clamp(5rem, 11vw, 9rem); animation-duration: 80s; animation-delay: -20s; }
    .c2 { top: 30%; width: clamp(3.5rem, 7vw, 6rem); animation-duration: 110s; animation-delay: -70s; opacity: 0.75; }
    .c3 { top: 5%; width: clamp(4rem, 8vw, 7rem); animation-duration: 95s; animation-delay: -45s; opacity: 0.8; }
    @keyframes drift {
        from { transform: translateX(-12rem); }
        to { transform: translateX(calc(100cqw + 12rem)); }
    }
    .world { container-type: inline-size; }

    .terrain {
        position: absolute; left: 0; right: 0; bottom: 0; z-index: 0;
        display: flex; align-items: flex-end;
        transition: filter 1.2s ease;
    }
    .terrain span {
        flex: none;
        width: var(--tile);
        background: var(--grass) top / var(--tile) var(--tile) no-repeat, var(--dirt) 0 var(--tile) / var(--tile) var(--tile) repeat;
        image-rendering: pixelated;
    }
    .night .terrain { filter: brightness(0.45) saturate(0.8); }
    .rain .terrain { filter: brightness(0.75) saturate(0.8); }
    .night.rain .terrain { filter: brightness(0.4) saturate(0.7); }

    .rainfall {
        position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' fill='rgb%28175%2C200%2C255%29' fill-opacity='0.6'%3E%3Crect x='60' y='38' width='2' height='16'/%3E%3Crect x='123' y='12' width='2' height='11'/%3E%3Crect x='156' y='137' width='2' height='11'/%3E%3Crect x='69' y='149' width='2' height='10'/%3E%3Crect x='174' y='129' width='2' height='13'/%3E%3Crect x='6' y='22' width='2' height='16'/%3E%3Crect x='78' y='17' width='2' height='13'/%3E%3Crect x='15' y='141' width='2' height='16'/%3E%3Crect x='9' y='144' width='2' height='11'/%3E%3Crect x='42' y='161' width='2' height='10'/%3E%3Crect x='108' y='149' width='2' height='16'/%3E%3Crect x='9' y='56' width='2' height='10'/%3E%3Crect x='105' y='34' width='2' height='14'/%3E%3Crect x='78' y='36' width='2' height='18'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='130' height='130' fill='rgb%28175%2C200%2C255%29' fill-opacity='0.4'%3E%3Crect x='21' y='78' width='2' height='18'/%3E%3Crect x='129' y='46' width='2' height='11'/%3E%3Crect x='111' y='48' width='2' height='15'/%3E%3Crect x='18' y='16' width='2' height='10'/%3E%3Crect x='117' y='52' width='2' height='17'/%3E%3Crect x='129' y='109' width='2' height='15'/%3E%3Crect x='87' y='116' width='2' height='15'/%3E%3Crect x='57' y='63' width='2' height='12'/%3E%3Crect x='45' y='20' width='2' height='14'/%3E%3C/svg%3E");
        background-size: 180px 180px, 130px 130px;
        transition: opacity 0.8s ease;
        animation: fall 0.5s linear infinite;
    }
    .rain .rainfall { opacity: 1; }
    @keyframes fall {
        from { background-position: 0 0, 40px 0; }
        to { background-position: -12px 180px, 32px 130px; }
    }

    .content { position: relative; z-index: 2; height: 100%; }
</style>
