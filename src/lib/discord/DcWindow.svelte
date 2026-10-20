<script lang="ts">
    import type { Snippet } from 'svelte';

    /** A Discord channel: header with name and topic, the messages, and a footer for the message box. */
    type Props = {
        channel: string;
        topic?: string;
        /** "text" shows a #, "dm" an @. */
        kind?: 'text' | 'dm';
        children: Snippet;
        footer?: Snippet;
        sidebar?: Snippet;
        class?: string;
    };
    let { channel, topic, kind = 'text', children, footer, sidebar, class: className = '' }: Props = $props();
</script>

<div class="window {className}" class:has-sidebar={!!sidebar}>
    {#if sidebar}<aside class="sidebar">{@render sidebar()}</aside>{/if}
    <div class="main">
        <header class="bar">
            <span class="hash" aria-hidden="true">{kind === 'dm' ? '@' : '#'}</span>
            <span class="channel">{channel}</span>
            {#if topic}<span class="divider" aria-hidden="true"></span><span class="topic">{topic}</span>{/if}
        </header>
        <div class="content">{@render children()}</div>
        {#if footer}<div class="footer">{@render footer()}</div>{/if}
    </div>
</div>

<style>
    .window {
        display: flex;
        min-width: 0;
        background: var(--color-dc);
        border-radius: 10px;
        box-shadow: 0 0 0 1px rgb(255 255 255 / 0.04), 0 18px 40px rgb(0 0 0 / 0.35);
        overflow: hidden;
        color: var(--color-dc-text);
        font-family: var(--font-discord);
        text-align: left;
    }
    .sidebar { flex: none; width: 13rem; background: var(--color-dc-2); padding: 0.75rem 0.5rem; }
    .main { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .bar {
        display: flex; align-items: center; gap: 0.5rem; height: 3rem; padding: 0 1rem; flex: none;
        border-bottom: 1px solid #26282c; font-size: 0.95rem; overflow: hidden; white-space: nowrap;
    }
    .hash { font-size: 1.4rem; line-height: 1; color: #80848e; font-weight: 500; }
    .channel { font-weight: 600; color: var(--color-dc-header); }
    .divider { width: 1px; height: 1.5rem; background: #3f4147; flex: none; }
    .topic { font-size: 0.85rem; color: var(--color-dc-muted); overflow: hidden; text-overflow: ellipsis; }
    .content { flex: 1; min-height: 0; padding: 0.5rem 1rem; }
    .footer { padding: 0 1rem 1rem; }
    @media (max-width: 640px) {
        .sidebar { display: none; }
    }
</style>
