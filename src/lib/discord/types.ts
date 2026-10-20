import type { Look, LookName } from '$lib/pixel/heads';

/** A picture URL, a pixel-art player head, or a coloured circle with a letter. */
export type Avatar = { image: string } | { head: LookName | Look } | { letter: string; color: string };

export type Author = {
    name: string;
    avatar: Avatar;
    /** Role colour for the name. */
    color?: string;
    tag?: 'APP';
    verified?: boolean;
};

export type EmbedField = { name: string; value: string; inline?: boolean };

export type Embed = {
    color: string;
    author?: { name: string; icon?: string; avatar?: Avatar };
    title?: string;
    description?: string;
    fields?: EmbedField[];
    image?: string;
    /** The small picture in the embed's top right corner. */
    thumbnail?: string;
    footer?: string;
};

/** The "you used /command" line above a bot's reply. */
export type Interaction = { user: string; avatar: Avatar; command: string };

export type DcButtonData = {
    label: string;
    style?: 'primary' | 'secondary' | 'danger' | 'success' | 'link';
    disabled?: boolean;
    onclick?: () => void;
};

/** The quoted message above a reply. */
export type Reply = { author: string; avatar: Avatar; content: string; bot?: boolean };

export type Reaction = { name: string; emoji: string; count: number };

export type DcMsg = {
    id: number;
    author: Author;
    content?: string;
    embeds?: Embed[];
    interaction?: Interaction;
    reply?: Reply;
    reactions?: Reaction[];
    buttons?: DcButtonData[];
    /** More rows of buttons under `buttons`, like the admin actions under the page buttons. */
    buttonRows?: DcButtonData[][];
    /** "Only you can see this" messages. */
    ephemeral?: boolean;
};

export type SlashCommand = {
    name: string;
    description: string;
    /** The names of its options. The first one labels the value that is typed after the command. */
    options?: string[];
    /** Values offered after the command name, like the bot's tab-completion. */
    suggestions?: string[];
};

/** discord.js colour names used by the bot. */
export const colors = {
    blue: '#3498db',
    orange: '#e67e22',
    yellow: '#fee75c',
    pink: '#e91e63',
    darkPurple: '#71368a',
    darkGold: '#c27c0e',
    red: '#ed4245',
    brand: '#729e34',
} as const;

/** Embed colours and authors used by the bot (see the bot's language file). */
export const embedStyle = {
    success: { color: '#43611a', author: { name: 'Success', icon: '/emoji/success.png' } },
    warning: { color: '#f1c40f', author: { name: 'Warning', icon: '/emoji/warning.png' } },
    step: { color: '#f88239' },
} as const;

export const success = (title: string, description?: string, extra: Partial<Embed> = {}): Embed =>
    ({ ...embedStyle.success, title, description, ...extra });

export const bot: Author = { name: 'MC Linker', avatar: { image: '/logo.png' }, tag: 'APP', verified: true };

/** The webhook identity the bot uses for system messages in chat channels. */
export const chatWebhook: Author = { name: 'MC Linker Chat', avatar: { image: '/logo.png' }, tag: 'APP' };

/** The visitor, when they type in a demo. */
export const visitor: Author = { name: 'you', avatar: { letter: 'Y', color: '#5865f2' } };
