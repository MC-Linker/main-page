<script lang="ts" module>
    export type Row = { name: string; time: number | null; delta: number | null; gold?: boolean; active?: boolean; pb?: number | null };
</script>

<script lang="ts">
    import { fmt, fmtDelta } from '$lib/speedrun/run.svelte';

    /** A LiveSplit-style splits window. */
    type Props = {
        title: string;
        category: string;
        attempts: number;
        rows: Row[];
        main: number;
        mode: 'idle' | 'running' | 'ahead' | 'behind' | 'done' | 'pb';
        footer?: string;
        class?: string;
    };
    let { title, category, attempts, rows, main, mode, footer, class: className = '' }: Props = $props();
</script>

<div class="splits {className}" role="timer" aria-label="{title} timer" aria-live="off">
    <header>
        <div class="title">{title}</div>
        <div class="cat">{category} <span>Attempts: {attempts}</span></div>
    </header>
    <ol>
        {#each rows as r, i (i)}
            <li class:active={r.active}>
                <span class="name">{r.name}</span>
                <span class="delta" class:ahead={r.delta !== null && r.delta < 0} class:behind={r.delta !== null && r.delta >= 0} class:gold={r.gold}>
                    {r.delta !== null ? fmtDelta(r.delta) : ''}
                </span>
                <span class="time">{r.time !== null ? fmt(r.time) : r.pb ? fmt(r.pb) : '—'}</span>
            </li>
        {/each}
    </ol>
    <div class="main {mode}">{fmt(main, 2)}</div>
    {#if footer}<div class="foot">{footer}</div>{/if}
</div>

<style>
    .splits {
        width: 100%;
        max-width: 24rem;
        background: var(--color-timer);
        color: #fff;
        border: var(--sticker);
        border-radius: 16px;
        box-shadow: var(--sticker-shadow);
        overflow: hidden;
        font-family: var(--font-pixel);
    }
    header { padding: 0.75rem 1rem 0.6rem; text-align: center; background: linear-gradient(#2a2c31, #17181b); border-bottom: 1px solid #333; }
    .title { font-family: var(--font-mojang); font-size: 1rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .cat { margin-top: 0.15rem; font-size: 0.85rem; color: #aab; }
    .cat span { margin-left: 0.6rem; color: #778; }
    ol { margin: 0; padding: 0.35rem 0; list-style: none; }
    li { display: grid; grid-template-columns: 1fr auto 4.6rem; align-items: center; gap: 0.6rem; padding: 0.4rem 1rem; font-size: 0.98rem; }
    li.active { background: linear-gradient(90deg, #2b4d8f, #1d3466); }
    .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .time { text-align: right; color: #eee; font-family: var(--font-sans); font-weight: 600; font-variant-numeric: tabular-nums; }
    .delta { font-family: var(--font-sans); font-weight: 700; font-size: 0.9rem; text-align: right; font-variant-numeric: tabular-nums; }
    .delta.ahead { color: var(--color-ahead); }
    .delta.behind { color: var(--color-behind); }
    .delta.gold { color: var(--color-gold); }
    .main {
        padding: 0.4rem 1rem 0.2rem; text-align: right; font-family: var(--font-sans); font-size: clamp(2.6rem, 9vw, 3.4rem); line-height: 1.1; font-weight: 800; letter-spacing: -0.02em;
        font-variant-numeric: tabular-nums; color: #fff;
    }
    .main.running, .main.ahead { background: linear-gradient(#8ff0a4, #2fbf5b); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .main.behind { background: linear-gradient(#ffb0a8, #d1453b); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .main.pb, .main.done { background: linear-gradient(#fff2a8, #e8b923); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .foot { padding: 0 1rem 0.75rem; text-align: right; font-size: 0.82rem; color: #99a; }
</style>
