<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { isTextField } from '$lib/browser';
    import { type HomeSection, homeSections, siteLinks } from '$lib/data';
    import type { Item, ItemIcon } from '$lib/mc/item';
    import McItemIcon from '$lib/mc/McItemIcon.svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import type { Sprite } from '$lib/pixel/sprites';
    import { tooltipHandlers } from '$lib/ui.svelte';

    /**
     * The site's navigation, as Minecraft's hotbar. Two clearly separate parts:
     * "This page" jumps to sections of the home page (keys 1 to 4) and follows
     * your scroll position; "Links" leaves the page.
     */

    // A small "leaves this page" arrow for the link slots.
    const out: Sprite = {
        rows: ['..wwww', '....ww', '...w.w', '..w..w', '.w....', 'w.....'],
        palette: { w: '#ffffff' },
    };

    const onHome = $derived(page.url.pathname === '/');
    const onLinkPage = $derived(siteLinks.some(l => l.href === page.url.pathname));
    let current = $state(0);
    let progress = $state(0);
    /** Phones: whether the folded "Links" list is open. */
    let open = $state(false);
    /** Phones: get out of the way while the keyboard is open. */
    let typing = $state(false);
    let nav: HTMLElement;

    /** The section whose top has passed 40% of the screen is the current one. */
    function track() {
        if(page.url.pathname !== '/') return;
        const line = window.innerHeight * 0.4;
        let i = 0;
        homeSections.forEach((s, n) => {
            const el = document.getElementById(s.id);
            if(el && el.getBoundingClientRect().top <= line) i = n;
        });
        current = i;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    }

    let frame = 0;
    const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(track);
    };

    onMount(() => {
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => {
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
        };
    });

    // Re-check after every navigation (coming back to the home page, following a #link).
    $effect(() => {
        void page.url.href;
        open = false;
        tick().then(track);
    });

    const href = (s: HomeSection) => (onHome ? `#${s.id}` : `/#${s.id}`);

    function keys(e: KeyboardEvent) {
        if(e.key === 'Escape') {
            open = false;
            return;
        }
        if(e.ctrlKey || e.metaKey || e.altKey || isTextField(e.target)) return;
        const n = Number(e.key);
        if(!Number.isInteger(n) || n < 1 || n > homeSections.length) return;
        e.preventDefault();
        const s = homeSections[n - 1];
        if(onHome) document.getElementById(s.id)?.scrollIntoView();
        else void goto(`/#${s.id}`);
    }

    function outside(e: PointerEvent) {
        if(open && !nav.contains(e.target as Node)) open = false;
    }

    // Tooltips sit above the hotbar, so they never cover the other slots.
    const tip = (name: string, icon: ItemIcon, extra: string[]) => {
        const item: Item = { id: name, name, lore: [], icon };
        return tooltipHandlers(item, { extra, above: true, focus: false, hideOnClick: true });
    };
</script>

<svelte:window onkeydown={keys} onpointerdown={outside} onfocusin={e => (typing = isTextField(e.target))} onfocusout={() => (typing = false)} />

