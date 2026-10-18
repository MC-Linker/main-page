<script lang="ts">
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import { dirt, grassSide, stone, type Sprite } from '$lib/pixel/sprites';
    import { spriteUri } from '$lib/pixel/uri';

    /** A slowly panning blocky landscape, standing in for Minecraft's title-screen panorama. */
    const tiles = { grass: spriteUri(grassSide), dirt: spriteUri(dirt), stone: spriteUri(stone) };

    // Column heights in blocks; repeated twice so the loop is seamless.
    const heights = [5, 5, 6, 6, 7, 7, 7, 6, 6, 5, 4, 4, 4, 5, 5, 6, 8, 9, 9, 8, 7, 6, 6, 5, 5, 5, 6, 6, 5, 4, 3, 3, 4, 4, 5, 6, 7, 7, 6, 5];
    const trees = new Set([3, 12, 19, 27, 34]);

    const tree: Sprite = {
        rows: ['.LLL.', 'LLlLL', 'LlLLL', 'LLLlL', '..T..', '..T..', '..T..'],
        palette: { L: '#3f7a1f', l: '#4f8f28', T: '#6b4a26' },
    };
</script>

<div class="panorama" aria-hidden="true" style:--grass={tiles.grass} style:--dirt={tiles.dirt} style:--stone={tiles.stone}>
    <div class="strip">
        {#each [0, 1] as copy (copy)}
            <div class="land">
                {#each heights as h, i (i)}
                    <div class="col" style:height="calc({h} * var(--t))">
                        {#if trees.has(i)}<div class="tree"><PixelArt sprite={tree} width="calc(var(--t) * 2.5)" /></div>{/if}
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    .panorama {
        --t: clamp(2.25rem, 5vw, 3.25rem);
        position: absolute;
        inset: 0;
        overflow: hidden;
        background: linear-gradient(#6d9cf3, #a8c8ff 60%, #cfe0ff);
        filter: blur(1.5px) saturate(0.95);
    }
    .strip { position: absolute; left: 0; bottom: 0; display: flex; width: max-content; animation: pan 140s linear infinite; }
    .land { display: flex; align-items: flex-end; }
    .col {
        position: relative;
        width: var(--t);
        background-image: var(--grass), var(--dirt), var(--dirt), var(--stone);
        background-size: var(--t) var(--t);
        background-repeat: no-repeat, no-repeat, no-repeat, repeat;
        background-position: 0 0, 0 var(--t), 0 calc(var(--t) * 2), 0 calc(var(--t) * 3);
        image-rendering: pixelated;
    }
    .tree { position: absolute; bottom: 100%; left: calc(var(--t) * -0.75); }
    @keyframes pan { to { transform: translateX(-50%); } }
</style>
