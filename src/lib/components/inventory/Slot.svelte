<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { Item } from '$lib/data/items';
    import { tooltip } from '$lib/ui.svelte';
    import ItemIcon from './ItemIcon.svelte';

    /** An inventory slot. Shows the item's tooltip on hover and focus. */
    type Props = {
        item?: Item | null;
        count?: number;
        size?: string;
        selected?: boolean;
        label?: string;
        extra?: string[];
        onclick?: (e: MouseEvent) => void;
        children?: Snippet;
        class?: string;
    };
    let { item, count, size = '2.75rem', selected = false, label, extra = [], onclick, children, class: className = '' }: Props = $props();
</script>

<button
    type="button"
    class="mc-slot slot {className}"
    class:selected
    style:--slot={size}
    aria-label={label ?? item?.name ?? 'Empty slot'}
    aria-pressed={selected || undefined}
    {onclick}
    onpointerenter={e => item && e.pointerType === 'mouse' && tooltip.show(item, e, extra)}
    onpointermove={e => { if(e.pointerType !== 'mouse') return; if(!item) tooltip.hide(); else if(tooltip.item !== item) tooltip.show(item, e, extra); else tooltip.move(e); }}
    onpointerleave={() => tooltip.hide()}
    onfocus={e => item && e.currentTarget.matches(':focus-visible') && tooltip.show(item, e, extra)}
    onblur={() => tooltip.hide()}
>
    {#if item}<ItemIcon icon={item.icon} glint={item.glint} {count} size="calc(var(--slot) * 0.72)" />{/if}
    {@render children?.()}
</button>

<style>
    .slot { border: 0; padding: 0; cursor: pointer; font: inherit; }
    .slot:hover::after, .slot:focus-visible::after { content: ''; position: absolute; inset: 2px; background: rgb(255 255 255 / 0.35); pointer-events: none; }
    .slot:focus-visible { outline: 2px solid #fff; outline-offset: 0; }
    .selected { box-shadow: inset 0 0 0 2px #fff, inset 2px 2px 0 #373737; background: #a8a8a8; }
</style>
