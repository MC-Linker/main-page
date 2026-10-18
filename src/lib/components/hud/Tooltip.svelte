<script lang="ts">
    import { tooltip } from '$lib/ui.svelte';
    import { rarityColor } from '$lib/data/items';
    import McText from '$lib/mc/McText.svelte';

    let el = $state<HTMLElement>();
    let w = $state(0);
    let h = $state(0);
    let vw = $state(1200);
    let vh = $state(800);

    // Sit to the right of the pointer, flip when it would leave the screen.
    const left = $derived(tooltip.x + 16 + w > vw - 8 ? Math.max(8, tooltip.x - 16 - w) : tooltip.x + 16);
    const top = $derived(Math.min(Math.max(8, tooltip.y - 24), vh - h - 8));
</script>

<svelte:window bind:innerWidth={vw} bind:innerHeight={vh} />

{#if tooltip.item}
    <div class="mc-tooltip tip" role="tooltip" bind:this={el} bind:offsetWidth={w} bind:offsetHeight={h} style:left="{left}px" style:top="{top}px">
        <div style:color={rarityColor[tooltip.item.rarity ?? 'common']}>{tooltip.item.name}</div>
        {#each tooltip.item.lore as line, i (i)}
            <div class="lore">{line || ' '}</div>
        {/each}
        {#each tooltip.extra as line, i (i)}
            <div><McText text={line} /></div>
        {/each}
    </div>
{/if}

<style>
    .tip { position: fixed; z-index: 90; max-width: 18rem; pointer-events: none; }
    .lore { color: #aa00aa; font-style: italic; }
</style>
