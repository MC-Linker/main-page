import { links } from '$lib/data';
import { colors, type Embed, embedStyle } from '$lib/discord/types';

/*
 * The bot's replies in the hero demo that show the pretend server's state:
 * /serverinfo's three pages and /help.
 */

/** The server state the embeds show. */
export type State = { online: string[]; night: boolean; rain: boolean; banned: string[] };

// Mirrors the real bot's /serverinfo (commands/other/ServerInfo.js and its en_us.json embeds):
// the general page shows only the player count, and no page shows time or weather.
export function serverEmbed(s: State): Embed {
    return {
        ...embedStyle.success,
        color: colors.brand,
        title: 'Server Information',
        thumbnail: '/logo.png',
        fields: [
            { name: 'Name', value: 'Linker SMP', inline: true },
            { name: 'MOTD', value: 'A cozy survival server', inline: true },
            { name: 'Players', value: `${s.online.length}/20`, inline: true },
        ],
        image: '/showcase/serverlist.png',
        footer: 'Server IP: testing.mclinker.com (26.2)',
    };
}

export function worldEmbed(_s: State): Embed {
    return {
        ...embedStyle.success,
        color: colors.brand,
        title: 'World Information',
        fields: [
            { name: 'Spawn Coordinates', value: 'Players will spawn at `0, 64, 0` in world: `world`' },
            { name: 'Allow End/Nether', value: 'End: `Enabled`\nNether: `Enabled`' },
            { name: 'Difficulty', value: 'Normal', inline: true },
            { name: 'Gamerules (only non-default values)', value: 'keepInventory: true\nplayersSleepingPercentage: 50' },
        ],
    };
}

// Lists show names (empty ones are left out); users, IPs and operators show only a count.
export function adminEmbed(s: State): Embed {
    return {
        ...embedStyle.success,
        color: colors.brand,
        title: 'Admin Information',
        fields: [
            { name: 'Plugins', value: 'Discord-Linker\nEssentialsX\nWorldEdit', inline: true },
            { name: 'Datapacks', value: 'Vanilla\nBundle', inline: true },
            { name: 'Whitelisted Users', value: '0', inline: true },
            { name: 'Banned Users', value: String(s.banned.length), inline: true },
            { name: 'Banned IPs', value: '0', inline: true },
            { name: 'Operators', value: '1', inline: true },
            { name: 'Whitelist', value: 'Disabled', inline: true },
            { name: 'Seed', value: '`-4172144997902289642`', inline: true },
        ],
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
