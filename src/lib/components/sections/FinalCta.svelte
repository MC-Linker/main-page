<script lang="ts">
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { links } from '$lib/data';
    import DcButton from '$lib/discord/DcButton.svelte';
    import McButton from '$lib/mc/McButton.svelte';
    import McWorld from '$lib/mc/McWorld.svelte';
    import GrassBlock from '$lib/pixel/GrassBlock.svelte';
</script>

<section class="cta" aria-labelledby="cta-title">
    <McWorld class="cta-world" tile={30} clouds={false} />
    <div class="dc-bg" aria-hidden="true"></div>
    <h2 id="cta-title">
        <span class="mc-logo left">Link your</span>
        <img src="/logo-horizontal.svg" alt="" width="980" height="472" class="logo" />
        <span class="right">worlds.</span>
    </h2>
    <div class="side mc">
        <GrassBlock size={54} />
        <McButton href="#install" size="lg">Get the plugin</McButton>
        <span class="mc-text small">Paper · Spigot · Fabric · Forge · NeoForge</span>
    </div>
    <div class="side dc">
        <DcButton href={links.invite} external size="lg" class="add"><BrandIcon brand="discord" size="1.3em" /> Add to Discord</DcButton>
        <a class="link" href={links.guide}>Read the guide →</a>
    </div>
</section>

<style>
    .cta { position: relative; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; isolation: isolate; overflow: hidden; }
    .cta :global(.cta-world) {
        grid-column: 1; grid-row: 1 / -1; z-index: -1;
        mask: var(--seam-mask);
    }
    .dc-bg { grid-column: 2; grid-row: 1 / -1; z-index: -2; margin-left: calc(-1 * var(--seam-width)); background: radial-gradient(40rem 20rem at 70% 100%, rgb(88 101 242 / 0.25), transparent 60%), var(--color-dc-3); }
    h2 {
        grid-column: 1 / -1; grid-row: 1; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
        margin: 0; padding: clamp(4rem, 9vw, 7rem) 0 1.5rem; font-weight: 400; font-size: clamp(2.2rem, 5.5vw, 4.5rem); line-height: 1; color: #fff;
    }
    .left { justify-self: end; padding-right: 1rem; --mc-shadow: 0.07em; font-size: 0.85em; }
    .right { justify-self: start; padding-left: 1rem; font-weight: 800; letter-spacing: -0.03em; }
    .logo { width: clamp(4.5rem, 9vw, 7rem); height: auto; filter: drop-shadow(0 5px 0 rgb(0 0 0 / 0.35)); }
    .side { grid-row: 2; display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 1.5rem 1rem clamp(6rem, 12vw, 8rem); }
    .side.mc { grid-column: 1; }
    .side.dc { grid-column: 2; }
    .small { font-size: 0.85rem; color: #fff; }
    /* Lines the button up with the plugin button on the Minecraft side. */
    .side :global(.add) { margin-top: 4.6rem; }
    .link { color: #c9cdfb; text-decoration: none; font-weight: 600; }
    .link:hover { text-decoration: underline; }
    @media (max-width: 640px) {
        .cta { grid-template-columns: 1fr; }
        .cta :global(.cta-world) { grid-row: 1 / 3; mask: none; }
        .dc-bg { grid-column: 1; grid-row: 3; margin-left: 0; }
        h2 { grid-template-columns: 1fr; justify-items: center; gap: 0.5rem; }
        .left, .right { justify-self: center; padding: 0; }
        .side.mc { grid-column: 1; grid-row: 2; }
        .side.dc { grid-column: 1; grid-row: 3; padding-top: 2.5rem; }
        .side :global(.add) { margin-top: 0; }
    }
</style>
