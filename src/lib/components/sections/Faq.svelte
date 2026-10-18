<script lang="ts">
    import { fly } from 'svelte/transition';
    import { MediaQuery } from 'svelte/reactivity';
    import { faq, guide, links } from '$lib/data';
    import { reducedMotion } from '$lib/motion';
    import type { Sprite } from '$lib/pixel/sprites';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import McButton from '$lib/mc/McButton.svelte';
    import Panorama from '../Panorama.svelte';
    import BrandIcon from '../BrandIcon.svelte';

    /** The FAQ as a written book: contents, one page per question, and a last page. */
    type Page = { kind: 'contents' } | { kind: 'answer'; index: number } | { kind: 'end' };
    const pages: Page[] = [{ kind: 'contents' }, ...faq.map((_, index) => ({ kind: 'answer' as const, index })), { kind: 'end' }];

    // Wide screens open the book flat: two pages at a time.
    const wide = new MediaQuery('(min-width: 900px)', true);
    const perView = $derived(wide.current ? 2 : 1);

    let page = $state(0);
    let dir = $state(1);
    const first = $derived(page - (page % perView));
    const shown = $derived(pages.slice(first, first + perView).map((p, i) => ({ p, n: first + i })));
    const canBack = $derived(first > 0);
    const canNext = $derived(first + perView < pages.length);

    function go(n: number) {
        const target = Math.max(0, Math.min(pages.length - 1, n));
        dir = target >= page ? 1 : -1;
        page = target;
    }
    const turn = (step: number) => go(first + step * perView);

    function keys(e: KeyboardEvent) {
        if(e.key === 'ArrowRight') { e.preventDefault(); if(canNext) turn(1); }
        if(e.key === 'ArrowLeft') { e.preventDefault(); if(canBack) turn(-1); }
    }

    // Swipe to turn pages on touch screens.
    let startX = 0;
    const down = (e: PointerEvent) => { startX = e.pointerType === 'mouse' ? NaN : e.clientX; };
    function up(e: PointerEvent) {
        const dx = e.clientX - startX;
        if(Number.isNaN(dx) || Math.abs(dx) < 50) return;
        if(dx < 0 && canNext) turn(1);
        if(dx > 0 && canBack) turn(-1);
    }

    // The page-turn arrows, drawn like the book's own buttons.
    const arrowRows = ['........o....', '........oo...', 'oooooooooBo..', 'oBBBBBBBBBBo.', 'oBBBBBBBBBBBo', 'oBBBBBBBBBBo.', 'oooooooooBo..', '........oo...', '........o....'];
    const arrow: Sprite = { rows: arrowRows, palette: { o: '#4a3418', B: '#d9c49a' } };
    const arrowHot: Sprite = { rows: arrowRows, palette: { o: '#4a3418', B: '#ffd25a' } };
</script>

