<script lang="ts">
    import type { SlashCommand } from './types';

    type Props = {
        placeholder: string;
        commands?: SlashCommand[];
        onsubmit: (text: string) => void;
        input?: HTMLInputElement;
        label?: string;
        /** A small bubble pointing at the "/" button, until a command is started. */
        hint?: string;
    };
    let { placeholder, commands = [], onsubmit, input = $bindable(), label = placeholder, hint }: Props = $props();

    let value = $state('');
    let active = $state(0);
    let focused = $state(false);
    /** The hint goes away for good once a command has been started. */
    let hinted = $state(false);
    const uid = $props.id();
    const listId = `dc-suggest-${uid}`;

    $effect(() => {
        if(value.startsWith('/')) hinted = true;
    });

    type Suggestion = { label: string; description: string; fill: string };

    // Once "/name " is typed, the command turns into chips and the rest is the first option's value.
    const cmd = $derived.by(() => {
        const m = /^\/([\w-]+) /.exec(value);
        return m ? (commands.find(c => c.name === m[1].toLowerCase()) ?? null) : null;
    });
    const tail = $derived(cmd ? value.slice(cmd.name.length + 2) : value);
    const option = $derived(cmd?.options?.[0]);

    const suggestions = $derived.by<Suggestion[]>(() => {
        if(cmd) {
            const arg = tail.toLowerCase();
            return (cmd.suggestions ?? [])
                .filter(s => s.toLowerCase().startsWith(arg) && s.toLowerCase() !== arg)
                .slice(0, 6)
                .map(s => ({ label: s, description: '', fill: `/${cmd.name} ${s}` }));
        }
        if(!value.startsWith('/')) return [];
        const name = value.slice(1).toLowerCase();
        return commands
            .filter(c => c.name.startsWith(name))
            .map(c => ({ label: `/${c.name}`, description: c.description, fill: `/${c.name} ` }));
    });
    const open = $derived(focused && suggestions.length > 0);

    // A new list starts at its first entry.
    $effect(() => {
        void suggestions;
        active = 0;
    });

    // Arrow keys keep the highlighted entry inside the list's scroll area.
    let list = $state<HTMLElement>();
    $effect(() => {
        const el = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);
        if(!el || !list) return;
        if(el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop;
        else if(el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
    });

    function pick(s: Suggestion) {
        value = s.fill;
        input?.focus();
    }

    function keydown(e: KeyboardEvent) {
        if(open) {
            if(e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % suggestions.length; return; }
            if(e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + suggestions.length) % suggestions.length; return; }
            if(e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                pick(suggestions[active]);
                return;
            }
        }
        // Backspace on an empty value takes the command apart again.
        if(cmd && e.key === 'Backspace' && tail === '') {
            e.preventDefault();
            value = `/${cmd.name}`;
            return;
        }
        if(e.key === 'Escape') { input?.blur(); return; }
        if(e.key === 'Enter') {
            e.preventDefault();
            const text = value.trim();
            if(!text) return;
            onsubmit(text);
            value = '';
        }
    }

    /** Used by the page to start typing a slash command from anywhere. */
    export function start(text = '/') {
        value = text;
        input?.focus();
    }
</script>

