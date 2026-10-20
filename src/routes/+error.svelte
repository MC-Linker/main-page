<script lang="ts">
    import { page } from '$app/state';
    import { links } from '$lib/data';
    import OreButton from '$lib/ore/OreButton.svelte';

    // Every error is the game's death screen (an Ore UI screen in Bedrock). Respawn goes home.
    const notFound = $derived(page.status === 404);
</script>

<svelte:head>
    <title>{page.status} · MC Linker</title>
</svelte:head>

<section class="died">
    <h1 class="ore-title">You died!</h1>
    <p class="cause">
        {#if notFound}
            <code class="ore-text">{page.url.pathname}</code> fell out of the world
        {:else}
            {page.error?.message ?? 'Something went wrong'}
        {/if}
    </p>
    <p class="score ore-text">Score: <span>{page.status}</span></p>
    <div class="buttons">
        <OreButton href="/" hero size="lg">Respawn</OreButton>
        <OreButton href={links.guide} variant="secondary" size="lg">Read the guide</OreButton>
    </div>
</section>

<style>
    .died {
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
        min-height: calc(100svh - var(--nav-h)); padding: 3rem 1rem 4rem; text-align: center;
        background: radial-gradient(circle, rgb(140 20 20 / 0.55), rgb(70 8 8 / 0.9)), #1e1e1f;
    }
    h1 { margin: 0; font-size: clamp(3rem, 9vw, 5rem); line-height: 1.1; color: #fff; }
    .cause { margin: 0; color: #fff; font-size: 1.1rem; }
    .cause code { color: var(--color-mc-yellow); }
    .score { margin: 0; color: #fff; }
    .score span { color: var(--color-mc-yellow); }
    .buttons { display: flex; flex-direction: column; gap: 0.75rem; width: min(22rem, 100%); margin-top: 1.5rem; }
</style>
