<script lang="ts">
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { reducedMotion, sleep } from '$lib/browser';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import { bot, type DcMsg, embedStyle, visitor } from '$lib/discord/types';
    import McChat from '$lib/mc/McChat.svelte';
    import StepHeading from './StepHeading.svelte';

    // /connect on a loop while the step is on screen: Discord shows a code, it gets typed into
    // Minecraft, both sides say they're linked, and after a while the link is dropped and it starts over.
    const code = '/linker connect 803412896432:a8f3c';
    const you = { user: visitor.name, avatar: visitor.avatar, command: '/connect' };

    type Phase = 'waiting' | 'linked' | 'disconnected';
    let phase = $state<Phase>('waiting');
    let typed = $state('');
    let dcSide = $state<HTMLElement>();
    let mcSide = $state<HTMLElement>();

    /** Bumped to cancel a running loop. */
    let run = 0;

    async function play() {
        const id = ++run;
        // Sleeps for `ms` and tells the loop whether it was cancelled meanwhile.
        const wait = async (ms: number) => {
            await sleep(ms);
            return id === run;
        };
        phase = 'waiting';
        typed = '';
        if(reducedMotion.current) {
            phase = 'linked';
            return;
        }
        while(id === run) {
            if(!await wait(900)) return;
            for(const ch of code) {
                typed += ch;
                if(!await wait(40)) return;
            }
            if(!await wait(400)) return;
            typed = '';
            phase = 'linked';
            if(!await wait(6000)) return;
            phase = 'disconnected';
            if(!await wait(3500)) return;
            phase = 'waiting';
            if(!await wait(600)) return;
        }
    }

    // It only plays while both halves are completely on screen (above the hotbar), and stops once the step is gone.
    onMount(() => {
        const ratios = new Map<Element, number>();
        let playing = false;
        const io = new IntersectionObserver(entries => {
            for(const e of entries) ratios.set(e.target, e.intersectionRatio);
            const all = [...ratios.values()];
            if(all.length === 2 && all.every(r => r > 0.99)) {
                if(!playing) {
                    playing = true;
                    void play();
                }
            }
            else if(all.every(r => r === 0) && playing) {
                playing = false;
                run++;
            }
        }, { threshold: [0, 0.25, 0.5, 0.75, 0.99, 1], rootMargin: '0px 0px -120px 0px' });
        if(dcSide && mcSide) {
            io.observe(dcSide);
            io.observe(mcSide);
        }
        return () => {
            run++;
            io.disconnect();
        };
    });

    const verification: DcMsg = {
        id: 1, author: bot, interaction: you,
        embeds: [{ ...embedStyle.step, title: 'Server Verification', description: ':step: Install the Discord-Linker plugin on your Minecraft server.\nThen join your server as an operator and execute the following command: ```' + code + '```\n**You have 3 minutes to run the command.**' }],
    };
    const linked: DcMsg = {
        id: 2, author: bot, interaction: you,
        embeds: [{ ...embedStyle.success, title: 'Connected to Server', description: 'Successfully connected to the plugin.' }],
    };
    const disconnected: DcMsg = {
        id: 3, author: bot, interaction: { ...you, command: '/disconnect' },
        embeds: [{ ...embedStyle.success, title: 'Disconnected From Plugin', description: 'The plugin connection was successfully disconnected.' }],
    };
    const dcMessages = { waiting: verification, linked, disconnected };
    const mcLines = [
        { id: 1, text: '&eAttempting to connect to the Discord bot...' },
        { id: 2, text: '&aSuccessfully connected to Discord!' },
        { id: 3, text: '&cDisconnected from the Discord bot.' },
    ];
    const shownMcLines = $derived(phase === 'waiting' ? [] : phase === 'linked' ? mcLines.slice(0, 2) : mcLines);
</script>

<!-- Step 3 happens in both worlds. -->
<div class="band">
    <div class="intro">
        <StepHeading step={3} world="both">Run <code>/connect</code>, paste the code</StepHeading>
        <p>Discord gives you a code. Run it on your server as an operator and the two are linked. That's it.</p>
    </div>
    <div class="side dc" bind:this={dcSide}>
        <DcWindow channel="general">
            <discord-messages no-background>
                {#key phase}
                    <div in:fly={{ y: 8, duration: 200 }}>
                        <DcMessage msg={dcMessages[phase]} />
                    </div>
                {/key}
            </discord-messages>
        </DcWindow>
    </div>
    <div class="side mc" bind:this={mcSide}>
        <div class="console" aria-label="Minecraft chat">
            <McChat lines={shownMcLines} />
            <div class="fake-input mc-text">{typed || ' '}{#if typed}<i class="caret"></i>{/if}</div>
        </div>
    </div>
</div>

<style>
    /* Discord on the left, Minecraft on the right (the order you use them in), the step's intro across the seam. */
    .band { position: relative; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto 1fr; padding-bottom: clamp(3rem, 6vw, 5rem); }
    .band::before, .band::after { content: ''; grid-row: 1 / -1; z-index: 0; margin-bottom: calc(-1 * clamp(3rem, 6vw, 5rem)); }
    /* Flipped so the seam's stepped edge faces the Discord half. */
    .band::before {
        grid-column: 2; z-index: 1; transform: scaleX(-1);
        background: linear-gradient(rgb(6 6 8 / 0.6), rgb(6 6 8 / 0.6)), var(--tex-deepslate) 0 0 / 64px 64px;
        image-rendering: pixelated;
        mask: var(--seam-mask);
    }
    .band::after { grid-column: 1; margin-right: calc(-1 * var(--seam-width)); background: var(--color-dc-3); }
    .intro {
        grid-column: 1 / -1; grid-row: 1; position: relative; z-index: 1; justify-self: center;
        width: min(36rem, calc(100% - 2rem)); margin-top: clamp(2.5rem, 5vw, 3.5rem); padding: 1.4rem 1.6rem;
        border-radius: 16px; background: rgb(13 16 20 / 0.92); box-shadow: 0 0 0 2px rgb(255 255 255 / 0.07); text-align: center;
    }
    .intro p { margin: 0; color: #ced4da; }
    code { padding: 0.05em 0.35em; border-radius: 5px; background: rgb(255 255 255 / 0.1); font-size: 0.9em; white-space: nowrap; }
    .side { position: relative; z-index: 1; grid-row: 2; display: flex; align-items: flex-start; padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 3.5rem) 0; min-width: 0; }
    .side > :global(*) { width: 100%; max-width: 30rem; }
    .side.dc { grid-column: 1; justify-content: flex-end; }
    .side.mc { grid-column: 2; justify-content: flex-start; }
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
        .side.mc { grid-row: 3; padding-bottom: 2.5rem; background: linear-gradient(rgb(6 6 8 / 0.6), rgb(6 6 8 / 0.6)), var(--tex-deepslate) 0 0 / 64px 64px; image-rendering: pixelated; }
    }
</style>
