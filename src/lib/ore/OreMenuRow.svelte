<script lang="ts">
    import type { Snippet } from 'svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import { chevronRight } from './sprites';

    /**
     * Ore UI's browse-list row: a thumbnail, a title, a muted line under it and an arrow,
     * on the dropdown-option face. A link with `href`, otherwise a button.
     */
    type Props = {
        title: string;
        subtitle?: string;
        href?: string;
        external?: boolean;
        onclick?: (e: MouseEvent) => void;
        /** The current choice in a list that picks something. */
        selected?: boolean;
        /** What a selected link is to assistive tech: the current page, or a place on this one. */
        current?: 'page' | 'location';
        /** Show the arrow on the right. Off for rows that pick rather than open. */
        chevron?: boolean;
        /** The thumbnail on the left. */
        icon?: Snippet;
        /** Anything on the right, before the arrow (a tag, a radio). */
        trailing?: Snippet;
        role?: string;
        class?: string;
        tabindex?: number;
    };
    let { title, subtitle, href, external = false, onclick, selected = false, current = 'page', chevron = true, icon, trailing, role, class: className = '', tabindex }: Props = $props();
</script>

{#snippet inner()}
    {#if icon}<span class="thumb">{@render icon()}</span>{/if}
    <span class="text">
        <span class="title ore-text">{title}</span>
        {#if subtitle}<span class="sub">{subtitle}</span>{/if}
    </span>
    {#if trailing}<span class="trail">{@render trailing()}</span>{/if}
    {#if chevron}<span class="chev" aria-hidden="true"><PixelArt sprite={chevronRight()} width="100%" /></span>{/if}
{/snippet}

{#if href}
    <a class="row {className}" class:selected {href} {onclick} {role} {tabindex} aria-current={selected ? current : undefined} target={external ? '_blank' : undefined} rel={external ? 'noopener' : undefined}>{@render inner()}</a>
{:else}
    <button
        type="button" class="row {className}" class:selected {onclick} {role} {tabindex}
        aria-checked={role === 'radio' ? selected : undefined}
        aria-pressed={role ? undefined : selected || undefined}
    >{@render inner()}</button>
{/if}

<style>
    .row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        min-height: 3.25rem;
        padding: 0.45rem 0.75rem;
        border: var(--t) solid #8c8d90;
        background: #58585a;
        color: #fff;
        font: inherit;
        text-align: left;
        text-decoration: none;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
    }
    .row:hover { background: #48494a; }
    .row.selected { background: #242425; }
    .row:focus-visible { outline-offset: calc(-1 * var(--t)); }
    .thumb { display: grid; place-items: center; flex: none; width: 2.25rem; height: 2.25rem; }
    .text { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; min-width: 0; }
    .title { font-size: 1rem; line-height: 1.2; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sub { font-size: 0.85rem; line-height: 1.35; color: var(--color-ore-white); }
    .trail { display: flex; align-items: center; gap: 0.5rem; flex: none; }
    .chev { flex: none; width: calc(4 * var(--t)); }
</style>
