import { links } from '$lib/data';
import { colors, type Embed, embedStyle } from '$lib/discord/types';

/*
 * The bot's replies in the hero demo that show the pretend server's state:
 * /serverinfo's three pages and /help.
 */

/** The server state the embeds show. */
export type State = { online: string[]; night: boolean; rain: boolean; banned: string[] };

export function serverEmbed(s: State): Embed {
    return {
        ...embedStyle.success,
        color: colors.brand,
        title: 'Server Information',
        fields: [
            { name: 'Name', value: 'Linker SMP', inline: true },
            { name: 'MOTD', value: 'A cozy survival server', inline: true },
            { name: 'Players', value: `${s.online.length}/20`, inline: true },
            { name: 'Online', value: s.online.length ? s.online.join(', ') : 'Nobody' },
        ],
        image: '/showcase/serverlist.png',
        footer: 'Server IP: testing.mclinker.com (26.2)',
    };
}

export function worldEmbed(s: State): Embed {
    return {
        ...embedStyle.success,
        color: colors.brand,
        title: 'World Information',
        fields: [
            { name: 'World', value: 'world', inline: true },
            { name: 'Difficulty', value: 'Normal', inline: true },
            { name: 'Hardcore', value: 'No', inline: true },
            { name: 'Time', value: s.night ? 'Night 🌙' : 'Day ☀️', inline: true },
            { name: 'Weather', value: s.rain ? 'Rain 🌧️' : 'Clear', inline: true },
            { name: 'Spawn', value: '0, 64, 0', inline: true },
        ],
        image: '/showcase/serverlist.png',
        footer: 'Try /command time set night, then check again',
    };
}

export function adminEmbed(s: State): Embed {
    return {
        ...embedStyle.success,
        color: colors.red,
        title: 'Admin Information',
        fields: [
            { name: 'Operators', value: 'Lianecx', inline: true },
            { name: 'Whitelist', value: 'Off', inline: true },
            { name: 'Banned players', value: s.banned.length ? s.banned.join(', ') : 'None', inline: true },
            { name: 'Plugins', value: 'Discord-Linker, EssentialsX, WorldEdit' },
        ],
        image: '/showcase/serverlist.png',
        footer: 'Only server admins can see this page',
    };
}

export const helpEmbed = (): Embed => ({
    color: colors.blue,
    author: { name: 'MC Linker', icon: '/logo.png' },
    title: 'Help Menu',
    fields: [
        { name: 'Main', value: 'Main commands such as `/inventory`, or `/advancements`.' },
        { name: 'Moderation', value: 'Moderation commands such as `/ban` or `/command`.' },
        { name: 'Other', value: 'Other commands such as `/message` or `/serverinfo`.' },
        { name: 'Settings', value: 'Setup and settings such as `/connect` or `/chatchannel`.' },
        { name: '​', value: `**Still need help?** [Read the guide](${links.guide})` },
    ],
});
