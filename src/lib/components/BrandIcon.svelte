<script lang="ts">
    import { brandPaths, brandViewBox, type Brand } from '$lib/data/brands';

    let { brand, size = '1.25em', class: className = '' }: { brand: Brand; size?: string; class?: string } = $props();
</script>

<svg viewBox={brandViewBox[brand] ?? '0 0 24 24'} width={size} height={size} fill="currentColor" aria-hidden="true" class={className}>
    <path d={brandPaths[brand]} />
</svg>
