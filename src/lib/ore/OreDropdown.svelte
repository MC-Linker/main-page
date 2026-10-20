<script lang="ts">
    import type { Snippet } from 'svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import { chevron } from './sprites';

    /**
     * Ore UI's dropdown: a light face with the current value and a chevron, opening a grey
     * popup under it. The popup's content is up to you (rows, links); it closes on Escape,
     * on a click outside and when something in it is clicked.
     */
    type Props = {
        /** What the closed dropdown says. */
        children: Snippet;
        /** The popup's content. */
        popup: Snippet;
        label?: string;
        align?: 'left' | 'right';
        open?: boolean;
        size?: 'sm' | 'md';
        id: string;
        class?: string;
    };
    let { children, popup, label, align = 'left', open = $bindable(false), size = 'md', id, class: className = '' }: Props = $props();

    let root: HTMLElement;
    let button: HTMLButtonElement;

    function outside(e: PointerEvent) {
        if(open && !root.contains(e.target as Node)) open = false;
    }
    function keys(e: KeyboardEvent) {
        if(e.key === 'Escape' && open) {
            open = false;
            button.focus();
        }
    }
</script>

<svelte:window onpointerdown={outside} onkeydown={keys} />

<div class="dropdown {size} {className}" bind:this={root}>
    <button bind:this={button} type="button" class="face ore-face ore-white ore-text" class:pressed={open} aria-expanded={open} aria-controls={id} aria-label={label} onclick={() => (open = !open)}>
        <span class="value">{@render children()}</span>
        <span class="arrow" aria-hidden="true"><PixelArt sprite={chevron()} width="100%" /></span>
    </button>
    {#if open}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <div class="popup {align}" {id} onclick={() => (open = false)}>
            {@render popup()}
        </div>
    {/if}
</div>

<style>
    .dropdown { position: relative; }
    .face {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        min-height: 2.75rem;
        padding-inline: 0.9rem 0.85rem;
        font-size: 1rem;
        cursor: pointer;
    }
    .sm .face { min-height: 2.25rem; font-size: 0.9rem; gap: 0.6rem; padding-inline: 0.7rem 0.65rem; }
    /* A dropdown doesn't sink when pressed; it opens. */
    .face:active::before { top: 0; box-shadow: inset 0 calc(-1 * var(--depth)) 0 var(--edge), inset var(--t) var(--t) 0 var(--hi), inset calc(-1 * var(--t)) calc(-1 * var(--t) - var(--depth)) 0 var(--shade); }
    .face:active > * { transform: none; }
    .value { display: inline-flex; align-items: center; gap: 0.5em; flex: 1; min-width: 0; white-space: nowrap; }
    .arrow { flex: none; width: calc(7 * var(--t)); transition: transform 0.15s ease; }
    .pressed .arrow { transform: rotate(180deg); }

    /* The popup: a grey frame around the options. */
    .popup {
        position: absolute;
        top: calc(100% + var(--t));
        z-index: 70;
        display: flex;
        flex-direction: column;
        gap: var(--t);
        min-width: 100%;
        width: max-content;
        max-width: min(20rem, calc(100vw - 1rem));
        padding: var(--t);
        border: var(--t) solid #1e1e1f;
        background: #8c8d90;
        box-shadow: 0 0.75rem 1.5rem rgb(0 0 0 / 0.4);
    }
    .popup.left { left: 0; }
    .popup.right { right: 0; }
</style>
