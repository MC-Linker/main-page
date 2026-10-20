<script lang="ts" module>
    /**
     * Ore UI's button colours. `primary` is green, `secondary` light grey with black text,
     * `contrast` dark grey, `danger` red and `realm` purple, as in the game; `discord` is
     * blurple, built the same way, for "Add to Discord".
     */
    export type OreVariant = 'primary' | 'secondary' | 'contrast' | 'danger' | 'realm' | 'discord' | 'transparent';

    /** The palette class (app.css) for each variant. */
    export const palette: Record<OreVariant, string> = {
        primary: 'ore-green',
        secondary: 'ore-white',
        contrast: 'ore-dark',
        danger: 'ore-red',
        realm: 'ore-purple',
        discord: 'ore-blurple',
        transparent: 'ore-clear',
    };
</script>

<script lang="ts">
    import type { Snippet } from 'svelte';

    /**
     * An Ore UI button: a flat face with a light top-left edge, a darker bottom edge that
     * makes it stand up, and a dark outline. Pressing pushes it down into that edge.
     * A link with `href`, otherwise a button.
     */
    type Props = {
        href?: string;
        onclick?: (e: MouseEvent) => void;
        children: Snippet;
        variant?: OreVariant;
        /** The big call to action: the title font, like the game's "Play" button. */
        hero?: boolean;
        size?: 'sm' | 'md' | 'lg';
        /** A small label on the button's corner, like "Recommended". */
        badge?: string;
        external?: boolean;
        class?: string;
        type?: 'button' | 'submit';
        disabled?: boolean;
        /** Drawn pressed in, for a button that stays on (with aria-pressed). */
        pressed?: boolean;
        label?: string;
    };
    let { href, onclick, children, variant = 'primary', hero = false, size = 'md', badge, external = false, class: className = '', type = 'button', disabled = false, pressed, label }: Props = $props();

    const classes = $derived(`ore-btn ore-face ${palette[variant]} ${size} ${className}`);
</script>

{#if href && !disabled}
    <a {href} class={classes} class:hero aria-label={label} {onclick} target={external ? '_blank' : undefined} rel={external ? 'noopener' : undefined}>
        <span class="label">{@render children()}</span>
        {#if badge}<span class="badge ore-text">{badge}</span>{/if}
    </a>
{:else}
    <button {type} {onclick} {disabled} class={classes} class:hero class:sunk={pressed} class:pressed aria-label={label} aria-pressed={pressed}>
        <span class="label">{@render children()}</span>
        {#if badge}<span class="badge ore-text">{badge}</span>{/if}
    </button>
{/if}

<style>
    .ore-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 2.75rem;
        padding-inline: 1rem;
        font-family: var(--font-pixel);
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.1;
        text-align: center;
        text-decoration: none;
        cursor: pointer;
        user-select: none;
    }
    .sm { min-height: 2.25rem; padding-inline: 0.75rem; font-size: 0.9rem; }
    .lg { min-height: 3.5rem; padding-inline: 1.5rem; font-size: 1.25rem; }
    .hero { font-family: var(--font-title); letter-spacing: 0.0625em; }
    .hero .label { text-shadow: 0.0625em 0 0 currentColor; }
    .label { display: inline-flex; align-items: center; justify-content: center; gap: 0.55em; min-width: 0; }
    .label :global(svg) { flex: none; }

    .badge {
        position: absolute; z-index: 2; top: -0.65rem; right: 0.5rem;
        padding: 0.15rem 0.35rem 0.2rem;
        border: var(--t) solid #1e1e1f;
        background: #fff;
        color: #000;
        font-size: 0.7rem;
        line-height: 1;
        white-space: nowrap;
        pointer-events: none;
    }
</style>