<nav class="hud" class:open class:typing bind:this={nav} aria-label="Site">
    <div class="group sections">
        <div class="top">
            <span class="cap">{onHome ? 'This page' : 'Home page'}</span>
            {#if onHome}<span class="level mc-text" aria-hidden="true">{current + 1}</span>{/if}
        </div>
        <div class="xp" aria-hidden="true"><span style:width="{(onHome ? progress : 0) * 100}%"></span></div>
        <ul class="bar">
            {#each homeSections as s, i (s.id)}
                {@const selected = onHome && i === current}
                <li>
                    <a
                        class="slot" class:selected href={href(s)} aria-current={selected ? 'location' : undefined}
                        {...tip(s.title, s.icon, [onHome ? '&7Jumps to this section' : '&7On the home page', `&8Key ${i + 1}`])}
                    >
                        <span class="key" aria-hidden="true">{i + 1}</span>
                        <McItemIcon icon={s.icon} size="var(--icon)" />
                        <span class="name mc-text">{s.name}</span>
                    </a>
                </li>
            {/each}
            <li class="more-li">
                <button type="button" class="slot more" class:selected={onLinkPage} aria-expanded={open} aria-controls="hud-links" onclick={() => (open = !open)}>
                    <McItemIcon icon={{ image: '/logo.svg' }} size="var(--icon)" />
                    <span class="name mc-text">Links</span>
                </button>
            </li>
        </ul>
    </div>

    <div class="group pages" id="hud-links">
        <div class="top"><span class="cap">Links</span></div>
        <ul class="bar">
            {#each siteLinks as p (p.name)}
                {@const selected = page.url.pathname === p.href}
                <li>
                    <a
                        class="slot" class:selected class:cta={p.cta} href={p.href}
                        target={p.newTab ? '_blank' : undefined} rel={p.newTab ? 'noopener' : undefined}
                        aria-current={selected ? 'page' : undefined}
                        {...tip(p.title, p.icon, [`&7${p.hint}`])}
                    >
                        <McItemIcon icon={p.icon} glint={p.cta} size="var(--icon)" />
                        <span class="name mc-text">{p.name}</span>
                        {#if !selected}<span class="out" aria-hidden="true"><PixelArt sprite={out} width="100%" /></span>{/if}
                        {#if p.newTab}<span class="sr-only">(opens in a new tab)</span>{/if}
                    </a>
                </li>
            {/each}
        </ul>
    </div>
</nav>

<style>
    .hud {
        --s: 4.25rem;
        --icon: 1.9rem;
        --label: 0.75rem;
        position: fixed;
        left: 50%;
        bottom: 0.6rem;
        z-index: 60;
        transform: translateX(-50%);
        display: flex;
        align-items: flex-end;
        gap: 1rem;
    }
    .group { position: relative; display: flex; flex-direction: column; }
    .top { position: relative; display: flex; align-items: flex-end; height: 1.1rem; margin-bottom: 0.2rem; padding-left: 2px; }
    .cap { font-family: var(--font-pixel); font-size: 0.75rem; line-height: 1; text-transform: uppercase; letter-spacing: 0.08em; color: #f1f3f5; text-shadow: 0.125em 0.125em 0 rgb(0 0 0 / 0.85); }
    .level { position: absolute; left: 50%; bottom: -0.35rem; transform: translateX(-50%); font-size: 1rem; line-height: 1; color: #80ff20; --mc-shadow: 0.1em; }
    .xp { height: 0.5rem; margin: 0.2rem 3px 0.3rem; background: #1b1b1b; border: 1px solid #000; }
    .xp span { display: block; height: 100%; background: linear-gradient(#b5f55a, #6fbf1f); transition: width 0.2s linear; }
    .pages .top { margin-bottom: calc(0.2rem + 0.2rem + 0.5rem + 2px + 0.3rem); }

    .bar {
        display: flex;
        margin: 0;
        padding: 3px;
        list-style: none;
        background: rgb(0 0 0 / 0.62);
        border: 2px solid #111;
        box-shadow: inset 0 0 0 2px #6b6b6b, 0 6px 18px rgb(0 0 0 / 0.35);
        backdrop-filter: blur(3px);
    }
    .slot {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        width: var(--s);
        height: var(--s);
        padding: 0;
        border: 1px solid rgb(255 255 255 / 0.12);
        background: none;
        color: #fff;
        font: inherit;
        text-decoration: none;
        cursor: pointer;
    }
    .slot:hover, .slot:focus-visible { background: rgb(255 255 255 / 0.14); }
    .slot:focus-visible { outline: 2px solid var(--color-mc-yellow); outline-offset: -2px; }
    /* The game's selected slot: a thick white frame. */
    .slot.selected { z-index: 1; outline: 3px solid #fff; outline-offset: -1px; box-shadow: 0 0 0 1px #000, inset 0 0 0 2px #000; }
    .slot.cta { background: rgb(88 101 242 / 0.55); }
    .slot.cta:hover, .slot.cta:focus-visible { background: rgb(88 101 242 / 0.8); }
    .name { font-size: var(--label); line-height: 1; white-space: nowrap; --mc-shadow: 0.125em; }
    .key { position: absolute; left: 4px; top: 3px; font-family: var(--font-pixel); font-size: 0.6rem; line-height: 1; color: #c8c8c8; }
    .out { position: absolute; right: 5px; top: 5px; width: 0.45rem; filter: drop-shadow(1px 1px 0 #000); }
    .more-li { display: none; }
    @media (hover: none) { .key { display: none; } }

    @media (max-width: 1000px) {
        .hud { --s: 3.85rem; --icon: 1.7rem; --label: 0.7rem; gap: 0.6rem; }
    }

    /* Phones: the links fold into one slot that opens a small list. */
    @media (max-width: 720px) {
        .hud { --s: min(4.25rem, calc((100vw - 2.5rem) / 5)); --icon: 1.6rem; --label: 0.7rem; bottom: 0.4rem; gap: 0; }
        .cap { display: none; }
        .top { height: 0.9rem; }
        .more-li { display: block; margin-left: 4px; }
        .slot.more { background: rgb(255 255 255 / 0.06); }
        .open .slot.more { background: rgb(255 255 255 / 0.2); }
        .hud { transition: transform 0.2s ease, opacity 0.2s ease; }
        .hud.typing { opacity: 0; pointer-events: none; transform: translate(-50%, 130%); }
        .group.pages { display: none; position: absolute; right: 0; bottom: calc(100% + 0.5rem); }
        .open .group.pages { display: flex; }
        .pages .top { display: none; }
        .pages .bar { flex-direction: column; width: min(14rem, calc(100vw - 2rem)); }
        .pages .slot { flex-direction: row; justify-content: flex-start; gap: 0.75rem; width: 100%; height: 3rem; padding: 0 0.75rem; }
        .pages .name { font-size: 0.95rem; }
        .pages .out { top: 50%; right: 0.75rem; width: 0.6rem; transform: translateY(-50%); }
    }

    /* Phones held sideways: a slimmer bar without captions, so the page keeps most of the screen. */
    @media (max-height: 520px) and (min-width: 721px) {
        .hud { --s: 3.1rem; --icon: 1.2rem; --label: 0.6rem; bottom: 0.3rem; gap: 0.5rem; }
        .top, .xp { display: none; }
        .slot { gap: 0.15rem; }
        .key { display: none; }
    }
</style>
