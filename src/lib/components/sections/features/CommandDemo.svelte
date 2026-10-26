<script lang="ts">
    import { onMount } from 'svelte';
    import { reducedMotion } from '$lib/browser';
    import DcComposer from '$lib/discord/DcComposer.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import { bot, colors, type DcMsg, embedStyle, type SlashCommand } from '$lib/discord/types';
    import { vanillaCommands } from '$lib/mc/commands';
    import McChat from '$lib/mc/McChat.svelte';
    import { discordChoices } from '$lib/mc/suggest';
    import type { McLine } from '$lib/mc/text';
    import { execute } from '../hero/demo/server';

    /**
     * The /command feature's preview: the bot's autocompletion, word by word, as it types a few
     * commands on its own. Clicking into the box hands it over to the visitor.
     */
    type Props = {
        /** For the hidden copy that only measures the panel's height: no typing. */
        still?: boolean;
    };
    let { still = false }: Props = $props();

    const user = 'Lianecx';
    const you = { user, avatar: { head: 'lianecx' as const } };
    const command: SlashCommand = { name: 'command', description: 'Execute any command on the Minecraft-server.', options: ['command'], tree: vanillaCommands };
    const scripts = ['time set night', 'effect give Cubey night_vision', 'weather thunder', 'gamemode creative Cubey', 'give Cubey diamond 64'];

    function reply(text: string): { dc: DcMsg; mc: string | null } {
        const r = execute({ online: ['Lianecx', 'Cubey'] }, text, user);
        const output = r.output;
        return {
            dc: {
                id: 0, author: bot, interaction: { ...you, command: '/command' },
                embeds: [{
                    ...embedStyle.success, color: colors.blue, title: 'Command Executed',
                    description: output ? `\`\`\`${output}\`\`\`` : 'No response message! Some commands do not have any response messages.',
                }],
            },
            mc: r.said ? `[Server] ${r.said}` : output && !output.startsWith('Unknown') ? `&7&o[Server: ${output}]` : null,
        };
    }

    // It starts with the last command already run, so the page's HTML shows a finished example.
    const first = reply(scripts.at(-1)!);
    let msg = $state<DcMsg>(first.dc);
    let lines = $state<McLine[]>([{ id: 0, text: '&eCubey joined the game' }, { id: 1, text: first.mc! }]);
    let value = $state('');
    let active = $state(0);
    let typing = $state(false);
    let handedOver = false;
    let nextId = 2;

    async function run(text: string) {
        if(!text.startsWith('/command')) {
            msg = { id: nextId++, author: bot, ephemeral: true, content: 'In this preview you can try `/command`. Pick a suggestion or type any Minecraft command.' };
            return;
        }
        const cmd = text.slice('/command'.length).trim();
        if(!cmd) return;
        msg = { id: nextId++, author: bot, interaction: { ...you, command: '/command' }, thinking: true };
        // Its own timer, so handing over mid-reply doesn't leave it thinking forever.
        await new Promise(resolve => setTimeout(resolve, 700));
        const r = reply(cmd);
        msg = { ...r.dc, id: nextId++ };
        if(r.mc) lines = [...lines.slice(-5), { id: nextId++, text: r.mc }];
    }

    /** The visitor's own command. The box keeps /command ready for the next one. */
    function submit(text: string) {
        void run(text);
        queueMicrotask(() => (value = '/command '));
    }

    let timer = 0;
    const sleep = (ms: number) => new Promise<void>(resolve => { timer = window.setTimeout(resolve, ms); });

    /** Types one command like a person: a few letters of each word, then picks the suggestion. */
    async function play(script: string) {
        value = '/command ';
        await sleep(900);
        const words = script.split(' ');
        for(const [i, word] of words.entries()) {
            const before = words.slice(0, i).join(' ') + (i ? ' ' : '');
            const want = before + word;
            const offered = discordChoices(vanillaCommands, want).choices.includes(want);
            // Free text is typed out in full; a word the server suggests needs only a few letters.
            const letters = offered ? Math.min(word.length, 2 + (i % 2)) : word.length;
            for(const ch of word.slice(0, letters)) {
                if(handedOver) return;
                value += ch;
                await sleep(110 + Math.random() * 80);
            }
            if(!offered) {
                if(i < words.length - 1) value += ' ';
                continue;
            }
            const choices = discordChoices(vanillaCommands, value.slice('/command '.length)).choices;
            active = Math.max(0, choices.indexOf(want));
            await sleep(650);
            if(handedOver) return;
            value = `/command ${want}${i < words.length - 1 ? ' ' : ''}`;
            active = 0;
            await sleep(i < words.length - 1 ? 850 : 500);
        }
        if(handedOver) return;
        await sleep(400);
        const text = value.trim();
        value = '';
        await run(text);
        await sleep(3200);
    }

    async function loop() {
        typing = true;
        for(let i = 0; !handedOver; i = (i + 1) % scripts.length) await play(scripts[i]);
    }

    function handOver() {
        if(handedOver) return;
        handedOver = true;
        typing = false;
        clearTimeout(timer);
    }

    let box: HTMLElement;
    onMount(() => {
        if(still || reducedMotion.current) return;
        // Only types while it's on screen.
        let started = false;
        const seen = new IntersectionObserver(([e]) => {
            if(!e.isIntersecting || started) return;
            started = true;
            seen.disconnect();
            void loop();
        }, { threshold: 0.4 });
        seen.observe(box);
        return () => {
            seen.disconnect();
            handedOver = true;
            clearTimeout(timer);
        };
    });
</script>

<div class="worlds" bind:this={box}>
    <div class="world">
        <p class="label ore-text">In Discord <span class="try">{typing ? '· click the box to try it' : ''}</span></p>
        <div class="dc-box">
            <discord-messages no-background class="dc-msgs">
                {#key msg.id}<DcMessage {msg} />{/key}
            </discord-messages>
            <div class="composer" inert={still}>
                <DcComposer
                    placeholder="Message #console" label="Discord message box (demo)" commands={[command]}
                    bind:value bind:active showList={typing} ontouch={handOver} onsubmit={submit}
                />
            </div>
        </div>
    </div>
    <div class="world">
        <p class="label ore-text">In Minecraft</p>
        <div class="mc-box"><McChat {lines} max={3} /></div>
    </div>
</div>

<style>
    .worlds { display: flex; flex-direction: column; gap: 1rem; margin: 1.25rem 0; }
    .label { margin: 0 0 0.45rem; font-size: 0.875rem; color: var(--color-mc-gray); }
    .try { color: #8c8d90; }
    .mc-box { padding: 0.75rem; border: var(--t) solid #1e1e1f; background: linear-gradient(#78a6f7, #b4d3ff); font-size: 0.9rem; }
    /* Room above the box for the suggestions, which open over the reply like in Discord. */
    .dc-box { display: flex; flex-direction: column; justify-content: flex-end; min-height: 22rem; padding: 0.5rem 1rem 1rem; background: var(--color-dc); border-radius: 8px; line-height: 1.375; }
    .dc-msgs { display: block; }
    .composer { margin-top: 0.75rem; --suggest-max: 12.5rem; }
    @media (max-width: 560px) {
        .dc-box { padding-inline: 0.6rem; }
    }
</style>
