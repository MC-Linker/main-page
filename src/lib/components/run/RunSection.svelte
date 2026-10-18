<script lang="ts">
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { links, platforms } from '$lib/data';
    import { Run, fmt } from '$lib/speedrun/run.svelte';
    import BrandIcon from '../BrandIcon.svelte';
    import Splits, { type Row } from './Splits.svelte';

    const steps = [
        { name: 'Add the bot', title: 'Add MC Linker to Discord' },
        { name: 'Install the plugin', title: 'Install Discord-Linker on your server' },
        { name: '/connect', title: 'Run /connect and paste the code' },
    ];
    const WR = 51_700;

    const run = new Run(steps.length);
    let platform = $state(platforms[0].id);
    const current = $derived(platforms.find(p => p.id === platform)!);
    let copied = $state(false);

    onMount(() => run.load());

    const rows = $derived<Row[]>(steps.map((s, i) => ({
        name: s.name,
        time: run.times[i],
        pb: run.pb?.[i] ?? null,
        delta: run.delta(i),
        gold: run.gold(i),
        active: run.running && run.index === i,
    })));

    const timerMode = $derived.by(() => {
        if(run.finished) return run.newPb ? 'pb' : 'done';
        if(!run.running) return 'idle';
        const last = run.index - 1;
        const d = last >= 0 ? run.delta(last) : null;
        return d !== null && d > 0 ? 'behind' : 'running';
    });

    // Which step card is open: the one you're on, or the first before you start.
    const active = $derived(run.finished ? -1 : run.running ? run.index : 0);

    /** Opening a link counts as starting the run. */
    function act() { if(!run.running && !run.finished) run.begin(); }

    function keys(e: KeyboardEvent) {
        const t = e.target as HTMLElement;
        if(e.ctrlKey || e.metaKey || e.altKey || t.closest('input, textarea, button, a, [contenteditable]')) return;
        if(e.code === 'Space' && runVisible) { e.preventDefault(); run.split(); }
        else if(e.key === 'r' || e.key === 'R') { if(runVisible) run.reset(); }
    }

    let runVisible = $state(false);
    let section: HTMLElement;
    onMount(() => {
        const io = new IntersectionObserver(([e]) => (runVisible = e.isIntersecting), { threshold: 0.2 });
        io.observe(section);
        return () => io.disconnect();
    });

    const shareText = $derived(`I linked my Minecraft server with Discord in ${fmt(run.elapsed)} with MC Linker. Beat that: mclinker.com`);
    async function share() {
        try { await navigator.clipboard.writeText(shareText); copied = true; setTimeout(() => (copied = false), 2000); }
        catch { copied = false; }
    }
</script>

<svelte:window onkeydown={keys} />

