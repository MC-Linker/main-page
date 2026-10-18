<script lang="ts">
    import type { Snippet } from 'svelte';
    import { inview } from '$lib/actions/inview';
    import { spriteUri } from '$lib/pixel/uri';
    import { deepslate, dirt, stone, diamondOre } from '$lib/pixel/sprites';

    type Props = {
        id: string;
        index: number;
        title: string;
        description: string;
        commands?: string[];
        guide?: string;
        material?: 'dirt' | 'stone' | 'deepslate' | 'ore';
        controls?: Snippet;
        mc: Snippet;
        dc: Snippet;
        /** Called once when the scene scrolls into view. */
        onenter?: () => void;
    };
    let { id, index, title, description, commands = [], guide, material = 'stone', controls, mc, dc, onenter }: Props = $props();

    const tiles = { dirt: spriteUri(dirt), stone: spriteUri(stone), deepslate: spriteUri(deepslate), ore: spriteUri(diamondOre) };
    let seen = $state(false);
</script>

<section
    {id}
    class="scene"
    class:seen
    style:--ground={tiles[material]}
    aria-labelledby="{id}-title"
    use:inview={{ once: true, threshold: 0.2, onchange: v => { if(v && !seen) { seen = true; onenter?.(); } } }}
>
    <div class="label">
        <span class="num mc-text">{String(index).padStart(2, '0')}</span>
        <h3 id="{id}-title">{title}</h3>
        <p>{description}</p>
        {#if commands.length}
            <ul class="chips" aria-label="Commands">
                {#each commands as c (c)}<li><code>{c}</code></li>{/each}
            </ul>
        {/if}
        {#if controls}<div class="controls">{@render controls()}</div>{/if}
        {#if guide}<a class="guide" href={guide}>How to set it up <span aria-hidden="true">→</span></a>{/if}
    </div>
    <div class="side mc">
        <span class="tag mojang">In Minecraft</span>
        {@render mc()}
    </div>
    <div class="side dc">
        <span class="tag dc-tag">In Discord</span>
        {@render dc()}
    </div>
</section>

<style>
    .scene {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto 1fr;
        isolation: isolate;
    }
    .scene::before,
    .scene::after {
        content: '';
        grid-row: 1 / -1;
        z-index: -1;
    }
    .scene::before {
        grid-column: 1;
        background: linear-gradient(rgb(8 6 4 / 0.62), rgb(8 6 4 / 0.62)), var(--ground) 0 0 / 64px 64px;
        image-rendering: pixelated;
        mask:
            linear-gradient(#000 0 0) left / calc(100% - 12px) 100% no-repeat,
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 8' width='12' height='32'%3E%3Cpath d='M0 0h3v2H2v2h1v1H1v3H0z'/%3E%3C/svg%3E") right top / 12px 32px repeat-y;
    }
    .scene::after {
        grid-column: 2;
        margin-left: -12px;
        background: var(--color-dc-3);
    }

    .label {
        grid-column: 1 / -1;
        grid-row: 1;
        justify-self: center;
        width: min(36rem, calc(100% - 2rem));
        margin: clamp(3rem, 7vw, 5.5rem) 0 2rem;
        padding: 1.5rem 1.75rem;
        border-radius: 16px;
        background: rgb(13 16 20 / 0.92);
        box-shadow: 0 0 0 2px rgb(255 255 255 / 0.07), 0 20px 50px rgb(0 0 0 / 0.4);
        text-align: center;
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    /* Only hide before the reveal when JavaScript is there to reveal it. */
    :global(html.js) .scene:not(.seen) .label { opacity: 0; transform: translateY(16px); }
    .num { display: block; font-size: 1rem; color: var(--color-grass-light); }
    h3 { margin: 0.25rem 0 0.5rem; font-family: var(--font-pixel); font-weight: 400; font-size: clamp(1.75rem, 3.2vw, 2.4rem); line-height: 1.1; color: #fff; }
    p { margin: 0 auto; max-width: 30rem; color: #ced4da; line-height: 1.55; text-wrap: pretty; }
    .chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.375rem; margin: 0.875rem 0 0; padding: 0; list-style: none; }
    .chips code {
        display: inline-block; padding: 0.15rem 0.5rem; border-radius: 6px;
        background: rgb(88 101 242 / 0.18); color: #c9cdfb; font-size: 0.85rem;
    }
    .controls { margin-top: 1rem; }
    .guide { display: inline-block; margin-top: 1rem; color: var(--color-grass-light); font-weight: 600; text-decoration: none; }
    .guide:hover { text-decoration: underline; }

    .side {
        position: relative;
        grid-row: 2;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
        min-width: 0;
        padding: 0 clamp(1rem, 3.5vw, 3rem) clamp(3rem, 7vw, 5.5rem);
        transition: opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s;
    }
    .side.mc { grid-column: 1; align-items: flex-end; }
    .side.dc { grid-column: 2; align-items: flex-start; }
    :global(html.js) .scene:not(.seen) .side { opacity: 0; }
    :global(html.js) .scene:not(.seen) .side.mc { transform: translateX(-20px); }
    :global(html.js) .scene:not(.seen) .side.dc { transform: translateX(20px); }
    .side > :global(:not(.tag)) { width: 100%; max-width: 32rem; }
    .tag { font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; color: #adb5bd; }
    .mc .tag { color: #e9ecef; font-size: 0.85rem; }
    .dc-tag { font-weight: 600; }

    @media (max-width: 860px) {
        .scene { grid-template-columns: 1fr; grid-template-rows: auto auto auto; padding-bottom: 0; }
        .scene::before { grid-column: 1; grid-row: 2; mask: none; }
        .scene::after { grid-column: 1; grid-row: 3; margin-left: 0; }
        .label { margin: 3rem 0 1.5rem; }
        .side { padding: 1.75rem 1rem 2.25rem; align-items: stretch !important; transform: none !important; }
        .side.mc { grid-row: 2; }
        .side.dc { grid-column: 1; grid-row: 3; }
        .side > :global(:not(.tag)) { max-width: none; }
    }
</style>
