<script lang="ts">
    import type { Snippet } from 'svelte';

    /** A small toggle or action button used in scene controls. */
    type Props = { pressed?: boolean; onclick: () => void; children: Snippet; disabled?: boolean; variant?: 'toggle' | 'action' };
    let { pressed, onclick, children, disabled = false, variant = 'toggle' }: Props = $props();
</script>

<button type="button" class="chip {variant}" aria-pressed={variant === 'toggle' ? !!pressed : undefined} {onclick} {disabled}>
    {#if variant === 'toggle'}<span class="box" aria-hidden="true"></span>{/if}
    {@render children()}
</button>

<style>
    .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.4rem 0.75rem;
        border: 0;
        border-radius: 999px;
        background: rgb(255 255 255 / 0.07);
        color: #ced4da;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;
    }
    .chip:hover:not(:disabled) { background: rgb(255 255 255 / 0.13); color: #fff; }
    .chip[aria-pressed='true'] { background: rgb(111 158 45 / 0.25); color: #fff; }
    .chip:disabled { opacity: 0.45; cursor: default; }
    .box {
        width: 0.8rem; height: 0.8rem; flex: none;
        border: 2px solid currentColor; border-radius: 3px;
    }
    [aria-pressed='true'] .box { background: var(--color-grass-light); border-color: var(--color-grass-light); box-shadow: inset 0 0 0 2px #10180a; }
    .action { background: var(--color-dc-blurple); color: #fff; font-weight: 600; }
    .action:hover:not(:disabled) { background: var(--color-dc-blurple-dark); }
</style>
