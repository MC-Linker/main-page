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
    .mc-btn {
        --tint: #6f6f6f;
        --face: var(--tint);
        --face-hover: color-mix(in srgb, var(--tint) 78%, white);
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: 2.5rem;
        padding: 0 1.25rem;
        border: 2px solid #000;
        background:
            linear-gradient(#ffffff40, #ffffff40) top / 100% 2px no-repeat,
            linear-gradient(#00000055, #00000055) bottom / 100% 3px no-repeat,
            var(--face);
        color: #fff;
        font-size: 1.05rem;
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        image-rendering: pixelated;
    }
    .mc-btn.default:not([style*='--tint']) { --face-hover: #7d84a8; }
    .mc-btn.discord { --tint: var(--color-dc-blurple); }
    .mc-btn.lg { min-height: 3rem; padding: 0 1.75rem; font-size: 1.2rem; }
    .mc-btn:hover:not(:disabled), .mc-btn:focus-visible, .mc-btn[aria-pressed='true'] {
        outline: 2px solid #fff;
        outline-offset: -4px;
        --face: var(--face-hover);
    }
    .mc-btn[aria-pressed='true'] { --face: #5c8a2a; }
    .mc-btn:active:not(:disabled) { transform: translateY(1px); }
    .mc-btn:disabled { color: #a0a0a0; --face: #2c2c2c; cursor: default; }
    .mc-btn > span { display: inline-flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
    .mc-btn :global(svg) { flex: none; }
    .badge {
        position: absolute; top: -0.7rem; right: 0.5rem; padding: 0.05rem 0.35rem;
        background: #1d1d1d; border: 2px solid #000; box-shadow: inset 0 0 0 1px #ffff55;
        color: #ffff55; font-size: 0.7rem; line-height: 1.2; white-space: nowrap; pointer-events: none;
    }
</style>
