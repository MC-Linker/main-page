<script lang="ts">
    import { fly } from 'svelte/transition';
    import { inview } from '$lib/actions/inview';
    import { links, platforms, platformNotes } from '$lib/data';
    import { reducedMotion, sleep } from '$lib/motion';
    import { spriteUri } from '$lib/pixel/uri';
    import { deepslate } from '$lib/pixel/sprites';
    import type { Sprite } from '$lib/pixel/sprites';
    import { craftingTable, enchantedBook, letter, painting } from '$lib/pixel/items';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import McButton from '$lib/mc/McButton.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import { bot, embedStyle } from '$lib/discord/types';
    import BrandIcon from '../BrandIcon.svelte';

    /** The three steps, in the same order as the guide's quick start. */

    // Step 1: the message the bot posts when it joins a server (from the bot's language file, shortened).
    const welcome = {
        id: 1,
        author: bot,
        embeds: [{
            color: '#202225',
            title: 'Thanks for inviting MC Linker!',
            description: 'To get started, please connect your Minecraft server to the bot:\n\n'
                + '• Install the **Discord-Linker** plugin from [SpigotMC](https://www.spigotmc.org/resources/discord-linker.98749/), [Modrinth](https://modrinth.com/plugin/discord-linker) or from the [Aternos Plugin List](https://aternos.org/addons/a/spigot/98749) to your Minecraft server.\n'
                + '• Execute </connect> in Discord.\n'
                + '• Run the command from the embed in Minecraft.\n\n'
                + '**That\'s it!**',
        }],
    };

    // Step 2: picking the server software, like the game's server list.
    const icons: Record<string, Sprite> = { paper: letter, fabric: painting, neoforge: enchantedBook, forge: craftingTable };
    let platform = $state(platforms[0].id);
    const current = $derived(platforms.find(p => p.id === platform)!);

    function listKeys(e: KeyboardEvent) {
        const i = platforms.findIndex(p => p.id === platform);
        if(e.key === 'ArrowDown') { e.preventDefault(); platform = platforms[(i + 1) % platforms.length].id; }
        if(e.key === 'ArrowUp') { e.preventDefault(); platform = platforms[(i - 1 + platforms.length) % platforms.length].id; }
    }

    // Step 3: /connect, played once when it scrolls into view.
    let connected = $state(false);
    let typed = $state('');
    let started = false;
    const code = '/linker connect 803412896432:a8f3c';

    async function connect() {
        if(started) return;
        started = true;
        if(reducedMotion.current) { connected = true; return; }
        await sleep(900);
        for(const ch of code) { typed += ch; await sleep(40); }
        await sleep(400);
        typed = '';
        connected = true;
    }

    const you = { user: 'you', avatar: { letter: 'Y', color: '#5865f2' }, command: '/connect' };
    const tile = spriteUri(deepslate);
</script>

