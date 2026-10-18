<script lang="ts">
    import { links } from '$lib/data/links';
    import { page } from '$app/state';
    import BrandIcon from './BrandIcon.svelte';

    const home = $derived(page.url.pathname === '/');
    let scrolled = $state(false);
</script>

<svelte:window onscroll={() => (scrolled = window.scrollY > 20)} />

<header class="nav" class:scrolled>
    <nav aria-label="Main">
        <a class="brand" href="/"><img src="/logo.svg" alt="" width="34" height="34" /><span>MC Linker</span></a>
        <ul>
            <li class="wide"><a href={home ? '#run' : '/#run'}>Setup</a></li>
            <li class="wide"><a href={home ? '#categories' : '/#categories'}>Features</a></li>
            <li><a href={links.guide}>Guide</a></li>
            <li class="wide"><a href={links.support} target="_blank" rel="noopener">Support</a></li>
        </ul>
        <a class="btn blurple small" href={links.invite} target="_blank" rel="noopener"><BrandIcon brand="discord" size="1.1em" /><span class="wide-inline">Add to Discord</span><span class="narrow-inline">Add</span></a>
    </nav>
</header>

<style>
    .nav { position: fixed; inset: 0 0 auto; z-index: 50; padding: 0.75rem clamp(0.75rem, 3vw, 1.5rem); transition: background 0.2s, box-shadow 0.2s; }
    .nav.scrolled { background: rgb(246 241 230 / 0.92); backdrop-filter: blur(8px); box-shadow: 0 3px 0 var(--color-ink); }
    nav { display: flex; align-items: center; gap: 1rem; max-width: 72rem; margin: 0 auto; }
    .brand { display: flex; align-items: center; gap: 0.55rem; margin-right: auto; color: inherit; text-decoration: none; font-weight: 900; font-size: 1.2rem; letter-spacing: -0.02em; }
    ul { display: flex; gap: 0.25rem; margin: 0; padding: 0; list-style: none; }
    ul a { display: block; padding: 0.45rem 0.7rem; border-radius: 8px; color: inherit; text-decoration: none; font-weight: 700; }
    ul a:hover { background: var(--color-paper-2); }
    .narrow-inline { display: none; }
    @media (max-width: 680px) {
        .wide { display: none; }
        .wide-inline { display: none; }
        .narrow-inline { display: inline; }
    }
</style>
