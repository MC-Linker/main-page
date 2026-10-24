<script lang="ts">
    import Faq from '$lib/components/sections/Faq.svelte';
    import Features from '$lib/components/sections/Features.svelte';
    import FinalCta from '$lib/components/sections/FinalCta.svelte';
    import HeroSplit from '$lib/components/sections/HeroSplit.svelte';
    import Setup from '$lib/components/sections/Setup.svelte';
</script>

<svelte:head><meta name="robots" content="noindex" /></svelte:head>

<!-- Prototype of the home page with the fullscreen split hero. -->
<HeroSplit intro />
<Setup />
<Features />
<Faq />
<FinalCta />
