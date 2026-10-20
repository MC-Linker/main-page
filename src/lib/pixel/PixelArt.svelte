<script lang="ts">
    import { spriteRuns, spriteSize } from './render';
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

    const size = $derived(spriteSize(sprite));
    const runs = $derived(spriteRuns(sprite));
</script>

<svg
    viewBox="0 0 {size.w} {size.h}"
    style:width={width ?? `${size.w * scale}px`}
    style:aspect-ratio="{size.w} / {size.h}"
    shape-rendering="crispEdges"
    class="pixel-art {className}"
    role={title ? 'img' : 'presentation'}
    aria-hidden={title ? undefined : 'true'}
>
    {#if title}<title>{title}</title>{/if}
    {#each runs as r, i (i)}
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
