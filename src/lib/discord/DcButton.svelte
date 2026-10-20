<script lang="ts">
    import type { Snippet } from 'svelte';

    /** A blurple Discord-style link button, like "Add to Discord". */
    type Props = {
        href: string;
        children: Snippet;
        size?: 'md' | 'lg';
        external?: boolean;
        class?: string;
    };
    let { href, children, size = 'md', external = false, class: className = '' }: Props = $props();
</script>

<a class="dc-btn {size} {className}" {href} target={external ? '_blank' : undefined} rel={external ? 'noopener' : undefined}>
    {@render children()}
</a>

<style>
    .dc-btn {
        display: inline-flex; align-items: center; gap: 0.6rem; min-height: 3rem; padding: 0 1.5rem; border-radius: 8px;
        background: var(--color-dc-blurple); color: #fff; font-weight: 700; text-decoration: none;
    }
    .dc-btn.lg { padding: 0 1.6rem; font-size: 1.05rem; }
    .dc-btn:hover { background: var(--color-dc-blurple-dark); }
</style>
