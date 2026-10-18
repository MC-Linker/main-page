<script lang="ts">
    import PixelArt from './PixelArt.svelte';
    import { grassSide, grassTop } from './sprites';

    /** Isometric grass block built from three pixel faces. */
    let { size = 64, class: className = '' }: { size?: number | string; class?: string } = $props();
    const s = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<div class="block-wrap {className}" style:--s={s} aria-hidden="true">
    <div class="cube">
        <div class="face top"><PixelArt sprite={grassTop} width="100%" /></div>
        <div class="face left"><PixelArt sprite={grassSide} width="100%" /></div>
        <div class="face right"><PixelArt sprite={grassSide} width="100%" /></div>
    </div>
</div>

<style>
    .block-wrap {
        width: calc(var(--s) * 1.42);
        height: calc(var(--s) * 1.6);
        display: grid;
        place-items: center;
        perspective: none;
    }
    .cube {
        position: relative;
        width: var(--s);
        height: var(--s);
        transform-style: preserve-3d;
        transform: rotateX(-30deg) rotateY(45deg);
    }
    .face {
        position: absolute;
        inset: 0;
        backface-visibility: hidden;
    }
    .top { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); }
    .left { transform: translateZ(calc(var(--s) / 2)); filter: brightness(0.85); }
    .right { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); filter: brightness(0.7); }
</style>
