<script lang="ts">
    import { tick } from 'svelte';
    import { fly } from 'svelte/transition';
    import OreButton from '$lib/ore/OreButton.svelte';
    import { sendArrow } from '$lib/ore/sprites';
    import PixelArt from '$lib/pixel/PixelArt.svelte';
    import McText from './McText.svelte';
    import { type CommandTree, complete, suggest } from './suggest';
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
        /** The commands to suggest while typing one, like the game does. */
        commands?: CommandTree;
        /** Read new lines out to screen readers. Off for scripted demos until the visitor joins in. */
        live?: boolean;
        /** Keep the history and let it scroll (it fills the height it's given), instead of only the last `max` lines. */
        scroll?: boolean;
    };
    let { lines, onsubmit, input = $bindable(), placeholder = 'Press T to chat', max = 9, label = 'Minecraft chat', commands, live = false, scroll = false }: Props = $props();

    let value = $state('');
    let focused = $state(false);
    /** Hidden with Escape until the input changes, like in the game. */
    let dismissed = $state(false);
    let active = $state(0);
    const visible = $derived(lines.slice(scroll ? -100 : -max));

    // Scrolling: new lines come into view, unless you've scrolled up to read.
    let list = $state<HTMLElement>();
    let following = true;
    $effect(() => {
        void visible.length;
        if(scroll && following) tick().then(() => list && (list.scrollTop = list.scrollHeight));
    });
    function onscroll() {
        if(list) following = list.scrollHeight - list.scrollTop - list.clientHeight < 24;
    }
    const suggestions = $derived(commands && focused && !dismissed ? suggest(commands, value) : null);
    const options = $derived(suggestions?.options.slice(0, 10) ?? []);
    const uid = $props.id();
    const listId = `mc-suggest-${uid}`;

    function pick(option: string) {
        if(!commands || !suggestions) return;
        value = complete(commands, value, suggestions.start, option);
        active = 0;
        input?.focus();
    }

    function send() {
        const text = value.trim();
        if(!text) return;
        onsubmit?.(text);
        value = '';
    }

    function keydown(e: KeyboardEvent) {
        if(options.length) {
            // Tab fills in the highlighted suggestion; the arrows move the highlight.
            if(e.key === 'Tab') { e.preventDefault(); pick(options[active] ?? options[0]); return; }
            if(e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                active = (active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
                return;
            }
            if(e.key === 'Escape') { dismissed = true; return; }
        }
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
    <ol class="lines" class:scroll bind:this={list} onscroll={scroll ? onscroll : undefined} aria-live={live ? 'polite' : 'off'} aria-label={label}>
        {#each visible as line (line.id)}
            <li in:fly={{ y: 8, duration: 200 }}><McText text={line.text} /></li>
        {/each}
    </ol>
    {#if onsubmit}
        <div class="bar">
            {#if options.length}
                <!-- The game's suggestion box: the highlighted one in yellow, Tab fills it in. -->
                <ul class="suggest" id={listId} role="listbox" aria-label="Command suggestions">
                    {#each options as o, i (o)}
                        <li role="option" aria-selected={i === active} class:active={i === active}>
                            <button type="button" tabindex="-1" onmousedown={e => e.preventDefault()} onclick={() => pick(o)}>{o}</button>
                        </li>
                    {/each}
                </ul>
            {:else if suggestions?.hint}
                <p class="suggest hint" aria-hidden="true">{suggestions.hint}</p>
            {/if}
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
                    role={commands ? 'combobox' : undefined}
                    aria-expanded={commands ? options.length > 0 : undefined}
                    aria-controls={commands ? listId : undefined}
                    aria-autocomplete={commands ? 'list' : undefined}
                    oninput={() => { dismissed = false; active = 0; }}
                    onfocus={() => (focused = true)}
                    onblur={() => (focused = false)}
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
    /* Scrolling, the lines still sit at the bottom (justify-content: flex-end would cut off the oldest). */
    .lines.scroll { justify-content: flex-start; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }
    .lines.scroll::-webkit-scrollbar { display: none; }
    .lines.scroll > :first-child { margin-top: auto; }
    .lines li {
        padding: 0.0625rem 0.5rem;
        background: rgb(0 0 0 / 0.5);
        color: #fff;
        overflow-wrap: anywhere;
    }
    .bar { position: relative; display: flex; }
    /* Above the bar, under where you type the word, like the game. */
    .suggest {
        position: absolute; left: 0.35rem; bottom: calc(100% + 0.25rem); z-index: 2;
        display: flex; flex-direction: column; margin: 0; padding: 0.15rem 0; list-style: none;
        background: rgb(0 0 0 / 0.85);
    }
    .suggest button {
        display: block; width: 100%; padding: 0 0.5rem; border: 0; background: none; text-align: left; cursor: pointer;
        font: inherit; color: #a8a8a8;
    }
    .suggest li.active button, .suggest button:hover { color: #ffff55; }
    .suggest.hint { padding: 0 0.5rem; color: #a8a8a8; }
    .field { flex: 1; min-width: 0; }
    input { display: block; width: 100%; height: 2.5rem; padding: calc(2 * var(--t)) 0.6rem 0; caret-color: #fff; }
    /* The send button, joined to the field. */
    .bar :global(.send) { flex: none; width: 2.75rem; min-height: 2.5rem; margin-left: calc(-1 * var(--t)); padding-inline: 0; }
    .arrow { display: block; width: calc(7 * var(--t)); }
</style>