<section id="setup" class="setup" style:--ground={tile} aria-labelledby="setup-title">
    <header class="section-head head">
        <p class="kicker mojang">Setup</p>
        <h2 id="setup-title" class="mc-text">Linked in three steps</h2>
        <p>No bot to host, no config files. Most people are done in about a minute.</p>
    </header>

    <!-- Step 1, in Discord -->
    <div class="band discord">
        <div class="copy">
            <span class="badge dc-badge" aria-hidden="true">1</span>
            <h3><span class="sr-only">Step 1: </span>Add MC Linker to your Discord server</h3>
            <p>Invite the bot to the server you want to link. You need the <em>Manage Server</em> permission there.</p>
            <a class="dc-btn" href={links.invite} target="_blank" rel="noopener"><BrandIcon brand="discord" size="1.25em" /> Add to Discord</a>
            <p class="alt">or find it in the <a href={links.appDirectory} target="_blank" rel="noopener">App Directory</a> and on <a href={links.socials.topgg} target="_blank" rel="noopener">Top.gg</a></p>
        </div>
        <div class="visual">
            <p class="caption">MC Linker says hi when it joins:</p>
            <DcWindow channel="general">
                <discord-messages no-background><DcMessage msg={welcome} /></discord-messages>
            </DcWindow>
        </div>
    </div>

    <!-- Step 2, in Minecraft: the server list screen -->
    <div id="install" class="band minecraft">
        <div class="copy centred">
            <span class="badge mc-badge mc-text" aria-hidden="true">2</span>
            <h3 class="mc-text"><span class="sr-only">Step 2: </span>Install the Discord-Linker plugin</h3>
            <p>Pick your server software, download the file and drop it into your <code>{current.folder}</code> folder. Then restart the server.</p>
        </div>

        <p class="screen-title mc-text" id="software-title">Select your server software</p>
        <div class="screen">
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <ul class="list" role="listbox" aria-labelledby="software-title" tabindex="0" onkeydown={listKeys}>
                {#each platforms as p (p.id)}
                    <li role="option" aria-selected={platform === p.id} class:selected={platform === p.id}>
                        <button type="button" onclick={() => (platform = p.id)} tabindex="-1">
                            <span class="icon"><PixelArt sprite={icons[p.id]} width="100%" /></span>
                            <span class="info">
                                <span class="name mc-text">{p.name}</span>
                                <span class="motd mc-text">Minecraft {p.versions} · goes in <span class="folder">{p.folder}/</span></span>
                                {#if p.alsoWorksOn}<span class="motd mc-text dim">Also: {p.alsoWorksOn}</span>{/if}
                            </span>
                            <span class="ping" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
                        </button>
                    </li>
                {/each}
            </ul>
        </div>

        <div class="downloads">
            <p class="get mc-text">Download for {current.name}</p>
            <div class="buttons">
                {#each current.downloads as d (d.name)}
                    <McButton href={d.href} external color={d.color} badge={d.recommended ? 'Recommended' : undefined}>
                        {#if d.brand}<BrandIcon brand={d.brand} size="1em" />{/if}{d.name}
                    </McButton>
                {/each}
            </div>
            <ul class="notes mc-text">{#each platformNotes as n (n)}<li>{n}</li>{/each}</ul>
        </div>
    </div>

    <!-- Step 3, in both -->
    <div class="band last" use:inview={{ once: true, threshold: 0.35, onchange: v => v && connect() }}>
        <div class="intro">
            <span class="badge both" aria-hidden="true">3</span>
            <h3><span class="sr-only">Step 3: </span>Run <code>/connect</code>, paste the code</h3>
            <p>Discord gives you a code. Run it on your server as an operator and the two are linked. That's it.</p>
        </div>
        <div class="side mc">
            <div class="console" aria-label="Minecraft chat">
                <McChat lines={connected
                    ? [{ id: 1, text: '&eAttempting to connect to the Discord bot...' }, { id: 2, text: '&aSuccessfully connected to Discord!' }]
                    : []} />
                <div class="fake-input mc-text">{typed || ' '}{#if typed}<i class="caret"></i>{/if}</div>
            </div>
        </div>
        <div class="side dc">
            <DcWindow channel="general">
                <discord-messages no-background>
                    {#key connected}
                        <div in:fly={{ y: 8, duration: 200 }}>
                            <DcMessage msg={connected
                                ? { id: 2, author: bot, interaction: you, embeds: [{ ...embedStyle.success, title: 'Connected to Server', description: 'Successfully connected to the plugin.' }] }
                                : { id: 1, author: bot, interaction: you, embeds: [{ ...embedStyle.step, title: 'Server Verification', description: ':step: Install the Discord-Linker plugin on your Minecraft server.\nThen join your server as an operator and execute the following command: ```' + code + '```\n**You have 3 minutes to run the command.**' }] }} />
                        </div>
                    {/key}
                </discord-messages>
            </DcWindow>
        </div>
    </div>
</section>

<style>
    .setup { position: relative; background: var(--color-ink); }
    .head { padding-top: clamp(4rem, 9vw, 7rem); padding-bottom: 2.5rem; }

    .badge {
        display: inline-grid; place-items: center; width: 2.5rem; height: 2.5rem; margin-bottom: 0.9rem;
        font-size: 1.4rem; font-weight: 400; color: #fff;
    }
    .mc-badge { background: var(--color-grass); border: 3px solid #000; box-shadow: inset -3px -3px 0 rgb(0 0 0 / 0.25), inset 3px 3px 0 rgb(255 255 255 / 0.25); }
    .dc-badge { border-radius: 50%; background: var(--color-dc-blurple); font-family: var(--font-sans); font-weight: 800; }
    .badge.both { border-radius: 12px; background: linear-gradient(90deg, var(--color-grass) 50%, var(--color-dc-blurple) 50%); font-family: var(--font-sans); font-weight: 800; }
    h3 { margin: 0 0 0.5rem; font-size: clamp(1.4rem, 2.6vw, 1.85rem); line-height: 1.2; color: #fff; }
    h3.mc-text { font-weight: 400; }
    .copy p { margin: 0 0 1rem; color: #ced4da; line-height: 1.55; }
    .copy em { font-style: normal; color: #fff; font-weight: 600; }
    code { padding: 0.05em 0.35em; border-radius: 5px; background: rgb(255 255 255 / 0.1); font-size: 0.9em; }

    /* ── Step 1: Discord ───────────────────────────────────────────────── */
    .band.discord {
        display: grid;
        grid-template-columns: minmax(0, 26rem) minmax(0, 32rem);
        justify-content: center;
        align-items: center;
        gap: clamp(2rem, 5vw, 4.5rem);
        padding: clamp(3rem, 6vw, 4.5rem) clamp(1rem, 4vw, 3rem);
        background: radial-gradient(50rem 24rem at 80% 10%, rgb(88 101 242 / 0.18), transparent 60%), var(--color-dc-3);
    }
    .dc-btn {
        display: inline-flex; align-items: center; gap: 0.6rem; min-height: 3rem; padding: 0 1.5rem; border-radius: 8px;
        background: var(--color-dc-blurple); color: #fff; font-weight: 700; text-decoration: none;
    }
    .dc-btn:hover { background: var(--color-dc-blurple-dark); }
    .alt { margin-top: 0.75rem !important; font-size: 0.875rem; color: #adb5bd !important; }
    .alt a { color: #c9cdfb; }
    .caption { margin: 0 0 0.5rem; font-size: 0.85rem; color: var(--color-dc-muted); }

    /* ── Step 2: Minecraft's server list ───────────────────────────────── */
    .band.minecraft {
        padding: clamp(3rem, 6vw, 4.5rem) 1rem;
        background: linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.55)), var(--dirt) 0 0 / 64px 64px;
        image-rendering: pixelated;
    }
    .band.minecraft :global(img), .band.minecraft :global(svg) { image-rendering: auto; }
    .copy.centred { max-width: 36rem; margin: 0 auto; text-align: center; }
    .screen-title { margin: 1.5rem 0 0.75rem; text-align: center; font-size: 1.1rem; color: #fff; }
    /* The darker band the list sits in, like the game's multiplayer screen. */
    .screen { margin: 0 -1rem; padding: 0.75rem 1rem; background: rgb(0 0 0 / 0.55); border-block: 2px solid #000; box-shadow: inset 0 2px 0 rgb(255 255 255 / 0.06); }
    .list { max-width: 42rem; margin: 0 auto; padding: 0; list-style: none; }
    .list:focus-visible { outline: 2px solid var(--color-mc-yellow); }
    .list button {
        display: flex; align-items: center; gap: 0.9rem; width: 100%; padding: 0.4rem; border: 2px solid transparent;
        background: none; color: inherit; text-align: left; cursor: pointer; font: inherit;
    }
    .list li.selected button { border-color: #fff; background: rgb(0 0 0 / 0.5); }
    .list button:hover { background: rgb(255 255 255 / 0.06); }
    .icon { width: 3.5rem; height: 3.5rem; flex: none; padding: 0.4rem; background: rgb(255 255 255 / 0.08); }
    .info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .name { font-size: 1.1rem; color: #fff; }
    .motd { font-size: 0.9rem; color: #aaa; }
    .motd.dim { color: #777; }
    .folder { color: var(--color-mc-yellow); }
    .ping { display: inline-flex; align-items: flex-end; gap: 2px; height: 0.9rem; align-self: flex-start; margin-top: 0.3rem; }
    .ping i { width: 3px; background: #55ff55; box-shadow: 1px 1px 0 #153f15; }
    .ping i:nth-child(1) { height: 20%; } .ping i:nth-child(2) { height: 40%; } .ping i:nth-child(3) { height: 60%; } .ping i:nth-child(4) { height: 80%; } .ping i:nth-child(5) { height: 100%; }
    .downloads { max-width: 42rem; margin: 1.5rem auto 0; }
    .get { margin: 0 0 0.9rem; font-size: 0.95rem; color: #ddd; }
    .buttons { display: flex; flex-wrap: wrap; gap: 0.9rem 0.5rem; }
    .buttons > :global(*) { flex: 1 1 9rem; }
    .notes { margin: 1rem 0 0; padding-left: 1.2rem; font-size: 0.85rem; color: #aaa; }

    /* ── Step 3: both worlds ───────────────────────────────────────────── */
    .band.last { position: relative; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto 1fr; padding-bottom: clamp(3rem, 6vw, 5rem); }
    .band.last::before, .band.last::after { content: ''; grid-row: 1 / -1; z-index: 0; margin-bottom: calc(-1 * clamp(3rem, 6vw, 5rem)); }
    .band.last::before {
        grid-column: 1;
        background: linear-gradient(rgb(6 6 8 / 0.6), rgb(6 6 8 / 0.6)), var(--ground) 0 0 / 64px 64px;
        image-rendering: pixelated;
        mask:
            linear-gradient(#000 0 0) left / calc(100% - 12px) 100% no-repeat,
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 8' width='12' height='32'%3E%3Cpath d='M0 0h3v2H2v2h1v1H1v3H0z'/%3E%3C/svg%3E") right top / 12px 32px repeat-y;
    }
    .band.last::after { grid-column: 2; margin-left: -12px; background: var(--color-dc-3); }
    .intro {
        grid-column: 1 / -1; grid-row: 1; position: relative; z-index: 1; justify-self: center;
        width: min(36rem, calc(100% - 2rem)); margin-top: clamp(2.5rem, 5vw, 3.5rem); padding: 1.4rem 1.6rem;
        border-radius: 16px; background: rgb(13 16 20 / 0.92); box-shadow: 0 0 0 2px rgb(255 255 255 / 0.07); text-align: center;
    }
    .intro h3 code { white-space: nowrap; }
    .intro p { margin: 0; color: #ced4da; }
    .side { position: relative; z-index: 1; grid-row: 2; display: flex; align-items: flex-start; padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 3.5rem) 0; min-width: 0; }
    .side > :global(*) { width: 100%; max-width: 30rem; }
    .side.mc { grid-column: 1; justify-content: flex-end; }
    .side.dc { grid-column: 2; justify-content: flex-start; }
    .console { display: flex; flex-direction: column; gap: 0.4rem; min-height: 9rem; justify-content: flex-end; padding: 1rem; background: rgb(0 0 0 / 0.35); border: 3px solid #000; }
    .fake-input { padding: 0.3rem 0.5rem; background: rgb(0 0 0 / 0.6); color: #fff; min-height: 1.9rem; overflow-wrap: anywhere; }
    .caret { display: inline-block; width: 0.5em; height: 2px; margin-left: 2px; background: #fff; animation: caret 1s steps(1) infinite; }
    @keyframes caret { 50% { opacity: 0; } }

    @media (max-width: 860px) {
        .band.discord { grid-template-columns: minmax(0, 32rem); }
        .band.last { grid-template-columns: 1fr; grid-template-rows: auto auto auto; padding-bottom: 0; }
        .band.last::before, .band.last::after { display: none; }
        .intro { margin-bottom: 1.5rem; }
        /* On phones the Discord reply comes first, then you paste the code in Minecraft. */
        .side { grid-column: 1 !important; justify-content: stretch !important; padding: 1.5rem 1rem; }
        .side > :global(*) { max-width: none; }
        .side.dc { grid-row: 2; background: var(--color-dc-3); }
        .side.mc { grid-row: 3; padding-bottom: 2.5rem; background: linear-gradient(rgb(6 6 8 / 0.6), rgb(6 6 8 / 0.6)), var(--ground) 0 0 / 64px 64px; image-rendering: pixelated; }
    }
    @media (max-width: 520px) {
        .list button { gap: 0.6rem; padding: 0.35rem; }
        .icon { width: 2.6rem; height: 2.6rem; padding: 0.3rem; }
        .name { font-size: 1rem; }
        .motd { font-size: 0.8rem; }
        .buttons > :global(*) { flex-basis: calc(50% - 0.25rem); }
    }
</style>
