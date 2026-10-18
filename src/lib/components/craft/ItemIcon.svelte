<script lang="ts">
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import PixelHead from '$lib/pixel/PixelHead.svelte';
    import GrassBlock from '$lib/pixel/GrassBlock.svelte';
    import { spriteUri } from '$lib/pixel/uri';
    import type { ItemIcon } from '$lib/craft/items';

    type Props = { icon: ItemIcon; size?: string; glint?: boolean; count?: number };
    let { icon, size = '2rem', glint = false, count }: Props = $props();

    // The enchantment glint is masked to the item's own shape.
    const mask = $derived('sprite' in icon ? spriteUri(icon.sprite) : 'image' in icon ? `url("${icon.image}")` : undefined);
</script>

<span class="icon" style:--size={size} aria-hidden="true">
    {#if 'sprite' in icon}
        <PixelArt sprite={icon.sprite} width="100%" />
    {:else if 'image' in icon}
        <img src={icon.image} alt="" />
    {:else if 'head' in icon}
        <PixelHead look={icon.head} size="100%" />
    {:else}
        <span class="block"><GrassBlock size="calc(var(--size) * 0.6)" /></span>
    {/if}
    {#if glint && mask}<span class="glint" style:mask-image={mask} style:-webkit-mask-image={mask}></span>{/if}
    {#if count && count > 1}<span class="count mc-text">{count}</span>{/if}
</span>

<style>
    .icon { position: relative; display: grid; place-items: center; width: var(--size); height: var(--size); }
    .icon > :global(svg), .icon > img { width: 100%; height: 100%; object-fit: contain; }
    .block { display: grid; place-items: center; width: 100%; height: 100%; }
    .glint {
        position: absolute; inset: 0; pointer-events: none;
        mask-size: contain; mask-repeat: no-repeat; mask-position: center;
        -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;
        background: linear-gradient(115deg, transparent 20%, rgb(190 120 255 / 0.75) 35%, transparent 50%, rgb(150 90 255 / 0.5) 65%, transparent 80%) 0 0 / 300% 300%;
        mix-blend-mode: screen;
        animation: glint 3.2s linear infinite;
    }
    @keyframes glint { from { background-position: 100% 0; } to { background-position: -100% 0; } }
    .count { position: absolute; right: -0.35rem; bottom: -0.35rem; font-size: 0.85rem; color: #fff; }
</style>