{#snippet text(html: string)}<p class="answer">{@html html}</p>{/snippet}

{#snippet view(p: Page, n: number)}
    <p class="pageno">Page {n + 1} of {pages.length}</p>
    {#if p.kind === 'contents'}
        <h3 class="bold">Questions</h3>
        <ol class="toc">
            {#each faq as f, i (f.q)}
                <li><button type="button" class="link" onclick={() => go(i + 1)}>{f.q}</button></li>
            {/each}
        </ol>
    {:else if p.kind === 'answer'}
        <h3 class="bold">{faq[p.index].q}</h3>
        {@render text(faq[p.index].a)}
    {:else}
        <h3 class="bold">More answers</h3>
        <p class="answer">The guide has a longer <a href={guide('help/faq')}>FAQ</a> and a <a href={guide('help/troubleshooting')}>troubleshooting</a> page for when something doesn't work.</p>
        <p class="answer">Thanks for reading!</p>
        <p class="sign">- The MC Linker team</p>
    {/if}
    {#if p.kind !== 'contents'}
        <button type="button" class="link to-contents" onclick={() => go(0)}>Contents</button>
    {/if}
{/snippet}

<section id="faq" class="faq" aria-labelledby="faq-title">
    <Panorama />
    <div class="shade" aria-hidden="true"></div>

    <header class="section-head">
        <p class="kicker mojang">Help</p>
        <h2 id="faq-title" class="mc-text">Questions? Read the book.</h2>
        <p>Turn the pages with the arrows{wide.current ? ' or your arrow keys' : ', or swipe'}.</p>
    </header>

    <div class="book-wrap" class:spread={perView === 2}>
    <!-- The book can be focused to turn pages with the arrow keys. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
    <div
        class="book"
        class:spread={perView === 2}
        role="region"
        aria-roledescription="book"
        aria-label="Questions and answers"
        tabindex="0"
        onkeydown={keys}
        onpointerdown={down}
        onpointerup={up}
    >
        <div class="pages">
            {#each shown as { p, n }, i (n)}
                <div class="page" class:left={perView === 2 && i === 0} class:right={perView === 2 && i === 1} aria-live="polite">
                    <div class="content" in:fly={{ x: reducedMotion.current ? 0 : 14 * dir, duration: 220 }}>
                        {@render view(p, n)}
                    </div>
                </div>
            {/each}
            {#if shown.length < perView}<div class="page right blank" aria-hidden="true"></div>{/if}
        </div>
        <button type="button" class="turn back" onclick={() => turn(-1)} disabled={!canBack} aria-label="Previous page">
            <PixelArt sprite={arrow} width="100%" class="cold" /><PixelArt sprite={arrowHot} width="100%" class="hot" />
        </button>
        <button type="button" class="turn next" onclick={() => turn(1)} disabled={!canNext} aria-label="Next page">
            <PixelArt sprite={arrow} width="100%" class="cold" /><PixelArt sprite={arrowHot} width="100%" class="hot" />
        </button>
    </div>
    </div>

    <div class="done">
        <McButton href={links.guide} size="lg">Read the guide</McButton>
        <McButton href={links.support} external size="lg" variant="discord"><BrandIcon brand="discord" size="1em" /> Ask on Discord</McButton>
    </div>
</section>

<style>
    .faq {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        padding: clamp(3rem, 6vw, 4rem) 1rem clamp(4rem, 8vw, 6rem);
    }
    .faq :global(.panorama) { z-index: -2; }
    /* Like opening a book in game: the world stays, dimmed, behind it. */
    .shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.7)); }
    .section-head { margin-bottom: 1.75rem; }

    /* ── The book ──────────────────────────────────────────────────────── */
    .book-wrap {
        /* One pixel of the book texture. */
        --u: 3px;
        width: min(27rem, 100%);
        margin: 0 auto;
        /* A one-pixel outline that follows the stepped corners, then a soft shadow. */
        filter:
            drop-shadow(var(--u) 0 0 #24140a) drop-shadow(calc(var(--u) * -1) 0 0 #24140a)
            drop-shadow(0 var(--u) 0 #24140a) drop-shadow(0 calc(var(--u) * -1) 0 #24140a)
            drop-shadow(0 1.25rem 1.5rem rgb(0 0 0 / 0.5));
    }
    .book-wrap.spread { --u: 4px; width: min(54rem, 100%); }
    .book {
        --page: #f4ebd3;
        --page-shade-1: #e9dcbc;
        --page-shade-2: #dccba3;
        --page-edge: #c2ab7e;
        --cover: #7b4c26;
        --cover-light: #95602f;
        --cover-dark: #4f2e13;
        --ink: #1e1b16;
        position: relative;
        padding: calc(var(--u) * 3) calc(var(--u) * 3) calc(var(--u) * 5) calc(var(--u) * 5);
        background:
            linear-gradient(var(--cover-light) 0 0) top / 100% var(--u) no-repeat,
            linear-gradient(var(--cover-dark) 0 0) bottom / 100% calc(var(--u) * 2) no-repeat,
            var(--cover);
        /* Pixel-stepped corners. */
        clip-path: polygon(
            calc(var(--u) * 2) 0, calc(100% - var(--u) * 2) 0, calc(100% - var(--u) * 2) var(--u), calc(100% - var(--u)) var(--u),
            calc(100% - var(--u)) calc(var(--u) * 2), 100% calc(var(--u) * 2), 100% calc(100% - var(--u) * 2), calc(100% - var(--u)) calc(100% - var(--u) * 2),
            calc(100% - var(--u)) calc(100% - var(--u)), calc(100% - var(--u) * 2) calc(100% - var(--u)), calc(100% - var(--u) * 2) 100%, calc(var(--u) * 2) 100%,
            calc(var(--u) * 2) calc(100% - var(--u)), var(--u) calc(100% - var(--u)), var(--u) calc(100% - var(--u) * 2), 0 calc(100% - var(--u) * 2),
            0 calc(var(--u) * 2), var(--u) calc(var(--u) * 2), var(--u) var(--u), calc(var(--u) * 2) var(--u)
        );
        color: var(--ink);
        font-family: var(--font-pixel);
        font-size: 1rem;
        line-height: 1.5;
        touch-action: pan-y;
        outline: none;
    }
    .book::before {
        /* The spine on the left of a single page. */
        content: ''; position: absolute; top: calc(var(--u) * 3); bottom: calc(var(--u) * 5); left: calc(var(--u) * 2); width: var(--u);
        background: var(--cover-dark);
    }
    .book:focus-visible { box-shadow: inset 0 0 0 3px var(--color-mc-yellow); }
    .book.spread { padding-left: calc(var(--u) * 3); font-size: 1.15rem; }
    .book.spread::before { display: none; }

    .pages { display: grid; grid-template-columns: 1fr; }
    .spread .pages { grid-template-columns: 1fr 1fr; }
    .page {
        position: relative;
        min-height: 28rem;
        padding: calc(var(--u) * 6) calc(var(--u) * 7) calc(var(--u) * 19) calc(var(--u) * 8);
        background:
            /* Shading towards the spine, in hard pixel steps. */
            linear-gradient(90deg, var(--page-shade-2) 0 var(--u), var(--page-shade-1) var(--u) calc(var(--u) * 3), transparent calc(var(--u) * 3)),
            var(--page);
        /* Page edges peeking out below: the rest of the book. */
        box-shadow: 0 var(--u) 0 var(--page-shade-2), 0 calc(var(--u) * 2) 0 var(--page-edge);
    }
    .spread .page { min-height: 30rem; }
    .page.left {
        padding: calc(var(--u) * 6) calc(var(--u) * 9) calc(var(--u) * 17) calc(var(--u) * 7);
        background:
            linear-gradient(270deg, var(--page-shade-2) 0 var(--u), var(--page-shade-1) var(--u) calc(var(--u) * 4), transparent calc(var(--u) * 4)),
            var(--page);
    }
    .page.right {
        padding: calc(var(--u) * 6) calc(var(--u) * 7) calc(var(--u) * 17) calc(var(--u) * 9);
        background:
            linear-gradient(90deg, var(--page-shade-2) 0 var(--u), var(--page-shade-1) var(--u) calc(var(--u) * 4), transparent calc(var(--u) * 4)),
            var(--page);
    }

    .pageno { margin: 0 0 calc(var(--u) * 4); text-align: right; font-size: 0.9em; color: #4d4535; }
    h3 { margin: 0 0 0.75em; font-size: 1em; font-weight: 400; line-height: 1.4; }
    /* Minecraft's bold: the glyph again, one pixel to the right. */
    .bold { letter-spacing: 0.0625em; text-shadow: 0.0625em 0 0 currentColor; }
    .answer { margin: 0 0 0.75em; }
    .answer :global(a), .link { color: #0000aa; text-decoration: underline; text-underline-offset: 0.18em; text-decoration-thickness: 0.0625em; }
    .answer :global(a:hover), .link:hover { color: #5555ff; }
    .answer :global(code) { font-family: inherit; color: #5a4a2a; }
    .answer :global(em) { font-style: normal; letter-spacing: 0.0625em; text-shadow: 0.0625em 0 0 currentColor; }
    .link { padding: 0; border: 0; background: none; font: inherit; text-align: left; cursor: pointer; }
    .toc { margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.35em; line-height: 1.4; list-style: none; counter-reset: q; }
    .toc li { display: grid; grid-template-columns: 1.6em 1fr; }
    .toc li::before { counter-increment: q; content: counter(q) '.'; color: #4d4535; }
    .sign { margin: 1.5em 0 0; text-align: right; color: #4d4535; }
    .to-contents { position: absolute; left: 50%; bottom: calc(var(--u) * 7); transform: translateX(-50%); font-size: 0.85em; }
    .spread .page.right .to-contents { display: none; }

    .turn {
        position: absolute;
        bottom: calc(var(--u) * 9);
        width: calc(var(--u) * 13 + 1rem);
        padding: 0.5rem;
        border: 0;
        background: none;
        cursor: pointer;
    }
    .turn.back { left: calc(var(--u) * 7); transform: scaleX(-1); }
    .turn.next { right: calc(var(--u) * 6); }
    .turn:disabled { visibility: hidden; }
    .turn :global(.hot) { display: none; }
    .turn:hover :global(.hot), .turn:focus-visible :global(.hot) { display: block; }
    .turn:hover :global(.cold), .turn:focus-visible :global(.cold) { display: none; }
    .turn:focus-visible { outline: 2px solid var(--color-mc-yellow); }

    .done { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 17rem)); justify-content: center; gap: 0.6rem; margin-top: 2rem; }
</style>
