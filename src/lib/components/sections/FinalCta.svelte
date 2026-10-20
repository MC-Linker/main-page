<script lang="ts">
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { links } from '$lib/data';
    import DcBackdrop from '$lib/discord/DcBackdrop.svelte';
    import McWorld from '$lib/mc/McWorld.svelte';
    import OreButton from '$lib/ore/OreButton.svelte';
</script>

<!-- The last screen: an Ore UI dialog over both worlds, like the game asking "ready?". -->
<section class="cta" aria-labelledby="cta-title">
    <McWorld class="cta-world" tile={30} hills blur={3} clouds={false} />
    <div class="dc-bg" aria-hidden="true"><DcBackdrop /></div>

    <img src="/logo-horizontal.svg" alt="" width="980" height="472" class="logo" />
    <div class="ore-card raised dialog" role="group" aria-labelledby="cta-title">
        <h2 id="cta-title" class="ore-header ore-title">Link your worlds</h2>
        <div class="body">
            <p>Add the bot, install the plugin, run <code class="ore-tag">/connect</code>. It's free, and it takes about a minute.</p>
            <div class="buttons">
                <OreButton href="#install" hero size="lg">Get the Plugin</OreButton>
                <OreButton href={links.invite} external variant="discord" hero size="lg"><BrandIcon brand="discord" size="1.15em" /> Add to Discord</OreButton>
            </div>
            <p class="fine ore-text">Paper · Spigot · Fabric · Forge · NeoForge · <a href={links.guide}>Read the guide</a></p>
        </div>
    </div>
</section>

<style>
    .cta {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: clamp(3.5rem, 8vw, 6rem) 1rem clamp(4rem, 9vw, 6.5rem);
    }
    /* Minecraft on the left, Discord on the right, both out of focus, the seam between them. */
    .cta :global(.cta-world) { position: absolute; inset: 0 50% 0 0; z-index: -1; mask: var(--seam-mask); }
    .dc-bg { position: absolute; inset: 0 0 0 calc(50% - var(--seam-width)); z-index: -2; overflow: hidden; background: #313338; }
    .dc-bg::after { content: ''; position: absolute; inset: 0; background: rgb(17 18 20 / 0.35); }

    .logo { position: relative; z-index: 1; width: clamp(6rem, 11vw, 8.5rem); height: auto; margin-bottom: -0.75rem; filter: drop-shadow(0 6px 0 rgb(0 0 0 / 0.35)); animation: bob 4s ease-in-out infinite; }
    @keyframes bob { 50% { transform: translateY(-6px); } }

    .dialog { width: min(36rem, 100%); box-shadow: inset 0 calc(-1 * var(--depth)) 0 var(--edge), 0 1.25rem 2.5rem rgb(0 0 0 / 0.45); }
    h2 { margin: 0; padding: 1rem 1rem calc(1rem + 3 * var(--t)); text-align: center; font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1.1; }
    .body { padding: 1.25rem clamp(1rem, 3vw, 1.75rem) 1.5rem; text-align: center; }
    .body > p:first-child { margin: 0; color: var(--color-ore-white); line-height: 1.8; }
    code { font-size: 0.9rem; color: var(--color-mc-yellow); }
    .buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1.4rem; }
    .fine { margin: 1.1rem 0 0; font-size: 0.875rem; color: var(--color-mc-gray); }
    .fine a { color: #fff; }

    @media (max-width: 560px) {
        .buttons { grid-template-columns: 1fr; }
        /* Phones: Minecraft over Discord. */
        .cta :global(.cta-world) { inset: 0 0 50% 0; mask: none; }
        .dc-bg { inset: 50% 0 0 0; }
    }
</style>
