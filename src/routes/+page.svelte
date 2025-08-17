<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import Hero from "$lib/components/hero.svelte";

    import { hero, links } from "$lib/index";
    import { UserPlus, Blocks } from "@lucide/svelte";
    import { fly } from "svelte/transition";
</script>
<div in:fly={{ y: 20, delay: 200 }} class="flex flex-col gap-2 items-center md:w-1/3 w-3/4 m-32">
    <img src="/banner.png" alt="MC Linker Banner" />
    <span class="text-center">Link your Minecraft server with Discord</span>
    <div class="flex flex-row gap-2">
        <Button variant="default" href={links.invites.bot} target="_blank">
            <UserPlus />
            <span class="md:block hidden">Invite Bot</span>
        </Button>
        <Popover.Root>
            <Popover.Trigger>
                <Button variant="secondary">
                    <Blocks />
                    <span class="md:block hidden">Plugin</span>
                </Button>
            </Popover.Trigger>
            <Popover.Content class="flex flex-row gap-2">
                <Button variant="outline" href={links.plugin.spigot} target="_blank">
                    <img src="/brands/spigot.png" alt="Spigot Icon" class="h-5">
                    Spigot
                </Button>
                <Button variant="outline" href={links.plugin.modrinth} target="_blank">
                    <img src="/brands/modrinth.svg" alt="Modrinth Icon" class="h-5 fill-amber-50" />
                    Modrinth
                </Button>
            </Popover.Content>
        </Popover.Root>
    </div>
</div>
<div class="transition-all flex flex-col gap-20 md:w-3xl w-sm mb-32">
    {#each hero as data, i}
        <Hero
            order={i+1}
            reverse={data?.reverse}
            image={data.image}
            alt={data.alt}
            title={data.title}
            description={data.description}
            link={data.link}
        />
    {/each}
</div>