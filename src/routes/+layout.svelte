<script lang="ts">
	import "../app.css";
	import "nprogress/nprogress.css";

	import { ModeWatcher, setMode } from "mode-watcher";
	import { navigating } from '$app/state';

	import nProgress from "nprogress";
	import favicon from '$lib/assets/favicon.svg';

    import Navbar from "$lib/components/navbar.svelte";
    import Footer from "$lib/components/footer.svelte";

	nProgress.configure({ parent: "body", minimum: 0.4, trickleSpeed: 200, showSpinner: false, easing: "ease-out", speed: 300 });
	$effect(() => {
		if(navigating.to) nProgress.start()
		else nProgress.done();
	});

	let { children } = $props();
	setMode("dark");
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MC Linker</title>

	<meta content="MC Linker" property="og:title" />
	<meta content="Moderate and connect your Minecraft server with Discord! This bot allows you to view Minecraft statistics, advancements, and even inventories of members in Discord. Also supports a powerful two-way chat with Minecraft, command execution and many other helpful features." property="og:description" />
	<meta content="https://mclinker.com/logo.png" property="og:image" />
	<meta content="#729e34" data-react-helmet="true" name="theme-color" />

	<meta name="description" content="Link your Minecraft server with Discord">
	<meta name="keywords" content="Discord, Minecraft, Bot, Link">
	<meta name="author" content="TheAnnoying, Lianecx">
</svelte:head>

<ModeWatcher />
<Navbar />
{@render children?.()}
<Footer />