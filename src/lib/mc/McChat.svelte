<script lang="ts">
    import { fly } from 'svelte/transition';
    import OreButton from '$lib/ore/OreButton.svelte';
    import { sendArrow } from '$lib/ore/sprites';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import McText from './McText.svelte';
    import type { McLine } from './text';

    /**
     * Minecraft's chat: the latest lines over the world, and, when `onsubmit` is set,
     * Bedrock's chat bar: a text field with a send button.
     */
    type Props = {
        lines: McLine[];
        onsubmit?: (text: string) => void;
        input?: HTMLInputElement;
        placeholder?: string;
        /** How many lines stay visible. */
        max?: number;
        label?: string;
    };
    let { lines, onsubmit, input = $bindable(), placeholder = 'Press T to chat', max = 9, label = 'Minecraft chat' }: Props = $props();

    let value = $state('');
    const visible = $derived(lines.slice(-max));

    function send() {
        const text = value.trim();
        if(!text) return;
        onsubmit?.(text);
        value = '';
    }

    function keydown(e: KeyboardEvent) {
        if(e.key === 'Escape') { input?.blur(); return; }
        if(e.key !== 'Enter') return;
        e.preventDefault();
        send();
    }

    export function start(text = '') {
        value = text;
        input?.focus();
    }
</script>

<div class="chat">
    <ol class="lines" aria-live="polite" aria-label={label}>
        {#each visible as line (line.id)}
            <li in:fly={{ y: 8, duration: 200 }}><McText text={line.text} /></li>
        {/each}
    </ol>
    {#if onsubmit}
        <div class="bar">
            <label class="field">
                <span class="sr-only">{label} input</span>
                <input
                    bind:this={input}
                    bind:value
                    {placeholder}
                    autocomplete="off"
                    spellcheck="false"
                    maxlength="100"
                    class="ore-field"
                    onkeydown={keydown}
                />
            </label>
            <OreButton onclick={send} label="Send" class="send"><span class="arrow"><PixelArt sprite={sendArrow()} width="100%" /></span></OreButton>
        </div>
    {/if}
</div>

<style>
    .chat { display: flex; flex-direction: column; gap: 0.5rem; font-family: var(--font-pixel); font-size: 1rem; line-height: 1.35; }
    .lines { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; justify-content: flex-end; }
    .lines li {
        padding: 0.0625rem 0.5rem;
        background: rgb(0 0 0 / 0.5);
        color: #fff;
        overflow-wrap: anywhere;
    }
    .bar { display: flex; }
    .field { flex: 1; min-width: 0; }
    input { display: block; width: 100%; height: 2.5rem; padding: calc(2 * var(--t)) 0.6rem 0; caret-color: #fff; }
    /* The send button, joined to the field. */
    .bar :global(.send) { flex: none; width: 2.75rem; min-height: 2.5rem; margin-left: calc(-1 * var(--t)); padding-inline: 0; }
    .arrow { display: block; width: calc(7 * var(--t)); }
</style>
