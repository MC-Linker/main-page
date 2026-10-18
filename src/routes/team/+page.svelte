<script lang="ts">
    import { fade } from 'svelte/transition';
    import { team, type Member } from '$lib/data';
    import McWorld from '$lib/mc/McWorld.svelte';
    import BrandIcon from '$lib/components/BrandIcon.svelte';

    /**
     * The team as Minecraft's player list (the Tab screen) on the Minecraft side.
     * Picking a player opens their Discord profile on the Discord side.
     */
    let selected = $state<Member>(team.core[0]);
    let profile = $state<HTMLElement>();

    function pick(m: Member) {
        selected = m;
        // On phones the profile sits below the list: bring it into view.
        if(window.matchMedia('(max-width: 760px)').matches) setTimeout(() => profile?.scrollIntoView({ block: 'center' }), 50);
    }

    // Role prefixes in the player list, coloured like a server's rank tags.
    const rankColor: Record<string, string> = {
        'Team Lead': '#ffaa00',
        Developer: '#55ff55',
        Marketing: '#ff55ff',
        Designer: '#55ffff',
        DevOps: '#5555ff',
        Donator: '#ffff55',
        Supporter: '#aaaaaa',
    };
</script>

<svelte:head>
    <title>The team · MC Linker</title>
    <meta name="description" content="The people who build MC Linker." />
</svelte:head>

