<script lang="ts">
    import { links } from '$lib/data';
    import BrandIcon from '../BrandIcon.svelte';
</script>

<section class="cta" aria-labelledby="cta-title">
    <h2 id="cta-title"><span>Ready.</span> <span>Set.</span> <span class="go">Link.</span></h2>
    <div class="btns">
        <a class="btn blurple" href={links.invite} target="_blank" rel="noopener"><BrandIcon brand="discord" size="1.2em" /> Add to Discord</a>
        <a class="btn green" href="#run">▶ Time your setup</a>
        <a class="btn" href={links.guide}>Read the guide</a>
    </div>
</section>

<style>
    .cta { padding: clamp(4rem, 9vw, 7rem) 1rem; text-align: center; background: var(--color-grass-bright); border-top: var(--sticker); }
    h2 { margin: 0; font-size: clamp(3rem, 10vw, 7rem); font-weight: 900; letter-spacing: -0.04em; line-height: 1; }
    h2 span { display: inline-block; }
    .go { color: #fff; -webkit-text-stroke: 3px var(--color-ink); paint-order: stroke fill; }
    .btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.9rem; margin-top: 2.25rem; }
</style>
