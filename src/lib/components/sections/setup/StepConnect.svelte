<script lang="ts">
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { reducedMotion, sleep } from '$lib/browser';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import { bot, type DcMsg, embedStyle, visitor } from '$lib/discord/types';
    import McChat from '$lib/mc/McChat.svelte';
    import StepCard from './StepCard.svelte';

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

    // It only plays while both halves are completely on screen (below the header bar), and stops once the step is gone.
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
        }, { threshold: [0, 0.25, 0.5, 0.75, 0.99, 1], rootMargin: `-${document.querySelector<HTMLElement>('nav.nav')?.offsetHeight ?? 56}px 0px 0px 0px` });
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
    const phases: Phase[] = ['waiting', 'linked', 'disconnected'];
    const mcLines = [
        { id: 1, text: '&eAttempting to connect to the Discord bot...' },
        { id: 2, text: '&aSuccessfully connected to Discord!' },
        { id: 3, text: '&cDisconnected from the Discord bot.' },
    ];
    const shownMcLines = $derived(phase === 'waiting' ? [] : phase === 'linked' ? mcLines.slice(0, 2) : mcLines);
</script>

<!-- Step 3 happens in both worlds: Discord on the left, Minecraft on the right, in the order you use them. -->
<StepCard step={3} world="both">
    {#snippet title()}Run <code>/connect</code>, paste the code{/snippet}
    <p class="intro">Discord gives you a code. Run it on your server as an operator and the two are linked. That's it.</p>
    <div class="sides">
        <div class="side" bind:this={dcSide}>
            <DcWindow channel="general">
                <!-- All three replies sit in one cell, the hidden ones only holding its height, so the step keeps the tallest one's size. -->
                <discord-messages no-background class="stack">
                    {#each phases as p (p)}
                        <div class="sizer" aria-hidden="true"><DcMessage msg={dcMessages[p]} /></div>
                    {/each}
                    {#key phase}
                        <div in:fly={{ y: 8, duration: 200 }}>
                            <DcMessage msg={dcMessages[phase]} />
                        </div>
                    {/key}
                </discord-messages>
            </DcWindow>
        </div>
        <div class="side" bind:this={mcSide}>
            <div class="console" aria-label="Minecraft chat">
                <div class="stack lines">
                    <div class="sizer" aria-hidden="true"><McChat lines={mcLines} /></div>
                    <McChat lines={shownMcLines} />
                </div>
                <!-- The full code, hidden, keeps the chat bar as tall as it gets once the code is typed in. -->
                <div class="fake-input ore-field stack">
                    <span class="sizer" aria-hidden="true">{code}<i class="caret"></i></span>
                    <span>{typed || ' '}{#if typed}<i class="caret"></i>{/if}</span>
                </div>
            </div>
        </div>
    </div>
</StepCard>

<style>
    .intro { margin: 0 0 1.25rem; color: var(--color-ore-white); line-height: 1.6; }
    .sides { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: start; }
    .side { min-width: 0; }
    /* Children share one grid cell, so the cell is as tall as the tallest of them. */
    .stack { display: grid; }
    .stack > :global(*) { grid-area: 1 / 1; min-width: 0; margin: 0; }
    .stack > .sizer { visibility: hidden; }
    .lines { align-items: end; }
    /* Minecraft's chat over a dark night sky, with the chat bar the code gets typed into. */
    .console {
        display: flex; flex-direction: column; justify-content: flex-end; gap: 0.5rem; min-height: 12rem; padding: 0.9rem;
        border: var(--t) solid #1e1e1f;
        background: linear-gradient(rgb(6 6 8 / 0.55), rgb(6 6 8 / 0.55)), var(--tex-deepslate) 0 0 / 64px 64px;
        image-rendering: pixelated;
    }
    .fake-input { min-height: 2.5rem; padding: calc(0.5rem + var(--t)) 0.6rem 0.4rem; overflow-wrap: anywhere; line-height: 1.3; image-rendering: auto; }
    .caret { display: inline-block; width: 0.5em; height: 2px; margin-left: 2px; background: #fff; animation: caret 1s steps(1) infinite; }
    @keyframes caret { 50% { opacity: 0; } }

    @media (max-width: 860px) {
        .sides { grid-template-columns: 1fr; }
    }
</style>
