<script lang="ts">
    import { MediaQuery } from 'svelte/reactivity';
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { faq, guide, links } from '$lib/data';
    import McBook, { type PageSide } from '$lib/mc/McBook.svelte';
    import McWorld from '$lib/mc/McWorld.svelte';
    import OreButton from '$lib/ore/OreButton.svelte';
    import { outArrow } from '$lib/ore/sprites';
    import PixelArt from '$lib/pixel/PixelArt.svelte';

    // The FAQ as a written book: contents, one page per question, and a last page.
    type Page = { kind: 'contents' } | { kind: 'answer'; index: number } | { kind: 'end' };
    const pages: Page[] = [{ kind: 'contents' }, ...faq.map((_, index) => ({ kind: 'answer' as const, index })), { kind: 'end' }];

    // Wide screens open the book flat: two pages at a time.
    const wide = new MediaQuery('(min-width: 900px)', true);
</script>

{#snippet bookPage(n: number, { go, side }: { go: (n: number) => void; side: PageSide })}
    {@const p = pages[n]}
    {#if p.kind === 'contents'}
        <h3 class="bold">Questions</h3>
        <ol class="toc">
            {#each faq as f, i (f.q)}
                <li><button type="button" class="link" onclick={() => go(i + 1)}>{f.q}</button></li>
            {/each}
        </ol>
    {:else if p.kind === 'answer'}
        <h3 class="bold">{faq[p.index].q}</h3>
        <p class="answer">{@html faq[p.index].a}</p>
    {:else}
        <h3 class="bold">More answers</h3>
        <p class="answer">The guide has a longer <a href={guide('help/faq')}>FAQ</a> and a <a href={guide('help/troubleshooting')}>troubleshooting</a> page for when something doesn't work.</p>
        <p class="answer">Thanks for reading!</p>
        <p class="sign">- <a class="team" href="/team" target="_blank">The MC Linker team<span class="out" aria-hidden="true"><PixelArt sprite={outArrow('#0000aa')} width="100%" /></span><span class="sr-only">(opens in a new tab)</span></a></p>
    {/if}
    <!-- Back to the contents. On an open spread, the left page has the link. -->
    {#if p.kind !== 'contents' && side !== 'right'}
        <button type="button" class="link to-contents" onclick={() => go(0)}>Contents</button>
    {/if}
{/snippet}

<section id="faq" class="faq" aria-labelledby="faq-title">
    <!-- Like opening a book in game: the world stays, out of focus and dimmed, behind it. -->
    <McWorld class="world" tile={36} hills blur={3} clouds={false} />
    <div class="shade" aria-hidden="true"></div>

    <header class="section-head">
        <p class="kicker ore-text">Help</p>
        <h2 id="faq-title" class="ore-title">Questions? Read the book.</h2>
        <p>Turn the pages with the buttons{wide.current ? ' or your arrow keys' : ', or swipe'}.</p>
    </header>

    <McBook count={pages.length} label="Questions and answers" spread={wide.current} page={bookPage} />

    <div class="done">
        <OreButton href={links.guide} variant="secondary" size="lg">Read the guide</OreButton>
        <OreButton href={links.support} external variant="discord" size="lg"><BrandIcon brand="discord" size="1.1em" /> Ask on Discord</OreButton>
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
    .shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(rgb(30 30 31 / 0.6), rgb(30 30 31 / 0.8)); }
    .section-head { margin-bottom: clamp(2rem, 5vw, 3rem); }
    .section-head :global(p:not(.kicker)) { color: #e6e8eb; }

    /* ── What's written on the pages ───────────────────────────────────── */
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
    .team { color: #0000aa; text-decoration: underline; text-underline-offset: 0.18em; text-decoration-thickness: 0.0625em; }
    .team:hover { color: #5555ff; }
    .out { display: inline-block; width: 0.55em; margin-left: 0.3em; vertical-align: 0.15em; }
    .to-contents { position: absolute; left: 50%; bottom: calc(var(--u) * 10 - var(--pad-bottom)); transform: translateX(-50%); font-size: 0.85em; }

    .done { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 17rem)); justify-content: center; gap: 0.75rem; margin-top: 2rem; }
</style>
