<script lang="ts">
    import type { Snippet } from 'svelte';
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import GrassBlock from '$lib/pixel/GrassBlock.svelte';

    /**
     * One setup step as an Ore UI panel: a light title bar with the step's number,
     * its title and where it happens, over a dark body.
     */
    type Props = {
        step: number;
        world: 'discord' | 'minecraft' | 'both';
        title: Snippet;
        children: Snippet;
        id?: string;
        class?: string;
    };
    let { step, world, title, children, id, class: className = '' }: Props = $props();
</script>

<article {id} class="ore-card raised step {className}" aria-labelledby="step-{step}">
    <header class="ore-header head">
        <span class="num ore-title" aria-hidden="true">{step}</span>
        <h3 id="step-{step}" class="ore-title"><span class="sr-only">Step {step}: </span>{@render title()}</h3>
        <span class="where ore-text {world}">
            {#if world !== 'minecraft'}<BrandIcon brand="discord" size="1em" />{/if}
            {#if world !== 'discord'}<GrassBlock size={14} />{/if}
            {world === 'discord' ? 'In Discord' : world === 'minecraft' ? 'In Minecraft' : 'In both'}
        </span>
    </header>
    <div class="body">{@render children()}</div>
</article>

<style>
    .step { scroll-margin-top: calc(var(--nav-h) + 1rem); }
    .head { display: flex; align-items: center; gap: 0.85rem; padding: 0.7rem 1rem calc(0.7rem + 3 * var(--t)); }
    /* The number on a green face, like a chosen toggle button. */
    .num {
        display: grid; place-items: center; flex: none; width: 2.25rem; height: 2.25rem;
        border: var(--t) solid #1e1e1f; background: #3c8527; box-shadow: inset var(--t) var(--t) 0 #639d52, inset calc(-1 * var(--t)) calc(-1 * var(--t)) 0 #4f913c;
        color: #fff; font-size: 1.2rem; line-height: 1;
    }
    h3 { flex: 1; min-width: 0; margin: 0; font-size: clamp(1.1rem, 1.5vw + 0.6rem, 1.45rem); line-height: 1.25; color: #000; }
    h3 :global(code) { font-family: inherit; color: #1d4d13; }
    .where {
        display: inline-flex; align-items: center; gap: 0.4rem; flex: none; padding: 0.3rem 0.5rem 0.35rem;
        border: var(--t) solid #1e1e1f; color: #fff; font-size: 0.8rem; line-height: 1; white-space: nowrap;
    }
    .where.discord { background: #5865f2; }
    .where.minecraft { background: #3c8527; }
    .where.both { background: linear-gradient(90deg, #3c8527 50%, #5865f2 50%); }
    .body { padding: clamp(1rem, 2.5vw, 1.5rem); }

    @media (max-width: 560px) {
        .head { flex-wrap: wrap; gap: 0.6rem 0.75rem; }
        h3 { flex-basis: calc(100% - 3rem); }
        .where { margin-left: calc(2.25rem + 0.75rem); }
    }
</style>