<div class="composer" class:stacked={open || cmd} class:open>
    {#if open}
        <ul class="suggest" id={listId} role="listbox" aria-label="Commands" bind:this={list}>
            <li class="suggest-head" aria-hidden="true">
                {#if cmd}Suggestions from your server{:else}<img src="/logo.png" alt="" width="16" height="16" /> MC Linker{/if}
            </li>
            {#each suggestions as s, i (s.label)}
                <li role="option" aria-selected={i === active} class:active={i === active} data-index={i}>
                    <button type="button" tabindex="-1" onmousedown={e => e.preventDefault()} onclick={() => pick(s)}>
                        <span class="s-label">{s.label}</span>
                        {#if s.description}<span class="s-desc">{s.description}</span>{/if}
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
    {#if cmd}
        <div class="info"><span class="i-name">/{cmd.name}</span><span class="i-desc">{cmd.description}</span></div>
    {/if}
    <!-- Clicking anywhere in the box starts typing, like in Discord. -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="field" class:command={!!cmd} onclick={() => input?.focus()}>
        {#if cmd}
            <img class="app" src="/logo.png" alt="" width="22" height="22" />
            <span class="pill">/{cmd.name}</span>
        {:else}
            <span class="plus" aria-hidden="true">+</span>
        {/if}
        <!-- In Discord the option's name and its value are one box. -->
        <span class="param" class:boxed={!!option}>
            {#if option}<span class="opt">{option}</span>{/if}
            <input
                bind:this={input}
                bind:value={() => tail, v => (value = cmd ? `/${cmd.name} ${v}` : v)}
                style:width={option ? `calc(${Math.max(tail.length, 4)}ch + 0.5rem)` : undefined}
                placeholder={cmd ? '' : placeholder}
                aria-label={label}
                autocomplete="off"
                spellcheck="false"
                maxlength="200"
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                onkeydown={keydown}
                onfocus={() => (focused = true)}
                onblur={() => (focused = false)}
            />
        </span>
        {#if !cmd}
            <button type="button" class="kbd" aria-label="Show commands" title="Commands" onmousedown={e => e.preventDefault()} onclick={() => start('/')}>/</button>
        {/if}
        {#if hint && !hinted && !open}
            <span class="hint-bubble" aria-hidden="true">{hint}</span>
        {/if}
    </div>
</div>

<style>
    .composer { position: relative; }
    .field {
        position: relative;
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0 0.75rem 0 1rem; height: 2.75rem; border-radius: 8px;
        background: var(--color-dc-input);
    }
    .plus {
        display: grid; place-items: center; width: 1.5rem; height: 1.5rem; flex: none;
        border-radius: 50%; background: #b5bac1; color: var(--color-dc-input); font-weight: 700; line-height: 1;
    }
    input {
        flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; box-shadow: none; background: transparent;
        color: var(--color-dc-text); font: inherit; font-size: max(0.9375rem, 16px);
    }
    input::placeholder { color: #6d6f78; }
    .field:has(input:focus-visible) { outline: 2px solid var(--color-dc-blurple); outline-offset: 0; }
    .kbd {
        display: grid; place-items: center; width: 1.75rem; height: 1.75rem; flex: none; padding: 0; cursor: pointer;
        border: 1px solid #4e5058; border-radius: 6px; background: none; font: inherit; font-size: 0.85rem; font-weight: 700; color: var(--color-dc-muted);
    }
    .kbd:hover, .kbd:focus-visible { color: #fff; border-color: var(--color-dc-blurple); background: rgb(88 101 242 / 0.25); }
    /* Points down at the "/" button. */
    .hint-bubble {
        position: absolute; right: -0.25rem; bottom: calc(100% + 0.6rem); z-index: 4;
        padding: 0.4rem 0.65rem; border-radius: 6px; white-space: nowrap; pointer-events: none;
        background: var(--color-dc-blurple); color: #fff; font-size: 0.8rem; font-weight: 600;
        box-shadow: 0 6px 16px rgb(0 0 0 / 0.4);
        animation: hint-bob 1.4s ease-in-out infinite;
    }
    .hint-bubble::after {
        content: ''; position: absolute; right: 0.95rem; top: 100%;
        border: 6px solid transparent; border-top-color: var(--color-dc-blurple);
    }
    @keyframes hint-bob { 50% { transform: translateY(-4px); } }
    /* Phones: above the box it would cover the newest message, so it sits in the box, pointing at "/". */
    @media (max-width: 760px) {
        .hint-bubble { position: relative; right: auto; bottom: auto; order: 1; flex: none; margin-right: 0.2rem; padding: 0.3rem 0.5rem; font-size: 0.75rem; animation-name: hint-nudge; }
        .hint-bubble::after { right: auto; left: 100%; top: 50%; margin-top: -5px; border-width: 5px; border-top-color: transparent; border-left-color: var(--color-dc-blurple); }
        .kbd { order: 2; }
    }
    @keyframes hint-nudge { 50% { transform: translateX(-3px); } }
    /* The command list sits right on top of the box, like Discord's autocomplete. */
    .suggest {
        position: absolute; left: 0; right: 0; bottom: 100%; z-index: 5;
        margin: 0; padding: 0 0 0.25rem; list-style: none;
        background: var(--color-dc-2); border-radius: 8px 8px 0 0; box-shadow: 0 -4px 16px rgb(0 0 0 / 0.25);
        max-height: 17rem; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #1a1b1e transparent;
    }
    .suggest-head { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 0.75rem 0.4rem; font-size: 0.8125rem; font-weight: 700; color: var(--color-dc-header); }
    .suggest-head img { border-radius: 50%; }
    .suggest button {
        display: flex; flex-direction: column; align-items: flex-start; gap: 0.1rem; width: 100%; padding: 0.4rem 0.75rem;
        border: 0; background: none; color: var(--color-dc-text); font: inherit; text-align: left; cursor: pointer;
    }
    .suggest li.active button, .suggest button:hover { background: rgb(78 80 88 / 0.35); }
    .s-label { font-size: 1rem; font-weight: 700; color: var(--color-dc-header); white-space: nowrap; }
    .s-desc { max-width: 100%; font-size: 0.8125rem; color: #b5bac1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .composer.open .suggest + .info { border-radius: 0; }

    /* Once a command is picked: its name and description above the box, and the box turns into chips. */
    .info {
        display: flex; align-items: baseline; gap: 0.6rem; min-width: 0; padding: 0.55rem 0.75rem;
        background: var(--color-dc-2); border-radius: 8px 8px 0 0; font-size: 0.875rem;
    }
    .i-name { flex: none; font-weight: 700; color: var(--color-dc-header); }
    .i-desc { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #b5bac1; }
    .composer.stacked .field { border-radius: 0 0 8px 8px; }
    .field.command { gap: 0.4rem; padding-left: 0.65rem; cursor: text; }
    .app { flex: none; width: 1.375rem; height: 1.375rem; border-radius: 50%; }
    .pill { flex: none; padding: 0.15rem 0.45rem; border-radius: 4px; background: var(--color-dc-2); font-size: 0.9375rem; line-height: 1.3; font-weight: 700; color: var(--color-dc-header); }
    .param { display: flex; align-items: center; flex: 1; min-width: 0; height: 100%; }
    .param.boxed {
        flex: none; max-width: 100%; height: auto; gap: 0.5rem; padding: 0.1rem 0.25rem 0.1rem 0.5rem;
        border: 1px solid transparent; border-radius: 4px; background: var(--color-dc-2); font-size: 0.9375rem; line-height: 1.3;
    }
    .param.boxed:focus-within { border-color: var(--color-dc-blurple); }
    .param.boxed input { flex: none; height: 1.5rem; min-width: 0; max-width: 100%; }
    .opt { flex: none; color: var(--color-dc-header); }
</style>
