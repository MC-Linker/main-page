<script lang="ts">
    import type { SlashCommand } from './types';

    type Props = {
        placeholder: string;
        commands?: SlashCommand[];
        onsubmit: (text: string) => void;
        input?: HTMLInputElement;
        label?: string;
    };
    let { placeholder, commands = [], onsubmit, input = $bindable(), label = placeholder }: Props = $props();

    let value = $state('');
    let active = $state(0);
    let focused = $state(false);
    const listId = `dc-suggest-${Math.random().toString(36).slice(2, 8)}`;

    type Suggestion = { label: string; description: string; fill: string };
    const suggestions = $derived.by<Suggestion[]>(() => {
        if(!value.startsWith('/')) return [];
        const [name, ...rest] = value.slice(1).split(' ');
        if(rest.length === 0) {
            return commands
                .filter(c => c.name.startsWith(name.toLowerCase()))
                .map(c => ({ label: `/${c.name}`, description: c.description, fill: `/${c.name} ` }));
        }
        const cmd = commands.find(c => c.name === name.toLowerCase());
        const arg = rest.join(' ').toLowerCase();
        return (cmd?.suggestions ?? [])
            .filter(s => s.toLowerCase().startsWith(arg) && s.toLowerCase() !== arg)
            .slice(0, 6)
            .map(s => ({ label: s, description: '', fill: `/${cmd!.name} ${s}` }));
    });
    const open = $derived(focused && suggestions.length > 0);

    $effect(() => { suggestions; active = 0; });

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

<div class="composer">
    {#if open}
        <ul class="suggest" id={listId} role="listbox" aria-label="Commands">
            <li class="suggest-head" aria-hidden="true">{value.includes(' ') ? 'Suggestions from your server' : 'MC Linker'}</li>
            {#each suggestions as s, i (s.label)}
                <li role="option" aria-selected={i === active} class:active={i === active}>
                    <button type="button" tabindex="-1" onmousedown={e => e.preventDefault()} onclick={() => pick(s)}>
                        <span class="s-label">{s.label}</span>
                        {#if s.description}<span class="s-desc">{s.description}</span>{/if}
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
    <div class="field">
        <span class="plus" aria-hidden="true">+</span>
        <input
            bind:this={input}
            bind:value
            {placeholder}
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
        <span class="kbd" aria-hidden="true">/</span>
    </div>
</div>

<style>
    .composer { position: relative; }
    .field {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0 0.75rem 0 1rem; height: 2.75rem; border-radius: 8px;
        background: var(--color-dc-input);
    }
    .plus {
        display: grid; place-items: center; width: 1.5rem; height: 1.5rem; flex: none;
        border-radius: 50%; background: #b5bac1; color: var(--color-dc-input); font-weight: 700; line-height: 1;
    }
    input {
        flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent;
        color: var(--color-dc-text); font: inherit; font-size: 0.9375rem;
    }
    input::placeholder { color: #6d6f78; }
    .field:has(input:focus-visible) { outline: 2px solid var(--color-dc-blurple); outline-offset: 0; }
    .kbd {
        display: grid; place-items: center; width: 1.25rem; height: 1.25rem; flex: none;
        border: 1px solid #4e5058; border-radius: 4px; font-size: 0.75rem; color: var(--color-dc-muted);
    }
    .suggest {
        position: absolute; left: 0; right: 0; bottom: calc(100% + 0.5rem); z-index: 5;
        margin: 0; padding: 0.5rem; list-style: none;
        background: var(--color-dc-2); border-radius: 8px; box-shadow: 0 8px 24px rgb(0 0 0 / 0.4);
        max-height: 16rem; overflow: auto;
    }
    .suggest-head { padding: 0.25rem 0.5rem 0.375rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; color: var(--color-dc-muted); }
    .suggest button {
        display: flex; align-items: baseline; gap: 0.75rem; width: 100%; padding: 0.375rem 0.5rem;
        border: 0; border-radius: 4px; background: none; color: var(--color-dc-text); font: inherit; text-align: left; cursor: pointer;
    }
    .suggest li.active button, .suggest button:hover { background: var(--color-dc-hover); }
    .s-label { font-weight: 600; color: var(--color-dc-header); white-space: nowrap; }
    .s-desc { font-size: 0.8125rem; color: var(--color-dc-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
