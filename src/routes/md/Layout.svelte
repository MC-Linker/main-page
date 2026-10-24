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
</svelte:head>

<!-- An Ore UI screen: the header bar shows the trail, the text sits on a panel. -->
<div class="legal">
    <header class="head">
        <p class="kicker ore-text">Legal</p>
        <h1 class="ore-title">{title}</h1>
    </header>
    <article class="ore-card raised prose prose-invert prose-zinc doc">
        {@render children?.()}
    </article>
</div>

<style>
    .legal { padding: 0 1rem clamp(4rem, 8vw, 6rem); background: var(--color-ore-deep); }
    .head { padding: clamp(2.5rem, 6vw, 4rem) 0 2rem; text-align: center; }
    .kicker { margin: 0 0 0.6rem; color: var(--color-mc-green); }
    h1 { margin: 0; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.15; color: #fff; }
    .doc { max-width: 48rem; margin: 0 auto; padding: clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2.5rem) calc(clamp(1.25rem, 4vw, 2.5rem) + 3 * var(--t)); }
    .doc :global(h2) { font-size: 1.6rem; margin-top: 2.5rem; }
    .doc :global(> :first-child) { margin-top: 0; }
    .doc :global(a) { color: #a6dd94; }
    /* Prose's list markers are made for a darker page; lighten them for the panel. */
    .doc { --tw-prose-invert-counters: var(--color-ore-white); --tw-prose-invert-bullets: var(--color-ore-mid); }
    .doc :global(code::before), .doc :global(code::after) { content: none; }
</style>
