<script lang="ts">
    import '../app.css';
    import '@fontsource-variable/pixelify-sans';
    import '@fontsource-variable/noto-sans';
    import 'nprogress/nprogress.css';
    import nProgress from 'nprogress';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { navigating } from '$app/state';
    import favicon from '$lib/assets/favicon.ico';
    import Footer from '$lib/components/Footer.svelte';
    import OreNav from '$lib/components/nav/OreNav.svelte';
    import { site } from '$lib/data';
    import { fixNarrowEmbeds } from '$lib/discord/narrow';
    import { textureVars } from '$lib/pixel/textures';

    let { children } = $props();

    // The Discord message elements are Lit web components, which need the DOM. Load them in the
    // browser only, so the Cloudflare worker (it renders the error page) doesn't crash on import.
    if(browser) import('@skyra/discord-components-core');

    onMount(fixNarrowEmbeds);

    // A thin progress bar while the next page loads. Browser only: on the Cloudflare worker, which
    // renders the error page for unknown paths, nprogress's CommonJS default import is undefined.
    onMount(() => nProgress.configure({ minimum: 0.4, trickleSpeed: 200, showSpinner: false }));
    $effect(() => {
        if(navigating.to) nProgress.start();
        else nProgress.done();
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <link rel="preload" href="/fonts/minecraft-seven.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
    <title>MC Linker · Link Minecraft and Discord</title>
    <meta name="description" content={site.description} />
    <meta name="keywords" content="Discord, Minecraft, Bot, Link, Chat bridge, Plugin, Mod" />
    <meta name="author" content="Lianecx, TheAnnoying" />
    <meta name="theme-color" content={site.themeColor} />
    {@html `<style>:root{${textureVars}}</style>`}
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>
<OreNav />
<!-- Every page starts under the header bar. -->
<main id="main" class="under-nav">
    {@render children?.()}
</main>
<Footer />

<style>
    .under-nav { padding-top: var(--nav-h); }
</style>
