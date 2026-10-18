<script lang="ts">
    import { fly } from 'svelte/transition';
    import { toasts } from '$lib/ui.svelte';
    import ItemIcon from '../inventory/ItemIcon.svelte';
</script>

<div class="toasts" aria-live="polite">
    {#each toasts.list as t (t.id)}
        <div class="toast" in:fly={{ x: 320, duration: 350 }} out:fly={{ x: 320, duration: 300 }}>
            <ItemIcon icon={t.icon} size="2rem" />
            <div>
                <div class="title mc-text">{t.title}</div>
                <div class="name mc-text">{t.name}</div>
            </div>
        </div>
    {/each}
</div>

<style>
    .toasts { position: fixed; top: 0.75rem; right: 0.75rem; z-index: 80; max-width: calc(100vw - 1.5rem); display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none; }
    .toast {
        display: flex; align-items: center; gap: 0.75rem; width: min(17rem, calc(100vw - 1.5rem)); padding: 0.6rem 0.8rem;
        background: #212121; border: 2px solid #000; border-radius: 4px;
        box-shadow: inset 0 0 0 2px #555, 0 8px 20px rgb(0 0 0 / 0.4);
    }
    .title { color: var(--color-mc-yellow); font-size: 0.95rem; }
    .name { color: #fff; font-size: 0.95rem; }
    /* Phones: one at a time, a bit smaller. */
    @media (max-width: 560px) {
        .toast { width: min(15rem, calc(100vw - 1.5rem)); padding: 0.45rem 0.6rem; gap: 0.6rem; }
        .toast:not(:last-child) { display: none; }
        .title, .name { font-size: 0.85rem; }
    }
</style>
