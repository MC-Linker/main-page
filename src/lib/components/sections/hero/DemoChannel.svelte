<script lang="ts">
    import { tick } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { scrollBehavior } from '$lib/browser';
    import DcComposer from '$lib/discord/DcComposer.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import { type Bridge, demoCommands } from './bridge.svelte';

    /** The hero's Discord side: the demo's #minecraft-chat channel, with a DM notification on top. */
    let { bridge, onsubmit }: { bridge: Bridge; onsubmit: (text: string) => void } = $props();

    let list: HTMLElement;
    let composer: DcComposer;

    // Keep the newest message in view.
    $effect(() => {
        void bridge.dc.length;
        void bridge.typing;
        tick().then(() => list?.scrollTo({ top: list.scrollHeight, behavior: scrollBehavior() }));
    });

    /** Starts typing in the message box, e.g. "/" to open the command list. */
    export function start(text = '/') {
        composer.start(text);
    }
</script>

<div class="channel">
    <DcWindow channel="minecraft-chat" topic="Linked with testing.mclinker.com · {bridge.online.length} online">
        <div class="dc-list" bind:this={list} aria-live="polite" aria-label="Discord channel (demo)">
            <discord-messages no-background>
                {#each bridge.dc as msg (msg.id)}
                    <div in:fly={{ y: 10, duration: 220 }}><DcMessage {msg} /></div>
                {/each}
            </discord-messages>
        </div>
        {#snippet footer()}
            <DcComposer bind:this={composer} placeholder="Message #minecraft-chat" commands={demoCommands} {onsubmit} label="Discord message (demo)" hint="Try a slash command!" />
            <div class="typing" aria-live="polite">
                {#if bridge.typing}<span transition:fade={{ duration: 150 }}><i></i><i></i><i></i> <b>{bridge.typing}</b> is typing…</span>{/if}
            </div>
        {/snippet}
    </DcWindow>
    {#if bridge.dmToast}
        <div class="dm-toast" role="status" transition:fly={{ y: -12, duration: 250 }}>
            <span class="dm-icon" aria-hidden="true">📬</span>
            <span><b>New DM from You</b><br />{bridge.dmToast}</span>
        </div>
    {/if}
</div>

<style>
    /* Fills whatever height the hero gives it; the message list takes the rest. */
    .channel { position: relative; flex: 1; min-height: 0; display: flex; }
    .channel :global(.window) { flex: 1; }
    .channel :global(.content) { display: flex; flex-direction: column; }
    .dc-list {
        flex: 1;
        min-height: 10rem;
        height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: #1a1b1e transparent;
        display: flex;
        flex-direction: column;
    }
    .dc-list > :first-child { margin-top: auto; }
    .typing { height: 1.25rem; padding-top: 0.25rem; font-size: 0.75rem; color: var(--color-dc-text); }
    .typing b { font-weight: 700; }
    .typing i {
        display: inline-block; width: 5px; height: 5px; margin-right: 2px; border-radius: 50%;
        background: var(--color-dc-text); animation: blink 1s infinite;
    }
    .typing i:nth-child(2) { animation-delay: 0.15s; }
    .typing i:nth-child(3) { animation-delay: 0.3s; }
    @keyframes blink { 50% { opacity: 0.3; } }

    .dm-toast {
        position: absolute; top: 3.5rem; right: 0.75rem; z-index: 3;
        display: flex; gap: 0.6rem; align-items: flex-start; max-width: 16rem; padding: 0.6rem 0.8rem;
        border-radius: 8px; background: #111214; box-shadow: 0 8px 24px rgb(0 0 0 / 0.5);
        font-size: 0.85rem; line-height: 1.35;
    }
    .dm-icon { font-size: 1.25rem; }

    /* Tablets and phones: the page scrolls, so the list gets a fixed height. */
    @media (max-width: 1023px) {
        .dc-list { flex: none; height: clamp(12rem, calc(50svh - 8rem), 22rem); min-height: 0; }
    }
    @media (max-width: 860px) {
        .dc-list { height: 20rem; }
    }
</style>
