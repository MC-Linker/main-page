<script lang="ts">
    import DcAvatar from './DcAvatar.svelte';
    import DcEmbed from './DcEmbed.svelte';
    import { discordMarkdown } from './markdown';
    import type { DcMsg } from './types';

    let { msg, compact = false }: { msg: DcMsg; compact?: boolean } = $props();
</script>

<div class="msg" class:compact>
    {#if msg.interaction}
        <div class="reply">
            <span class="spine" aria-hidden="true"></span>
            <DcAvatar avatar={msg.interaction.avatar} size={16} />
            <span class="who">{msg.interaction.user}</span>
            <span>used</span>
            <span class="cmd">{msg.interaction.command}</span>
        </div>
    {/if}
    <div class="row">
        <DcAvatar avatar={msg.author.avatar} size={compact ? 32 : 40} />
        <div class="body">
            <div class="head">
                <span class="name" style:color={msg.author.color}>{msg.author.name}</span>
                {#if msg.author.tag}
                    <span class="tag">
                        {#if msg.author.verified}<svg viewBox="0 0 16 16" width="12" height="12" aria-label="Verified"><path fill="currentColor" d="M6.4 11.2 3.2 8l1.1-1.1 2.1 2.1 5.3-5.3L12.8 4.8z" /></svg>{/if}
                        {msg.author.tag}
                    </span>
                {/if}
                <span class="time">{msg.time ?? 'Today at 4:20 PM'}</span>
            </div>
            {#if msg.content}<div class="content">{@html discordMarkdown(msg.content)}</div>{/if}
            {#each msg.embeds ?? [] as embed, i (i)}<DcEmbed {embed} />{/each}
            {#if msg.buttons?.length}
                <div class="buttons">
                    {#each msg.buttons as b, i (i)}<span class="btn {b.style ?? 'secondary'}">{b.label}</span>{/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .msg { padding: 0.25rem 0; font-size: 0.9375rem; line-height: 1.375; }
    .row { display: flex; gap: 0.875rem; align-items: flex-start; }
    .compact .row { gap: 0.625rem; }
    .body { min-width: 0; flex: 1; }
    .head { display: flex; align-items: center; gap: 0.375rem; flex-wrap: wrap; }
    .name { font-weight: 600; color: var(--color-dc-header); }
    .tag {
        display: inline-flex; align-items: center; gap: 2px;
        padding: 0 4px; height: 15px; border-radius: 3px;
        background: var(--color-dc-blurple); color: white;
        font-size: 0.625rem; font-weight: 600; letter-spacing: 0.02em;
    }
    .time { font-size: 0.75rem; color: var(--color-dc-muted); }
    .content { color: var(--color-dc-text); overflow-wrap: anywhere; }
    .content :global(.dc-mention) { padding: 0 2px; border-radius: 3px; background: rgb(88 101 242 / 0.3); color: #c9cdfb; }
    .content :global(.dc-emoji) { display: inline-block; width: 1.25em; height: 1.25em; vertical-align: -0.25em; }
    .content :global(.dc-code) { padding: 0.1em 0.3em; border-radius: 3px; background: var(--color-dc-3); font-size: 0.85em; }
    .reply {
        position: relative; display: flex; align-items: center; gap: 0.25rem;
        margin-left: 3.375rem; margin-bottom: 0.25rem;
        font-size: 0.8125rem; color: var(--color-dc-muted);
    }
    .compact .reply { margin-left: 2.625rem; }
    .spine {
        position: absolute; left: -2.125rem; top: 50%; width: 1.875rem; height: 0.75rem;
        border-left: 2px solid #4e5058; border-top: 2px solid #4e5058; border-top-left-radius: 6px;
    }
    .compact .spine { left: -1.625rem; width: 1.375rem; }
    .who { color: var(--color-dc-header); font-weight: 500; }
    .cmd { color: var(--color-dc-link); }
    .buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
    .btn { padding: 0.25rem 1rem; border-radius: 4px; font-size: 0.875rem; font-weight: 500; color: white; background: #4e5058; }
    .btn.primary { background: var(--color-dc-blurple); }
    .btn.danger { background: var(--color-dc-red); }
    .btn.success { background: #248046; }
</style>
