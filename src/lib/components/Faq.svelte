<script lang="ts">
    import { faq } from '$lib/data';
</script>

<section class="faq" aria-labelledby="faq-title">
    <h2 id="faq-title" class="mc-text">Questions</h2>
    <div class="list">
        {#each faq as item, i (item.q)}
            <details open={i === 0}>
                <summary>{item.q}<span class="sign" aria-hidden="true"></span></summary>
                <p>{@html item.a}</p>
            </details>
        {/each}
    </div>
</section>

<style>
    .faq { padding: clamp(4rem, 9vw, 7rem) 1rem; background: var(--color-ink); }
    h2 { margin: 0 0 2rem; text-align: center; font-size: clamp(2rem, 4.5vw, 3.25rem); font-weight: 700; color: #fff; }
    .list { max-width: 44rem; margin: 0 auto; display: flex; flex-direction: column; gap: 0.6rem; }
    details { border-radius: 12px; background: #161b21; box-shadow: 0 0 0 1px rgb(255 255 255 / 0.06); }
    summary {
        position: relative; display: flex; justify-content: space-between; align-items: center; gap: 1rem;
        padding: 1rem 1.25rem; cursor: pointer; list-style: none; font-weight: 600; font-size: 1.05rem; color: #fff;
    }
    summary::-webkit-details-marker { display: none; }
    .sign { position: relative; width: 0.9rem; height: 0.9rem; flex: none; }
    .sign::before, .sign::after { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 3px; margin-top: -1.5px; background: var(--color-grass-light); transition: transform 0.2s ease; }
    .sign::after { transform: rotate(90deg); }
    details[open] .sign::after { transform: rotate(0deg); }
    p { margin: 0; padding: 0 1.25rem 1.1rem; color: #ced4da; line-height: 1.6; }
    p :global(a) { color: var(--color-grass-light); }
    p :global(code) { padding: 0.05em 0.35em; border-radius: 5px; background: rgb(255 255 255 / 0.1); }
    p :global(em) { font-style: normal; color: #fff; }
</style>
