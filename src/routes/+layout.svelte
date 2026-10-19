<script lang="ts">
	import '../app.css';
	import '@skyra/discord-components-core';
	import '@fontsource-variable/pixelify-sans';
	import '@fontsource-variable/dm-sans';
	import 'nprogress/nprogress.css';
	import nProgress from 'nprogress';
	import { navigating } from '$app/state';
	import favicon from '$lib/assets/favicon.ico';
	import { spriteUri } from '$lib/pixel/uri';
	import { dirt, stone } from '$lib/pixel/sprites';
	import Hotbar from '$lib/components/hud/Hotbar.svelte';
	import Tooltip from '$lib/components/hud/Tooltip.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();

	nProgress.configure({ minimum: 0.4, trickleSpeed: 200, showSpinner: false });
	$effect(() => {
		if(navigating.to) nProgress.start();
		else nProgress.done();
	});

	const description = 'MC Linker links your Minecraft server with Discord. Two-way chat, inventories, stats, moderation, role sync and more. No bot to host, no config files.';
	// Block textures shared by several sections, as CSS variables.
	const textures = `:root{--dirt:${spriteUri(dirt)};--stone-tile:${spriteUri(stone)}}`;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preload" href="/fonts/minecraft-seven.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href="/fonts/minecrafter.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
	<title>MC Linker · Link Minecraft and Discord</title>
	<meta name="description" content={description} />
	<meta name="keywords" content="Discord, Minecraft, Bot, Link, Chat bridge, Plugin, Mod" />
	<meta name="author" content="Lianecx, TheAnnoying" />
	<meta name="theme-color" content="#6f9e2d" />
	{@html `<style>${textures}</style>`}
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>
<main id="main">
	{@render children?.()}
</main>
<Footer />
<Hotbar />
<Tooltip />
