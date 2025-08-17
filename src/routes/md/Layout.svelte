<script lang="ts">
    import { CornerUpLeft, CircleUserRound } from '@lucide/svelte';
    import { Button } from "$lib/components/ui/button/index";
    import { fly } from "svelte/transition";

    let { children, author, title, description } = $props();
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
</svelte:head>

<div in:fly={{ y: -5 }} class="p-5 prose dark:prose-invert prose-zinc !max-w-4xl">
    <div class="flex flex-row items-center mb-2 gap-2">
        <Button variant="ghost" class="" onclick={() => window.history.back()}>
            <CornerUpLeft />
            Back
        </Button>
        {#if author}
            <Button variant="ghost" href="https://github.com/{author}">
                <CircleUserRound />
                Lianecx
            </Button>
        {/if}
    </div>
    {@render children?.()}
</div>
