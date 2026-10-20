<script lang="ts">
    import { page } from '$app/state';
    import McButton from '$lib/mc/McButton.svelte';
    import { links } from '$lib/data';

    // Every error is Minecraft's death screen. Respawn goes home.
    const notFound = $derived(page.status === 404);
</script>

<svelte:head>
    <title>{page.status} · MC Linker</title>
</svelte:head>

<section class="died">
    <h1 class="mc-text">You died!</h1>
    <p class="mc-text cause">
        {#if notFound}
            <code>{page.url.pathname}</code> fell out of the world
        {:else}
            {page.error?.message ?? 'Something went wrong'}
        {/if}
    </p>
    <p class="mc-text score">Score: <span>{page.status}</span></p>
    <div class="buttons">
        <McButton href="/" size="lg">Respawn</McButton>
        <McButton href={links.guide} size="lg">Read the guide</McButton>
    </div>
</section>

<style>
    .died {
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
        min-height: 100svh; padding: 3rem 1rem var(--hud-space); text-align: center;
        background: radial-gradient(circle, rgb(120 0 0 / 0.55), rgb(60 0 0 / 0.85)), #1a0505;
    }
    h1 { margin: 0; font-size: clamp(3rem, 9vw, 5.5rem); color: #fff; --mc-shadow: 0.08em; }
    .cause { margin: 0; color: #fff; font-size: 1.15rem; }
    .cause code { font-family: inherit; color: var(--color-mc-yellow); }
    .score { margin: 0; color: #fff; }
    .score span { color: var(--color-mc-yellow); }
    .buttons { display: flex; flex-direction: column; gap: 0.6rem; width: min(22rem, 100%); margin-top: 1.5rem; }
    .buttons :global(.mc-btn) { width: 100%; }
</style>
