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
    import { backArrow, upArrow } from '$lib/ore/sprites';
    import PixelArt from '$lib/pixel/PixelArt.svelte';

    /**
     * The site's navigation, as the header bar of an Ore UI screen: a back arrow, the trail
     * of where you are ("MC Linker › Setup"), the home page's sections as toggle buttons
     * (keys 1 to 4) and a "Links" dropdown for everything that leaves the page. Its bottom
     * edge fills green as you scroll.
     */

    const onHome = $derived(page.url.pathname === '/');
    let current = $state(0);
    let progress = $state(0);
    /** On the home page, scrolled all the way up: the arrow has nowhere to go. */
    let atTop = $state(true);
    let open = $state(false);
    /** Phones: get out of the way while the keyboard is open. */
    let typing = $state(false);

    const trail = $derived.by(() => {
        if(page.status >= 400) return ['You died!'];
        // On the home page the section buttons already say where you are.
        if(onHome) return [];
        return pageTrails[page.url.pathname.replace(/\/$/, '')] ?? [];
    });
    const sectionHref = (id: string) => (onHome ? `#${id}` : `/#${id}`);
    const segments = $derived(homeSections.map(s => ({ id: s.id, label: s.name, href: sectionHref(s.id), title: s.title })));

    /** The section whose top has passed 40% of the screen is the current one. */
    function track() {
        atTop = window.scrollY < 8;
        if(page.url.pathname !== '/') return;
        const line = window.innerHeight * 0.4;
        let i = 0;
        homeSections.forEach((s, n) => {
            const el = document.getElementById(s.id);
            if(el && el.getBoundingClientRect().top <= line) i = n;
        });
        current = i;
        // A stretch of scrolling that only drives an effect (the hero's opening) doesn't count.
        const skipEl = document.querySelector<HTMLElement>('[data-progress-skip]');
        const skip = skipEl ? skipEl.offsetHeight - (skipEl.lastElementChild as HTMLElement | null)!.offsetHeight : 0;
        const max = document.documentElement.scrollHeight - window.innerHeight - skip;
        progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY - skip) / max) : 0;
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

    // After every navigation: close the dropdown and re-check the section.
    $effect(() => {
        void page.url.href;
        open = false;
        void tick().then(track);
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

<nav class="nav ore-header dark" class:typing aria-label="Site">
    {#if onHome && atTop}
        <span class="back idle" aria-hidden="true"><span class="up-arrow"><PixelArt sprite={upArrow()} width="100%" /></span></span>
    {:else if onHome}
        <OreButton variant="transparent" href="#top" label="Back to the top" class="back">
            <span class="up-arrow"><PixelArt sprite={upArrow()} width="100%" /></span>
        </OreButton>
    {:else}
        <OreButton variant="transparent" href="/" label="Back to the home page" class="back">
            <span class="back-arrow"><PixelArt sprite={backArrow('#ffffff')} width="100%" /></span>
        </OreButton>
    {/if}

    {#if trail.length}
        <p class="trail ore-title">
            {#each trail as t, i (i)}{#if i}<span class="sep" aria-hidden="true">›</span>{/if}<span class="crumb" class:last={i === trail.length - 1}>{t}</span>{/each}
        </p>
    {/if}

    <!-- The banner, in a tab that hangs down from the middle of the bar. -->
    <a class="brand" href={onHome ? '#top' : '/'} aria-label={onHome ? 'MC Linker, back to the top' : 'MC Linker home page'}>
        <img src="/banner.png" alt="" width="1346" height="340" />
    </a>

    {#if onHome}<OreSegments
        class="sections" items={segments} selected={onHome ? homeSections[current].id : ''}
        mode="links" label="Home page sections" size="sm" tone="dark"
    >
        {#snippet icon(s)}
            <McItemIcon icon={homeSections.find(h => h.id === s.id)!.icon} size="1.25rem" />
        {/snippet}
    </OreSegments>{/if}

    <OreButton href={links.invite} external variant="discord" size="sm" class="add"><BrandIcon brand="discord" size="1.1em" /> Add to Discord</OreButton>

    <OreDropdown id="nav-links" bind:open align="right" size="sm" tone="dark" class="links">
        <span class="wide-only">Links</span><span class="narrow-only">Menu</span>
        {#snippet popup()}
            <div class="group" class:narrow-only={onHome}>
                <p class="group-title ore-text">{onHome ? 'This page' : 'Home page'}</p>
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

    .nav :global(.back) { flex: none; width: 2.5rem; min-height: 2.5rem; padding: 0; }
    .back-arrow { width: calc(4 * var(--t)); }
    .up-arrow { width: calc(7 * var(--t)); }
    /* At the top of the home page: shown greyed out, since it has nowhere to go. */
    .idle { display: flex; align-items: center; justify-content: center; opacity: 0.3; }

    /* Left of the banner: what fits beside it. */
    .trail { display: flex; align-items: center; gap: 0.45rem; min-width: 0; max-width: calc(50% - var(--brand-w) / 2 - 4rem); margin: 0; font-size: 1.2rem; line-height: 1; white-space: nowrap; color: #fff; }

    /*
     * The banner hangs below the bar in a tab of the same surface: the bar's bottom edge
     * steps down around it, outline and all.
     */
    .nav { --drop: 1.6rem; --brand-h: 3.5rem; --brand-w: calc(var(--brand-h) * 1346 / 340 + 2rem); }
    .brand {
        position: absolute;
        top: 0;
        left: 50%;
        z-index: 1;
        isolation: isolate;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--brand-w);
        height: calc(var(--nav-h) + var(--drop));
        padding-bottom: calc(3 * var(--t));
        translate: -50% 0;
    }
    .brand::before {
        content: '';
        position: absolute;
        z-index: -1;
        inset: calc(var(--nav-h) - 3 * var(--t)) 0 0;
        background: var(--color-ore-deep);
        box-shadow:
            inset 0 calc(-2 * var(--t)) 0 #1a1a1b,
            inset 0 calc(-3 * var(--t)) 0 #3a3b3c,
            0 var(--t) 0 #121213,
            var(--t) 0 0 #121213,
            calc(-1 * var(--t)) 0 0 #121213,
            0 0.5rem 1rem rgb(0 0 0 / 0.35);
    }
    .brand img { display: block; width: auto; height: var(--brand-h); transition: filter 0.15s ease; }
    .brand:hover img { filter: brightness(1.15); }
    .brand:focus-visible { outline-offset: calc(-1 * var(--t)); }
    .sep { color: var(--color-ore-mid); text-shadow: none; }
    .crumb { overflow: hidden; text-overflow: ellipsis; }
    .crumb:not(.last) { flex: none; }

    .nav :global(.sections) { flex: none; }
    .nav :global(.add) { flex: none; margin-left: auto; }
    .nav :global(.links) { flex: none; }
    .narrow-only { display: none; }

    .group { display: flex; flex-direction: column; gap: var(--t); }
    .group.narrow-only { display: none; }
    .group-title { margin: 0; padding: 0.45rem 0.6rem 0.3rem; font-size: 0.8rem; color: #1e1e1f; text-transform: uppercase; letter-spacing: 0.06em; }

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

    /* Phones: sections and links in one "Menu" dropdown. */
    @media (max-width: 760px) {
        .nav { gap: 0.4rem; padding-inline: 0.4rem 0.6rem; }
        .nav :global(.sections), .nav :global(.add), .trail, .wide-only { display: none; }
        .nav :global(.links) { margin-left: auto; }
        .narrow-only { display: inline; }
        .group.narrow-only { display: flex; }
        .nav { --drop: 1.1rem; --brand-h: min(2.5rem, 9.5vw); --brand-w: calc(var(--brand-h) * 1346 / 340 + 1rem); }
        .brand { align-items: flex-end; padding-bottom: calc(3 * var(--t) + 0.4rem); }
        .nav { transition: transform 0.2s ease; }
        .nav.typing { transform: translateY(calc(-100% - var(--drop) - 4px)); }
    }
</style>
