import { type Author, type Embed, type SlashCommand, visitor } from '$lib/discord/types';
import { vanillaCommands } from '$lib/mc/commands';
import type { CommandTree } from '$lib/mc/suggest';
import type { LookName } from '$lib/pixel/heads';

/*
 * The hero demo's cast and wording. Messages and command replies mirror the real bot and
 * plugin (formats taken from the plugin config and the bot's language file).
 */

export type Player = { name: string; look: LookName };

export const players: Record<string, Player> = {
    cubey: { name: 'Cubey', look: 'cubey' },
    lianecx: { name: 'Lianecx', look: 'lianecx' },
    you: { name: 'You', look: 'newbie' },
};

export const members = {
    theannoying: { name: 'TheAnnoying', avatar: { head: 'theannoying' }, color: '#f47b67' } satisfies Author,
    bnux: { name: 'Bnux', avatar: { head: 'bnux' }, color: '#3ba55d' } satisfies Author,
    you: visitor,
};

/** The visitor, as the user of a slash command. */
export const you = { user: visitor.name, avatar: visitor.avatar };

/** The commands the demo's Minecraft chat understands, for its suggestions (see runMinecraft and execute): the game's own, and the plugin's. */
export const mcCommands: CommandTree = {
    ...vanillaCommands,
    dm: { TheAnnoying: { '<message>': {} }, Bnux: { '<message>': {} } },
    discord: {},
    verify: {},
    linker: {},
};

export const demoCommands: SlashCommand[] = [
    {
        name: 'command',
        description: 'Execute any command on the Minecraft-server.',
        options: ['command'],
        tree: vanillaCommands,
    },
    { name: 'serverinfo', description: 'View information about the connected Minecraft server.' },
    { name: 'inventory', description: 'Get an image of the current player\'s inventory.', options: ['user'], suggestions: ['TheAnnoying'] },
    { name: 'message', description: 'Send private chat messages to members on the server.', options: ['user', 'message'], suggestions: ['Cubey psst, behind you', 'Lianecx nice build!'] },
    { name: 'ban', description: 'Ban a player from the Minecraft server.', options: ['user', 'reason'], suggestions: ['Griefer too much TNT'] },
    { name: 'help', description: 'Detailed description of every command.' },
];

/** What the game says to commands it doesn't know. */
export const UNKNOWN_COMMAND = 'Unknown or incomplete command, see below for error';

// The plugin's default config.yml formats.
export const discordToMc = (name: string, text: string) => `&l&9Discord &8| &l&7${name} &8>>&r ${text}`;
export const privateToMc = (name: string, text: string) => `&9&o&lDiscord &8&o| &7&o${name} whispers to you: ${text}`;

const shortcodes: Record<string, string> = {
    '💀': ':skull:', '😂': ':joy:', '❤️': ':heart:', '🔥': ':fire:', '👍': ':thumbsup:', '🛏️': ':bed:',
    '😭': ':sob:', '🎉': ':tada:', '👋': ':wave:', '😀': ':grinning:', '😄': ':smile:', '🙂': ':slight_smile:',
};
/** The bot turns emoji into :shortcodes: before sending them to Minecraft. */
export const toShort = (text: string) =>
    text.replace(/\p{Extended_Pictographic}️?/gu, m => shortcodes[m] ?? shortcodes[m.replace('️', '')] ?? ':emoji:');

export const webhookFor = (p: Player): Author => ({ name: p.name, avatar: { head: p.look }, tag: 'APP' });
export const eventEmbed = (p: Player, description: string, color: string): Embed => ({
    color,
    author: { name: p.name, avatar: { head: p.look } },
    description,
});
