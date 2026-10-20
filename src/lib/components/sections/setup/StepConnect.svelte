<script lang="ts">
    import { fly } from 'svelte/transition';
    import { inview } from '$lib/actions/inview';
    import { reducedMotion, sleep } from '$lib/browser';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import { bot, type DcMsg, embedStyle, visitor } from '$lib/discord/types';
    import McChat from '$lib/mc/McChat.svelte';
    import StepHeading from './StepHeading.svelte';

    // /connect, played once when the step scrolls into view: Discord shows a code,
    // it gets typed into Minecraft, and both sides say they're linked.
    const code = '/linker connect 803412896432:a8f3c';
    const you = { user: visitor.name, avatar: visitor.avatar, command: '/connect' };

    let connected = $state(false);
    let typed = $state('');
    let started = false;

    async function connect() {
        if(started) return;
        started = true;
        if(reducedMotion.current) {
            connected = true;
            return;
        }
        await sleep(900);
        for(const ch of code) {
            typed += ch;
            await sleep(40);
        }
        await sleep(400);
        typed = '';
        connected = true;
    }

    const verification: DcMsg = {
        id: 1, author: bot, interaction: you,
        embeds: [{ ...embedStyle.step, title: 'Server Verification', description: ':step: Install the Discord-Linker plugin on your Minecraft server.\nThen join your server as an operator and execute the following command: ```' + code + '```\n**You have 3 minutes to run the command.**' }],
    };
    const linked: DcMsg = {
        id: 2, author: bot, interaction: you,
        embeds: [{ ...embedStyle.success, title: 'Connected to Server', description: 'Successfully connected to the plugin.' }],
    };
    const mcLines = [
        { id: 1, text: '&eAttempting to connect to the Discord bot...' },
        { id: 2, text: '&aSuccessfully connected to Discord!' },
    ];
</script>

<!-- Step 3 happens in both worlds. -->
<div class="band" use:inview={{ once: true, threshold: 0.35, onchange: v => v && connect() }}>
    <div class="intro">
        <StepHeading step={3} world="both">Run <code>/connect</code>, paste the code</StepHeading>
        <p>Discord gives you a code. Run it on your server as an operator and the two are linked. That's it.</p>
    </div>
    <div class="side mc">
        <div class="console" aria-label="Minecraft chat">
            <McChat lines={connected ? mcLines : []} />
            <div class="fake-input mc-text">{typed || ' '}{#if typed}<i class="caret"></i>{/if}</div>
        </div>
    </div>
    <div class="side dc">
        <DcWindow channel="general">
            <discord-messages no-background>
                {#key connected}
                    <div in:fly={{ y: 8, duration: 200 }}>
                        <DcMessage msg={connected ? linked : verification} />
                    </div>
                {/key}
            </discord-messages>
        </DcWindow>
    </div>
</div>

<style>
    /* Minecraft on the left, Discord on the right, the step's intro across the seam. */
    .band { position: relative; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto 1fr; padding-bottom: clamp(3rem, 6vw, 5rem); }
    .band::before, .band::after { content: ''; grid-row: 1 / -1; z-index: 0; margin-bottom: calc(-1 * clamp(3rem, 6vw, 5rem)); }
    .band::before {
        grid-column: 1;
        background: linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.55)), var(--tex-dirt) 0 0 / 64px 64px;
        image-rendering: pixelated;
        mask: var(--seam-mask);
    }
    .band::after { grid-column: 2; margin-left: calc(-1 * var(--seam-width)); background: var(--color-dc-3); }
    .intro {
        grid-column: 1 / -1; grid-row: 1; position: relative; z-index: 1; justify-self: center;
        width: min(36rem, calc(100% - 2rem)); margin-top: clamp(2.5rem, 5vw, 3.5rem); padding: 1.4rem 1.6rem;
        border-radius: 16px; background: rgb(13 16 20 / 0.92); box-shadow: 0 0 0 2px rgb(255 255 255 / 0.07); text-align: center;
    }
    .intro p { margin: 0; color: #ced4da; }
    code { padding: 0.05em 0.35em; border-radius: 5px; background: rgb(255 255 255 / 0.1); font-size: 0.9em; white-space: nowrap; }
    .side { position: relative; z-index: 1; grid-row: 2; display: flex; align-items: flex-start; padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 3.5rem) 0; min-width: 0; }
    .side > :global(*) { width: 100%; max-width: 30rem; }
    .side.mc { grid-column: 1; justify-content: flex-end; }
    .side.dc { grid-column: 2; justify-content: flex-start; }
    .console { display: flex; flex-direction: column; gap: 0.4rem; min-height: 9rem; justify-content: flex-end; padding: 1rem; background: rgb(0 0 0 / 0.35); border: 3px solid #000; }
    .fake-input { padding: 0.3rem 0.5rem; background: rgb(0 0 0 / 0.6); color: #fff; min-height: 1.9rem; overflow-wrap: anywhere; }
    .caret { display: inline-block; width: 0.5em; height: 2px; margin-left: 2px; background: #fff; animation: caret 1s steps(1) infinite; }
    @keyframes caret { 50% { opacity: 0; } }

    @media (max-width: 860px) {
        .band { grid-template-columns: 1fr; grid-template-rows: auto auto auto; padding-bottom: 0; }
        .band::before, .band::after { display: none; }
        .intro { margin-bottom: 1.5rem; }
        /* On phones the Discord reply comes first, then you paste the code in Minecraft. */
        .side { padding: 1.5rem 1rem; }
        .side.mc, .side.dc { grid-column: 1; justify-content: stretch; }
        .side > :global(*) { max-width: none; }
        .side.dc { grid-row: 2; background: var(--color-dc-3); }
        .side.mc { grid-row: 3; padding-bottom: 2.5rem; background: linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.55)), var(--tex-dirt) 0 0 / 64px 64px; image-rendering: pixelated; }
    }
</style>
