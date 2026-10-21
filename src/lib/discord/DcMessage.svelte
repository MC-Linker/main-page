<script lang="ts">
    import { avatarUrl, discordMarkdown } from './markdown';
    import type { DcMsg, EmbedField } from './types';

    /**
     * One Discord message, drawn by discord-components (@skyra/discord-components-core).
     * Put it inside a <discord-messages> element. This only maps our message data
     * onto the library's elements.
     */
    let { msg }: { msg: DcMsg } = $props();

    // discord-components lays out inline fields by their position in a row (1 to 3).
    const withIndex = (fields: EmbedField[]) => {
        let run = 0;
        return fields.map(f => {
            run = f.inline ? (run % 3) + 1 : 0;
            return { ...f, index: f.inline ? run : undefined };
        });
    };
    const rows = $derived([msg.buttons, ...(msg.buttonRows ?? [])].filter(r => r?.length) as NonNullable<DcMsg['buttons']>[]);
    const buttonType = { primary: 'primary', secondary: 'secondary', danger: 'destructive', success: 'success', link: 'secondary' } as const;

    // Like Discord: a clicked button shows pulsing dots in place of its label while the bot
    // answers, and the message ignores other clicks until the answer arrives.
    let loading = $state<string | null>(null);
    async function press(key: string, onclick?: () => void) {
        if(!onclick || loading) return;
        loading = key;
        await new Promise(r => setTimeout(r, 650));
        loading = null;
        onclick();
    }
</script>

<discord-message
    author={msg.author.name}
    avatar={avatarUrl(msg.author.avatar)}
    bot={msg.author.tag === 'APP' || undefined}
    verified={msg.author.verified || undefined}
    role-color={msg.author.color}
    ephemeral={msg.ephemeral || undefined}
    timestamp="Today at 4:20 PM"
>
    {#if msg.interaction}
        <discord-command slot="reply" author={msg.interaction.user} avatar={avatarUrl(msg.interaction.avatar)} command={msg.interaction.command}></discord-command>
    {:else if msg.reply}
        <discord-reply slot="reply" author={msg.reply.author} avatar={avatarUrl(msg.reply.avatar)} bot={msg.reply.bot || undefined}>{msg.reply.content}</discord-reply>
    {/if}
    {#if msg.thinking}<span class="thinking">{msg.author.name} is thinking<i></i><i></i><i></i></span>{/if}
    {#if msg.content}{@html discordMarkdown(msg.content)}{/if}
    {#each msg.embeds ?? [] as e, i (i)}
        <discord-embed
            slot="embeds"
            color={e.color}
            author-name={e.author?.name}
            author-image={e.author ? (e.author.avatar ? avatarUrl(e.author.avatar) : e.author.icon) : undefined}
            embed-title={e.title}
            image={e.image}
            thumbnail={e.thumbnail}
        >
            {#if e.description}<discord-embed-description slot="description">{@html discordMarkdown(e.description, true)}</discord-embed-description>{/if}
            {#if e.fields?.length}
                <discord-embed-fields slot="fields">
                    {#each withIndex(e.fields) as f, j (j)}
                        <discord-embed-field field-title={f.name} inline={f.inline || undefined} inline-index={f.index}>{@html discordMarkdown(f.value, true)}</discord-embed-field>
                    {/each}
                </discord-embed-fields>
            {/if}
            {#if e.footer}<discord-embed-footer slot="footer">{e.footer}</discord-embed-footer>{/if}
        </discord-embed>
    {/each}
    {#if msg.reactions?.length}
        <discord-reactions slot="reactions">
            {#each msg.reactions as r (r.name)}<discord-reaction name={r.name} emoji={r.emoji} count={r.count}></discord-reaction>{/each}
        </discord-reactions>
    {/if}
    {#if rows.length}
        <discord-attachments slot="components">
            {#each rows as row, i (i)}
                <discord-action-row>
                    <!-- discord-button draws a real <button> inside, so it already works with the keyboard. -->
                    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                    {#each row as b, j (j)}<discord-button type={buttonType[b.style ?? 'secondary']} disabled={b.disabled || undefined} aria-busy={loading === `${i}-${j}` || undefined} onclick={b.disabled ? undefined : () => press(`${i}-${j}`, b.onclick)}><span class="label" class:loading={loading === `${i}-${j}`}><span class="text">{b.label}</span><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></span></discord-button>{/each}
                </discord-action-row>
            {/each}
        </discord-attachments>
    {/if}
</discord-message>

<style>
    .thinking i { display: inline-block; width: 0.25em; height: 0.25em; margin-left: 0.18em; border-radius: 50%; background: currentColor; vertical-align: 0.1em; animation: dot 1.2s infinite both; }
    .thinking i:nth-of-type(2) { animation-delay: 0.2s; }
    .thinking i:nth-of-type(3) { animation-delay: 0.4s; }

    /* Discord's pulsing ellipsis: the label keeps the button's width but is hidden behind three dots. */
    .label { position: relative; display: inline-block; }
    .dots { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; gap: 0.2rem; }
    .label.loading .text { visibility: hidden; }
    .label.loading .dots { display: flex; }
    .dots i { width: 0.375rem; height: 0.375rem; border-radius: 50%; background: currentColor; animation: pulse 1.4s ease-in-out infinite; }
    .dots i:nth-of-type(2) { animation-delay: 0.15s; }
    .dots i:nth-of-type(3) { animation-delay: 0.3s; }
    @keyframes pulse { 0%, 60%, 100% { opacity: 1; transform: scale(1); } 30% { opacity: 0.3; transform: scale(0.8); } }
    @keyframes dot { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
</style>
