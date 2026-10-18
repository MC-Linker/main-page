<script lang="ts">
    import { faq } from '$lib/data';
    import McButton from '$lib/mc/McButton.svelte';

    // Page 0 is the table of contents, then one page per question.
    let page = $state(0);
    const pages = faq.length + 1;
    const go = (n: number) => (page = Math.max(0, Math.min(pages - 1, n)));
</script>

<section id="faq" class="faq" aria-labelledby="faq-title">
    <h2 id="faq-title" class="mc-text">Questions? Read the book.</h2>

    <div class="book" role="region" aria-label="FAQ book" aria-live="polite">
        <p class="pageno">Page {page + 1} of {pages}</p>
        {#if page === 0}
            <h3>Questions</h3>
            <ol class="toc">
                {#each faq as f, i (f.q)}<li><button type="button" onclick={() => go(i + 1)}>{f.q}</button></li>{/each}
            </ol>
        {:else}
            <h3>{faq[page - 1].q}</h3>
            <p>{@html faq[page - 1].a}</p>
        {/if}
        <div class="turn">
            <button type="button" class="arrow prev" onclick={() => go(page - 1)} disabled={page === 0} aria-label="Previous page"></button>
            <button type="button" class="arrow next" onclick={() => go(page + 1)} disabled={page === pages - 1} aria-label="Next page"></button>
        </div>
    </div>
    {#if page > 0}<div class="done"><McButton onclick={() => go(0)}>Back to contents</McButton></div>{/if}
</section>

<style>
    .faq { padding: clamp(4rem, 9vw, 7rem) 1rem; }
    h2 { margin: 0 0 2rem; text-align: center; font-size: clamp(2rem, 5vw, 3.25rem); color: #fff; }
    .book {
        position: relative; width: min(26rem, 100%); min-height: 24rem; margin: 0 auto; padding: 2.5rem 2rem 4rem;
        background: #f3e7c9;
        border: 4px solid #1a1206;
        box-shadow: inset 0 0 0 4px #c9b48a, inset 6px 0 0 4px #a8905f, 0 20px 40px rgb(0 0 0 / 0.45);
        color: #1f1a10;
        font-family: var(--font-pixel);
    }
    .pageno { position: absolute; top: 0.9rem; right: 1.2rem; margin: 0; font-size: 0.85rem; color: #5a4a2a; }
    h3 { margin: 0.5rem 0 1rem; font-size: 1.3rem; line-height: 1.3; }
    p { margin: 0; font-family: var(--font-sans); font-size: 1rem; line-height: 1.6; }
    p :global(a) { color: #2a4fb8; }
    p :global(code) { font-family: var(--font-pixel); background: rgb(0 0 0 / 0.08); padding: 0 0.2em; }
    p :global(em) { font-style: normal; letter-spacing: 0.0625em; text-shadow: 0.0625em 0 0 currentColor; }
    .toc { margin: 0; padding-left: 1.3rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .toc button { border: 0; padding: 0; background: none; color: #2a4fb8; text-align: left; cursor: pointer; font: inherit; font-size: 0.98rem; text-decoration: underline; text-underline-offset: 3px; }
    .turn { position: absolute; left: 1.5rem; right: 1.5rem; bottom: 1rem; display: flex; justify-content: space-between; }
    .arrow { width: 2.25rem; height: 1.5rem; border: 0; background: #7a5a2a; cursor: pointer; }
    .arrow.next { clip-path: polygon(0 30%, 60% 30%, 60% 0, 100% 50%, 60% 100%, 60% 70%, 0 70%); }
    .arrow.prev { clip-path: polygon(100% 30%, 40% 30%, 40% 0, 0 50%, 40% 100%, 40% 70%, 100% 70%); }
    .arrow:hover:not(:disabled) { background: #c0392b; }
    .arrow:disabled { visibility: hidden; }
    .done { display: flex; justify-content: center; margin-top: 1.25rem; }
</style>
