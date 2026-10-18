<script lang="ts">
    import type { Snippet } from 'svelte';

    /** Nine slots like the in-game hotbar. `slot` renders the item in a slot. */
    type Props = { selected?: number; slot?: Snippet<[number]>; class?: string };
    let { selected = 0, slot, class: className = '' }: Props = $props();
</script>

<div class="hotbar {className}" aria-hidden="true">
    {#each Array(9) as _, i (i)}
        <span class="slot" class:selected={i === selected}>{@render slot?.(i)}</span>
    {/each}
</div>

<style>
    .hotbar {
        display: inline-flex;
        padding: 2px;
        background: rgb(0 0 0 / 0.55);
        border: 2px solid #1a1a1a;
        box-shadow: inset 0 0 0 1px #7a7a7a;
    }
    .slot {
        position: relative;
        display: grid;
        place-items: center;
        width: var(--slot, 2.1rem);
        height: var(--slot, 2.1rem);
        border: 1px solid rgb(255 255 255 / 0.12);
    }
    .slot.selected { outline: 3px solid #fff; outline-offset: -1px; z-index: 1; box-shadow: 0 0 0 1px #000; }
</style>
