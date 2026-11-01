<script lang="ts">
    import type { Snippet } from 'svelte';

    /**
     * One setup step as an Ore UI panel: a light title bar with the step's number
     * and its title, over a dark body.
     */
    type Props = {
        step: number;
        title: Snippet;
        children: Snippet;
        id?: string;
        class?: string;
    };
    let { step, title, children, id, class: className = '' }: Props = $props();
</script>

<article {id} class="ore-card raised step {className}" aria-labelledby="step-{step}">
    <header class="ore-header head">
        <span class="num ore-title" aria-hidden="true">{step}</span>
        <h3 id="step-{step}" class="ore-title"><span class="sr-only">Step {step}: </span>{@render title()}</h3>
    </header>
    <div class="body">{@render children()}</div>
</article>

<style>
    .step { scroll-margin-top: 1rem; }
    .head { display: flex; align-items: center; gap: 0.85rem; padding: 0.7rem 1rem calc(0.7rem + 3 * var(--t)); }
    /* The number on a green face, like a chosen toggle button. */
    .num {
        display: grid; place-items: center; flex: none; width: 2.25rem; height: 2.25rem;
        border: var(--t) solid #1e1e1f; background: #3c8527; box-shadow: inset var(--t) var(--t) 0 #639d52, inset calc(-1 * var(--t)) calc(-1 * var(--t)) 0 #4f913c;
        color: #fff; font-size: 1.2rem; line-height: 1; letter-spacing: 0;
    }
    h3 { flex: 1; min-width: 0; margin: 0; font-size: clamp(1.1rem, 1.5vw + 0.6rem, 1.45rem); line-height: 1.25; color: #000; }
    /* Commands in a title keep the title's own font and colour. */
    h3 :global(code) { font: inherit; color: inherit; }
    .body { padding: clamp(1rem, 2.5vw, 1.5rem); }
</style>
