<script lang="ts">
    import { fly } from 'svelte/transition';
    import { inview } from '$lib/actions/inview';
    import { links, platforms } from '$lib/data';
    import { reducedMotion, sleep } from '$lib/motion';
    import { spriteUri } from '$lib/pixel/uri';
    import { deepslate } from '$lib/pixel/sprites';
    import McButton from '$lib/mc/McButton.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import { bot, embedStyle } from '$lib/discord/types';
    import BrandIcon from '../BrandIcon.svelte';

    let platform = $state(platforms[0].id);
    const current = $derived(platforms.find(p => p.id === platform)!);

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

    const tile = spriteUri(deepslate);
</script>

<section id="setup" class="setup" style:--ground={tile} aria-labelledby="setup-title">
    <header class="section-head head">
        <p class="kicker mojang">Setup</p>
        <h2 id="setup-title" class="mc-text">Linked in three steps</h2>
        <p>No bot to host, no config files. Most people are done in about a minute.</p>
    </header>

    <!-- Steps 1 and 2 sit side by side, each in its own world. -->
    <div class="band pair">
        <div class="side mc">
            <div class="step mc-step">
                <span class="badge mc-text" aria-hidden="true">1</span>
                <h3 class="mc-text"><span class="sr-only">Step 1: </span>Install the Discord-Linker plugin</h3>
                <p>Pick your server software, download the file and drop it into your <code>{current.folder}</code> folder. Then restart the server.</p>
                <div class="tabs" role="tablist" aria-label="Server software">
                    {#each platforms as p (p.id)}
                        <button role="tab" type="button" aria-selected={platform === p.id} class="mc-text" onclick={() => (platform = p.id)}>{p.name}</button>
                    {/each}
                </div>
                <div class="panel" role="tabpanel">
                    <p class="versions mc-text">Minecraft {current.versions}{#if current.alsoWorksOn}<br /><span class="also">Also works on {current.alsoWorksOn}</span>{/if}</p>
                    <div class="downloads">
                        {#each current.downloads as d (d.name)}
                            <McButton href={d.href} external>
                                {#if d.brand}<BrandIcon brand={d.brand} size="1.1em" />{/if}
                                {d.name}
                            </McButton>
                        {/each}
                    </div>
                </div>
                <p class="more">Hybrid server or Aternos? See <a href="#download">all downloads</a>.</p>
            </div>
        </div>
        <div class="side dc">
            <div class="step">
                <span class="badge dc-badge" aria-hidden="true">2</span>
                <h3><span class="sr-only">Step 2: </span>Add MC Linker to your Discord server</h3>
                <p>Invite the bot to the server you want to link. You need the <em>Manage Server</em> permission there.</p>
                <a class="dc-btn" href={links.invite} target="_blank" rel="noopener"><BrandIcon brand="discord" size="1.25em" /> Add to Discord</a>
                <p class="alt">or find it in the <a href={links.appDirectory} target="_blank" rel="noopener">App Directory</a> and on <a href={links.socials.topgg} target="_blank" rel="noopener">Top.gg</a></p>
            </div>
        </div>
    </div>

    <!-- Step 3: both -->
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
                            ? { id: 2, author: bot, interaction: { user: 'you', avatar: { letter: 'Y', color: '#5865f2' }, command: '/connect' }, embeds: [{ ...embedStyle.success, title: 'Connected to Server', description: 'Successfully connected to the plugin.' }] }
                            : { id: 1, author: bot, interaction: { user: 'you', avatar: { letter: 'Y', color: '#5865f2' }, command: '/connect' }, embeds: [{ ...embedStyle.step, title: 'Server Verification', description: ':step: Install the Discord-Linker plugin on your Minecraft server.\nThen join your server as an operator and execute the following command: ```' + code + '```\n**You have 3 minutes to run the command.**' }] }} />
                    </div>
                {/key}
                </discord-messages>
            </DcWindow>
        </div>
    </div>
</section>

<style>
    .setup { position: relative; padding-bottom: clamp(3rem, 6vw, 5rem); background: var(--color-ink); }
    .head { padding-top: clamp(4rem, 9vw, 7rem); padding-bottom: 2.5rem; }

    .band { position: relative; display: grid; grid-template-columns: 1fr 1fr; }
    .band::before, .band::after { content: ''; grid-row: 1 / -1; z-index: 0; }
    .band::before {
        grid-column: 1;
        background: linear-gradient(rgb(6 6 8 / 0.6), rgb(6 6 8 / 0.6)), var(--ground) 0 0 / 64px 64px;
        image-rendering: pixelated;
        mask:
            linear-gradient(#000 0 0) left / calc(100% - 12px) 100% no-repeat,
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 8' width='12' height='32'%3E%3Cpath d='M0 0h3v2H2v2h1v1H1v3H0z'/%3E%3C/svg%3E") right top / 12px 32px repeat-y;
    }
    .band::after { grid-column: 2; margin-left: -12px; background: var(--color-dc-3); }
    .side { position: relative; z-index: 1; grid-row: 1; display: flex; padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 3.5rem); min-width: 0; }
    .side.mc { grid-column: 1; justify-content: flex-end; }
    .side.dc { grid-column: 2; justify-content: flex-start; }
    .badge {
        display: inline-grid; place-items: center; width: 2.5rem; height: 2.5rem; margin-bottom: 0.9rem;
        font-size: 1.4rem; font-weight: 400; color: #fff;
        background: var(--color-grass); border: 3px solid #000; box-shadow: inset -3px -3px 0 rgb(0 0 0 / 0.25), inset 3px 3px 0 rgb(255 255 255 / 0.25);
    }
    .badge.dc-badge { border: 0; border-radius: 50%; background: var(--color-dc-blurple); box-shadow: none; font-family: var(--font-sans); font-weight: 800; }
    .badge.both { border: 0; border-radius: 12px; background: linear-gradient(90deg, var(--color-grass) 50%, var(--color-dc-blurple) 50%); box-shadow: none; font-family: var(--font-sans); font-weight: 800; }

    .step { max-width: 28rem; }
    h3 { margin: 0 0 0.5rem; font-size: clamp(1.4rem, 2.6vw, 1.85rem); line-height: 1.2; color: #fff; }
    .mc-step h3 { font-weight: 400; }
    .step p { margin: 0 0 1rem; color: #ced4da; line-height: 1.55; }
    .step em { font-style: normal; color: #fff; font-weight: 600; }
    .step code, .intro code { padding: 0.05em 0.35em; border-radius: 5px; background: rgb(255 255 255 / 0.1); font-size: 0.9em; }
    .alt { font-size: 0.875rem; color: #adb5bd !important; margin-top: 0.75rem !important; }
    .alt a { color: #c9cdfb; }
    .dc-btn {
        display: inline-flex; align-items: center; gap: 0.6rem; min-height: 3rem; padding: 0 1.5rem; border-radius: 8px;
        background: var(--color-dc-blurple); color: #fff; font-weight: 700; text-decoration: none;
    }
    .dc-btn:hover { background: var(--color-dc-blurple-dark); }

    .tabs { display: flex; flex-wrap: wrap; gap: 0.25rem; }
    .tabs button {
        padding: 0.45rem 0.75rem; border: 2px solid #000; background: #3a3a3a; color: #ccc; font-size: 0.95rem; cursor: pointer;
        box-shadow: inset 0 2px 0 rgb(255 255 255 / 0.12);
    }
    .tabs button[aria-selected='true'] { background: var(--color-mc-ui); color: #3f3f3f; text-shadow: none; box-shadow: inset 0 2px 0 #fff; }
    .panel { margin-top: -2px; padding: 1rem; border: 2px solid #000; background: rgb(0 0 0 / 0.45); box-shadow: inset 0 0 0 2px rgb(255 255 255 / 0.08); }
    .versions { margin: 0 0 0.8rem !important; color: #fff !important; }
    .also { font-size: 0.85rem; color: #bbb; }
    .downloads { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .step .more { margin: 0.9rem 0 0; font-size: 0.85rem; color: #adb5bd; }
    .more a { color: var(--color-grass-light); }

    .band.last { grid-template-rows: auto 1fr; }
    .band.last .intro { grid-column: 1 / -1; grid-row: 1; position: relative; z-index: 1; justify-self: center; width: min(36rem, calc(100% - 2rem)); margin-top: clamp(2.5rem, 5vw, 3.5rem); padding: 1.4rem 1.6rem; border-radius: 16px; background: rgb(13 16 20 / 0.92); box-shadow: 0 0 0 2px rgb(255 255 255 / 0.07); text-align: center; }
    .intro h3 { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; }
    .intro p { margin: 0; color: #ced4da; }
    .band.last .side { grid-row: 2; align-items: flex-start; }
    .band.last .side > :global(*) { width: 100%; max-width: 30rem; }
    .console { display: flex; flex-direction: column; gap: 0.4rem; min-height: 9rem; justify-content: flex-end; padding: 1rem; background: rgb(0 0 0 / 0.35); border: 3px solid #000; }
    .fake-input { padding: 0.3rem 0.5rem; background: rgb(0 0 0 / 0.6); color: #fff; min-height: 1.9rem; }
    .caret { display: inline-block; width: 0.5em; height: 2px; margin-left: 2px; background: #fff; animation: caret 1s steps(1) infinite; }
    @keyframes caret { 50% { opacity: 0; } }

    @media (max-width: 860px) {
        .band { grid-template-columns: 1fr; }
        .band::before, .band::after { display: none; }
        .side { grid-column: 1 !important; grid-row: auto !important; justify-content: stretch !important; }
        .side.mc { background: linear-gradient(rgb(6 6 8 / 0.6), rgb(6 6 8 / 0.6)), var(--ground) 0 0 / 64px 64px; }
        .side.dc { background: var(--color-dc-3); }
        .band.last .side { grid-row: auto !important; }
        .step, .band.last .side > :global(*) { max-width: none; }
        .band.last .intro { margin-bottom: 1.5rem; }
    }
</style>
