<script lang="ts">
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { faq, guide, links } from '$lib/data';
    import McWorld from '$lib/mc/McWorld.svelte';
    import OreButton from '$lib/ore/OreButton.svelte';
    import { chevron } from '$lib/ore/sprites';
    import PixelArt from '$lib/pixel/PixelArt.svelte';

    // Ore UI's collapsible rows, one open at a time. The first starts open.
    let open = $state(faq.map((_, i) => i === 0));
</script>

<section id="faq" class="faq" aria-labelledby="faq-title">
    <!-- Like the game's menus: the world stays, out of focus and dimmed, behind the panels. -->
    <McWorld class="world" tile={36} hills blur={3} clouds={false} />
    <div class="shade" aria-hidden="true"></div>

    <header class="section-head">
        <p class="kicker ore-text">Help</p>
        <h2 id="faq-title" class="ore-title">Questions and answers</h2>
        <p>The short version. The guide has the long one.</p>
    </header>

    <div class="layout">
        <div class="list">
            {#each faq as f, i (f.q)}
                <details name="faq" bind:open={open[i]}>
                    <summary class="q ore-face ore-dark" class:sunk={open[i]}>
                        <span class="q-in">
                            <span class="q-text ore-text">{f.q}</span>
                            <span class="arrow" aria-hidden="true"><PixelArt sprite={chevron('#ffffff')} width="100%" /></span>
                        </span>
                    </summary>
                    <div class="a">{@html f.a}</div>
                </details>
            {/each}
        </div>

        <aside class="ore-card raised more" aria-labelledby="more-title">
            <h3 id="more-title" class="ore-header ore-title">More answers</h3>
            <div class="more-body">
                <p>The guide has a longer <a href={guide('help/faq')}>FAQ</a> and a <a href={guide('help/troubleshooting')}>troubleshooting</a> page for when something doesn't work.</p>
                <p>Or ask the team on the support server. They're quick.</p>
                <div class="buttons">
                    <OreButton href={links.guide} variant="secondary">Read the guide</OreButton>
                    <OreButton href={links.support} external variant="discord"><BrandIcon brand="discord" size="1.1em" /> Ask on Discord</OreButton>
                </div>
            </div>
        </aside>
    </div>
</section>

<style>
    .faq {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        padding: clamp(4rem, 9vw, 6.5rem) 1rem clamp(4rem, 8vw, 6rem);
    }
    .faq :global(.world) { position: absolute; inset: 0; z-index: -2; }
    .shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(rgb(30 30 31 / 0.72), rgb(30 30 31 / 0.85)); }
    .section-head { margin-bottom: clamp(2rem, 5vw, 3rem); }
    .section-head :global(p:not(.kicker)) { color: #e6e8eb; }

    .layout { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 1.5rem; align-items: start; max-width: 64rem; margin: 0 auto; }

    /* ── Questions ─────────────────────────────────────────────────────── */
    .list { display: flex; flex-direction: column; gap: 0.6rem; }
    .q { display: block; list-style: none; cursor: pointer; }
    .q::-webkit-details-marker { display: none; }
    .q-in { display: flex; align-items: center; gap: 1rem; min-height: 3.25rem; padding: 0.6rem 1rem; }
    .q-text { flex: 1; font-size: 1rem; line-height: 1.35; }
    .arrow { flex: none; width: calc(7 * var(--t)); transition: transform 0.15s ease; }
    details[open] .arrow { transform: rotate(180deg); }
    /* The answer hangs under its question, in the same frame. */
    .a {
        margin-top: calc(-1 * var(--t));
        padding: 1rem 1.1rem 1.1rem;
        border: var(--t) solid #1e1e1f;
        background: var(--color-ore-dark);
        color: var(--color-ore-white);
        line-height: 1.65;
    }
    .a :global(a), .more a { color: #a6dd94; }
    .a :global(code) { font-family: var(--font-pixel); color: var(--color-mc-yellow); }
    .a :global(em) { font-style: normal; font-weight: 600; color: #fff; }

    /* ── More answers ──────────────────────────────────────────────────── */
    .more { overflow: hidden; }
    .more h3 { margin: 0; padding: 0.8rem 1rem calc(0.8rem + 3 * var(--t)); font-size: 1.2rem; }
    .more-body { padding: 1rem 1.1rem 1.25rem; }
    .more p { margin: 0 0 0.75rem; color: var(--color-ore-white); line-height: 1.6; }
    .buttons { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1.1rem; }

    @media (max-width: 860px) {
        .layout { grid-template-columns: 1fr; }
    }
</style>
