<script lang="ts">
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import { radioOff, radioOn } from './sprites';

    /** Ore UI radio buttons: a diamond and a label per row, with a line of help under each label. */
    type Choice = { name: string; text?: string };
    type Props = { label: string; choices: Choice[]; selected?: number; class?: string };
    let { label, choices, selected = $bindable(0), class: className = '' }: Props = $props();

    let root: HTMLElement;
    function keys(e: KeyboardEvent) {
        const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if(!step) return;
        e.preventDefault();
        selected = (selected + step + choices.length) % choices.length;
        root.querySelectorAll<HTMLElement>('[role="radio"]')[selected]?.focus();
    }
</script>

<div class="group {className}" role="radiogroup" aria-label={label} bind:this={root} onkeydown={keys} tabindex="-1">
    {#each choices as c, i (c.name)}
        <button type="button" class="choice" role="radio" aria-checked={i === selected} tabindex={i === selected ? 0 : -1} onclick={() => (selected = i)}>
            <span class="diamond" aria-hidden="true"><PixelArt sprite={i === selected ? radioOn : radioOff} width="100%" /></span>
            <span class="text">
                <span class="name ore-text">{c.name}</span>
                {#if c.text}<span class="help">{c.text}</span>{/if}
            </span>
        </button>
    {/each}
</div>

<style>
    .group { display: flex; flex-direction: column; gap: 0.15rem; outline: none; }
    .choice {
        display: flex; align-items: flex-start; gap: 0.7rem; width: 100%; padding: 0.4rem 0.4rem;
        border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer;
    }
    .choice:hover { background: rgb(255 255 255 / 0.06); }
    .choice:hover .diamond { filter: brightness(1.12); }
    .diamond { flex: none; width: calc(13 * var(--t)); margin-top: -0.1rem; }
    .text { display: flex; flex-direction: column; gap: 0.15rem; }
    .name { font-size: 1rem; line-height: 1.3; color: #fff; }
    .help { font-size: 0.875rem; line-height: 1.45; color: #b1b2b5; }
</style>
