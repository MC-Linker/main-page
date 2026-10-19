<script lang="ts">
    import Hero from '$lib/components/sections/Hero.svelte';
    import Setup from '$lib/components/sections/Setup.svelte';
    import Features from '$lib/components/sections/Features.svelte';
    import Faq from '$lib/components/sections/Faq.svelte';
    import FinalCta from '$lib/components/sections/FinalCta.svelte';
    import LinkPreview from '$lib/components/LinkPreview.svelte';
    import { homeEmbed } from '$lib/linkPreview';
</script>

<LinkPreview
    title="MC Linker"
    description="MC Linker links your Minecraft server with Discord. Two-way chat, inventories, stats, moderation, role sync and more. No bot to host, no config files."
    path="/"
    embed={homeEmbed()}
/>

<Hero />
<Setup />
<Features />
<Faq />
<FinalCta />
