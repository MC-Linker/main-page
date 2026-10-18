<script lang="ts">
    import { links } from '$lib/data';
    import McButton from '$lib/mc/McButton.svelte';
    import McWorld from '$lib/mc/McWorld.svelte';
    import GrassBlock from '$lib/pixel/GrassBlock.svelte';
    import BrandIcon from './BrandIcon.svelte';
</script>

<section class="cta" aria-labelledby="cta-title">
    <McWorld class="cta-world" tile={30} clouds={false} />
    <div class="dc-bg" aria-hidden="true"></div>
    <h2 id="cta-title">
        <span class="mc-logo left">Link your</span>
        <img src="/logo.svg" alt="" width="96" height="96" class="logo" />
        <span class="right">worlds.</span>
    </h2>
    <div class="side mc">
        <GrassBlock size={54} />
        <McButton href="#setup" size="lg">Get the plugin</McButton>
        <span class="mc-text small">Paper · Spigot · Fabric · Forge · NeoForge</span>
    </div>
    <div class="side dc">
        <a class="dc-btn" href={links.invite} target="_blank" rel="noopener"><BrandIcon brand="discord" size="1.3em" /> Add to Discord</a>
        <a class="link" href={links.guide}>Read the guide →</a>
    </div>
</section>

<style>
    .cta { position: relative; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; isolation: isolate; overflow: hidden; }
    .cta :global(.cta-world) {
        grid-column: 1; grid-row: 1 / -1; z-index: -1;
        mask:
            linear-gradient(#000 0 0) left / calc(100% - 12px) 100% no-repeat,
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 8' width='12' height='32'%3E%3Cpath d='M0 0h3v2H2v2h1v1H1v3H0z'/%3E%3C/svg%3E") right top / 12px 32px repeat-y;
    }
    .dc-bg { grid-column: 2; grid-row: 1 / -1; z-index: -2; margin-left: -12px; background: radial-gradient(40rem 20rem at 70% 100%, rgb(88 101 242 / 0.25), transparent 60%), var(--color-dc-3); }
    h2 {
        grid-column: 1 / -1; grid-row: 1; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
        margin: 0; padding: clamp(4rem, 9vw, 7rem) 0 1.5rem; font-weight: 400; font-size: clamp(2.2rem, 5.5vw, 4.5rem); line-height: 1; color: #fff;
    }
    .left { justify-self: end; padding-right: 1rem; --mc-shadow: 0.07em; font-size: 0.85em; }
    .right { justify-self: start; padding-left: 1rem; font-weight: 800; letter-spacing: -0.03em; }
    .logo { width: clamp(4rem, 8vw, 6rem); height: auto; filter: drop-shadow(0 5px 0 rgb(0 0 0 / 0.35)); }
    .side { grid-row: 2; display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 1.5rem 1rem clamp(6rem, 12vw, 8rem); }
    .side.mc { grid-column: 1; }
    .side.dc { grid-column: 2; }
    .small { font-size: 0.85rem; color: #fff; }
    .dc-btn {
        display: inline-flex; align-items: center; gap: 0.6rem; min-height: 3rem; padding: 0 1.6rem; border-radius: 8px;
        background: var(--color-dc-blurple); color: #fff; font-weight: 700; font-size: 1.05rem; text-decoration: none; margin-top: 4.6rem;
    }
    .dc-btn:hover { background: var(--color-dc-blurple-dark); }
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
        .dc-btn { margin-top: 0; }
    }
</style>
