<script lang="ts">
    import { site } from '$lib/data';
    import { absolute, type ComponentEmbed, embedScript } from '$lib/linkPreview';

    /**
     * Link preview tags for one page: Open Graph for every site that unfurls links,
     * plus Discord's component embed (text, images and buttons) when given.
     */
    type Props = { title: string; description: string; path: string; embed?: ComponentEmbed };
    let { title, description, path, embed }: Props = $props();
</script>

<svelte:head>
    <meta name="description" content={description} />
    <link rel="canonical" href={absolute(path)} />
    <meta property="og:site_name" content={site.name} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <!-- A wide card (static/og.jpg, made from the hero intro) so apps show it as a big banner. -->
    <meta property="og:image" content={absolute('/og.jpg')} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="MC Linker: The easiest Minecraft and Discord link." />
    <meta property="og:url" content={absolute(path)} />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    {#if embed}{@html embedScript(embed)}{/if}
</svelte:head>
