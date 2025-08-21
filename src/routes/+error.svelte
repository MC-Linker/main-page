<script>
    import { Button } from "$lib/components/ui/button/index";
    import { CornerUpLeft } from '@lucide/svelte';
    import { fly } from "svelte/transition";
    import { page } from "$app/state";
</script>

<svelte:head>
    <title>{page.status}</title>
    <meta name="description" content={page.error?.message} />
</svelte:head>

<div in:fly={{ y: -5 }} class="p-5 prose dark:prose-invert prose-zinc !max-w-4xl">
    <h1>{page.status} {page.error?.message}</h1>
    The page <code>{page.url.pathname}</code> was not found
</div>