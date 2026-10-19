import { links } from './data/links';
import { team } from './data/team';

/**
 * Discord "component embeds": a custom link preview made of message components
 * (text, images, link buttons), shown when someone posts a link to the site in Discord.
 * https://docs.discord.com/developers/link-previews/component-embeds
 *
 * Rules that make Discord drop the whole preview: the root must be one Container (17);
 * only types 1, 2, 9, 10, 11, 12, 14 and 17 are allowed; buttons are link buttons
 * (style 5) with nothing but type, style, url, label (and emoji, disabled, id);
 * at most 40 components, 10 media items and 3000 bytes of JSON; all URLs absolute.
 * Discord doesn't run JavaScript, so the payload must be in the prerendered HTML.
 * The Open Graph tags stay as the fallback for older clients and other sites.
 */

export const site = 'https://mclinker.com';
const abs = (path: string) => (path.startsWith('http') ? path : site + path);

/** The grass green used for the theme colour, as the integer Discord expects. */
const green = 0x6f9e2d;

type Button = { type: 2; style: 5; label: string; url: string };
type Text = { type: 10; content: string };
type Thumbnail = { type: 11; media: { url: string } };
type Section = { type: 9; components: Text[]; accessory: Thumbnail | Button };
type Gallery = { type: 12; items: { media: { url: string }; description?: string }[] };
type Separator = { type: 14 };
type Row = { type: 1; components: Button[] };
type Child = Text | Section | Gallery | Separator | Row;
export type ComponentEmbed = { component: { type: 17; accent_color: number; components: Child[] } };

const text = (content: string): Text => ({ type: 10, content });
const button = (label: string, url: string): Button => ({ type: 2, style: 5, label, url: abs(url) });
const row = (...buttons: Button[]): Row => ({ type: 1, components: buttons });
const section = (content: string, accessory: Thumbnail | Button): Section => ({ type: 9, components: [text(content)], accessory });
const thumbnail = (url: string): Thumbnail => ({ type: 11, media: { url: abs(url) } });
const container = (...components: Child[]): ComponentEmbed => ({ component: { type: 17, accent_color: green, components } });

export function homeEmbed(): ComponentEmbed {
    return container(
        section(
            '# MC Linker\n' +
            'Links your Minecraft server with Discord. Chat flows both ways, and inventories, stats, moderation and role sync work right from Discord.\n' +
            '-# Free Discord bot and server plugin · No bot to host, no config files',
            thumbnail('/logo.png'),
        ),
        {
            type: 12,
            items: [
                { media: { url: abs('/hero/inventory.png') }, description: 'A player inventory, rendered in Discord' },
                { media: { url: abs('/showcase/userinfo.png') }, description: 'Player stats with /userinfo' },
                { media: { url: abs('/showcase/serverinfo.png') }, description: 'Server info with /serverinfo' },
                { media: { url: abs('/showcase/statchannel.png') }, description: 'Stat channels with the server status' },
            ],
        },
        text('**Set up in three steps:** add the bot, install the plugin, run `/connect`.'),
        { type: 14 },
        row(
            button('Add to Discord', links.invite),
            button('Get the plugin', links.plugin.modrinth),
            button('Guide', links.guide),
            button('Support', links.support),
        ),
    );
}

export function teamEmbed(): ComponentEmbed {
    const thanks = team.specialThanks.map(m => m.username).join(', ');
    return container(
        text('# The MC Linker team\nThe people who build MC Linker.'),
        ...team.core.map(m => section(`**${m.username}**\n-# ${m.roles.join(' · ')}`, thumbnail(`/profiles/${m.username}.png`))),
        text(`-# Special thanks to ${thanks}.`),
        { type: 14 },
        row(button('Meet the team', links.pages.team), button('Add to Discord', links.invite)),
    );
}

export function legalEmbed(title: string, description: string, path: string): ComponentEmbed {
    const other = path === links.pages.terms
        ? button('Privacy Policy', links.pages.privacy)
        : button('Terms of Service', links.pages.terms);
    return container(
        section(`## ${title}\n${description}`, button('Read', path)),
        row(other, button('MC Linker', '/')),
    );
}

/**
 * The payload as a `<script>` for the page head. `<` is escaped so the JSON can't
 * close the tag. Fails the build if Discord would reject the payload for its size.
 */
export function embedScript(embed: ComponentEmbed): string {
    const json = JSON.stringify(embed).replace(/</g, '\\u003c');
    const bytes = new TextEncoder().encode(json).length;
    if(bytes > 3000) throw new Error(`Component embed is ${bytes} bytes, Discord allows 3000`);
    return `<script id="discord:component-embed" type="application/json">${json}</script>`;
}
