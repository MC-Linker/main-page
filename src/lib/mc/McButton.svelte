<script lang="ts">
    import type { Snippet } from 'svelte';

    type Props = {
        href?: string;
        onclick?: () => void;
        children: Snippet;
        size?: 'md' | 'lg';
        external?: boolean;
        class?: string;
        type?: 'button' | 'submit';
        disabled?: boolean;
        pressed?: boolean;
    };
    let { href, onclick, children, size = 'md', external = false, class: className = '', type = 'button', disabled = false, pressed }: Props = $props();
</script>

{#if href}
    <a {href} class="mc-btn {size} {className}" target={external ? '_blank' : undefined} rel={external ? 'noopener' : undefined}>
        <span class="mc-text">{@render children()}</span>
    </a>
{:else}
    <button {type} {onclick} {disabled} class="mc-btn {size} {className}" aria-pressed={pressed}>
        <span class="mc-text">{@render children()}</span>
    </button>
{/if}

<style>
    .mc-btn {
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
            #6f6f6f;
        color: #fff;
        font-size: 1.05rem;
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        image-rendering: pixelated;
    }
    .mc-btn.lg { min-height: 3rem; padding: 0 1.75rem; font-size: 1.2rem; }
    .mc-btn:hover:not(:disabled), .mc-btn:focus-visible, .mc-btn[aria-pressed='true'] {
        outline: 2px solid #fff;
        outline-offset: -4px;
        background-color: #7d84a8;
    }
    .mc-btn[aria-pressed='true'] { background-color: #5c8a2a; }
    .mc-btn:active:not(:disabled) { transform: translateY(1px); }
    .mc-btn:disabled { color: #a0a0a0; background: #2c2c2c; cursor: default; }
    .mc-btn > span { display: inline-flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
    .mc-btn :global(svg) { flex: none; }
</style>
