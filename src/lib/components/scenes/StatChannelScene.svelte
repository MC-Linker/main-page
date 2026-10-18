<script lang="ts">
    import { fly } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import Scene from '../Scene.svelte';
    import Chip from '../Chip.svelte';
    import McViewport from '$lib/mc/McViewport.svelte';
    import PixelHead from '$lib/pixel/PixelHead.svelte';
    import type { LookName } from '$lib/pixel/sprites';
    import { featureById } from '$lib/data/features';

    let { index }: { index: number } = $props();
    const feature = featureById('stat-channels');

    const pool: { name: string; look: LookName }[] = [
        { name: 'Lianecx', look: 'lianecx' },
        { name: 'Cubey', look: 'cubey' },
        { name: 'TheAnnoying', look: 'theannoying' },
        { name: 'Bnux', look: 'bnux' },
        { name: 'Newbie', look: 'newbie' },
    ];
    let count = $state(3);
    let online = $state(true);
    let onlineTpl = $state('🟢 %count% players online');
    let offlineTpl = $state('🔴 Server offline');
    let ipTpl = $state('📍 %ip% (%version%)');

    const players = $derived(online ? pool.slice(0, count) : []);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    // Same placeholders and time format as the bot.
    const fill = (t: string) => t
        .replaceAll('%count%', String(online ? count : 0))
        .replaceAll('%ip%', 'play.example.net')
        .replaceAll('%version%', '26.2')
        .replaceAll('%time%', `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${String(now.getFullYear()).slice(2)} ${pad(now.getHours())}:${pad(now.getMinutes())}`);
    const statName = $derived(fill(online ? onlineTpl : offlineTpl || onlineTpl));
    const ipName = $derived(fill(ipTpl));

    let focused: 'online' | 'offline' | 'ip' = 'online';
    function insert(ph: string) {
        if(focused === 'online') onlineTpl += ph;
        else if(focused === 'offline') offlineTpl += ph;
        else ipTpl += ph;
    }
</script>

