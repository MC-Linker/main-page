import { craftingTable, enchantedBook, letter, painting } from '$lib/pixel/items';
import type { Sprite } from '$lib/pixel/sprites';
import type { Brand } from './brands';
import { links } from './links';

/** `color` is the site's brand colour, used for its download button. */
export type Download = { name: string; href: string; brand?: Brand; color: string; recommended?: boolean; /** Not published there yet: shown, but not clickable. */ disabled?: boolean };

/** Server software, as listed in setup step 2 (styled like the game's server list). */
export type Platform = {
    id: string;
    name: string;
    icon: Sprite;
    /** Other server software that uses the same build. */
    alsoWorksOn?: string;
    versions: string;
    folder: string;
    downloads: Download[];
};

const modrinth: Download = { name: 'Modrinth', href: links.plugin.modrinth, brand: 'modrinth', color: '#1bae5a', recommended: true };
const curseforgePlugin: Download = { name: 'CurseForge', href: links.plugin.curseforge, brand: 'curseforge', color: '#e1592c', disabled: true };
const curseforgeMods: Download = { name: 'CurseForge', href: links.plugin.curseforgeMods, brand: 'curseforge', color: '#e1592c' };
const hangar: Download = { name: 'Hangar', href: links.plugin.hangar, color: '#2d6be0' };
const spigot: Download = { name: 'SpigotMC', href: links.plugin.spigot, brand: 'spigot', color: '#d99a06' };

export const platforms: Platform[] = [
    {
        id: 'paper',
        name: 'Paper & Spigot',
        icon: letter,
        alsoWorksOn: 'Purpur and other Bukkit-based servers',
        versions: '1.8 – latest',
        folder: 'plugins',
        downloads: [modrinth, hangar, spigot, curseforgePlugin],
    },
    {
        id: 'fabric',
        name: 'Fabric',
        icon: painting,
        versions: '1.16.5 – 26.2',
        folder: 'mods',
        downloads: [modrinth, curseforgeMods],
    },
    {
        id: 'neoforge',
        name: 'NeoForge',
        icon: enchantedBook,
        versions: '1.21.1 – 26.2',
        folder: 'mods',
        downloads: [modrinth, curseforgeMods],
    },
    {
        id: 'forge',
        name: 'Forge',
        icon: craftingTable,
        versions: '1.16.5 – 1.20.x',
        folder: 'mods',
        downloads: [modrinth, curseforgeMods],
    },
];

/** Shown under the platform picker. */
export const platformNotes = [
    'Hybrid servers (MohistMC, Magma, Arclight) use the Forge or NeoForge build.',
    'On Aternos, add Discord-Linker from the plugin list.',
];
