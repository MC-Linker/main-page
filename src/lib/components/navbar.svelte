<script lang="ts">
    import { fly } from "svelte/transition";
    import { Button } from "$lib/components/ui/button/index";
    import { Book, UserPlus, Blocks } from '@lucide/svelte';
    import { onMount } from "svelte"
    import { links } from "$lib/index";
    import * as Popover from "$lib/components/ui/popover/index.js";
    
    let hasScrolled = $state(false);
    
    onMount(() => {
        const handleScroll = () => window.scrollY > 32 ? hasScrolled = true : hasScrolled = false;
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });
    
</script>
<div in:fly={{ y: -5 }} class="border-b border-b-accent transition-all flex justify-center h-[var(--header-height)] top-0 fixed items-center z-10 {hasScrolled ? 'bg-card/70 backdrop-blur-2xl lg:w-3xl w-3/4 rounded-[var(--radius)] m-2' : 'bg-card w-full'}">
    <div class="flex flex-row w-3xl justify-around items-center">
        <a href="/" class="flex flex-row items-center gap-2">
            <img src="/mc-linker.svg" alt="MC Linker Icon" class="size-11" />
            <span class="md:block hidden">MC Linker</span>
        </a>
        <div class="flex flex-row gap-1">
            <Button variant="outline" href={links.pages.guide}>
                <Book />
                <span class="md:block hidden">Guide</span>
            </Button>
            <Button variant="outline" href={links.invites.server} target="_blank">
                <img src="/brands/discord.svg" alt="Discord Icon" class="size-5">
                <span class="md:block hidden">Discord</span>
            </Button>
            <Button variant="secondary" href={links.invites.bot} target="_blank">
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
                        <img src="/brands/modrinth.svg" alt="Modrinth Icon" class="h-5" />
                        Modrinth
                    </Button>
                </Popover.Content>
            </Popover.Root>
        </div>
    </div>
</div>