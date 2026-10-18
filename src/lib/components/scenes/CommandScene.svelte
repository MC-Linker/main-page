<script lang="ts">
    import { fly, scale } from 'svelte/transition';
    import Scene from '../Scene.svelte';
    import Chip from '../Chip.svelte';
    import McViewport from '$lib/mc/McViewport.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import McHotbar from '$lib/mc/McHotbar.svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import { bot, colors, embedStyle } from '$lib/discord/types';
    import { diamond, looks, player } from '$lib/pixel/sprites';
    import { featureById } from '$lib/data/features';
    import { reducedMotion, sleep } from '$lib/motion';

    let { index }: { index: number } = $props();
    const feature = featureById('command');

    const full = '/command give Cubey diamond 64';
    let typed = $state('');
    let done = $state(false);
    let running = $state(false);

    // What the plugin would offer as tab-completions at each point.
    const suggestions = $derived.by(() => {
        if(!typed.startsWith('/command ') || done) return [];
        const arg = typed.slice('/command '.length);
        const parts = arg.split(' ');
        if(parts.length === 1) return ['give', 'gamemode', 'gamerule', 'time', 'weather', 'whitelist'].filter(s => s.startsWith(parts[0]));
        if(parts.length === 2) return ['Cubey', 'Lianecx', '@a', '@p', '@s'].filter(s => s.startsWith(parts[1]));
        if(parts.length === 3) return ['diamond', 'diamond_axe', 'diamond_block', 'diamond_sword'].filter(s => s.startsWith(parts[2]) && s !== parts[2]);
        return [];
    });

    async function run() {
        if(running) return;
        running = true;
        done = false;
        typed = '';
        if(reducedMotion.current) {
            typed = full;
        }
        else {
            for(const ch of full) {
                typed += ch;
                await sleep(ch === ' ' ? 220 : 55);
            }
            await sleep(500);
        }
        done = true;
        running = false;
    }

    const cubey = player(looks.cubey);
</script>

<Scene id={feature.id} {index} title="Run any command from Discord" description="/command runs anything on your server. Tab-completion comes live from the server, so suggestions always match your plugins and players. Use @s for yourself or @mention a member to use their Minecraft name." commands={['/command']} guide={feature.guide} material="dirt" onenter={run}>
    {#snippet controls()}
        <Chip variant="action" onclick={run} disabled={running}>{done ? '↻ Run it again' : '▶ Run it'}</Chip>
    {/snippet}

    {#snippet mc()}
        <McViewport label="Minecraft with a hotbar receiving 64 diamonds">
            <div class="player" aria-hidden="true"><PixelArt sprite={cubey} width="100%" /></div>
            <div class="mc-overlay">
                <McChat lines={done ? [{ id: 1, text: '&7&o[Server: Gave 64 [Diamond] to Cubey]' }] : []} />
            </div>
            <div class="hud">
                <McHotbar selected={0}>
                    {#snippet slot(i)}
                        {#if i === 0 && done}
                            <span class="item" in:scale={{ start: 0.2, duration: 350 }}>
                                <PixelArt sprite={diamond} width="1.5rem" />
                                <span class="count mc-text">64</span>
                            </span>
                        {/if}
                    {/snippet}
                </McHotbar>
            </div>
        </McViewport>
    {/snippet}

    {#snippet dc()}
        <DcWindow channel="staff" topic="Admins only">
            <div class="list">
                {#if done}
                    <div in:fly={{ y: 10, duration: 220 }}>
                        <DcMessage compact msg={{
                            id: 1,
                            author: bot,
                            interaction: { user: 'Lianecx', avatar: { head: 'lianecx' }, command: '/command' },
                            embeds: [{ ...embedStyle.success, color: colors.blue, title: 'Command Executed', description: '```Gave 64 [Diamond] to Cubey```' }],
                        }} />
                    </div>
                {/if}
            </div>
            {#snippet footer()}
                <div class="fake-composer" aria-hidden="true">
                    {#if suggestions.length}
                        <ul class="pop">
                            <li class="head">Suggestions from your server</li>
                            {#each suggestions as s, i (s)}<li class:active={i === 0}>{s}</li>{/each}
                        </ul>
                    {/if}
                    <div class="field">
                        <span class="plus">+</span>
                        <span class="text">{#if typed && !done}{typed}<i class="caret"></i>{:else}<span class="ph">Message #staff</span>{/if}</span>
                    </div>
                </div>
            {/snippet}
        </DcWindow>
    {/snippet}
</Scene>

<style>
    .player { position: absolute; left: 22%; bottom: var(--ground); width: 2.4rem; }
    .mc-overlay { position: absolute; left: 0.75rem; right: 0.75rem; bottom: 4rem; font-size: 0.9rem; }
    .hud { position: absolute; left: 0; right: 0; bottom: 0.5rem; display: flex; justify-content: center; --slot: 2rem; }
    .item { position: relative; display: grid; place-items: center; }
    .count { position: absolute; right: -0.55rem; bottom: -0.5rem; font-size: 0.8rem; color: #fff; }
    .list { display: flex; flex-direction: column; justify-content: flex-end; height: 13.5rem; }
    .fake-composer { position: relative; }
    .field {
        display: flex; align-items: center; gap: 0.75rem; height: 2.75rem; padding: 0 1rem; border-radius: 8px;
        background: var(--color-dc-input); font-size: 0.9375rem;
    }
    .plus { display: grid; place-items: center; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: #b5bac1; color: var(--color-dc-input); font-weight: 700; }
    .text { white-space: nowrap; overflow: hidden; }
    .ph { color: #6d6f78; }
    .caret { display: inline-block; width: 1px; height: 1.1em; margin-left: 1px; vertical-align: text-bottom; background: #fff; animation: caret 1s steps(1) infinite; }
    @keyframes caret { 50% { opacity: 0; } }
    .pop {
        position: absolute; left: 0; right: 0; bottom: calc(100% + 0.5rem); margin: 0; padding: 0.5rem; list-style: none;
        border-radius: 8px; background: var(--color-dc-2); box-shadow: 0 8px 24px rgb(0 0 0 / 0.4); font-size: 0.9rem;
    }
    .pop li { padding: 0.3rem 0.5rem; border-radius: 4px; color: var(--color-dc-header); font-weight: 600; }
    .pop li.active { background: var(--color-dc-hover); }
    .pop .head { font-size: 0.72rem; text-transform: uppercase; color: var(--color-dc-muted); font-weight: 700; }
</style>