{#snippet row(m: Member)}
    <li>
        <button type="button" class="player" class:selected={selected === m} aria-pressed={selected === m} onclick={() => pick(m)}>
            <img class="head" src="/profiles/{m.username}.png" alt="" width="24" height="24" />
            <span class="pname mc-text"><span style:color={rankColor[m.roles[0]] ?? '#fff'}>[{m.roles[0]}]</span> {m.username}</span>
            <span class="ping" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        </button>
    </li>
{/snippet}

<section class="team" aria-labelledby="team-title">
    <McWorld class="mc-bg" tile={30} />
    <div class="dc-bg" aria-hidden="true"></div>

    <h1 id="team-title" class="title">
        <span class="mc-logo left">Meet the</span>
        <img src="/logo.svg" alt="" width="96" height="96" class="logo" />
        <span class="right">team.</span>
    </h1>
    <p class="lead">A small crew who like Minecraft, Discord and building things that link the two.</p>

    <div class="mc-side">
        <div class="tablist" role="group" aria-label="Team members">
            <p class="list-head mc-text">MC Linker Team</p>
            <ul>{#each team.core as m (m.username)}{@render row(m)}{/each}</ul>
            <p class="list-head small mc-text">Special thanks</p>
            <ul>{#each team.specialThanks as m (m.username)}{@render row(m)}{/each}</ul>
            <p class="list-foot mc-text">Click a player to see their profile</p>
        </div>
    </div>

    <div class="dc-side" bind:this={profile}>
        {#key selected.username}
            <article class="profile" in:fade={{ duration: 160 }} aria-live="polite">
                <div class="banner" style:background={selected.color}></div>
                <div class="avatar-wrap">
                    <img class="avatar" src="/profiles/{selected.username}.png" alt="" width="88" height="88" />
                    <span class="status" aria-label="Online"></span>
                </div>
                <div class="body">
                    <h2>{selected.username}</h2>
                    {#if selected.github}
                        <a class="gh" href="https://github.com/{selected.github}" target="_blank" rel="noopener"><BrandIcon brand="github" size="0.95em" /> {selected.github}</a>
                    {/if}
                    <div class="box">
                        {#if selected.about}
                            <h3>About me</h3>
                            <p>{selected.about}</p>
                        {/if}
                        <h3>Roles</h3>
                        <ul class="roles">
                            {#each selected.roles as r (r)}<li><i style:background={rankColor[r] ?? selected.color}></i>{r}</li>{/each}
                        </ul>
                    </div>
                </div>
            </article>
        {/key}
    </div>
</section>

<style>
    .team {
        --logo: clamp(4rem, 7vw, 6rem);
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto 1fr;
        min-height: max(100svh, 44rem);
        padding: clamp(2.5rem, 7vh, 5rem) 0 calc(var(--hud-space) + 2rem);
        isolation: isolate;
        overflow: hidden;
    }
    .team :global(.mc-bg) {
        position: absolute;
        inset: 0 50% 0 0;
        z-index: -1;
        mask:
            linear-gradient(#000 0 0) left / calc(100% - 12px) 100% no-repeat,
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 8' width='12' height='32'%3E%3Cpath d='M0 0h3v2H2v2h1v1H1v3H0z'/%3E%3C/svg%3E") right top / 12px 32px repeat-y;
    }
    .dc-bg {
        position: absolute;
        inset: 0 0 0 calc(50% - 12px);
        z-index: -2;
        background: radial-gradient(50rem 26rem at 80% 0%, rgb(88 101 242 / 0.22), transparent 60%), var(--color-dc-3);
    }

    .title {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        margin: 0;
        font-weight: 400;
        font-size: clamp(2.2rem, 5.5vw, 4.5rem);
        line-height: 1;
        color: #fff;
    }
    .left { justify-self: end; padding-right: 1rem; font-size: 0.85em; --mc-shadow: 0.07em; }
    .right { justify-self: start; padding-left: 1rem; font-family: var(--font-sans); font-weight: 800; letter-spacing: -0.03em; }
    .logo { width: var(--logo); height: auto; filter: drop-shadow(0 5px 0 rgb(0 0 0 / 0.35)); animation: bob 4s ease-in-out infinite; }
    @keyframes bob { 50% { transform: translateY(-5px); } }
    .lead {
        grid-column: 1 / -1;
        justify-self: center;
        margin: 1.25rem 1rem 0;
        padding: 0.5rem 1rem;
        border-radius: 10px;
        background: rgb(13 16 20 / 0.7);
        text-align: center;
        color: #e9ecef;
    }

    .mc-side, .dc-side { grid-row: 3; display: flex; align-items: flex-start; padding: clamp(2rem, 5vh, 3.5rem) clamp(1rem, 4vw, 3.5rem) 0; min-width: 0; }
    .mc-side { grid-column: 1; justify-content: flex-end; }
    .dc-side { grid-column: 2; justify-content: flex-start; }

    /* ── Minecraft's player list ───────────────────────────────────────── */
    .tablist { width: min(100%, 27rem); padding: 0.5rem; background: rgb(0 0 0 / 0.5); }
    .tablist ul { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
    .list-head { margin: 0.2rem 0 0.5rem; text-align: center; color: #ffff55; font-size: 1.05rem; }
    .list-head.small { margin-top: 0.9rem; color: #aaa; font-size: 0.9rem; }
    .list-foot { margin: 0.7rem 0 0.1rem; text-align: center; color: #aaa; font-size: 0.85rem; }
    .player {
        display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.15rem 0.35rem 0.15rem 0.15rem;
        border: 0; background: rgb(255 255 255 / 0.13); color: #fff; font: inherit; text-align: left; cursor: pointer;
    }
    .player:hover { background: rgb(255 255 255 / 0.22); }
    .player.selected { outline: 2px solid #fff; outline-offset: -2px; background: rgb(255 255 255 / 0.25); }
    .head { width: 1.5rem; height: 1.5rem; object-fit: cover; image-rendering: auto; }
    .pname { flex: 1; min-width: 0; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ping { display: inline-flex; align-items: flex-end; gap: 1px; height: 0.8rem; }
    .ping i { width: 3px; background: #55ff55; box-shadow: 1px 1px 0 #153f15; }
    .ping i:nth-child(1) { height: 20%; } .ping i:nth-child(2) { height: 40%; } .ping i:nth-child(3) { height: 60%; } .ping i:nth-child(4) { height: 80%; } .ping i:nth-child(5) { height: 100%; }

    /* ── Discord profile ───────────────────────────────────────────────── */
    .profile {
        position: relative; width: min(100%, 24rem); min-height: 25rem; border-radius: 10px; overflow: hidden;
        background: #232428; box-shadow: 0 0 0 1px rgb(255 255 255 / 0.05), 0 16px 36px rgb(0 0 0 / 0.35);
        font-family: var(--font-discord); color: var(--color-dc-text);
    }
    .banner { height: 6rem; }
    .avatar-wrap { position: absolute; top: 2.6rem; left: 1rem; }
    .avatar { display: block; width: 5.75rem; height: 5.75rem; border-radius: 50%; border: 6px solid #232428; background: #232428; object-fit: cover; }
    .status { position: absolute; right: 0.25rem; bottom: 0.25rem; width: 1.3rem; height: 1.3rem; border-radius: 50%; background: #23a55a; border: 5px solid #232428; }
    .body { padding: 3.9rem 1rem 1.1rem; }
    h2 { margin: 0; font-size: 1.35rem; font-weight: 700; color: #fff; }
    .gh { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.875rem; color: var(--color-dc-muted); text-decoration: none; }
    .gh:hover { color: #fff; }
    .box { margin-top: 0.9rem; padding: 0.75rem; border-radius: 8px; background: #111214; }
    h3 { margin: 0 0 0.35rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-dc-header); }
    h3:not(:first-child) { margin-top: 0.9rem; }
    p { margin: 0; font-size: 0.9rem; line-height: 1.5; }
    .roles { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0; padding: 0; list-style: none; }
    .roles li { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: #2e3035; font-size: 0.8rem; }
    .roles i { width: 0.65rem; height: 0.65rem; border-radius: 50%; }

    /* Phones: Minecraft on top, Discord below. */
    @media (max-width: 760px) {
        .team { grid-template-columns: 1fr; grid-template-rows: auto auto auto auto; min-height: 0; padding-top: 0; }
        .team :global(.mc-bg) { position: relative; inset: auto; grid-column: 1; grid-row: 1 / 4; mask: none; }
        .dc-bg { position: relative; inset: auto; grid-column: 1; grid-row: 4; margin-bottom: calc(-1 * (var(--hud-space) + 2rem)); }
        .title { grid-row: 1; grid-template-columns: 1fr; justify-items: center; gap: 0.6rem; padding-top: 2.5rem; }
        .left, .right { justify-self: center; padding: 0; }
        .lead { grid-row: 2; }
        .mc-side { grid-row: 3; grid-column: 1; justify-content: center; padding-bottom: 2rem; }
        .dc-side { grid-row: 4; grid-column: 1; justify-content: center; padding-top: 2rem; }
    }
</style>
