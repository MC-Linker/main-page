import { headOf } from '$lib/pixel/heads';
import { spriteDataUri } from '$lib/pixel/render';
import type { Avatar } from './types';

const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The bot's custom emoji, served from /emoji. */
const botEmoji = /:(step|success|warning|error|join|leave|death|command):/g;

/**
 * A small subset of Discord markdown, rendered with discord-components'
 * elements where they work well: code blocks, inline code, bold, italic, links, headings, small text,
 * @mentions, #channels, the bot's emoji and line breaks. Input is escaped first, so
 * it is safe for text visitors type.
 */
export function discordMarkdown(text: string, inEmbed = false): string {
    const embed = inEmbed ? ' embed' : '';
    const blocks: string[] = [];
    let out = escape(text).replace(/```(?:\w+\n)?([\s\S]*?)```/g, (_, code: string) => {
        blocks.push(`<discord-code multiline${embed}>${code.replace(/^\n|\n$/g, '')}</discord-code>`);
        return `\uE000${blocks.length - 1}\uE000`;
    });
    out = out
        // Headings and small text are blocks of their own, so they swallow their line break.
        .replace(/^(#{1,3}) (.+)\n?/gm, (_, h: string, t: string) => `<discord-header level="${h.length}">${t}</discord-header>`)
        .replace(/^-# (.+)\n?/gm, '<discord-subscript>$1</discord-subscript>')
        .replace(/`([^`]+)`/g, `<discord-code${embed}>$1</discord-code>`)
        // Plain <strong>/<em>: the library's <discord-bold> adds stray spaces around its text.
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<discord-link href="$2" target="_blank" rel="noopener">$1</discord-link>')
        // Command mentions, written like Discord's </name> (Discord adds an id: </name:123>).
        .replace(/&lt;\/([\w -]+?)(?::\d+)?&gt;/g, '<discord-mention type="slash">$1</discord-mention>')
        .replace(/(^|\s)@([\w.]+)/g, '$1<discord-mention>$2</discord-mention>')
        .replace(/(^|\s)#([\w-]+)/g, '$1<discord-mention type="channel">$2</discord-mention>')
        .replace(botEmoji, `<discord-custom-emoji name="$1" url="/emoji/$1.png"${inEmbed ? ' embed-emoji' : ''}></discord-custom-emoji>`)
        .replace(/\n/g, '<br>');
    return out.replace(/\uE000(\d+)\uE000/g, (_, i) => blocks[+i] ?? '');
}

/** discord-components wants an image URL; pixel heads and letters become small SVGs. */
export function avatarUrl(avatar: Avatar): string {
    if('image' in avatar) return avatar.image;
    if('head' in avatar) return spriteDataUri(headOf(avatar.head));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='${avatar.color}'/><text x='20' y='27' text-anchor='middle' font-family='sans-serif' font-weight='700' font-size='18' fill='white'>${escape(avatar.letter)}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
