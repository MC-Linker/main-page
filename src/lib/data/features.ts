import type { Author, DcButtonData, DcMsg, Embed, Interaction } from '$lib/discord/types';
import { bot, chatWebhook, colors, embedStyle, success } from '$lib/discord/types';
import type { Item, ItemIcon } from '$lib/mc/item';
import { guide } from './links';

/** One button under a paged message. */
export type PageButton = {
    label: string;
    style?: DcButtonData['style'];
    /** What the bot answers (privately) when the button is pressed. */
    followUp?: { command: string; response: string };
};

/** One page of a message like /userinfo, picked with the buttons under it. */
export type Page = {
    label: string;
    style?: DcButtonData['style'];
    embeds: Embed[];
    /** A second row of buttons that belongs to this page, like the admin actions. */
    actions?: PageButton[];
};

/** What a feature looks like in each world. */
export type Preview = {
    /** Discord messages, in order. */
    dc?: Omit<DcMsg, 'id'>[];
    /** A message whose buttons switch between pages. */
    paged?: { author: Author; interaction: Interaction; pages: Page[] };
    /** Minecraft chat lines. */
    mc?: string[];
    /** Screenshots shown under "In Discord". */
    images?: { src: string; alt: string }[];
    /** For features that are set up with choices, the choices instead of a demo. */
    options?: { title: string; choices: { name: string; text: string }[] }[];
};

/** Every feature, as an item in the Features section's list. */
export type Feature = Item & {
    tab: 'chat' | 'players' | 'moderation' | 'server' | 'accounts';
    commands: string[];
    guide: string;
    /** The world it starts in: that one is shown first, the other follows. */
    from: 'discord' | 'minecraft';
    preview: Preview;
};

// Real item textures, downloaded by scripts/mc-item-icons.py.
const texture = (name: string): ItemIcon => ({ image: `/mc/items/${name}.png` });

// Who runs the commands in the previews.
const you = { user: 'Lianecx', avatar: { head: 'lianecx' as const } };
const lianecx = { head: 'lianecx' as const };
const cubey = { head: 'cubey' as const };
const theAnnoying: Author = { name: 'TheAnnoying', avatar: { head: 'theannoying' } };

const userInfoAuthor = { name: 'Lianecx', avatar: lianecx };
const info = (embed: Omit<Embed, 'color'>): Embed => ({ color: embedStyle.success.color, ...embed });
const serverInfo = (embed: Omit<Embed, 'color'>): Embed => ({ color: colors.brand, ...embed });

/** The reply Minecraft shows when a Discord user answers a DM (from the plugin's private chat format). */
const whisper = (name: string, text: string) => `&9&o&lDiscord &8&o| &7&o${name} whispers to you: ${text}`;

const dmMessage = '### 📬 New DM from Cubey\nmeet me at spawn?\n-# Sent from Minecraft (testing.mclinker.com) · Reply to this message to send a reply · `/account dms` to manage DM settings';

