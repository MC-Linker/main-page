<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import Scene from '../Scene.svelte';
    import Chip from '../Chip.svelte';
    import McViewport from '$lib/mc/McViewport.svelte';
    import McChat from '$lib/mc/McChat.svelte';
    import McText from '$lib/mc/McText.svelte';
    import McButton from '$lib/mc/McButton.svelte';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import { bot, embedStyle, type DcMsg } from '$lib/discord/types';
    import { looks, player } from '$lib/pixel/sprites';
    import { featureById } from '$lib/data/features';
    import { spriteUri } from '$lib/pixel/uri';
    import { dirt } from '$lib/pixel/sprites';
    import { reducedMotion, sleep } from '$lib/motion';
    import type { McLine } from '$lib/mc/types';

    let { index }: { index: number } = $props();
    const feature = featureById('accounts');
    const joinReq = featureById('join-requirements');

    type Mode = 'link' | 'require';
    let mode = $state<Mode>('link');
    let step = $state(0);
    let typing = $state('');
    let run = 0;

    const wait = (ms: number) => sleep(reducedMotion.current ? 0 : ms);

    async function play(next: Mode) {
        mode = next;
        step = 0;
        typing = '';
        const id = ++run;
        await wait(500);
        if(id !== run) return;
        step = 1;
        await wait(1100);
        if(next === 'link') {
            for(const ch of '/verify a8f3c') {
                if(id !== run) return;
                typing += ch;
                await wait(60);
            }
            await wait(350);
        }
        else await wait(700);
        if(id !== run) return;
        typing = '';
        step = 2;
    }

    const linkMc = $derived<McLine[]>([
        ...(step >= 1 ? [{ id: 1, text: '&eYou have been added to the verification queue. Please execute "/verify <code>" in-game within 3 minutes to verify your account.' }] : []),
        ...(step >= 2 ? [{ id: 2, text: '&aYou have been verified successfully.' }] : []),
    ]);

    const cubeyDiscord = { user: 'Cubey', avatar: { head: 'cubey' as const } };
    // Texts from the bot's /account and DM verification replies.
    const linkDc = $derived<DcMsg[]>([
        step < 2
            ? { id: 1, author: bot, interaction: { ...cubeyDiscord, command: '/account connect' }, embeds: [{ ...embedStyle.step, title: 'Account Verification', description: ':step: To verify your account, please join the server (**play.example.net**) and execute the following command: ```/verify a8f3c```\n**You have 3 minutes to run the command.**' }] }
            : { id: 2, author: bot, interaction: { ...cubeyDiscord, command: '/account connect' }, embeds: [{ ...embedStyle.success, title: 'Account Verified', description: 'Successfully verified your account.' }] },
    ]);
    const requireDc = $derived<DcMsg[]>([
        ...(step >= 1 ? [{ id: 3, author: { name: 'Newbie', avatar: { head: 'newbie' as const } }, content: '4821' }] : []),
        ...(step >= 2 ? [{ id: 4, author: bot, embeds: [{ ...embedStyle.success, title: 'Account Verified', description: 'Successfully verified your account.' }] }] : []),
    ]);

    const kick = '&eYou have not connected your Minecraft account to Discord.\nPlease join &b&ndiscord.gg/linker-smp&e and DM &b@MC Linker#7784&e with the code &b4821&e in the next&l 3 minutes&e and rejoin.';
    const cubey = player(looks.cubey);
    const dirtTile = spriteUri(dirt);
</script>

<Scene id={feature.id} {index} title="Link accounts, guard the door" description="Players link Discord and Minecraft once with /account connect and /verify. Then turn on a join requirement and only linked players, or players with the right Discord roles, get in. Works for premium, cracked and Bedrock players." commands={['/account connect', '/verify', '/connect join-requirement']} guide={feature.guide} material="deepslate" onenter={() => play('link')}>
    {#snippet controls()}
        <div class="row">
            <Chip pressed={mode === 'link'} onclick={() => play('link')}>🔗 Link an account</Chip>
            <Chip pressed={mode === 'require'} onclick={() => play('require')}>🚪 Require a linked account</Chip>
        </div>
        {#if mode === 'require'}<a class="more" href={joinReq.guide}>More about join requirements →</a>{/if}
    {/snippet}

    {#snippet mc()}
        <McViewport label={mode === 'link' ? 'Cubey verifying in Minecraft chat' : 'A player being kept out until they link'}>
            {#if mode === 'link'}
                <div class="player" aria-hidden="true"><PixelArt sprite={cubey} width="100%" /></div>
                <div class="mc-overlay">
                    <McChat lines={linkMc} max={3} />
                    {#if typing}<div class="fake-input mc-text">{typing}<i class="caret"></i></div>{/if}
                </div>
            {:else}
                <div class="kicked" style:--dirt={dirtTile} in:fade={{ duration: 200 }}>
                    {#if step < 2}
                        <p class="mc-text title">Failed to connect to the server</p>
                        <p class="mc-text reason"><McText text={kick} /></p>
                        <McButton>Back to server list</McButton>
                    {:else}
                        <p class="mc-text title" in:fade>Joining world…</p>
                        <p class="mc-text reason"><McText text="&aLinked! Newbie can play now." /></p>
                    {/if}
                </div>
            {/if}
        </McViewport>
    {/snippet}

    {#snippet dc()}
        <DcWindow channel={mode === 'link' ? 'general' : 'MC Linker'} kind={mode === 'link' ? 'text' : 'dm'}>
            <div class="list" aria-live="polite">
                {#each mode === 'link' ? linkDc : requireDc as m (m.id)}
                    <div in:fly={{ y: 10, duration: 200 }}><DcMessage msg={m} compact /></div>
                {/each}
            </div>
        </DcWindow>
    {/snippet}
</Scene>

<style>
    .row { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem; }
    .more { display: inline-block; margin-top: 0.6rem; font-size: 0.85rem; color: #c9cdfb; }
    .player { position: absolute; left: 50%; bottom: var(--ground); width: 2.4rem; transform: translateX(-50%); }
    .mc-overlay { position: absolute; left: 0.75rem; right: 0.75rem; top: 0.75rem; font-size: 0.85rem; }
    .fake-input { margin-top: 0.4rem; padding: 0.25rem 0.5rem; background: rgb(0 0 0 / 0.55); color: #fff; }
    .caret { display: inline-block; width: 0.5em; height: 2px; margin-left: 2px; background: #fff; animation: caret 1s steps(1) infinite; }
    @keyframes caret { 50% { opacity: 0; } }
    .kicked {
        position: absolute; inset: 0; z-index: 5;
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem;
        padding: 1rem; text-align: center;
        background: linear-gradient(rgb(0 0 0 / 0.6), rgb(0 0 0 / 0.6)), var(--dirt) 0 0 / 48px 48px;
        image-rendering: pixelated;
    }
    .kicked p { margin: 0; }
    .title { color: #aaa; font-size: 1rem; }
    .reason { max-width: 24rem; font-size: 0.9rem; line-height: 1.45; white-space: pre-line; }
    .list { display: flex; flex-direction: column; justify-content: flex-end; height: 16.25rem; overflow: hidden; }
</style>
