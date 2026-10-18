<script lang="ts">
    import { onMount } from 'svelte';
    import { links } from '$lib/data/links';
    import { reducedMotion } from '$lib/motion';
    import BrandIcon from '../BrandIcon.svelte';
    import Splits, { type Row } from './Splits.svelte';

    // A "world record" run that replays on load, sped up.
    const names = ['Add the bot', 'Install the plugin', '/connect'];
    const wr = [12_400, 38_900, 51_700];
    const pb = [13_600, 38_100, 53_800];
    let t = $state(0);

    onMount(() => {
        if(reducedMotion.current) { t = wr[2]; return; }
        const speed = 16;
        let start = 0;
        let raf = 0;
        const tick = (now: number) => {
            start ||= now;
            t = Math.min(wr[2], (now - start) * speed);
            if(t < wr[2]) raf = requestAnimationFrame(tick);
        };
        const timeout = setTimeout(() => (raf = requestAnimationFrame(tick)), 600);
        return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
    });

    const rows = $derived<Row[]>(names.map((name, i) => {
        const done = t >= wr[i];
        const seg = wr[i] - (i ? wr[i - 1] : 0);
        const best = pb[i] - (i ? pb[i - 1] : 0);
        return {
            name,
            time: done ? wr[i] : null,
            pb: pb[i],
            delta: done ? wr[i] - pb[i] : null,
            gold: done && seg < best,
            active: !done && (i === 0 || t >= wr[i - 1]),
        };
    }));
    const finished = $derived(t >= wr[2]);
</script>

<section class="hero" aria-labelledby="hero-title">
    <div class="copy">
        <p class="tag">any% · glitchless · no config files</p>
        <h1 id="hero-title">
            Minecraft <span class="swap" aria-label="and">⇄</span> Discord.<br />
            Linked in <mark>under a minute.</mark>
        </h1>
        <p class="lead">
            MC Linker connects your Minecraft server and your Discord community.
            Chat, stats and moderation, both ways. Three steps, no bot to host. We timed it.
        </p>
        <div class="ctas">
            <a class="btn green" href="#run">▶ Time your setup</a>
            <a class="btn blurple" href={links.invite} target="_blank" rel="noopener"><BrandIcon brand="discord" size="1.2em" /> Add to Discord</a>
        </div>
        <p class="fine">Free · Paper, Spigot, Fabric, Forge &amp; NeoForge · Minecraft 1.8 → 26.2</p>
    </div>
    <div class="timer">
        <Splits
            title="MC Linker Setup"
            category="any%"
            attempts={1337}
            {rows}
            main={t}
            mode={finished ? 'pb' : 'running'}
            footer={finished ? 'New world record! (Lianecx, probably)' : 'Sum of best: 0:47.3'}
        />
        <span class="sticker-badge" aria-hidden="true">WR</span>
    </div>
</section>

<style>
    .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
        align-items: center;
        gap: clamp(2rem, 5vw, 4rem);
        max-width: 72rem;
        margin: 0 auto;
        padding: clamp(7rem, 14vh, 9rem) clamp(1rem, 4vw, 2rem) clamp(4rem, 9vw, 6rem);
    }
    .tag {
        display: inline-block; margin: 0 0 1.25rem; padding: 0.35rem 0.8rem;
        border: var(--sticker); border-radius: 999px; background: var(--color-gold);
        font-family: var(--font-pixel); font-size: 0.95rem; transform: rotate(-2deg);
    }
    h1 { margin: 0; font-size: clamp(2.5rem, 5.3vw, 4.6rem); font-weight: 900; line-height: 1.02; letter-spacing: -0.035em; }
    .swap { display: inline-block; color: var(--color-grass); }
    mark { white-space: nowrap; padding: 0 0.15em; background: linear-gradient(transparent 12%, var(--color-grass-bright) 12%, var(--color-grass-bright) 92%, transparent 92%); color: inherit; }
    .lead { margin: 1.5rem 0 0; max-width: 34rem; font-size: clamp(1.05rem, 1.6vw, 1.25rem); line-height: 1.55; color: var(--color-ink-soft); }
    .ctas { display: flex; flex-wrap: wrap; gap: 0.9rem; margin-top: 2rem; }
    .fine { margin: 1.1rem 0 0; font-size: 0.9rem; color: var(--color-ink-soft); }
    .timer { position: relative; display: flex; justify-content: center; transform: rotate(1.5deg); }
    .sticker-badge {
        position: absolute; top: -1.1rem; right: 0.5rem; display: grid; place-items: center; width: 3.4rem; height: 3.4rem;
        border: var(--sticker); border-radius: 50%; background: var(--color-gold); font-family: var(--font-pixel); font-weight: 700; font-size: 1.1rem;
        transform: rotate(12deg); box-shadow: 3px 3px 0 var(--color-ink);
    }
    @media (max-width: 860px) {
        .hero { grid-template-columns: 1fr; padding-top: 6.5rem; }
        .timer { transform: none; }
    }
</style>
