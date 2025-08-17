<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar/index";
    import { Badge } from "$lib/components/ui/badge/index";

    let { username, github, roles, about = undefined } = $props();
</script>
<div class="bg-secondary/70 border-t flex md:flex-row flex-col gap-5 p-5 rounded-[var(--radius)] w-full">
    <div class="flex flex-col justify-around">
        <div class="flex flex-row items-center gap-3">
            <Avatar.Root class="size-15">
                <Avatar.Image src="https://github.com/{github}.png" alt="@{github}"></Avatar.Image>
                <Avatar.Fallback>{username.split(2)}</Avatar.Fallback>
            </Avatar.Root>
            <div class="flex flex-col">
                <span class="font-bold text-lg">{username}</span>
                <a href="https://github.com/TheAnnoying/" class="text-sm font-extralight text-muted-foreground underline">@{github}</a>
            </div>
        </div>
        <div class="flex flex-row gap-1 mt-1">
            {#each roles as role}
                <Badge variant="outline">{role}</Badge>
            {/each}
        </div>
    </div>
    {#if about}
        <p class="flex flex-col gap-1">{@html about}</p>
    {/if}
</div>
