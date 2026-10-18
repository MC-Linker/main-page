<script lang="ts">
    import DcAvatar from './DcAvatar.svelte';
    import { discordMarkdown } from './markdown';
    import type { Embed } from './types';

    let { embed }: { embed: Embed } = $props();
</script>

<article class="embed" style:--bar={embed.color}>
    {#if embed.author}
        <div class="author">
            {#if embed.author.avatar}<DcAvatar avatar={embed.author.avatar} size={24} />
            {:else if embed.author.icon}<img src={embed.author.icon} alt="" width="24" height="24" />{/if}
            <span>{embed.author.name}</span>
        </div>
    {/if}
    {#if embed.title}<div class="title">{embed.title}</div>{/if}
    {#if embed.description}<div class="desc">{@html discordMarkdown(embed.description)}</div>{/if}
    {#if embed.fields?.length}
        <div class="fields">
            {#each embed.fields as f, i (i)}
                <div class="field" class:inline={f.inline}>
                    <div class="fname">{f.name}</div>
                    <div class="fvalue">{@html discordMarkdown(f.value)}</div>
                </div>
            {/each}
        </div>
    {/if}
    {#if embed.image}<img class="image" src={embed.image} alt={embed.imageAlt ?? ''} loading="lazy" />{/if}
    {#if embed.footer}<div class="footer">{embed.footer}</div>{/if}
</article>

<style>
    .embed {
        position: relative;
        max-width: 26rem;
        margin-top: 0.25rem;
        padding: 0.5rem 1rem 0.875rem 0.875rem;
        background: var(--color-dc-2);
        border-left: 4px solid var(--bar);
        border-radius: 4px;
        font-size: 0.875rem;
        line-height: 1.375;
        color: var(--color-dc-text);
    }
    .author { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; font-weight: 600; font-size: 0.875rem; color: var(--color-dc-header); }
    .author img { border-radius: 50%; }
    .title { margin-top: 0.5rem; font-weight: 700; font-size: 1rem; color: var(--color-dc-header); }
    .desc { margin-top: 0.5rem; white-space: normal; overflow-wrap: anywhere; }
    .fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem 1rem; margin-top: 0.5rem; }
    .field { grid-column: 1 / -1; min-width: 0; }
    .field.inline { grid-column: auto; }
    .fname { font-weight: 700; color: var(--color-dc-header); margin-bottom: 0.125rem; }
    .fvalue { overflow-wrap: anywhere; }
    .image { display: block; margin-top: 1rem; max-width: 100%; border-radius: 4px; }
    .footer { margin-top: 0.5rem; font-size: 0.75rem; color: var(--color-dc-muted); }
    .embed :global(.dc-code) { padding: 0.1em 0.3em; border-radius: 3px; background: var(--color-dc-3); font-size: 0.85em; }
    .embed :global(.dc-codeblock) { margin: 0.375rem 0 0; padding: 0.5rem; border-radius: 4px; background: var(--color-dc-3); border: 1px solid #1a1b1e; font-size: 0.8rem; white-space: pre-wrap; }
    .embed :global(.dc-emoji) { display: inline-block; width: 1.25em; height: 1.25em; vertical-align: -0.25em; }
    .embed :global(a) { color: var(--color-dc-link); }
    .embed :global(.dc-mention) { padding: 0 2px; border-radius: 3px; background: rgb(88 101 242 / 0.3); color: #c9cdfb; }
</style>
