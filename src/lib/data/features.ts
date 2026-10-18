import { guide } from './links';

export type Feature = {
    id: string;
    title: string;
    /** One short line, used on cards. */
    tagline: string;
    /** One or two sentences, used where there's room. */
    description: string;
    /** Commands involved, shown as chips. */
    commands: string[];
    guide: string;
};

export const features: Feature[] = [
    {
        id: 'chat-bridge',
        title: 'Chat bridge',
        tagline: 'Minecraft chat in Discord. Discord chat in Minecraft.',
        description: 'Messages flow both ways, with player skins as avatars. Joins, quits, deaths, advancements, commands and server starts can come along too.',
        commands: ['/chatchannel'],
        guide: guide('features/chat-bridge'),
    },
    {
        id: 'console',
        title: 'Console channel',
        tagline: 'Your server console, in a private channel.',
        description: 'Stream the console output into any channel so your staff can keep an eye on things from their phone.',
        commands: ['/chatchannel'],
        guide: guide('features/console-channel'),
    },
    {
        id: 'command',
        title: 'Run any command',
        tagline: 'Every Minecraft command, from Discord.',
        description: '/command runs anything on your server, with tab-completion that comes live from the server itself.',
        commands: ['/command'],
        guide: guide('commands/command'),
    },
    {
        id: 'player-info',
        title: 'Inventories & stats',
        tagline: 'See what anyone is carrying.',
        description: 'Inventories, statistics and advancements are rendered as images, straight from your server, including shulker boxes and enchantments.',
        commands: ['/inventory', '/stats', '/advancements'],
        guide: guide('commands/inventory'),
    },
    {
        id: 'info',
        title: 'Player & server info',
        tagline: 'Health, XP, play time, MOTD, gamerules.',
        description: '/userinfo shows a player\'s status, health, XP and play time. /serverinfo shows the MOTD, players, world settings and plugins.',
        commands: ['/userinfo', '/serverinfo'],
        guide: guide('commands/userinfo'),
    },
    {
        id: 'moderation',
        title: 'Moderation',
        tagline: 'Ban, kick, op and more without the console.',
        description: 'Moderate from anywhere. Discord\'s own permissions decide who may ban, kick, op or change gamemodes.',
        commands: ['/ban', '/unban', '/kick', '/op', '/deop', '/gamemode'],
        guide: guide('commands/ban-unban'),
    },
    {
        id: 'stat-channels',
        title: 'Stat channels',
        tagline: 'Live player count in your channel list.',
        description: 'Channel names or topics that show who\'s online, your IP, version or the time, with separate templates for online and offline.',
        commands: ['/statchannel'],
        guide: guide('features/stat-channels'),
    },
    {
        id: 'role-sync',
        title: 'Role sync',
        tagline: 'Discord roles ⇄ Minecraft groups.',
        description: 'Keep Discord roles in sync with Minecraft teams, LuckPerms or Vault groups. You pick the direction.',
        commands: ['/rolesync'],
        guide: guide('features/role-sync'),
    },
    {
        id: 'accounts',
        title: 'Account linking',
        tagline: 'One command to link Discord and Minecraft.',
        description: 'Players link with /account connect and /verify. Premium, cracked and Bedrock (Floodgate) accounts all work.',
        commands: ['/account connect', '/verify'],
        guide: guide('features/account-linking'),
    },
    {
        id: 'join-requirements',
        title: 'Join requirements',
        tagline: 'Your Discord is the whitelist.',
        description: 'Only let players join who linked their account, or who have the right Discord roles.',
        commands: ['/connect'],
        guide: guide('features/join-requirements'),
    },
    {
        id: 'linked-roles',
        title: 'Linked Roles',
        tagline: 'A Minecraft badge on Discord profiles.',
        description: 'Use Discord\'s Linked Roles to give verified players a role and show their connection on their profile.',
        commands: [],
        guide: guide('features/linked-roles'),
    },
    {
        id: 'dms',
        title: 'Direct messages',
        tagline: 'DM Discord members from in-game.',
        description: 'Players send DMs with /dm and get replies right in their chat. /message whispers to players from Discord.',
        commands: ['/dm', '/message'],
        guide: guide('features/direct-messages'),
    },
    {
        id: 'customize',
        title: 'Make it yours',
        tagline: 'Your name, avatar and banner.',
        description: 'Change the bot\'s nickname, avatar, banner and bio in your server for free, or run your own branded bot with premium.',
        commands: ['/customize'],
        guide: guide('features/customization'),
    },
];

export const featureById = (id: string) => features.find(f => f.id === id)!;
