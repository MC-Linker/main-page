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
    const buttonType = { primary: 'primary', secondary: 'secondary', danger: 'destructive', success: 'success', link: 'secondary' } as const;
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
    {/if}
    {#if msg.content}{@html discordMarkdown(msg.content)}{/if}
    {#each msg.embeds ?? [] as e, i (i)}
        <discord-embed
            slot="embeds"
            color={e.color}
            author-name={e.author?.name}
            author-image={e.author ? (e.author.avatar ? avatarUrl(e.author.avatar) : e.author.icon) : undefined}
            embed-title={e.title}
            image={e.image}
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
    {#if msg.buttons?.length}
        <discord-attachments slot="components">
            <discord-action-row>
                <!-- discord-button draws a real <button> inside, so it already works with the keyboard. -->
                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                {#each msg.buttons as b, i (i)}<discord-button type={buttonType[b.style ?? 'secondary']} disabled={b.disabled || undefined} onclick={b.disabled ? undefined : b.onclick}>{b.label}</discord-button>{/each}
            </discord-action-row>
        </discord-attachments>
    {/if}
</discord-message>
