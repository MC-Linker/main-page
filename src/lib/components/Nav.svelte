<script lang="ts">
    import { links } from '$lib/data/links';
    import { page } from '$app/state';
    import BrandIcon from './BrandIcon.svelte';

    let scrolled = $state(false);
    const home = $derived(page.url.pathname === '/');
</script>

<svelte:window onscroll={() => (scrolled = window.scrollY > 40)} />

<header class="nav" class:scrolled>
    <nav aria-label="Main">
        <a class="brand" href="/" aria-label="MC Linker home">
            <img src="/logo.svg" alt="" width="32" height="32" />
            <span class="mc-logo">MC Linker</span>
        </a>
        <ul>
            <li class="wide"><a href={home ? '#features' : '/#features'}>Features</a></li>
            <li class="wide"><a href={home ? '#setup' : '/#setup'}>Setup</a></li>
            <li><a href={links.guide}>Guide</a></li>
            <li class="wide"><a href={links.support} target="_blank" rel="noopener">Support</a></li>
        </ul>
        <a class="cta" href={links.invite} target="_blank" rel="noopener">
            <BrandIcon brand="discord" size="1.15em" />
            <span>Add<span class="wide-inline">{' '}to Discord</span></span>
        </a>
    </nav>
</header>

<style>
    .nav {
        position: fixed;
        top: 0.75rem;
        left: 0;
        right: 0;
        z-index: 50;
        display: flex;
        justify-content: center;
        padding: 0 0.75rem;
        pointer-events: none;
    }
    nav {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0.375rem 0.375rem 0.75rem;
        border-radius: 14px;
        background: rgb(13 16 20 / 0.72);
        backdrop-filter: blur(12px);
        box-shadow: 0 0 0 1px rgb(255 255 255 / 0.08), 0 10px 30px rgb(0 0 0 / 0.25);
        pointer-events: auto;
        transition: background 0.2s ease;
    }
    .scrolled nav { background: rgb(13 16 20 / 0.9); }
    .brand { display: flex; align-items: center; gap: 0.5rem; margin-right: 0.5rem; color: #fff; text-decoration: none; font-size: 1.1rem; }
    ul { display: flex; gap: 0.125rem; margin: 0; padding: 0; list-style: none; }
    ul a {
        display: block; padding: 0.5rem 0.75rem; border-radius: 8px;
        color: #ced4da; text-decoration: none; font-size: 0.925rem; font-weight: 500;
    }
    ul a:hover { color: #fff; background: rgb(255 255 255 / 0.08); }
    .cta {
        display: inline-flex; align-items: center; gap: 0.45rem; margin-left: 0.25rem;
        padding: 0.5rem 0.9rem; border-radius: 9px;
        background: var(--color-dc-blurple); color: #fff; font-weight: 700; font-size: 0.925rem; text-decoration: none;
    }
    .cta:hover { background: var(--color-dc-blurple-dark); }
    @media (max-width: 720px) {
        .wide { display: none; }
        .wide-inline { display: none; }
        .brand span { display: none; }
    }
</style>
