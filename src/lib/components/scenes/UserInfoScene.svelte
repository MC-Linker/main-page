<script lang="ts">
    import { fade } from 'svelte/transition';
    import Scene from '../Scene.svelte';
    import McViewport from '$lib/mc/McViewport.svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import { bot, embedStyle, type Embed } from '$lib/discord/types';
    import { drumstick, heart, heartEmpty, looks, player } from '$lib/pixel/sprites';
    import { featureById } from '$lib/data/features';

    let { index }: { index: number } = $props();
    const feature = featureById('info');

    type Tab = 'general' | 'survival' | 'admin';
    let tab = $state<Tab>('survival');

    const author = { name: 'Lianecx', avatar: { head: 'lianecx' as const } };
    // Field names and formats from the bot's /userinfo pages.
    const embeds: Record<Tab, Embed> = {
        general: {
            ...embedStyle.success, author, title: 'User Information',
            fields: [
                { name: 'Status', value: '🟢 Online', inline: true },
                { name: 'Banned', value: 'No', inline: true },
                { name: 'Whitelisted', value: 'Yes', inline: true },
                { name: 'Operator', value: 'Yes (Level: 4)', inline: true },
                { name: 'Linked Discord Account', value: '@Lianecx', inline: true },
            ],
            footer: 'UUID: 3f1c2a8e-5b7d-4e0a-9c6f-1d2e3f4a5b6c',
        },
        survival: {
            ...embedStyle.success, author, title: 'User Information',
            fields: [
                { name: 'Gamemode', value: 'Survival', inline: true },
                { name: 'Health', value: '10.0 ❤️', inline: true },
                { name: 'Food Level', value: '20 🍗 (Saturation: 5)', inline: true },
                { name: 'XP', value: '2248 ✨ (Level: 36)', inline: true },
                { name: 'Play Time', value: '50h 29m 51s', inline: true },
                { name: 'Teams', value: 'builders', inline: true },
            ],
        },
        admin: {
            ...embedStyle.success, author, title: 'User Information',
            fields: [
                { name: 'Current Position', value: '`120, 64, -340` (Dimension: Overworld)', inline: true },
                { name: 'Spawn Location', value: '`0, 71, 0` (Dimension: Overworld)', inline: true },
                { name: 'Last Death Location', value: '`-512, 12, 88` (Dimension: Nether)', inline: true },
            ],
        },
    };
    const tabs: { id: Tab; label: string; danger?: boolean }[] = [
        { id: 'general', label: 'General Information' },
        { id: 'survival', label: 'Survival Information' },
        { id: 'admin', label: 'Admin Information', danger: true },
    ];

    const sprite = player(looks.lianecx);
</script>

<Scene id={feature.id} {index} title="Look up any player" description="/userinfo shows what you'd see in-game: health, hunger, XP, play time, position and more. /inventory, /stats and /advancements render as images, straight from your server." commands={['/userinfo', '/inventory', '/stats', '/advancements']} guide={feature.guide} material="stone">
    {#snippet mc()}
        <McViewport label="Lianecx in game with health, food and XP bars">
            <div class="player" class:hl={tab === 'general'} aria-hidden="true">
                <span class="nametag mc-text">Lianecx</span>
                <PixelArt sprite={sprite} width="100%" />
            </div>
            {#if tab === 'admin'}
                <div class="debug mc-text" transition:fade={{ duration: 150 }}>
                    <span>Minecraft 26.2</span>
                    <span>XYZ: 120.000 / 64.00000 / -340.000</span>
                    <span>Facing: north (Towards negative Z)</span>
                </div>
            {/if}
            <div class="hud" class:hl={tab === 'survival'} aria-hidden="true">
                <div class="bars">
                    <span class="row">{#each Array(10) as _, i (i)}<PixelArt sprite={i < 5 ? heart : heartEmpty} width="0.95rem" />{/each}</span>
                    <span class="row">{#each Array(10) as _, i (i)}<PixelArt sprite={drumstick} width="0.95rem" />{/each}</span>
                </div>
                <div class="xp"><span class="level mc-text">36</span><span class="bar"><span style:width="62%"></span></span></div>
            </div>
        </McViewport>
    {/snippet}

    {#snippet dc()}
        <DcWindow channel="general">
            <DcMessage compact msg={{ id: 1, author: bot, interaction: { user: 'TheAnnoying', avatar: { head: 'theannoying' }, command: '/userinfo' }, embeds: [embeds[tab]] }} />
            <div class="buttons" role="group" aria-label="userinfo pages">
                {#each tabs as t (t.id)}
                    <button type="button" class:danger={t.danger} aria-pressed={tab === t.id} onclick={() => (tab = t.id)}>{t.label}</button>
                {/each}
            </div>
            <p class="try">↑ These buttons work. Try them.</p>
        </DcWindow>
    {/snippet}
</Scene>

<style>
    .player { position: absolute; left: 50%; bottom: var(--ground); width: 2.6rem; transform: translateX(-50%); }
    .nametag {
        position: absolute; bottom: calc(100% + 0.4rem); left: 50%; transform: translateX(-50%);
        padding: 0 0.3rem; background: rgb(0 0 0 / 0.35); color: #fff; font-size: 0.85rem; white-space: nowrap;
        transition: outline-color 0.2s;
        outline: 2px solid transparent;
    }
    .player.hl .nametag { outline-color: var(--color-mc-yellow); }
    .debug { position: absolute; left: 0.5rem; top: 0.5rem; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; font-size: 0.8rem; color: #fff; }
    .debug span { padding: 0 0.25rem; background: rgb(80 80 80 / 0.55); }
    .hud {
        position: absolute; left: 50%; bottom: 0.5rem; transform: translateX(-50%);
        display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.3rem; border-radius: 4px;
        outline: 2px solid transparent; transition: outline-color 0.2s;
    }
    .hud.hl { outline-color: var(--color-mc-yellow); }
    .bars { display: flex; gap: 1.5rem; }
    .row { display: inline-flex; gap: 1px; }
    .xp { position: relative; width: 100%; }
    .bar { display: block; height: 0.4rem; background: #1b1b1b; border: 1px solid #000; }
    .bar span { display: block; height: 100%; background: linear-gradient(#b5f55a, #6fbf1f); }
    .level { position: absolute; left: 50%; bottom: 0.35rem; transform: translateX(-50%); color: #80ff20; font-size: 1rem; --mc-shadow: 0.1em; }
    .buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.5rem 0 0 2.625rem; }
    .buttons button {
        padding: 0.35rem 0.9rem; border: 0; border-radius: 4px; background: #4e5058; color: #fff;
        font: inherit; font-size: 0.85rem; font-weight: 500; cursor: pointer;
    }
    .buttons button:hover { background: #6d6f78; }
    .buttons button.danger { background: var(--color-dc-red); }
    .buttons button.danger:hover { background: #a12828; }
    .buttons button[aria-pressed='true'] { box-shadow: 0 0 0 2px #fff; }
    .try { margin: 0.5rem 0 0.75rem 2.625rem; font-size: 0.8rem; color: var(--color-dc-muted); }
    @media (max-width: 480px) {
        .bars { gap: 0.5rem; }
        .row :global(svg) { width: 0.7rem !important; }
    }
</style>
