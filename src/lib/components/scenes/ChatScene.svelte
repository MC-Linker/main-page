<script lang="ts">
    import { fly } from 'svelte/transition';
    import Scene from '../Scene.svelte';
    import Chip from '../Chip.svelte';
    import McViewport from '$lib/mc/McViewport.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import { chatWebhook, colors, type DcMsg } from '$lib/discord/types';
    import { looks, player } from '$lib/pixel/sprites';
    import { featureById } from '$lib/data/features';
    import { reducedMotion, sleep } from '$lib/motion';

    let { index }: { index: number } = $props();
    const feature = featureById('chat-bridge');

    type Kind = 'start' | 'join' | 'chat' | 'advancement' | 'command' | 'death';
    type Ev = { kind: Kind | 'discord'; mc?: string; dc: Omit<DcMsg, 'id'> };

    const cubey = { head: 'cubey' as const };
    const event = (description: string, color: string): Omit<DcMsg, 'id'> =>
        ({ author: chatWebhook, embeds: [{ color, author: { name: 'Cubey', avatar: cubey }, description }] });

    const events: Ev[] = [
        { kind: 'start', dc: { author: chatWebhook, embeds: [{ color: colors.green, description: '🟢 **The server has started!**', footer: 'Today at 6:58 PM' }] } },
        { kind: 'join', mc: '&eCubey joined the game', dc: event(':join: **Cubey** joined the game', colors.yellow) },
        { kind: 'chat', mc: '<Cubey> who wants to raid the ocean monument?', dc: { author: { name: 'Cubey', avatar: cubey, tag: 'APP' }, content: 'who wants to raid the ocean monument?' } },
        { kind: 'discord', mc: '&l&9Discord &8| &l&7TheAnnoying &8>>&r me!! bringing sponges', dc: { author: { name: 'TheAnnoying', avatar: { head: 'theannoying' }, color: '#f47b67' }, content: 'me!! bringing sponges' } },
        { kind: 'command', dc: event(':command: **Cubey** has executed the command: [**/home base**]', colors.darkGold) },
        { kind: 'advancement', mc: 'Cubey has made the advancement &a[Monster Hunter]', dc: event('**Cubey** has made the advancement: [**Monster Hunter**]\n*Kill any hostile monster*', colors.pink) },
        { kind: 'death', mc: 'Cubey was slain by Drowned', dc: event(':death: Cubey was slain by Drowned', colors.darkPurple) },
    ];

    // Mirrors the message types in the bot's /chatchannel add menu.
    const types: { kind: Kind; label: string }[] = [
        { kind: 'chat', label: '💬 Chat' },
        { kind: 'join', label: '👋 Join & quit' },
        { kind: 'advancement', label: '🏆 Advancements' },
        { kind: 'death', label: '💀 Deaths' },
        { kind: 'command', label: '⚡ Commands' },
        { kind: 'start', label: '🟢 Start & stop' },
    ];
    let enabled = $state<Record<Kind, boolean>>({ chat: true, join: true, advancement: true, death: true, command: true, start: true });
    let discordToMc = $state(true);
    let shown = $state(0);

    const mcLines = $derived(
        events.slice(0, shown)
            .filter(e => e.mc && (e.kind !== 'discord' || discordToMc))
            .map((e, i) => ({ id: i, text: e.mc! })),
    );
    const dcMsgs = $derived(
        events.slice(0, shown)
            .map((e, i) => ({ ...e, i }))
            .filter(e => e.kind === 'discord' || enabled[e.kind as Kind]),
    );

    async function play() {
        if(reducedMotion.current) { shown = events.length; return; }
        for(let i = 1; i <= events.length; i++) {
            shown = i;
            await sleep(450);
        }
    }

    const cubeySprite = player(looks.cubey);
</script>

<Scene id={feature.id} {index} title="A chat bridge that goes both ways" description={feature.description} commands={['/chatchannel add', '/chatchannel list', '/chatchannel filter-commands']} guide={feature.guide} material="dirt" onenter={play}>
    {#snippet controls()}
        <p class="ctl-label">Pick what reaches Discord:</p>
        <div class="row">
            {#each types as t (t.kind)}
                <Chip pressed={enabled[t.kind]} onclick={() => (enabled[t.kind] = !enabled[t.kind])}>{t.label}</Chip>
            {/each}
        </div>
        <div class="row">
            <Chip pressed={discordToMc} onclick={() => (discordToMc = !discordToMc)}>Discord → Minecraft</Chip>
        </div>
    {/snippet}

    {#snippet mc()}
        <McViewport label="Minecraft chat showing the same messages">
            <div class="player" aria-hidden="true"><PixelArt sprite={cubeySprite} width="100%" /></div>
            <div class="mc-overlay"><McChat lines={mcLines} max={7} /></div>
        </McViewport>
    {/snippet}

    {#snippet dc()}
        <DcWindow channel="minecraft-chat" topic="Bridged with play.example.net">
            <div class="list" aria-live="polite">
                {#each dcMsgs as m (m.i)}
                    <div in:fly={{ y: 10, duration: 200 }} out:fly={{ x: 20, duration: 150 }}><DcMessage msg={{ ...m.dc, id: m.i }} compact /></div>
                {/each}
            </div>
        </DcWindow>
    {/snippet}
</Scene>

<style>
    .ctl-label { margin: 0 0 0.5rem; font-size: 0.85rem; color: #adb5bd; }
    .row { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.375rem; }
    .row + .row { margin-top: 0.5rem; }
    .player { position: absolute; right: 18%; bottom: var(--ground); width: 2.4rem; }
    .mc-overlay { position: absolute; left: 0.75rem; right: 30%; bottom: 0.75rem; font-size: 0.9rem; }
    .list { display: flex; flex-direction: column; justify-content: flex-end; height: 20.25rem; overflow: hidden; }
</style>
