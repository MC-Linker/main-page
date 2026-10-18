<script lang="ts">
    import { fly } from 'svelte/transition';
    import { toasts } from '$lib/craft/ui.svelte';
    import ItemIcon from './ItemIcon.svelte';
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
    .toasts { position: fixed; top: 0.75rem; right: 0.75rem; z-index: 80; display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none; }
    .toast {
        display: flex; align-items: center; gap: 0.75rem; width: 17rem; padding: 0.6rem 0.8rem;
        background: #212121; border: 2px solid #000; border-radius: 4px;
        box-shadow: inset 0 0 0 2px #555, 0 8px 20px rgb(0 0 0 / 0.4);
    }
    .title { color: var(--color-mc-yellow); font-size: 0.95rem; }
    .name { color: #fff; font-size: 0.95rem; }
</style>
