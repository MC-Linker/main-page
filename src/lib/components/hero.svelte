<script lang="ts">
    import { fly } from "svelte/transition";
    let { image, alt, title, description, link, reverse = false, order = 1 } = $props();
    import Button from "$lib/components/ui/button/button.svelte";
</script>
<div class="flex flex-col {reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 items-center" in:fly={{ y: 10, delay: 200*order }}>
    <img src={image} {alt}>
    <div class="flex flex-col gap-3">
        <h1 class="text-3xl font-bold">{title}</h1>
        <p class="text-lg">{description}</p>
        <Button href={link} variant="secondary">Learn More</Button>
    </div>
</div>
