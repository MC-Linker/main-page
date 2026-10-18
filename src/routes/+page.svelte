<script lang="ts">
    import { inview } from '$lib/actions/inview';
    import { hud, toasts } from '$lib/craft/ui.svelte';
    import { book, chest, map } from '$lib/pixel/items';
    import TitleScreen from '$lib/components/craft/TitleScreen.svelte';
    import Crafting from '$lib/components/craft/Crafting.svelte';
    import CreativeInventory from '$lib/components/craft/CreativeInventory.svelte';
    import ServerList from '$lib/components/craft/ServerList.svelte';
    import Book from '$lib/components/craft/Book.svelte';

    // Reaching a section selects its hotbar slot and, the first time, earns an advancement.
    const advancements = [null, null, { name: 'Window Shopping', icon: { sprite: chest } }, { name: 'Server Hopper', icon: { sprite: map } }, { name: 'Bookworm', icon: { sprite: book } }];
    const enter = (i: number) => (visible: boolean) => {
        if(!visible) return;
        hud.section = i;
        const a = advancements[i];
        if(a) toasts.advancement(a.name, a.icon);
    };
</script>

<svelte:window onscroll={() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    hud.progress = max > 0 ? window.scrollY / max : 0;
}} />

<div use:inview={{ threshold: 0.5, onchange: enter(0) }}><TitleScreen /></div>
<div use:inview={{ threshold: 0.35, onchange: enter(1) }}><Crafting /></div>
<div use:inview={{ threshold: 0.35, onchange: enter(2) }}><CreativeInventory /></div>
<div use:inview={{ threshold: 0.35, onchange: enter(3) }}><ServerList /></div>
<div use:inview={{ threshold: 0.35, onchange: enter(4) }}><Book /></div>
