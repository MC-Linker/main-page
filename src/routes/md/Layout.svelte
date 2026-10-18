<script lang="ts">
    let { children, title, description } = $props();
</script>

<svelte:head>
    <title>{title} · MC Linker</title>
    <meta name="description" content={description} />
</svelte:head>

<header class="head">
    <p class="crumb"><a href="/">MC Linker</a> / Legal</p>
    <h1>{title}</h1>
</header>
<article class="prose prose-stone doc">
    {@render children?.()}
</article>

<style>
    .head { padding: 8rem 1rem 3rem; text-align: center; background: var(--color-paper-2); border-bottom: var(--sticker); }
    .crumb { margin: 0 0 0.5rem; font-family: var(--font-pixel); color: var(--color-ink-soft); }
    .crumb a { color: inherit; }
    h1 { margin: 0; font-size: clamp(2.2rem, 6vw, 3.5rem); font-weight: 900; letter-spacing: -0.03em; }
    .doc { max-width: 46rem; margin: 0 auto; padding: 3rem 1rem 6rem; }
    .doc :global(h1) { font-size: 1.6rem; margin-top: 2.5rem; }
    .doc :global(a) { color: var(--color-grass); }
    .doc :global(code::before), .doc :global(code::after) { content: none; }
</style>
