<script lang="ts">
    import { fly } from 'svelte/transition';
    import McText from './McText.svelte';
    import type { McLine } from './text';

    /** Minecraft's chat: the latest lines over the world, and the chat bar when `onsubmit` is set. */
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

    function keydown(e: KeyboardEvent) {
        if(e.key === 'Escape') { input?.blur(); return; }
        if(e.key !== 'Enter') return;
        e.preventDefault();
        const text = value.trim();
        if(!text) return;
        onsubmit?.(text);
        value = '';
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
        <label class="bar">
            <span class="sr-only">{label} input</span>
            <input
                bind:this={input}
                bind:value
                {placeholder}
                autocomplete="off"
                spellcheck="false"
                maxlength="100"
                class="mc-text"
                onkeydown={keydown}
            />
        </label>
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
    .bar { display: block; background: rgb(0 0 0 / 0.55); }
    input {
        display: block; width: 100%; height: 2rem; padding: 0 0.5rem;
        border: 0; outline: 0; background: transparent; color: #fff;
        font-size: 1rem; caret-color: #fff;
    }
    input::placeholder { color: #c8c8c8; text-shadow: none; }
    .bar:has(input:focus-visible) { outline: 2px solid #fff; }
</style>
