<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { links } from '$lib/data/links';
    import { hud } from '$lib/craft/ui.svelte';
    import type { ItemIcon as Icon } from '$lib/craft/items';
    import { book, chest, craftingTable, discordBlock, enchantedBook, letter, map } from '$lib/pixel/items';
    import ItemIcon from './ItemIcon.svelte';

    /** Navigation as a hotbar. Keys 1 to 9 work like in the game. */
    type HotbarSlot = { name: string; icon: Icon; href: string; external?: boolean; section?: number; glint?: boolean };
    const slots: HotbarSlot[] = [
        { name: 'Title Screen', icon: { block: 'grass' }, href: '/#title', section: 0 },
        { name: 'Crafting Table', icon: { sprite: craftingTable }, href: '/#craft', section: 1 },
        { name: 'Features', icon: { sprite: chest }, href: '/#features', section: 2 },
        { name: 'Download', icon: { sprite: map }, href: '/#servers', section: 3 },
        { name: 'Questions', icon: { sprite: book }, href: '/#faq', section: 4 },
        { name: 'Guide', icon: { sprite: enchantedBook }, href: links.guide, glint: true },
        { name: 'Support Server', icon: { sprite: letter }, href: links.support, external: true },
        { name: 'The Team', icon: { head: 'lianecx' }, href: '/team' },
        { name: 'Add to Discord', icon: { sprite: discordBlock }, href: links.invite, external: true, glint: true },
    ];

    const onHome = $derived(page.url.pathname === '/');
    const selected = $derived(onHome ? hud.section : page.url.pathname === '/team' ? 7 : -1);
    let hover = $state<number | null>(null);
    const label = $derived((hover ?? selected) >= 0 ? slots[hover ?? selected].name : '');

    function activate(i: number) {
        const s = slots[i];
        if(s.external) window.open(s.href, '_blank', 'noopener');
        else if(s.href.startsWith('http')) window.location.href = s.href;
        else void goto(s.href);
    }

    function keys(e: KeyboardEvent) {
        const t = e.target as HTMLElement;
        if(e.ctrlKey || e.metaKey || e.altKey || t.closest('input, textarea, [contenteditable]')) return;
        const n = Number(e.key);
        if(n >= 1 && n <= 9) { e.preventDefault(); activate(n - 1); }
    }
</script>

<svelte:window onkeydown={keys} />

<nav class="hud" aria-label="Main (keys 1 to 9)">
    {#key label}
        <!-- Like the game: the name shows up, then fades. A new name replaces it right away. -->
        <p class="label mc-text" aria-hidden="true">{label}</p>
    {/key}
    <div class="xp" aria-hidden="true">
        <span class="level mc-text">{Math.max(0, selected) + 1}</span>
        <span class="bar"><span style:width="{Math.round(hud.progress * 100)}%"></span></span>
    </div>
    <ul class="hotbar">
        {#each slots as s, i (s.name)}
            <li>
                <a
                    href={s.href}
                    class:selected={i === selected}
                    target={s.external ? '_blank' : undefined}
                    rel={s.external ? 'noopener' : undefined}
                    aria-current={i === selected ? 'true' : undefined}
                    onpointerenter={() => (hover = i)}
                    onpointerleave={() => (hover = null)}
                    onfocus={() => (hover = i)}
                    onblur={() => (hover = null)}
                >
                    <ItemIcon icon={s.icon} glint={s.glint} size="1.55rem" />
                    <span class="key mc-text" aria-hidden="true">{i + 1}</span>
                    <span class="sr-only">{s.name}</span>
                </a>
            </li>
        {/each}
    </ul>
</nav>

<style>
    .hud {
        --s: clamp(2.2rem, 10vw, 2.6rem);
        position: fixed; left: 50%; bottom: 0.5rem; z-index: 60; transform: translateX(-50%);
        display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
        pointer-events: none;
    }
    .label { position: absolute; bottom: calc(100% + 0.6rem); margin: 0; white-space: nowrap; color: #fff; font-size: 1rem; animation: label-fade 2.5s ease-in forwards; }
    @keyframes label-fade { 0%, 60% { opacity: 1; } 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .label { animation: none !important; } }
    .xp { position: relative; width: calc(var(--s) * 9 - 0.6rem); margin-top: 1.1rem; }
    .level { position: absolute; left: 50%; bottom: 0.3rem; transform: translateX(-50%); color: var(--color-mc-green); font-size: 1rem; --mc-shadow: 0.1em; }
    .bar { display: block; height: 0.45rem; background: #1b1b1b; border: 1px solid #000; }
    .bar span { display: block; height: 100%; background: linear-gradient(#b5f55a, #6fbf1f); transition: width 0.2s linear; }
    .hotbar {
        display: flex; margin: 0; padding: 3px; list-style: none; pointer-events: auto;
        background: rgb(0 0 0 / 0.6); border: 2px solid #111; box-shadow: inset 0 0 0 2px #707070;
    }
    .hotbar a {
        position: relative; display: grid; place-items: center; width: var(--s); height: var(--s);
        border: 1px solid rgb(255 255 255 / 0.12); color: #fff; text-decoration: none;
    }
    .hotbar a:hover { background: rgb(255 255 255 / 0.12); }
    .hotbar a.selected { outline: 3px solid #fff; outline-offset: -1px; z-index: 1; box-shadow: 0 0 0 1px #000; }
    .key { position: absolute; left: 3px; top: 1px; font-size: 0.6rem; color: #ddd; opacity: 0.8; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    @media (hover: none) { .key { display: none; } }
</style>
