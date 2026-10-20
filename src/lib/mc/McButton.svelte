<script lang="ts">
    import type { Snippet } from 'svelte';

    type Props = {
        href?: string;
        onclick?: () => void;
        children: Snippet;
        size?: 'md' | 'lg';
        /** `discord` is the blurple button used for "Add to Discord". */
        variant?: 'default' | 'discord';
        /** Any face colour, e.g. a download site's brand colour. */
        color?: string;
        /** A small label on the button's corner, like "Recommended". */
        badge?: string;
        external?: boolean;
        class?: string;
        type?: 'button' | 'submit';
        disabled?: boolean;
        pressed?: boolean;
    };
    let { href, onclick, children, size = 'md', variant = 'default', color, badge, external = false, class: className = '', type = 'button', disabled = false, pressed }: Props = $props();
</script>

{#if href}
    <a {href} class="mc-btn {size} {variant} {className}" style:--tint={color} target={external ? '_blank' : undefined} rel={external ? 'noopener' : undefined}>
        <span class="mc-text">{@render children()}</span>
        {#if badge}<span class="badge mc-text">{badge}</span>{/if}
    </a>
{:else}
    <button {type} {onclick} {disabled} class="mc-btn {size} {variant} {className}" style:--tint={color} aria-pressed={pressed}>
        <span class="mc-text">{@render children()}</span>
        {#if badge}<span class="badge mc-text">{badge}</span>{/if}
    </button>
{/if}

<style>
    /* Minecraft's own button textures (from the game's client.jar, gui/sprites/widget),
       drawn as a 9-slice with a 3-pixel edge, the way the game scales them. */
    .mc-btn {
        /* Size of one texture pixel. */
        --px: 2px;
        --texture: url('/mc/gui/button.png');
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: calc(20 * var(--px));
        padding: 0 1.25rem;
        border: calc(3 * var(--px)) solid transparent;
        border-image: var(--texture) 3 fill / calc(3 * var(--px)) repeat;
        background: none;
        color: #fff;
        font-size: 1.05rem;
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        image-rendering: pixelated;
    }
    .mc-btn.lg { --px: 3px; padding: 0 1.75rem; font-size: 1.2rem; }
    .mc-btn:hover:not(:disabled), .mc-btn:focus-visible, .mc-btn[aria-pressed='true'] {
        --texture: url('/mc/gui/button_highlighted.png');
        outline: none;
    }
    .mc-btn[aria-pressed='true'] { --tint: #5c8a2a; }
    .mc-btn:active:not(:disabled) { transform: translateY(1px); }
    .mc-btn:disabled { --texture: url('/mc/gui/button_disabled.png'); color: #a0a0a0; cursor: default; }
    .mc-btn.discord { --tint: var(--color-dc-blurple); }
    /* Coloured buttons: the same texture, recoloured but keeping its shading and grain. */
    .mc-btn::before {
        content: ''; position: absolute; inset: calc(-3 * var(--px)); pointer-events: none;
        background: var(--tint, transparent); mix-blend-mode: color;
    }
    .mc-btn:disabled::before { display: none; }
    .mc-btn > span { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
    .mc-btn :global(svg) { flex: none; }
    .badge {
        position: absolute; z-index: 2; top: -0.7rem; right: 0.5rem; padding: 0.05rem 0.35rem;
        background: #1d1d1d; border: 2px solid #000; box-shadow: inset 0 0 0 1px #ffff55;
        color: #ffff55; font-size: 0.7rem; line-height: 1.2; white-space: nowrap; pointer-events: none;
    }
</style>
