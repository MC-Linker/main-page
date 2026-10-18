<script lang="ts">
    import { faq } from '$lib/data';
</script>

<section class="faq" aria-labelledby="faq-title">
    <h2 id="faq-title">Questions.</h2>
    <div class="list">
        {#each faq as item, i (item.q)}
            <details class="sticker" open={i === 0}>
                <summary>{item.q}</summary>
                <p>{@html item.a}</p>
            </details>
        {/each}
    </div>
</section>

<style>
    .faq { max-width: 46rem; margin: 0 auto; padding: 0 clamp(1rem, 4vw, 2rem) clamp(4rem, 9vw, 7rem); }
    h2 { margin: 0 0 2rem; text-align: center; font-size: clamp(2.2rem, 5vw, 3.6rem); font-weight: 900; letter-spacing: -0.03em; }
    .list { display: flex; flex-direction: column; gap: 1rem; }
    details { box-shadow: 4px 4px 0 var(--color-ink); }
    summary { padding: 1rem 1.2rem; cursor: pointer; font-weight: 800; font-size: 1.1rem; list-style: none; display: flex; justify-content: space-between; gap: 1rem; }
    summary::-webkit-details-marker { display: none; }
    summary::after { content: '+'; font-family: var(--font-pixel); font-size: 1.4rem; line-height: 1; }
    details[open] summary::after { content: '−'; }
    p { margin: 0; padding: 0 1.2rem 1.1rem; line-height: 1.6; color: var(--color-ink-soft); }
    p :global(a) { color: var(--color-grass); font-weight: 600; }
    p :global(code) { padding: 0.05em 0.35em; border-radius: 5px; background: var(--color-paper-2); }
    p :global(em) { font-style: normal; font-weight: 700; color: var(--color-ink); }
</style>
