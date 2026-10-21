<script lang="ts" module>
    export type Segment = { id: string; label: string; href?: string; title?: string };
</script>

<script lang="ts">
    import type { Snippet } from 'svelte';

    /**
     * Side-by-side segments with fused borders, one of them chosen: it sinks in and gets a
     * white line under its label. `toggle` is Ore UI's light toggle buttons (the chosen one
     * turns green), `tabs` its dark tabs.
     *
     * `mode` sets what they are to assistive tech: `tabs` (a tablist), `radio` (one choice)
     * or `links` (navigation, the chosen one is the current location).
     */
    type Props = {
        items: Segment[];
        selected: string;
        onselect?: (id: string) => void;
        look?: 'toggle' | 'tabs';
        mode?: 'tabs' | 'radio' | 'links';
        label: string;
        /** Draws something before each label, like an icon. */
        icon?: Snippet<[Segment]>;
        /** Only the icons, with the label for screen readers and as hover text, like an item's name in the game. */
        iconOnly?: boolean;
        /** Stretch to fill the row, each segment as wide as the others. */
        fill?: boolean;
        size?: 'sm' | 'md';
        /** For tabs: the id of the panel they control. */
        controls?: string;
        class?: string;
    };
    let { items, selected, onselect, look = 'toggle', mode = 'tabs', label, icon, iconOnly = false, fill = false, size = 'md', controls, class: className = '' }: Props = $props();

    let root: HTMLElement;

    // The chosen one sinks in with a white line under its label: green among light toggle buttons, darker among tabs.
    const faceClass = (on: boolean) => `seg ore-face ${look === 'toggle' && !on ? 'ore-white' : look === 'toggle' ? 'ore-green' : 'ore-dark'}${on ? ' sunk marked' : ''}`;

    // Tabs and radios move with the arrow keys, like the game's controller navigation.
    function keys(e: KeyboardEvent) {
        if(mode === 'links') return;
        const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if(!step) return;
        e.preventDefault();
        const i = items.findIndex(it => it.id === selected);
        const next = items[(i + step + items.length) % items.length];
        onselect?.(next.id);
        root.querySelectorAll<HTMLElement>('.seg')[items.indexOf(next)]?.focus();
    }
</script>

<div
    bind:this={root}
    class="segments {look} {size} {className}"
    class:fill
    role={mode === 'tabs' ? 'tablist' : mode === 'radio' ? 'radiogroup' : undefined}
    aria-label={label}
    onkeydown={keys}
>
    {#each items as it (it.id)}
        {@const on = it.id === selected}
        {#if it.href}
            <a
                class={faceClass(on)} href={it.href} title={iconOnly ? undefined : it.title}
                aria-current={on ? 'location' : undefined}
                onclick={() => onselect?.(it.id)}
            >
                <span class="label">{@render icon?.(it)}<span class:sr-only={iconOnly}>{it.label}</span></span>{#if iconOnly}<span class="tip" aria-hidden="true">{it.label}</span>{/if}
            </a>
        {:else}
            <button
                type="button" class={faceClass(on)} title={iconOnly ? undefined : it.title}
                role={mode === 'tabs' ? 'tab' : 'radio'}
                aria-selected={mode === 'tabs' ? on : undefined}
                aria-checked={mode === 'radio' ? on : undefined}
                aria-controls={mode === 'tabs' ? controls : undefined}
                tabindex={on ? 0 : -1}
                onclick={() => onselect?.(it.id)}
            >
                <span class="label">{@render icon?.(it)}<span class:sr-only={iconOnly}>{it.label}</span></span>{#if iconOnly}<span class="tip" aria-hidden="true">{it.label}</span>{/if}
            </button>
        {/if}
    {/each}
</div>

<style>
    .segments { display: flex; min-width: 0; }
    .seg {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        min-height: 2.75rem;
        padding-inline: 0.9rem;
        font-family: var(--font-pixel);
        font-size: 1rem;
        line-height: 1.1;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
    }
    .sm .seg { min-height: 2.25rem; padding-inline: 0.7rem; font-size: 0.9rem; }
    /* Neighbours share their outline. */
    .seg + .seg { margin-left: calc(-1 * var(--t)); }
    .seg:focus-visible { z-index: 1; }
    .fill .seg { flex: 1 1 0; }
    .label { display: inline-flex; align-items: center; gap: 0.5em; min-width: 0; }
    .label :global(svg), .label :global(.icon) { flex: none; }
    /* Icon-only segments show their name above them when pointed at or focused, like hover text in the game. */
    .tip {
        position: absolute; bottom: calc(100% + 0.4rem); left: 50%; z-index: 3; translate: -50% 0;
        padding: 0.3rem 0.5rem; border: var(--t) solid #1e1e1f; background: #313233; color: #fff;
        font-size: 0.875rem; line-height: 1.2; white-space: nowrap; pointer-events: none; visibility: hidden;
    }
    /* The ones at the ends line up with their edge so they stay on screen. */
    .seg:first-child .tip { left: 0; translate: none; }
    .seg:last-child .tip { left: auto; right: 0; translate: none; }
    .seg:hover, .seg:focus-visible { z-index: 2; }
    .seg:hover .tip, .seg:focus-visible .tip { visibility: visible; }
    /* Touch screens have no pointing; the chosen tab's name is shown elsewhere. */
    @media (hover: none) { .seg:hover:not(:focus-visible) .tip { visibility: hidden; } }
</style>
