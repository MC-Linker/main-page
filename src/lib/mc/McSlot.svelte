<script lang="ts">
    import type { Snippet } from 'svelte';
    import { tooltip, tooltipHandlers } from '$lib/ui.svelte';
    import type { Item } from './item';
    import McItemIcon from './McItemIcon.svelte';

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

    // An empty slot only clears a tooltip that is still showing.
    const hide = () => tooltip.hide();
    const empty = {
        onpointermove: (e: PointerEvent) => {
            if(e.pointerType === 'mouse') hide();
        },
        onpointerleave: hide,
        onblur: hide,
    };
    const tip = $derived(item ? tooltipHandlers(item, { extra }) : empty);
</script>

<button
    type="button"
    class="mc-slot slot {className}"
    class:selected
    style:--slot={size}
    aria-label={label ?? item?.name ?? 'Empty slot'}
    aria-pressed={selected || undefined}
    {onclick}
    {...tip}
>
    {#if item}<McItemIcon icon={item.icon} glint={item.glint} {count} size="calc(var(--slot) * 0.72)" />{/if}
    {@render children?.()}
</button>

<style>
    .slot { border: 0; padding: 0; cursor: pointer; font: inherit; }
    .slot:hover::after, .slot:focus-visible::after { content: ''; position: absolute; inset: 2px; background: rgb(255 255 255 / 0.35); pointer-events: none; }
    .slot:focus-visible { outline: 2px solid #fff; outline-offset: 0; }
    .selected { box-shadow: inset 0 0 0 2px #fff, inset 2px 2px 0 #373737; background: #a8a8a8; }
</style>
