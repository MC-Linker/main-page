import type { Sprite, LookName } from '$lib/pixel/sprites';
import { commandBlock } from '$lib/pixel/sprites';
import * as I from '$lib/pixel/items';
import { featureById } from '$lib/data/features';
import { bot, chatWebhook, colors, embedStyle, success, type DcMsg } from '$lib/discord/types';

export type ItemIcon = { sprite: Sprite } | { image: string } | { block: 'grass' } | { head: LookName };

export type Item = {
    id: string;
    name: string;
    /** Minecraft rarity colours: white, yellow (uncommon), aqua (rare), light purple (epic). */
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic';
    lore: string[];
    icon: ItemIcon;
    glint?: boolean;
};

export const rarityColor = { common: '#ffffff', uncommon: '#ffff55', rare: '#55ffff', epic: '#ff55ff' } as const;

// ── Features, as items in a creative inventory ──────────────────────────
export type FeatureItem = Item & {
    tab: 'chat' | 'players' | 'moderation' | 'server' | 'accounts';
    commands: string[];
    guide: string;
    preview: { dc: Omit<DcMsg, 'id'>; mc?: string[] };
};

const you = { user: 'Lianecx', avatar: { head: 'lianecx' as const } };
const cubey = { head: 'cubey' as const };

const feature = (id: string, extra: Omit<FeatureItem, 'id' | 'name' | 'lore' | 'commands' | 'guide'> & { name?: string; lore?: string[] }): FeatureItem => {
    const f = featureById(id);
    return {
        id,
        name: extra.name ?? f.title,
        lore: extra.lore ?? [f.tagline],
        commands: f.commands,
        guide: f.guide,
        ...extra,
    };
};

export const featureItems: FeatureItem[] = [
    feature('chat-bridge', {
        tab: 'chat', icon: { sprite: I.sign }, rarity: 'rare',
        lore: ['Minecraft chat in Discord,', 'Discord chat in Minecraft'],
        preview: {
            dc: { author: { name: 'Cubey', avatar: cubey, tag: 'APP' }, content: 'anyone up for the nether?' },
            mc: ['<Cubey> anyone up for the nether?', '&l&9Discord &8| &l&7TheAnnoying &8>>&r omw!'],
        },
    }),
    feature('console', {
        tab: 'chat', icon: { sprite: I.repeatingCommandBlock },
        preview: { dc: { author: chatWebhook, content: '```[18:02:11 INFO]: Cubey joined the game\n[18:02:15 INFO]: Cubey issued server command: /home base```' } },
    }),
    feature('dms', {
        tab: 'chat', icon: { sprite: I.letter },
        preview: {
            dc: { author: bot, content: '**📬 New DM from Cubey**\nmeet me at spawn?' },
            mc: ['&aDM sent to TheAnnoying: meet me at spawn?'],
        },
    }),
    feature('player-info', {
        tab: 'players', icon: { sprite: I.chest }, rarity: 'rare',
        preview: { dc: { author: bot, interaction: { ...you, command: '/inventory' }, embeds: [success('Player Inventory', 'Here\'s the inventory of **TheAnnoying**:', { image: '/hero/inventory.png', imageAlt: 'A rendered Minecraft inventory' })] } },
    }),
    feature('info', {
        tab: 'players', icon: { sprite: I.map },
        preview: {
            dc: { author: bot, interaction: { ...you, command: '/userinfo' }, embeds: [{ ...embedStyle.success, title: 'User Information', author: { name: 'Lianecx', avatar: { head: 'lianecx' } }, fields: [{ name: 'Health', value: '10.0 ❤️', inline: true }, { name: 'XP', value: '2248 ✨ (Level: 36)', inline: true }, { name: 'Play Time', value: '50h 29m 51s', inline: true }] }] },
        },
    }),
    feature('moderation', {
        tab: 'moderation', icon: { sprite: I.sword },
        preview: {
            dc: { author: bot, interaction: { ...you, command: '/ban' }, embeds: [{ ...embedStyle.success, color: colors.orange, title: 'Ban Player', description: 'Successfully banned player **Griefer**: `Too much TNT`' }] },
            mc: ['&eGriefer left the game', '&7&o[Server: Banned Griefer: Too much TNT]'],
        },
    }),
    feature('command', {
        tab: 'moderation', icon: { sprite: commandBlock }, rarity: 'epic', name: 'Run any command',
        preview: {
            dc: { author: bot, interaction: { ...you, command: '/command' }, embeds: [{ ...embedStyle.success, color: colors.blue, title: 'Command Executed', description: '```Gave 64 [Diamond] to Cubey```' }] },
            mc: ['&7&o[Server: Gave 64 [Diamond] to Cubey]'],
        },
    }),
    feature('stat-channels', {
        tab: 'server', icon: { sprite: I.clock },
        preview: { dc: { author: bot, interaction: { ...you, command: '/statchannel add' }, embeds: [success('Added Stat Channel', 'Successfully added the stat channel.')], content: '🔊 **🟢 7 players online**' } },
    }),
    feature('customize', {
        tab: 'server', icon: { sprite: I.painting },
        preview: { dc: { author: bot, interaction: { ...you, command: '/customize' }, embeds: [success('Customized Server Appearance', 'Successfully customized MC Linker\'s appearance in this server!')] } },
    }),
    feature('role-sync', {
        tab: 'accounts', icon: { sprite: I.nameTag }, rarity: 'rare',
        preview: {
            dc: { author: bot, interaction: { ...you, command: '/rolesync add' }, embeds: [success('Added Synced Role', 'Successfully added the synced role.')] },
            mc: ['&b[LP] &fcubey &anow inherits permissions from &fvip&a in context global.'],
        },
    }),
    feature('accounts', {
        tab: 'accounts', icon: { sprite: I.chain },
        preview: {
            dc: { author: bot, interaction: { user: 'Cubey', avatar: cubey, command: '/account connect' }, embeds: [success('Account Verified', 'Successfully verified your account.')] },
            mc: ['> /verify a8f3c', '&aYou have been verified successfully.'],
        },
    }),
    feature('join-requirements', {
        tab: 'accounts', icon: { sprite: I.door },
        preview: {
            dc: { author: { name: 'Newbie', avatar: { head: 'newbie' } }, content: '4821' },
            mc: ['&eYou have not connected your Minecraft account to Discord.', '&ePlease DM &b@MC Linker&e with the code &b4821&e and rejoin.'],
        },
    }),
    feature('linked-roles', {
        tab: 'accounts', icon: { sprite: I.emerald },
        preview: { dc: { author: bot, content: '✅ **Verified Player** · Has Minecraft Account' } },
    }),
];

export const tabs = [
    { id: 'all', name: 'Search Items', icon: { sprite: I.book } },
    { id: 'chat', name: 'Chat & Logs', icon: { sprite: I.sign } },
    { id: 'players', name: 'Players', icon: { sprite: I.chest } },
    { id: 'moderation', name: 'Moderation', icon: { sprite: I.sword } },
    { id: 'server', name: 'Server', icon: { sprite: I.clock } },
    { id: 'accounts', name: 'Accounts & Roles', icon: { sprite: I.chain } },
] as const satisfies { id: string; name: string; icon: ItemIcon }[];
