<script lang="ts">
    import { site } from '$lib/data';
    import { absolute, type ComponentEmbed, embedScript } from '$lib/linkPreview';

    /**
     * Link preview tags for one page: Open Graph for every site that unfurls links,
     * plus Discord's component embed (text, images and buttons) when given.
     */
    type Props = { title: string; description: string; path: string; image?: string; embed?: ComponentEmbed };
    let { title, description, path, image = '/logo.png', embed }: Props = $props();
</script>

<svelte:head>
    <meta property="og:site_name" content={site.name} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={absolute(image)} />
    <meta property="og:url" content={absolute(path)} />
    <meta name="twitter:card" content="summary" />
    {#if embed}{@html embedScript(embed)}{/if}
</svelte:head>
