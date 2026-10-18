<script lang="ts">
    import { team, type Member } from '$lib/data';
    import BrandIcon from '$lib/components/BrandIcon.svelte';
</script>

<svelte:head>
    <title>The team · MC Linker</title>
    <meta name="description" content="The people who build MC Linker." />
</svelte:head>

{#snippet card(m: Member, small = false)}
    <article class="profile" class:small>
        <div class="banner" style:background={m.color}></div>
        <img class="avatar" src="/profiles/{m.username}.png" alt="" width="88" height="88" loading="lazy" />
        <div class="body">
            <h2>{m.username}</h2>
            {#if m.github}
                <a class="gh" href="https://github.com/{m.github}" target="_blank" rel="noopener"><BrandIcon brand="github" size="0.95em" /> {m.github}</a>
            {/if}
            {#if m.about}
                <h3>About me</h3>
                <p>{m.about}</p>
            {/if}
            <h3>Roles</h3>
            <ul class="roles">
                {#each m.roles as r (r)}<li><i style:background={m.color}></i>{r}</li>{/each}
            </ul>
        </div>
    </article>
{/snippet}

<header class="head">
    <h1 class="mc-text">The team</h1>
    <p>A small crew who like Minecraft, Discord and building things that link the two.</p>
</header>

<section class="grid" aria-label="Core team">
    {#each team.core as m (m.username)}{@render card(m)}{/each}
</section>

<h2 class="thanks mc-text">Special thanks</h2>
<section class="grid small-grid" aria-label="Special thanks">
    {#each team.specialThanks as m (m.username)}{@render card(m, true)}{/each}
</section>

<style>
    .head { padding: 8rem 1rem 2.5rem; text-align: center; }
    h1 { margin: 0; font-family: var(--font-sans) !important; text-shadow: none !important; font-size: clamp(2.6rem, 7vw, 4.5rem); font-weight: 900; letter-spacing: -0.03em; }
    .head p { margin: 0.75rem auto 0; max-width: 32rem; color: var(--color-ink-soft); font-size: 1.1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1.25rem; max-width: 64rem; margin: 3rem auto 0; padding: 0 1rem; }
    .small-grid { max-width: 42rem; margin-bottom: 6rem; }
    .thanks { margin: 4rem 0 0; text-align: center; font-size: 2rem; font-family: var(--font-sans) !important; text-shadow: none !important; font-weight: 900; }
    .profile { position: relative; border: var(--sticker); border-radius: 16px; overflow: hidden; background: #232428; color: #dbdee1; box-shadow: var(--sticker-shadow); }
    .banner { height: 5.5rem; }
    .avatar { position: absolute; top: 2.25rem; left: 1rem; width: 5.5rem; height: 5.5rem; border-radius: 50%; border: 6px solid #232428; background: #232428; object-fit: cover; }
    .body { padding: 3.6rem 1.1rem 1.2rem; }
    h2 { margin: 0; font-size: 1.3rem; color: #fff; }
    .gh { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.875rem; color: var(--color-dc-muted); text-decoration: none; }
    .gh:hover { color: #fff; }
    h3 { margin: 1rem 0 0.35rem; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-dc-header); }
    p { margin: 0; font-size: 0.9rem; line-height: 1.5; color: var(--color-dc-text); }
    .roles { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0; padding: 0; list-style: none; }
    .roles li { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: #2e3035; font-size: 0.8rem; }
    .roles i { width: 0.65rem; height: 0.65rem; border-radius: 50%; }
    .small .banner { height: 4rem; }
    .small .avatar { top: 1.5rem; width: 4.5rem; height: 4.5rem; }
    .small .body { padding-top: 3rem; }
</style>
