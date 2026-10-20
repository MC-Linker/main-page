import type { DcMsg } from '$lib/discord/types';
import { bot, chatWebhook, colors, embedStyle, success } from '$lib/discord/types';
import type { Item, ItemIcon } from '$lib/mc/item';
import * as I from '$lib/pixel/items';
import { guide } from './links';

/** Every feature, as an item in the creative inventory (Features section). */
export type Feature = Item & {
    tab: 'chat' | 'players' | 'moderation' | 'server' | 'accounts';
    commands: string[];
    guide: string;
    /** What it looks like in Discord, and optionally the matching Minecraft chat. */
    preview: { dc: Omit<DcMsg, 'id'>; mc?: string[] };
};

// Who runs the commands in the previews.
const you = { user: 'Lianecx', avatar: { head: 'lianecx' as const } };
const cubey = { head: 'cubey' as const };

export const features: Feature[] = [
    {
        id: 'chat-bridge',
        name: 'Chat bridge',
        lore: ['Minecraft chat in Discord,', 'Discord chat in Minecraft'],
        commands: ['/chatchannel'],
        guide: guide('features/chat-bridge'),
        tab: 'chat', icon: { sprite: I.sign }, rarity: 'rare',
        preview: {
            dc: { author: { name: 'Cubey', avatar: cubey, tag: 'APP' }, content: 'anyone up for the nether?' },
            mc: ['<Cubey> anyone up for the nether?', '&l&9Discord &8| &l&7TheAnnoying &8>>&r omw!'],
        },
    },
    {
        id: 'console',
        name: 'Console channel',
        lore: ['Your server console, in a private channel.'],
        commands: ['/chatchannel'],
        guide: guide('features/console-channel'),
        tab: 'chat', icon: { sprite: I.repeatingCommandBlock },
        preview: { dc: { author: chatWebhook, content: '```[18:02:11 INFO]: Cubey joined the game\n[18:02:15 INFO]: Cubey issued server command: /home base```' } },
    },
    {
        id: 'dms',
        name: 'Direct messages',
        lore: ['DM Discord members from in-game.'],
        commands: ['/dm', '/message'],
        guide: guide('features/direct-messages'),
        tab: 'chat', icon: { sprite: I.letter },
        preview: {
            dc: { author: bot, content: '**📬 New DM from Cubey**\nmeet me at spawn?' },
            mc: ['&aDM sent to TheAnnoying: meet me at spawn?'],
        },
    },
    {
        id: 'player-info',
        name: 'Inventories & stats',
        lore: ['See what anyone is carrying.'],
        commands: ['/inventory', '/stats', '/advancements'],
        guide: guide('commands/inventory'),
        tab: 'players', icon: { sprite: I.chest }, rarity: 'rare',
        preview: { dc: { author: bot, interaction: { ...you, command: '/inventory' }, embeds: [success('Player Inventory', 'Here\'s the inventory of **TheAnnoying**:', { image: '/hero/inventory.png' })] } },
    },
    {
        id: 'info',
        name: 'Player & server info',
        lore: ['Health, XP, play time, MOTD, gamerules.'],
        commands: ['/userinfo', '/serverinfo'],
        guide: guide('commands/userinfo'),
        tab: 'players', icon: { sprite: I.map },
        preview: {
            dc: { author: bot, interaction: { ...you, command: '/userinfo' }, embeds: [{ ...embedStyle.success, title: 'User Information', author: { name: 'Lianecx', avatar: { head: 'lianecx' } }, fields: [{ name: 'Health', value: '10.0 ❤️', inline: true }, { name: 'XP', value: '2248 ✨ (Level: 36)', inline: true }, { name: 'Play Time', value: '50h 29m 51s', inline: true }] }] },
        },
    },
    {
        id: 'moderation',
        name: 'Moderation',
        lore: ['Ban, kick, op and more without the console.'],
        commands: ['/ban', '/unban', '/kick', '/op', '/deop', '/gamemode'],
        guide: guide('commands/ban-unban'),
        tab: 'moderation', icon: { sprite: I.sword },
        preview: {
            dc: { author: bot, interaction: { ...you, command: '/ban' }, embeds: [{ ...embedStyle.success, color: colors.orange, title: 'Ban Player', description: 'Successfully banned player **Griefer**: `Too much TNT`' }] },
            mc: ['&eGriefer left the game', '&7&o[Server: Banned Griefer: Too much TNT]'],
        },
    },
    {
        id: 'command',
        name: 'Run any command',
        lore: ['Every Minecraft command, from Discord.'],
        commands: ['/command'],
        guide: guide('commands/command'),
        tab: 'moderation', icon: { sprite: I.commandBlock }, rarity: 'epic',
        preview: {
            dc: { author: bot, interaction: { ...you, command: '/command' }, embeds: [{ ...embedStyle.success, color: colors.blue, title: 'Command Executed', description: '```Gave 64 [Diamond] to Cubey```' }] },
            mc: ['&7&o[Server: Gave 64 [Diamond] to Cubey]'],
        },
    },
    {
        id: 'stat-channels',
        name: 'Stat channels',
        lore: ['Live player count in your channel list.'],
        commands: ['/statchannel'],
        guide: guide('features/stat-channels'),
        tab: 'server', icon: { sprite: I.clock },
        preview: { dc: { author: bot, interaction: { ...you, command: '/statchannel add' }, embeds: [success('Added Stat Channel', 'Successfully added the stat channel.')], content: '🔊 **🟢 7 players online**' } },
    },
    {
        id: 'customize',
        name: 'Make it yours',
        lore: ['Your name, avatar and banner.'],
        commands: ['/customize'],
        guide: guide('features/customization'),
        tab: 'server', icon: { sprite: I.painting },
        preview: { dc: { author: bot, interaction: { ...you, command: '/customize' }, embeds: [success('Customized Server Appearance', 'Successfully customized MC Linker\'s appearance in this server!')] } },
    },
    {
        id: 'role-sync',
        name: 'Role sync',
        lore: ['Discord roles ⇄ Minecraft groups.'],
        commands: ['/rolesync'],
        guide: guide('features/role-sync'),
        tab: 'accounts', icon: { sprite: I.nameTag }, rarity: 'rare',
        preview: {
            dc: { author: bot, interaction: { ...you, command: '/rolesync add' }, embeds: [success('Added Synced Role', 'Successfully added the synced role.')] },
            mc: ['&b[LP] &fcubey &anow inherits permissions from &fvip&a in context global.'],
        },
    },
    {
        id: 'accounts',
        name: 'Account linking',
        lore: ['One command to link Discord and Minecraft.'],
        commands: ['/account connect', '/verify'],
        guide: guide('features/account-linking'),
        tab: 'accounts', icon: { sprite: I.chain },
        preview: {
            dc: { author: bot, interaction: { user: 'Cubey', avatar: cubey, command: '/account connect' }, embeds: [success('Account Verified', 'Successfully verified your account.')] },
            mc: ['> /verify a8f3c', '&aYou have been verified successfully.'],
        },
    },
    {
        id: 'join-requirements',
        name: 'Join requirements',
        lore: ['Your Discord is the whitelist.'],
        commands: ['/connect'],
        guide: guide('features/join-requirements'),
        tab: 'accounts', icon: { sprite: I.door },
        preview: {
            dc: { author: { name: 'Newbie', avatar: { head: 'newbie' } }, content: '4821' },
            mc: ['&eYou have not connected your Minecraft account to Discord.', '&ePlease DM &b@MC Linker&e with the code &b4821&e and rejoin.'],
        },
    },
    {
        id: 'linked-roles',
        name: 'Linked Roles',
        lore: ['A Minecraft badge on Discord profiles.'],
        commands: [],
        guide: guide('features/linked-roles'),
        tab: 'accounts', icon: { sprite: I.emerald },
        preview: { dc: { author: bot, content: '✅ **Verified Player** · Has Minecraft Account' } },
    },
];

/** The creative inventory's tabs. "all" shows everything and has the search field. */
export const featureTabs = [
    { id: 'all', name: 'Search Items', icon: { sprite: I.book } },
    { id: 'chat', name: 'Chat & Logs', icon: { sprite: I.sign } },
    { id: 'players', name: 'Players', icon: { sprite: I.chest } },
    { id: 'moderation', name: 'Moderation', icon: { sprite: I.sword } },
    { id: 'server', name: 'Server', icon: { sprite: I.clock } },
    { id: 'accounts', name: 'Accounts & Roles', icon: { sprite: I.chain } },
] as const satisfies { id: string; name: string; icon: ItemIcon }[];
