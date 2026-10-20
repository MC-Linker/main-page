<script lang="ts">
    import LinkPreview from '$lib/components/LinkPreview.svelte';
    import Faq from '$lib/components/sections/Faq.svelte';
    import Features from '$lib/components/sections/Features.svelte';
    import FinalCta from '$lib/components/sections/FinalCta.svelte';
    import Hero from '$lib/components/sections/Hero.svelte';
    import Setup from '$lib/components/sections/Setup.svelte';
    import { site } from '$lib/data';
    import { homeEmbed } from '$lib/linkPreview';
</script>

<LinkPreview title={site.name} description={site.description} path="/" embed={homeEmbed()} />

<!-- The sections, top to bottom. The hotbar links to them by id (see data/navigation.ts). -->
<Hero />
<Setup />
<Features />
<Faq />
<FinalCta />
