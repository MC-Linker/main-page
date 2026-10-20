<script lang="ts">
    import { type Brand, brandPaths, brandViewBox } from '$lib/data';

    /** A brand logo (Discord, Modrinth, GitHub, ...) in the current text colour. */
    let { brand, size = '1.25em', class: className = '' }: { brand: Brand; size?: string; class?: string } = $props();
</script>

<svg viewBox={brandViewBox[brand] ?? '0 0 24 24'} width={size} height={size} fill="currentColor" aria-hidden="true" class={className}>
    <path d={brandPaths[brand]} />
</svg>
