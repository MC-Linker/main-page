<script lang="ts">
    import { fly } from 'svelte/transition';
    import Scene from '../Scene.svelte';
    import Chip from '../Chip.svelte';
    import McViewport from '$lib/mc/McViewport.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import PixelHead from '$lib/pixel/PixelHead.svelte';
    import { featureById } from '$lib/data/features';
    import type { McLine } from '$lib/mc/types';

    let { index }: { index: number } = $props();
    const feature = featureById('role-sync');

    type Direction = 'both' | 'to_minecraft' | 'to_discord';
    // Labels are the bot's own option names.
    const directions: { id: Direction; label: string; hint: string }[] = [
        { id: 'both', label: 'Both', hint: 'Changes on either side sync to the other.' },
        { id: 'to_minecraft', label: 'To Minecraft', hint: 'Discord → Minecraft only. Minecraft changes stay in Minecraft.' },
        { id: 'to_discord', label: 'To Discord', hint: 'Minecraft → Discord only. Discord changes stay in Discord.' },
    ];
    let direction = $state<Direction>('both');
    let role = $state(false);
    let group = $state(false);
    let lines = $state<McLine[]>([]);
    let n = 0;
    const say = (text: string) => { lines = [...lines.slice(-3), { id: n++, text }]; };

    const lpMessage = (on: boolean) => on
        ? '&b[LP] &fcubey &anow inherits permissions from &fvip&a in context global.'
        : '&b[LP] &fcubey &ano longer inherits permissions from &fvip&a in context global.';

    function toggleRole() {
        role = !role;
        if(direction !== 'to_discord') setTimeout(() => { group = role; say(lpMessage(group)); }, 450);
    }
    function toggleGroup() {
        group = !group;
        say(lpMessage(group));
        if(direction !== 'to_minecraft') setTimeout(() => (role = group), 450);
    }
</script>

<Scene id={feature.id} {index} title="Roles and groups that stay in sync" description="Link a Discord role to a Minecraft team, LuckPerms group or Vault group. Give someone the role and they're in the group, and the other way round. You pick the direction." commands={['/rolesync add', '/rolesync list']} guide={feature.guide} material="deepslate">
    {#snippet controls()}
        <div class="row">
            <Chip variant="action" onclick={toggleRole}>{role ? 'Remove' : 'Give'} @VIP in Discord</Chip>
            <Chip variant="action" onclick={toggleGroup}>{group ? 'Remove from' : 'Add to'} vip in Minecraft</Chip>
        </div>
        <div class="row dir" role="group" aria-label="Sync direction">
            <span class="dlabel">direction:</span>
            {#each directions as d (d.id)}
                <Chip pressed={direction === d.id} onclick={() => (direction = d.id)}>{d.label}</Chip>
            {/each}
        </div>
        <p class="hint">{directions.find(d => d.id === direction)?.hint}</p>
    {/snippet}

    {#snippet mc()}
        <McViewport label="Minecraft player list with the VIP group">
            <div class="tablist mc-text">
                <div class="tab-row"><PixelHead look="lianecx" size="1rem" /><span><span class="admin">[Admin]</span> Lianecx</span></div>
                <div class="tab-row"><PixelHead look="cubey" size="1rem" /><span>{#if group}<span class="vip" in:fly={{ x: -8, duration: 200 }}>[VIP] </span>{/if}Cubey</span></div>
                <div class="tab-row"><PixelHead look="newbie" size="1rem" /><span>Newbie</span></div>
            </div>
            <div class="mc-overlay"><McChat {lines} max={3} /></div>
        </McViewport>
    {/snippet}

    {#snippet dc()}
        <div class="profile" aria-label="Discord profile of Cubey">
            <div class="banner"></div>
            <div class="avatar"><PixelHead look="cubey" size="100%" /></div>
            <div class="body">
                <div class="name">Cubey</div>
                <div class="handle">cubey · linked to <b>Cubey</b> in Minecraft</div>
                <div class="section">Roles</div>
                <ul class="roles">
                    <li><i style:background="#99aab5"></i>Member</li>
                    {#if role}<li in:fly={{ y: 6, duration: 200 }}><i style:background="#f1c40f"></i>VIP</li>{/if}
                </ul>
            </div>
        </div>
    {/snippet}
</Scene>

<style>
    .row { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.4rem; }
    .row.dir { margin-top: 0.6rem; }
    .dlabel { font-size: 0.8rem; color: #adb5bd; }
    .hint { margin: 0.5rem 0 0; font-size: 0.8rem; color: #adb5bd; min-height: 1.2em; }
    .tablist { position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); min-width: 12rem; padding: 0.3rem; background: rgb(0 0 0 / 0.62); color: #fff; font-size: 0.9rem; }
    .tab-row { display: flex; align-items: center; gap: 0.4rem; padding: 0.15rem 0.3rem; margin-top: 1px; background: rgb(255 255 255 / 0.12); }
    .vip { color: var(--color-mc-gold); }
    .admin { color: var(--color-mc-red); }
    .mc-overlay { position: absolute; left: 0.75rem; right: 0.75rem; bottom: 0.75rem; font-size: 0.85rem; }

    .profile { position: relative; max-width: 22rem; border-radius: 10px; overflow: hidden; background: #232428; box-shadow: 0 0 0 1px rgb(255 255 255 / 0.04), 0 18px 40px rgb(0 0 0 / 0.35); }
    .banner { height: 5.5rem; background: linear-gradient(120deg, #ae3ec9, #f59f00); }
    .avatar { position: absolute; top: 2.75rem; left: 1rem; width: 5rem; height: 5rem; padding: 0.35rem; border-radius: 50%; background: #232428; }
    .avatar :global(svg) { border-radius: 50%; }
    .body { padding: 3rem 1rem 1rem; }
    .name { font-size: 1.25rem; font-weight: 700; color: var(--color-dc-header); }
    .handle { font-size: 0.85rem; color: var(--color-dc-muted); }
    .handle b { color: var(--color-grass-light); font-weight: 600; }
    .section { margin-top: 1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-dc-header); }
    .roles { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.5rem 0 0; padding: 0; list-style: none; min-height: 1.6rem; }
    .roles li { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: #2e3035; font-size: 0.8rem; color: var(--color-dc-text); }
    .roles i { width: 0.7rem; height: 0.7rem; border-radius: 50%; }
</style>