export const features: Feature[] = [
    {
        id: 'chat-bridge',
        name: 'Chat bridge',
        lore: ['Minecraft chat in Discord,', 'Discord chat in Minecraft'],
        commands: ['/chatchannel'],
        guide: guide('features/chat-bridge'),
        tab: 'chat', icon: texture('oak_sign'), glint: true, rarity: 'rare', from: 'minecraft',
        preview: {
            mc: ['<Cubey> anyone up for the nether?', '&l&9Discord &8| &l&7TheAnnoying &8>>&r omw!'],
            dc: [
                { author: { name: 'Cubey', avatar: cubey, tag: 'APP' }, content: 'anyone up for the nether?' },
                { author: theAnnoying, content: 'omw!' },
            ],
        },
    },
    {
        id: 'console',
        name: 'Console channel',
        lore: ['Your server console, in a private channel.'],
        commands: ['/chatchannel'],
        guide: guide('features/console-channel'),
        tab: 'chat', icon: texture('repeating_command_block'), from: 'minecraft',
        preview: { dc: [{ author: chatWebhook, content: '```[18:02:11 INFO]: Cubey joined the game\n[18:02:15 INFO]: Cubey issued server command: /home base```' }] },
    },
    {
        id: 'dms',
        name: 'Direct messages',
        lore: ['DM Discord members from in-game, and they can answer.'],
        commands: ['/dm', '/message'],
        guide: guide('features/direct-messages'),
        tab: 'chat', icon: texture('writable_book'), from: 'minecraft',
        preview: {
            mc: ['> /dm TheAnnoying meet me at spawn?', '&aDM sent to TheAnnoying: meet me at spawn?', whisper('TheAnnoying', 'omw!')],
            dc: [
                { author: bot, content: dmMessage },
                {
                    author: theAnnoying, content: 'omw!',
                    reply: { author: bot.name, avatar: bot.avatar, bot: true, content: '📬 New DM from Cubey' },
                    reactions: [{ name: 'success', emoji: '/emoji/success.png', count: 1 }],
                },
            ],
        },
    },
    {
        id: 'inventory',
        name: 'Inventory',
        lore: ['See what anyone is carrying.'],
        commands: ['/inventory'],
        guide: guide('commands/inventory'),
        tab: 'players', icon: texture('barrel'), rarity: 'rare', from: 'discord',
        preview: {
            dc: [{
                author: bot, interaction: { ...you, command: '/inventory' },
                embeds: [success('Player Inventory', 'Here\'s the inventory of **Lianecx**:', { image: '/features/inventory.png' })],
            }],
        },
    },
    {
        id: 'stats',
        name: 'Statistics',
        lore: ['Every stat, drawn like the game\'s own screen.'],
        commands: ['/stats'],
        guide: guide('commands/stats'),
        tab: 'players', icon: texture('book'), from: 'discord',
        preview: {
            dc: [{
                author: bot, interaction: { ...you, command: '/stats' },
                embeds: [success('Player Statistics', 'Here are the statistics of **Lianecx**:', { image: '/features/stats.png' })],
            }],
        },
    },
    {
        id: 'advancements',
        name: 'Advancements',
        lore: ['The full advancement tree of a player.'],
        commands: ['/advancements'],
        guide: guide('commands/advancements'),
        tab: 'players', icon: texture('experience_bottle'), from: 'discord',
        preview: {
            dc: [{
                author: bot, interaction: { ...you, command: '/advancements' },
                embeds: [success('Player Advancements', 'Here are the advancements of **Lianecx**:', { image: '/features/advancements.png' })],
            }],
        },
    },
    {
        id: 'userinfo',
        name: 'Player info',
        lore: ['Health, XP, play time and more. Admins can kick, ban and op from here.'],
        commands: ['/userinfo'],
        guide: guide('commands/userinfo'),
        tab: 'players', icon: texture('spyglass'), from: 'discord',
        preview: {
            paged: {
                author: bot, interaction: { ...you, command: '/userinfo' },
                pages: [
                    {
                        label: 'General Information',
                        embeds: [info({
                            title: 'User Information', author: userInfoAuthor, footer: 'UUID: 5f8eb73b-25be-4c5a-a50f-a3dc7d3d1a67',
                            fields: [
                                { name: 'Status', value: '🟢 Online', inline: true },
                                { name: 'Banned', value: 'No', inline: true },
                                { name: 'Whitelisted', value: 'Yes', inline: true },
                                { name: 'Operator', value: 'Yes (Level: 4)', inline: true },
                                { name: 'Linked Discord Account', value: '@Lianecx', inline: true },
                            ],
                        })],
                    },
                    {
                        label: 'Survival Information',
                        embeds: [info({
                            title: 'User Information', author: userInfoAuthor,
                            fields: [
                                { name: 'Gamemode', value: 'Survival', inline: true },
                                { name: 'Score', value: '2905 ♦️', inline: true },
                                { name: 'Health', value: '10.0 ❤️', inline: true },
                                { name: 'Food Level', value: '20 🍗 (Saturation: 20)', inline: true },
                                { name: 'XP', value: '2248 ✨ (Level: 36)', inline: true },
                                { name: 'First Joined', value: 'June 10, 2025 7:23 PM', inline: true },
                                { name: 'Last Joined', value: 'October 19, 2026 5:21 PM', inline: true },
                                { name: 'Play Time', value: '50h 29m 51s', inline: true },
                                { name: 'Teams', value: 'Builders', inline: true },
                            ],
                        })],
                    },
                    {
                        label: 'Admin Information', style: 'danger',
                        embeds: [info({
                            title: 'User Information', author: userInfoAuthor,
                            fields: [
                                { name: 'Current Position', value: '`120, 64, -340` (Dimension: Overworld)', inline: true },
                                { name: 'Spawn Location', value: '`0, 64, 0` (Dimension: Overworld)', inline: true },
                                { name: 'Last Death Location', value: '`-52, 12, 88` (Dimension: Nether)', inline: true },
                            ],
                        })],
                        actions: [
                            { label: 'Kick', style: 'danger', followUp: { command: 'kick Lianecx', response: 'Kicked Lianecx: Kicked by an operator' } },
                            { label: 'Ban', style: 'danger', followUp: { command: 'ban Lianecx', response: 'Banned Lianecx: Banned by an operator.' } },
                            { label: 'De-OP', style: 'primary', followUp: { command: 'deop Lianecx', response: 'Made Lianecx no longer a server operator' } },
                            { label: 'Un-Whitelist', style: 'secondary', followUp: { command: 'whitelist remove Lianecx', response: 'Removed Lianecx from the whitelist' } },
                        ],
                    },
                ],
            },
        },
    },
    {
        id: 'moderation',
        name: 'Moderation',
        lore: ['Ban, kick, op and more without the console.'],
        commands: ['/ban', '/unban', '/kick', '/op', '/deop', '/gamemode'],
        guide: guide('commands/ban-unban'),
        tab: 'moderation', icon: texture('iron_sword'), from: 'discord',
        preview: {
            dc: [{ author: bot, interaction: { ...you, command: '/ban' }, embeds: [{ ...embedStyle.success, color: colors.orange, title: 'Ban Player', description: 'Successfully banned player **Griefer**: `Too much TNT`' }] }],
            mc: ['&eGriefer left the game', '&7&o[Server: Banned Griefer: Too much TNT]'],
        },
    },
    {
        id: 'command',
        name: 'Run any command',
        lore: ['Every Minecraft command, from Discord.'],
        commands: ['/command'],
        guide: guide('commands/command'),
        tab: 'moderation', icon: texture('command_block'), glint: true, rarity: 'epic', from: 'discord',
        preview: {
            dc: [{ author: bot, interaction: { ...you, command: '/command' }, embeds: [{ ...embedStyle.success, color: colors.blue, title: 'Command Executed', description: '```Gave 64 [Diamond] to Cubey```' }] }],
            mc: ['&7&o[Server: Gave 64 [Diamond] to Cubey]'],
        },
    },
    {
        id: 'serverinfo',
        name: 'Server info',
        lore: ['Players, world settings, gamerules, plugins and seed.'],
        commands: ['/serverinfo'],
        guide: guide('commands/serverinfo'),
        tab: 'server', icon: texture('compass'), from: 'discord',
        preview: {
            paged: {
                author: bot, interaction: { ...you, command: '/serverinfo' },
                pages: [
                    {
                        label: 'General Information',
                        embeds: [serverInfo({
                            title: 'Server Information', thumbnail: '/logo.png', image: '/showcase/serverlist.png', footer: 'Server IP: testing.mclinker.com (1.21.4)',
                            fields: [
                                { name: 'Name', value: 'Example SMP', inline: true },
                                { name: 'MOTD', value: 'Welcome to the Example SMP!', inline: true },
                                { name: 'Players', value: '7/20', inline: true },
                            ],
                        })],
                    },
                    {
                        label: 'World Information',
                        embeds: [serverInfo({
                            title: 'World Information', image: '/showcase/serverlist.png',
                            fields: [
                                { name: 'Spawn Coordinates', value: 'Players will spawn at `0, 64, 0` in world: `world`' },
                                { name: 'Allow End/Nether', value: 'End: `Enabled`\nNether: `Enabled`' },
                                { name: 'Difficulty', value: 'Normal', inline: true },
                                { name: 'Gamerules (only non-default values)', value: 'keepInventory: true\nplayersSleepingPercentage: 50' },
                            ],
                        })],
                    },
                    {
                        label: 'Admin Information', style: 'danger',
                        embeds: [serverInfo({
                            title: 'Admin Information', image: '/showcase/serverlist.png',
                            fields: [
                                { name: 'Plugins', value: 'Discord-Linker\nLuckPerms\nEssentialsX', inline: true },
                                { name: 'Datapacks', value: 'Vanilla', inline: true },
                                { name: 'Whitelisted Users', value: '12', inline: true },
                                { name: 'Banned Users', value: '2', inline: true },
                                { name: 'Banned IPs', value: '0', inline: true },
                                { name: 'Operators', value: '3', inline: true },
                                { name: 'Whitelist', value: 'Enabled', inline: true },
                                { name: 'Seed', value: '`-4172144997902289642`', inline: true },
                            ],
                        })],
                    },
                ],
            },
        },
    },
    {
        id: 'stat-channels',
        name: 'Stat channels',
        lore: ['Live player count and status in your channel list.'],
        commands: ['/statchannel'],
        guide: guide('features/stat-channels'),
        tab: 'server', icon: texture('clock'), from: 'discord',
        preview: { images: [{ src: '/showcase/statchannel.png', alt: 'Three voice channels showing the server status, the member count and the IP' }] },
    },
    {
        id: 'customize',
        name: 'Make it yours',
        lore: ['Your own name, avatar and banner. Or a whole custom bot.'],
        commands: ['/customize'],
        guide: guide('features/customization'),
        tab: 'server', icon: texture('painting'), glint: true, from: 'discord',
        preview: { images: [{ src: '/hero/profilecustomization.png', alt: 'A custom MC Linker bot profile in villager fashion' }] },
    },
    {
        id: 'role-sync',
        name: 'Role sync',
        lore: ['Keep Discord roles and Minecraft groups in step.'],
        commands: ['/rolesync'],
        guide: guide('features/role-sync'),
        tab: 'accounts', icon: texture('name_tag'), rarity: 'rare', from: 'discord',
        preview: {
            options: [
                {
                    title: 'Sync a role with',
                    choices: [
                        { name: 'LuckPerms group', text: 'Members of the role get the group.' },
                        { name: 'Vault group', text: 'Works with any Vault-supported permissions plugin.' },
                        { name: 'Minecraft team', text: 'Members of the role join the scoreboard team.' },
                    ],
                },
                {
                    title: 'Direction',
                    choices: [
                        { name: 'Both', text: 'Changes on either side are copied to the other. The default.' },
                        { name: 'To Minecraft', text: 'Discord roles decide the Minecraft group or team.' },
                        { name: 'To Discord', text: 'Minecraft groups and teams decide the Discord role.' },
                    ],
                },
            ],
        },
    },
    {
        id: 'accounts',
        name: 'Account linking',
        lore: ['One command to link Discord and Minecraft.'],
        commands: ['/account connect', '/verify'],
        guide: guide('features/account-linking'),
        tab: 'accounts', icon: texture('chain'), from: 'discord',
        preview: {
            dc: [{ author: bot, interaction: { user: 'Cubey', avatar: cubey, command: '/account connect' }, embeds: [success('Account Verified', 'Successfully verified your account.')] }],
            mc: ['> /verify a8f3c', '&aYou have been verified successfully.'],
        },
    },
    {
        id: 'join-requirements',
        name: 'Join requirements',
        lore: ['Your Discord is the whitelist.'],
        commands: ['/connect'],
        guide: guide('features/join-requirements'),
        tab: 'accounts', icon: texture('iron_door'), from: 'discord',
        preview: {
            options: [{
                title: 'Who can join',
                choices: [
                    { name: 'Everyone', text: 'No requirement. The default.' },
                    { name: 'Require linked account', text: 'Players must link their Minecraft account to Discord first.' },
                    { name: 'Require roles', text: 'Players need any or all of the Discord roles you pick.' },
                ],
            }],
        },
    },
    {
        id: 'linked-roles',
        name: 'Linked Roles',
        lore: ['A Minecraft badge on Discord profiles.'],
        commands: [],
        guide: guide('features/linked-roles'),
        tab: 'accounts', icon: texture('emerald'), from: 'discord',
        preview: {
            images: [
                { src: '/features/linked-roles-profile.png', alt: 'A Discord message from a member with a Minecraft badge, and the linked accounts that gave it' },
                { src: '/features/linked-roles-apps.png', alt: 'The Minecraft app on a Discord profile, powered by MC Linker' },
            ],
        },
    },
];

/** The feature list's tabs. "all" shows everything and has the search field. */
export const featureTabs = [
    { id: 'all', name: 'All', icon: texture('book') },
    { id: 'chat', name: 'Chat & Logs', icon: texture('oak_sign') },
    { id: 'players', name: 'Players', icon: texture('barrel') },
    { id: 'moderation', name: 'Moderation', icon: texture('iron_sword') },
    { id: 'server', name: 'Server', icon: texture('clock') },
    { id: 'accounts', name: 'Accounts & Roles', icon: texture('chain') },
] as const satisfies { id: string; name: string; icon: ItemIcon }[];
