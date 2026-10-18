<script lang="ts">
    import { fly, scale } from 'svelte/transition';
    import Scene from '../Scene.svelte';
    import Chip from '../Chip.svelte';
    import McViewport from '$lib/mc/McViewport.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import { bot, colors, embedStyle, type DcMsg, type Embed } from '$lib/discord/types';
    import { looks, player, tnt } from '$lib/pixel/sprites';
    import { featureById } from '$lib/data/features';
    import type { McLine } from '$lib/mc/types';

    let { index }: { index: number } = $props();
    const feature = featureById('moderation');

    let griefer = $state(true);
    let creative = $state(false);
    let op = $state(false);
    let lines = $state<McLine[]>([{ id: 0, text: '<Griefer> hehe watch this' }]);
    let replies = $state<DcMsg[]>([]);
    let n = 1;

    const success = (title: string, color: string, description: string): Embed => ({ ...embedStyle.success, color, title, description });

    function reply(command: string, embed: Embed) {
        replies = [...replies.slice(-1), { id: n++, author: bot, interaction: { user: 'Bnux', avatar: { head: 'bnux' }, command }, embeds: [embed] }];
    }
    const say = (text: string) => { lines = [...lines.slice(-4), { id: n++, text }]; };

    // Embed texts follow the bot's language file; responses are vanilla server output.
    const actions = {
        kick() {
            griefer = false;
            say('&eGriefer left the game');
            say('&7&o[Server: Kicked Griefer: Too much TNT]');
            reply('/kick', success('Kick Player', colors.orange, 'Successfully kicked player **Griefer**: `Too much TNT`\n```Kicked Griefer: Too much TNT```'));
        },
        ban() {
            griefer = false;
            say('&eGriefer left the game');
            say('&7&o[Server: Banned Griefer: Too much TNT]');
            reply('/ban', success('Ban Player', colors.orange, 'Successfully banned player **Griefer**: `Too much TNT`\n```Banned Griefer: Too much TNT```'));
        },
        op() {
            op = !op;
            say(op ? '&7&o[Server: Made Cubey a server operator]' : '&7&o[Server: Made Cubey no longer a server operator]');
            reply(op ? '/op' : '/deop', op
                ? success('OP Player', colors.blue, 'Successfully oped player **Cubey**\n```Made Cubey a server operator```')
                : success('Deop Player', colors.blue, 'Successfully Deoped player **Cubey**\n```Made Cubey no longer a server operator```'));
        },
        gamemode() {
            creative = !creative;
            const mode = creative ? 'Creative' : 'Survival';
            say(`&7&o[Server: Set Cubey's game mode to ${mode} Mode]`);
            reply('/gamemode', success('Change Gamemode', colors.orange, `Successfully changed gamemode of **Cubey** to **${mode.toLowerCase()}**\n\`\`\`Set Cubey's game mode to ${mode} Mode\`\`\``));
        },
    };

    function reset() {
        griefer = true;
        say('&eGriefer joined the game');
    }

    const cubey = player(looks.cubey);
    const grief = player(looks.griefer);
</script>

<Scene id={feature.id} {index} title="Moderate from anywhere" description="Ban, kick, op and change gamemodes without opening the console. Discord's own permissions decide who can use what, so your mods only get the tools you give them." commands={['/ban', '/unban', '/kick', '/op', '/deop', '/gamemode']} guide={feature.guide} material="stone">
    {#snippet controls()}
        <div class="row">
            {#if griefer}
                <Chip variant="action" onclick={actions.kick}>/kick Griefer</Chip>
                <Chip variant="action" onclick={actions.ban}>/ban Griefer</Chip>
            {:else}
                <Chip variant="action" onclick={reset}>↻ Bring Griefer back</Chip>
            {/if}
            <Chip variant="action" onclick={actions.op}>{op ? '/deop Cubey' : '/op Cubey'}</Chip>
            <Chip variant="action" onclick={actions.gamemode}>/gamemode {creative ? 'survival' : 'creative'} Cubey</Chip>
        </div>
    {/snippet}

    {#snippet mc()}
        <McViewport label="Griefer next to TNT, and Cubey">
            <div class="cubey" class:flying={creative} aria-hidden="true">
                <span class="nametag mc-text">{#if op}<span class="op">★ </span>{/if}Cubey</span>
                <PixelArt sprite={cubey} width="100%" />
            </div>
            {#if griefer}
                <div class="griefer" aria-hidden="true" in:fly={{ y: -30, duration: 300 }} out:scale={{ start: 0.2, duration: 250 }}>
                    <span class="nametag mc-text">Griefer</span>
                    <PixelArt sprite={grief} width="100%" />
                </div>
                <div class="tnt" aria-hidden="true" out:scale={{ duration: 200 }}>
                    <PixelArt sprite={tnt} width="100%" />
                    <PixelArt sprite={tnt} width="100%" />
                    <PixelArt sprite={tnt} width="100%" />
                </div>
            {/if}
            <div class="mc-overlay"><McChat {lines} max={5} /></div>
        </McViewport>
    {/snippet}

    {#snippet dc()}
        <DcWindow channel="staff" topic="Mods and admins">
            <div class="list" aria-live="polite">
                {#if replies.length === 0}
                    <p class="empty">Press a command above to run it.</p>
                {/if}
                {#each replies as r (r.id)}
                    <div in:fly={{ y: 10, duration: 200 }}><DcMessage msg={r} compact /></div>
                {/each}
            </div>
        </DcWindow>
    {/snippet}
</Scene>

<style>
    .row { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem; }
    .cubey { position: absolute; left: 16%; bottom: var(--ground); width: 2.4rem; transition: transform 0.6s cubic-bezier(.3, 1.4, .5, 1); }
    .cubey.flying { transform: translateY(-3.5rem); animation: hover 2s ease-in-out infinite 0.6s; }
    @keyframes hover { 50% { transform: translateY(-3.9rem); } }
    .griefer { position: absolute; right: 30%; bottom: var(--ground); width: 2.4rem; }
    .tnt { position: absolute; right: 12%; bottom: var(--ground); display: grid; grid-template-columns: repeat(2, 1.6rem); }
    .tnt :global(svg:last-child) { grid-column: 1 / -1; justify-self: center; grid-row: 1; width: 1.6rem !important; }
    .nametag {
        position: absolute; bottom: calc(100% + 0.35rem); left: 50%; transform: translateX(-50%);
        padding: 0 0.3rem; background: rgb(0 0 0 / 0.35); color: #fff; font-size: 0.8rem; white-space: nowrap;
    }
    .op { color: var(--color-mc-gold); }
    .mc-overlay { position: absolute; left: 0.75rem; right: 25%; top: 0.75rem; font-size: 0.85rem; }
    .list { display: flex; flex-direction: column; justify-content: flex-end; height: 16.25rem; overflow: hidden; }
    .empty { margin: auto; color: var(--color-dc-muted); font-size: 0.9rem; }
</style>
