<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { isTextField } from '$lib/browser';
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { homeSections, links, pageTrails, siteLinks } from '$lib/data';
    import McItemIcon from '$lib/mc/McItemIcon.svelte';
    import OreButton from '$lib/ore/OreButton.svelte';
    import OreDropdown from '$lib/ore/OreDropdown.svelte';
    import OreMenuRow from '$lib/ore/OreMenuRow.svelte';
    import OreSegments from '$lib/ore/OreSegments.svelte';
    import { backArrow, outArrow } from '$lib/ore/sprites';
    import PixelArt from '$lib/pixel/PixelArt.svelte';

    /**
     * The site's navigation, as the header bar of an Ore UI screen: a back arrow, the trail
     * of where you are ("MC Linker › Setup"), the home page's sections as toggle buttons
     * (keys 1 to 4) and a "Links" dropdown for everything that leaves the page. Its bottom
     * edge fills green as you scroll. On the home page it waits until the title screen's
     * menu has scrolled away: until then, that menu is the navigation.
     */

    const onHome = $derived(page.url.pathname === '/');
    let current = $state(0);
    let progress = $state(0);
    /** Whether the title screen's menu (`[data-title-menu]`) is on screen. */
    let menuInView = $state(true);
    let open = $state(false);
    /** Phones: get out of the way while the keyboard is open. */
    let typing = $state(false);

    const away = $derived(onHome && menuInView && !open);
    const trail = $derived.by(() => {
        if(page.status >= 400) return ['You died!'];
        if(onHome) return current === 0 ? [] : [homeSections[current].name];
        return pageTrails[page.url.pathname.replace(/\/$/, '')] ?? [];
    });
    const sectionHref = (id: string) => (onHome ? `#${id}` : `/#${id}`);
    const segments = $derived(homeSections.map(s => ({ id: s.id, label: s.name, href: sectionHref(s.id), title: s.title })));

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

    // After every navigation: re-check the section, and watch the title menu if this page has one.
    // Coming in to a section below the menu (/#features), the page passes the menu on its way there:
    // the bar stays until the menu has really gone, so it doesn't slide away and back.
    $effect(() => {
        void page.url.href;
        open = false;
        let io: IntersectionObserver | undefined;
        tick().then(() => {
            track();
            const menu = document.querySelector('[data-title-menu]');
            const target = page.url.hash ? document.getElementById(decodeURIComponent(page.url.hash.slice(1))) : null;
            const toSection = !!menu && !!target && target.getBoundingClientRect().top >= menu.getBoundingClientRect().bottom;
            let settled = !toSection;
            menuInView = !!menu && !toSection;
            if(!menu) return;
            io = new IntersectionObserver(([e]) => {
                if(!e.isIntersecting) settled = true;
                if(settled) menuInView = e.isIntersecting;
            });
            io.observe(menu);
        });
        return () => io?.disconnect();
    });

    function keys(e: KeyboardEvent) {
        if(e.ctrlKey || e.metaKey || e.altKey || isTextField(e.target)) return;
        const n = Number(e.key);
        if(!Number.isInteger(n) || n < 1 || n > homeSections.length) return;
        e.preventDefault();
        const s = homeSections[n - 1];
        if(onHome) document.getElementById(s.id)?.scrollIntoView();
        else void goto(`/#${s.id}`);
    }
</script>

<svelte:window onkeydown={keys} onfocusin={e => (typing = isTextField(e.target))} onfocusout={() => (typing = false)} />

