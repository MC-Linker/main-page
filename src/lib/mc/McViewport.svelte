<script lang="ts">
    import type { Snippet } from 'svelte';
    import McWorld from './McWorld.svelte';

    type Props = { night?: boolean; rain?: boolean; height?: string; tile?: number; children?: Snippet; label?: string };
    let { night = false, rain = false, height = '20rem', tile = 26, children, label }: Props = $props();
</script>

<figure class="viewport" style:height aria-label={label}>
    <McWorld {night} {rain} {tile} class="vp-world">
        {@render children?.()}
    </McWorld>
</figure>

<style>
    .viewport {
        position: relative;
        width: 100%;
        margin: 0;
        border: 3px solid #000;
        box-shadow: inset 0 0 0 2px rgb(255 255 255 / 0.15), 0 18px 40px rgb(0 0 0 / 0.45);
        background: #000;
        overflow: hidden;
    }
    .viewport :global(.vp-world) { height: 100%; }
</style>