<Scene id={feature.id} {index} title="Your player count, in the channel list" description={feature.description} commands={['/statchannel add', '/statchannel list']} guide={feature.guide} material="stone">
    {#snippet controls()}
        <div class="row">
            <Chip variant="action" onclick={() => (count = Math.min(5, count + 1))} disabled={!online || count >= 5}>+ Player joins</Chip>
            <Chip variant="action" onclick={() => (count = Math.max(0, count - 1))} disabled={!online || count <= 0}>− Player leaves</Chip>
            <Chip variant="action" onclick={() => (online = !online)}>{online ? '■ Stop server' : '▶ Start server'}</Chip>
        </div>
    {/snippet}

    {#snippet mc()}
        <McViewport label="Minecraft player list" night={!online}>
            <div class="tablist mc-text" aria-live="polite">
                {#if online}
                    <div class="tab-head">Linker SMP · {count}/20</div>
                    {#each players as p (p.name)}
                        <div class="tab-row" animate:flip={{ duration: 200 }} in:fly={{ y: -8, duration: 200 }} out:fly={{ x: 12, duration: 150 }}>
                            <PixelHead look={p.look} size="1rem" />
                            <span>{p.name}</span>
                            <span class="ping" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
                        </div>
                    {:else}
                        <div class="tab-row empty">Nobody online</div>
                    {/each}
                {:else}
                    <div class="tab-head stopped">Server stopped</div>
                {/if}
            </div>
        </McViewport>
    {/snippet}

    {#snippet dc()}
        <div class="dc-pair">
            <nav class="sidebar" aria-label="Discord channel list preview">
                <div class="server">Linker SMP <span aria-hidden="true">⌄</span></div>
                <div class="cat">⌄ SERVER STATS</div>
                <div class="chan voice active"><span class="ico" aria-hidden="true">🔊</span><span class="name">{statName}</span></div>
                <div class="chan voice"><span class="ico" aria-hidden="true">🔊</span><span class="name">{ipName}</span></div>
                <div class="cat">⌄ TEXT CHANNELS</div>
                <div class="chan"><span class="ico" aria-hidden="true">#</span><span class="name">general</span></div>
                <div class="chan"><span class="ico" aria-hidden="true">#</span><span class="name">minecraft-chat</span></div>
            </nav>
            <div class="editor">
                <div class="cmd"><b>/statchannel add</b></div>
                <label><span>online</span><input bind:value={onlineTpl} onfocus={() => (focused = 'online')} maxlength="60" /></label>
                <label><span>offline</span><input bind:value={offlineTpl} onfocus={() => (focused = 'offline')} maxlength="60" /></label>
                <label><span>2nd channel</span><input bind:value={ipTpl} onfocus={() => (focused = 'ip')} maxlength="60" /></label>
                <div class="phs" role="group" aria-label="Insert placeholder">
                    {#each ['%count%', '%ip%', '%version%', '%time%'] as ph (ph)}
                        <button type="button" onmousedown={e => e.preventDefault()} onclick={() => insert(ph)}>{ph}</button>
                    {/each}
                </div>
                <p class="note">Edit the templates. The channel names update live.</p>
            </div>
        </div>
    {/snippet}
</Scene>

<style>
    .row { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem; }
    .tablist {
        position: absolute; top: 1rem; left: 50%; transform: translateX(-50%);
        min-width: 13rem; padding: 0.3rem; background: rgb(0 0 0 / 0.62); color: #fff; font-size: 0.9rem;
    }
    .tab-head { padding: 0.2rem 0.4rem 0.35rem; text-align: center; color: var(--color-mc-gold); }
    .tab-head.stopped { color: var(--color-mc-red); }
    .tab-row { display: flex; align-items: center; gap: 0.4rem; padding: 0.15rem 0.3rem; margin-top: 1px; background: rgb(255 255 255 / 0.12); }
    .tab-row.empty { justify-content: center; color: #aaa; }
    .ping { display: inline-flex; align-items: flex-end; gap: 1px; margin-left: auto; height: 0.7rem; }
    .ping i { width: 2px; background: #55ff55; }
    .ping i:nth-child(1) { height: 25%; } .ping i:nth-child(2) { height: 50%; } .ping i:nth-child(3) { height: 75%; } .ping i:nth-child(4) { height: 100%; }

    .dc-pair { display: grid; grid-template-columns: 13.5rem 1fr; border-radius: 10px; overflow: hidden; background: var(--color-dc); box-shadow: 0 0 0 1px rgb(255 255 255 / 0.04), 0 18px 40px rgb(0 0 0 / 0.35); }
    .sidebar { background: var(--color-dc-2); padding-bottom: 0.75rem; font-size: 0.9rem; }
    .server { padding: 0.8rem 1rem; border-bottom: 1px solid #1f2023; font-weight: 700; color: var(--color-dc-header); display: flex; justify-content: space-between; }
    .cat { padding: 1rem 0.75rem 0.25rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em; color: var(--color-dc-muted); }
    .chan { display: flex; align-items: center; gap: 0.4rem; margin: 1px 0.5rem; padding: 0.35rem 0.5rem; border-radius: 4px; color: var(--color-dc-muted); }
    .chan.voice { color: #b5bac1; }
    .chan.active { background: rgb(78 80 88 / 0.35); color: var(--color-dc-header); }
    .ico { width: 1.1rem; text-align: center; flex: none; font-size: 0.85rem; }
    .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .editor { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.9rem; font-size: 0.85rem; min-width: 0; }
    .cmd { color: var(--color-dc-header); }
    label { display: flex; flex-direction: column; gap: 0.2rem; }
    label span { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--color-dc-muted); }
    input { width: 100%; padding: 0.4rem 0.55rem; border: 0; border-radius: 4px; background: var(--color-dc-3); color: var(--color-dc-text); font: inherit; }
    input:focus-visible { outline: 2px solid var(--color-dc-blurple); }
    .phs { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .phs button { padding: 0.15rem 0.45rem; border: 0; border-radius: 4px; background: rgb(88 101 242 / 0.25); color: #c9cdfb; font: inherit; font-size: 0.8rem; cursor: pointer; }
    .phs button:hover { background: rgb(88 101 242 / 0.45); }
    .note { margin: 0; color: var(--color-dc-muted); font-size: 0.78rem; }
    @media (max-width: 520px) {
        .dc-pair { grid-template-columns: 1fr; }
    }
</style>