<nav class="nav ore-header" class:away class:typing aria-label="Site">
    <OreButton variant="transparent" href={onHome ? '#top' : '/'} label={onHome ? 'Back to the title screen' : 'Back to the home page'} class="back">
        <span class="back-arrow"><PixelArt sprite={backArrow()} width="100%" /></span>
    </OreButton>

    <p class="trail ore-title">
        <a class="home" href={onHome ? '#top' : '/'}><img src="/logo.svg" alt="" width="20" height="20" />MC Linker</a>
        {#each trail as t, i (i)}<span class="sep" aria-hidden="true">›</span><span class="crumb" class:last={i === trail.length - 1}>{t}</span>{/each}
    </p>

    <OreSegments
        class="sections" items={segments} selected={onHome ? homeSections[current].id : ''}
        mode="links" label="Home page sections" size="sm"
    >
        {#snippet icon(s)}
            <McItemIcon icon={homeSections.find(h => h.id === s.id)!.icon} size="1.25rem" />
        {/snippet}
    </OreSegments>

    <OreButton href={links.invite} external variant="discord" size="sm" class="add"><BrandIcon brand="discord" size="1.1em" /> Add to Discord</OreButton>

    <OreDropdown id="nav-links" bind:open align="right" size="sm" class="links">
        <span class="wide-only">Links</span><span class="narrow-only">Menu</span>
        {#snippet popup()}
            <div class="narrow-only group">
                <p class="group-title ore-text">This page</p>
                {#each homeSections as s, i (s.id)}
                    <OreMenuRow title={s.name} subtitle={s.title} href={sectionHref(s.id)} selected={onHome && i === current} current="location" chevron={false}>
                        {#snippet icon()}<McItemIcon icon={s.icon} size="1.75rem" />{/snippet}
                    </OreMenuRow>
                {/each}
                <p class="group-title ore-text">Links</p>
            </div>
            {#each siteLinks as l (l.name)}
                <OreMenuRow title={l.title} subtitle={l.hint} href={l.href} external={l.newTab} selected={page.url.pathname === l.href} chevron={!l.newTab}>
                    {#snippet icon()}<McItemIcon icon={l.icon} glint={l.cta} size="1.75rem" />{/snippet}
                    {#snippet trailing()}
                        {#if l.newTab}<span class="out" aria-hidden="true"><PixelArt sprite={outArrow()} width="100%" /></span><span class="sr-only">(opens in a new tab)</span>{/if}
                    {/snippet}
                </OreMenuRow>
            {/each}
        {/snippet}
    </OreDropdown>

    {#if onHome}<div class="progress" style:width="{progress * 100}%" aria-hidden="true"></div>{/if}
</nav>

<style>
    .nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 60;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        height: var(--nav-h);
        padding: 0 0.75rem calc(3 * var(--t));
        transition: transform 0.25s ease;
    }
    /* Out of sight above the screen, unless you tab into it (keyboard focus only: a click or tap
       leaves focus behind, which shouldn't keep it over the title). Without JavaScript nothing
       would bring it back, so on the home page the title menu is the navigation. */
    :global(.js) .nav.away:not(:has(:focus-visible)) { transform: translateY(calc(-100% - 4px)); }
    :global(html:not(.js)) .nav.away { display: none; }

    .nav :global(.back) { flex: none; width: 2.5rem; min-height: 2.5rem; padding: 0; }
    .back-arrow { width: calc(4 * var(--t)); }

    .trail { display: flex; align-items: center; gap: 0.45rem; flex: 1; min-width: 0; margin: 0; font-size: 1.2rem; line-height: 1; white-space: nowrap; color: #000; }
    .home { display: inline-flex; align-items: center; gap: 0.5rem; flex: none; color: inherit; text-decoration: none; }
    .home:hover { text-decoration: underline; text-underline-offset: 0.2em; }
    .home img { width: 1.5rem; height: 1.5rem; }
    .sep { color: #555; text-shadow: none; }
    .crumb { overflow: hidden; text-overflow: ellipsis; }
    .crumb:not(.last) { flex: none; }

    .nav :global(.sections) { flex: none; }
    .nav :global(.add) { flex: none; }
    .nav :global(.links) { flex: none; }
    .narrow-only { display: none; }

    .group { flex-direction: column; gap: var(--t); }
    .group-title { margin: 0; padding: 0.45rem 0.6rem 0.3rem; font-size: 0.8rem; color: #1e1e1f; text-transform: uppercase; letter-spacing: 0.06em; }
    .out { display: block; width: calc(6 * var(--t)); }

    /* Scroll progress, along the bottom edge: the slider's green fill. */
    .progress {
        position: absolute;
        left: 0;
        bottom: 0;
        height: calc(2 * var(--t));
        background: var(--color-ore-green);
        box-shadow: inset 0 var(--t) 0 var(--color-ore-green-light);
        transition: width 0.15s linear;
    }

    /* Smaller screens: icons only on the section buttons. */
    @media (max-width: 1180px) {
        .nav :global(.sections .label > span:last-child) { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .nav :global(.sections .seg) { padding-inline: 0.65rem; }
    }
    @media (max-width: 1000px) {
        .home { font-size: 0; gap: 0; }
        .home img { width: 1.6rem; height: 1.6rem; }
    }

    /* Phones: sections and links in one "Menu" dropdown. */
    @media (max-width: 760px) {
        .nav { gap: 0.4rem; padding-inline: 0.4rem 0.6rem; }
        .nav :global(.sections), .nav :global(.add), .wide-only { display: none; }
        .narrow-only { display: inline; }
        .group.narrow-only { display: flex; }
        .trail { font-size: 1.05rem; }
        .home img { width: 1.5rem; height: 1.5rem; }
        .nav { transition: transform 0.2s ease; }
        .nav.typing { transform: translateY(calc(-100% - 4px)); }
    }
</style>
