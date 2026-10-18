<script lang="ts">
    import Hero from '$lib/components/Hero.svelte';
    import ChatScene from '$lib/components/scenes/ChatScene.svelte';
    import CommandScene from '$lib/components/scenes/CommandScene.svelte';
    import UserInfoScene from '$lib/components/scenes/UserInfoScene.svelte';
    import ModerationScene from '$lib/components/scenes/ModerationScene.svelte';
    import StatChannelScene from '$lib/components/scenes/StatChannelScene.svelte';
    import RoleSyncScene from '$lib/components/scenes/RoleSyncScene.svelte';
    import AccountScene from '$lib/components/scenes/AccountScene.svelte';
    import MoreFeatures from '$lib/components/MoreFeatures.svelte';
    import Setup from '$lib/components/Setup.svelte';
    import Faq from '$lib/components/Faq.svelte';
    import FinalCta from '$lib/components/FinalCta.svelte';
    import { spriteUri } from '$lib/pixel/uri';
    import { dirt } from '$lib/pixel/sprites';

    const ground = spriteUri(dirt);
</script>

<Hero />

<div id="features" class="features">
    <header class="intro" style:--ground={ground}>
        <p class="kicker mojang">Features</p>
        <h2 class="mc-text">One link. Two worlds.</h2>
        <p>Every feature works on both sides. On the left, what your players see in-game. On the right, what your community sees in Discord. Try the buttons.</p>
    </header>
    <ChatScene index={1} />
    <CommandScene index={2} />
    <UserInfoScene index={3} />
    <ModerationScene index={4} />
    <StatChannelScene index={5} />
    <RoleSyncScene index={6} />
    <AccountScene index={7} />
</div>

<MoreFeatures />
<Setup />
<Faq />
<FinalCta />

<style>
    .features { position: relative; background: var(--color-ink); }
    .intro {
        padding: clamp(4rem, 9vw, 7rem) 1rem 0;
        text-align: center;
        background:
            linear-gradient(90deg, transparent calc(50% - 6px), var(--color-dc-3) calc(50% - 6px)),
            linear-gradient(rgb(8 6 4 / 0.62), rgb(8 6 4 / 0.62)),
            var(--ground) 0 0 / 64px 64px;
        image-rendering: pixelated;
    }
    .kicker { margin: 0 0 0.6rem; font-size: 1rem; color: var(--color-grass-light); text-shadow: 0.1em 0.1em 0 rgb(0 0 0 / 0.6); }
    .intro h2 { margin: 0; font-size: clamp(2.2rem, 5vw, 3.5rem); color: #fff; }
    .intro p:not(.kicker) { margin: 0.75rem auto 0; max-width: 36rem; padding: 0.75rem 1rem; border-radius: 12px; background: rgb(13 16 20 / 0.7); color: #ced4da; line-height: 1.6; }
    @media (max-width: 860px) {
        .intro { background: var(--color-ink); }
    }
</style>
