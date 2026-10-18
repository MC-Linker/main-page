<script lang="ts">
    import type { Sprite } from './sprites';

    type Props = {
        sprite: Sprite;
        /** CSS size of one pixel, or a full width like "4rem" via `width`. */
        scale?: number;
        width?: string;
        title?: string;
        class?: string;
    };

    let { sprite, scale = 4, width, title, class: className = '' }: Props = $props();

    const h = $derived(sprite.rows.length);
    const w = $derived(Math.max(...sprite.rows.map(r => r.length)));

    // Merge horizontal runs of the same colour into one rect to keep the DOM small.
    const rects = $derived.by(() => {
        const out: { x: number; y: number; w: number; fill: string }[] = [];
        sprite.rows.forEach((row, y) => {
            let x = 0;
            while(x < row.length) {
                const key = row[x];
                let len = 1;
                while(row[x + len] === key) len++;
                const fill = sprite.palette[key];
                if(fill) out.push({ x, y, w: len, fill });
                x += len;
            }
        });
        return out;
    });
</script>

<svg
    viewBox="0 0 {w} {h}"
    width={width ?? `${w * scale}px`}
    style:aspect-ratio="{w} / {h}"
    shape-rendering="crispEdges"
    class="pixel-art {className}"
    role={title ? 'img' : 'presentation'}
    aria-hidden={title ? undefined : 'true'}
>
    {#if title}<title>{title}</title>{/if}
    {#each rects as r, i (i)}
        <rect x={r.x} y={r.y} width={r.w + 0.02} height="1.02" fill={r.fill} />
    {/each}
</svg>

<style>
    .pixel-art {
        display: block;
        height: auto;
        image-rendering: pixelated;
    }
</style>
