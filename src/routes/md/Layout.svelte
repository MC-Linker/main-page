<script lang="ts">
    import { page } from '$app/state';
    import LinkPreview from '$lib/components/LinkPreview.svelte';
    import { legalEmbed } from '$lib/linkPreview';

    // The layout for the markdown pages (terms, privacy). `title` and `description` come from their front matter.
    let { children, title, description } = $props();
    const path = page.url.pathname.replace(/\/$/, '');
</script>

<LinkPreview title="{title} · MC Linker" {description} {path} embed={legalEmbed(title, description, path)} />

<svelte:head>
    <title>{title} · MC Linker</title>
    <meta name="description" content={description} />
</svelte:head>

<header class="head">
    <p class="crumb mc-text"><a href="/">MC Linker</a> / Legal</p>
    <h1>{title}</h1>
</header>
<article class="prose prose-invert prose-zinc doc">
    {@render children?.()}
</article>

<style>
    .head {
        padding: 4.5rem 1rem 3rem;
        text-align: center;
        background: linear-gradient(90deg, #2d4a12 0 50%, #232a6b 50% 100%);
    }
    .crumb { margin: 0 0 0.5rem; color: #e9ecef; }
    .crumb a { color: inherit; }
    h1 { margin: 0; font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; color: #fff; letter-spacing: -0.02em; }
    .doc { max-width: 46rem; margin: 0 auto; padding: 3rem 1rem 6rem; }
    .doc :global(h1) { font-size: 1.6rem; margin-top: 2.5rem; }
    .doc :global(a) { color: var(--color-grass-light); }
    .doc :global(code::before), .doc :global(code::after) { content: none; }
</style>
