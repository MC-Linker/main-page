<script lang="ts">
	import '../app.css';
	import '@fontsource-variable/pixelify-sans';
	import '@fontsource-variable/dm-sans';
	import 'nprogress/nprogress.css';
	import nProgress from 'nprogress';
	import { navigating } from '$app/state';
	import favicon from '$lib/assets/favicon.ico';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();

	nProgress.configure({ minimum: 0.4, trickleSpeed: 200, showSpinner: false });
	$effect(() => {
		if(navigating.to) nProgress.start();
		else nProgress.done();
	});

	const description = 'MC Linker links your Minecraft server with Discord. Two-way chat, inventories, stats, moderation, role sync and more. No bot to host, no config files.';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MC Linker · Link Minecraft and Discord</title>
	<meta name="description" content={description} />
	<meta name="keywords" content="Discord, Minecraft, Bot, Link, Chat bridge, Plugin, Mod" />
	<meta name="author" content="Lianecx, TheAnnoying" />
	<meta name="theme-color" content="#6f9e2d" />
	<meta property="og:title" content="MC Linker" />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="https://mclinker.com/logo.png" />
	<meta property="og:url" content="https://mclinker.com" />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>
<Nav />
<main id="main">
	{@render children?.()}
</main>
<Footer />