<section id="run" class="run" bind:this={section} aria-labelledby="run-title">
    <header class="head">
        <h2 id="run-title">Your turn. Time your setup.</h2>
        <p>Follow the three steps for real. Hit <kbd>Space</kbd> (or the Split button) after each one. Your best time stays in this browser.</p>
    </header>

    <div class="layout">
        <ol class="steps">
            {#each steps as s, i (s.name)}
                {@const done = run.times[i] !== null}
                <li class="step sticker" class:open={active === i} class:done>
                    <div class="step-head">
                        <span class="num">{done ? '✓' : i + 1}</span>
                        <h3>{s.title}</h3>
                        {#if done}<span class="t">{fmt(run.times[i]!)}</span>{/if}
                    </div>
                    {#if active === i}
                        <div class="body" transition:fly={{ y: -6, duration: 180 }}>
                            {#if i === 0}
                                <p>Pick the Discord server you want to link. You need the <b>Manage Server</b> permission there.</p>
                                <a class="btn blurple small" href={links.invite} target="_blank" rel="noopener" onclick={act}><BrandIcon brand="discord" size="1.1em" /> Add to Discord</a>
                            {:else if i === 1}
                                <p>Download the file for your server software, put it into the <code>{current.folder}</code> folder and restart the server.</p>
                                <div class="pills" role="radiogroup" aria-label="Server software">
                                    {#each platforms as p (p.id)}
                                        <button type="button" role="radio" aria-checked={platform === p.id} class="pill" onclick={() => (platform = p.id)}>{p.name}</button>
                                    {/each}
                                </div>
                                <p class="versions">Minecraft {current.versions}{#if current.alsoWorksOn} · also {current.alsoWorksOn}{/if}</p>
                                <div class="downloads">
                                    {#each current.downloads as d (d.name)}
                                        <a class="btn small" href={d.href} target="_blank" rel="noopener" onclick={act}>{#if d.brand}<BrandIcon brand={d.brand} size="1em" />{/if}{d.name}</a>
                                    {/each}
                                </div>
                            {:else}
                                <p>In Discord, run <code>/connect</code>. MC Linker answers with a command. Paste it into Minecraft as an operator:</p>
                                <pre class="code"><span class="dim">&gt;</span> /linker connect 803412896432:a8f3c
<span class="ok">Successfully connected to Discord!</span></pre>
                                <p class="hint">From the console, leave out the slash.</p>
                            {/if}
                            <div class="controls">
                                <button type="button" class="btn green small" onclick={() => run.split()}>{run.running ? (i === steps.length - 1 ? 'Finish ⏱' : 'Split') : '▶ Start the timer'}</button>
                                {#if run.running && i > 0}<button type="button" class="btn small" onclick={() => run.undo()}>Undo split</button>{/if}
                            </div>
                        </div>
                    {/if}
                </li>
            {/each}
        </ol>

        <div class="side">
            <Splits
                title="MC Linker Setup"
                category="any%"
                attempts={run.attempts}
                {rows}
                main={run.elapsed}
                mode={timerMode}
                footer={run.pb ? `Personal best: ${fmt(run.pb[steps.length - 1])}` : 'No personal best yet'}
            />
            {#if run.finished}
                <div class="result sticker" in:fly={{ y: 12, duration: 250 }}>
                    <p class="big">{run.newPb ? 'New personal best!' : 'Run complete!'}</p>
                    <p>
                        {fmt(run.elapsed)} ·
                        {#if run.elapsed < WR}faster than our "world record" of {fmt(WR)}. Impressive.{:else}{fmt(run.elapsed - WR)} behind our {fmt(WR)}. Your server is linked either way.{/if}
                    </p>
                    <div class="controls">
                        <button type="button" class="btn small" onclick={share}>{copied ? 'Copied!' : 'Copy brag text'}</button>
                        <button type="button" class="btn small" onclick={() => run.reset()}>Reset</button>
                        <a class="btn small" href={links.guide}>What's next? →</a>
                    </div>
                </div>
            {:else if run.running}
                <button type="button" class="reset" onclick={() => run.reset()}>Reset run (R)</button>
            {/if}
        </div>
    </div>
</section>

<style>
    .run { padding: clamp(4rem, 9vw, 7rem) clamp(1rem, 4vw, 2rem); background: var(--color-paper-2); border-block: var(--sticker); }
    .head { max-width: 40rem; margin: 0 auto 2.5rem; text-align: center; }
    h2 { margin: 0; font-size: clamp(2.2rem, 5vw, 3.6rem); font-weight: 900; letter-spacing: -0.03em; line-height: 1.05; }
    .head p { margin: 1rem 0 0; font-size: 1.1rem; color: var(--color-ink-soft); line-height: 1.55; }
    kbd { padding: 0.05em 0.45em; border: 2px solid var(--color-ink); border-radius: 6px; background: #fff; font-family: var(--font-pixel); font-size: 0.9em; box-shadow: 2px 2px 0 var(--color-ink); }

    .layout { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 2rem; align-items: start; max-width: 64rem; margin: 0 auto; }
    .steps { display: flex; flex-direction: column; gap: 1rem; margin: 0; padding: 0; list-style: none; }
    .step { padding: 1rem 1.2rem; transition: background 0.2s; }
    .step.done { background: #eef7e3; }
    .step-head { display: flex; align-items: center; gap: 0.8rem; }
    .num { display: grid; place-items: center; flex: none; width: 2.2rem; height: 2.2rem; border: var(--sticker); border-radius: 50%; font-weight: 900; background: var(--color-paper); }
    .done .num { background: var(--color-grass-bright); }
    .open .num { background: var(--color-gold); }
    h3 { margin: 0; flex: 1; font-size: 1.15rem; font-weight: 800; }
    .t { font-family: var(--font-pixel); color: var(--color-grass); }
    .body { padding: 0.8rem 0 0.2rem 3rem; }
    .body p { margin: 0 0 0.8rem; line-height: 1.55; color: var(--color-ink-soft); }
    code { padding: 0.05em 0.35em; border-radius: 5px; background: var(--color-paper-2); font-size: 0.92em; }
    .pills { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.6rem; }
    .pill { padding: 0.35rem 0.8rem; border: 2px solid var(--color-ink); border-radius: 999px; background: #fff; font: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
    .pill[aria-checked='true'] { background: var(--color-ink); color: #fff; }
    .versions { font-size: 0.9rem; }
    .downloads, .controls { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .controls { margin-top: 1rem; }
    .code { margin: 0 0 0.6rem; padding: 0.8rem 1rem; border-radius: 10px; background: var(--color-timer); color: #fff; font-family: var(--font-pixel); font-size: 0.95rem; white-space: pre-wrap; }
    .dim { color: #777; }
    .ok { color: #55ff55; }
    .hint { font-size: 0.9rem; }

    .side { position: sticky; top: 6rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .result { width: 100%; max-width: 24rem; padding: 1rem 1.2rem; background: var(--color-gold); }
    .result p { margin: 0 0 0.4rem; line-height: 1.5; }
    .big { font-size: 1.4rem; font-weight: 900; }
    .reset { border: 0; background: none; color: var(--color-ink-soft); text-decoration: underline; font: inherit; cursor: pointer; }
    @media (max-width: 860px) {
        .layout { grid-template-columns: 1fr; }
        .side { position: static; order: -1; }
        .body { padding-left: 0; }
    }
</style>
