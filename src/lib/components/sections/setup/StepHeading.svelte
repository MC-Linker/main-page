<script lang="ts">
    import type { Snippet } from 'svelte';

    /** A setup step's number badge and title, styled for the world the step happens in. */
    type Props = { step: number; world: 'discord' | 'minecraft' | 'both'; children: Snippet };
    let { step, world, children }: Props = $props();
</script>

<span class="badge {world}" class:mc-text={world === 'minecraft'} aria-hidden="true">{step}</span>
<h3 class:mc-text={world === 'minecraft'}><span class="sr-only">Step {step}: </span>{@render children()}</h3>

<style>
    .badge {
        display: inline-grid; place-items: center; width: 2.5rem; height: 2.5rem; margin-bottom: 0.9rem;
        font-size: 1.4rem; font-weight: 400; color: #fff;
    }
    .minecraft { background: var(--color-grass); border: 3px solid #000; box-shadow: inset -3px -3px 0 rgb(0 0 0 / 0.25), inset 3px 3px 0 rgb(255 255 255 / 0.25); }
    .discord { border-radius: 50%; background: var(--color-dc-blurple); font-family: var(--font-sans); font-weight: 800; }
    .both { border-radius: 12px; background: linear-gradient(90deg, var(--color-grass) 50%, var(--color-dc-blurple) 50%); font-family: var(--font-sans); font-weight: 800; }
    h3 { margin: 0 0 0.5rem; font-size: clamp(1.4rem, 2.6vw, 1.85rem); line-height: 1.2; color: #fff; }
    h3.mc-text { font-weight: 400; }
</style>
