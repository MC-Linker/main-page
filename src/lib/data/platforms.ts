import { links } from './links';
import type { Brand } from './brands';

/** `color` is the site's brand colour, used for its download button. */
export type Download = { name: string; href: string; brand?: Brand; color: string; recommended?: boolean };

export type Platform = {
    id: string;
    name: string;
    /** Other server software that uses the same build. */
    alsoWorksOn?: string;
    versions: string;
    folder: string;
    downloads: Download[];
};

const modrinth: Download = { name: 'Modrinth', href: links.plugin.modrinth, brand: 'modrinth', color: '#1bae5a', recommended: true };
const curseforge: Download = { name: 'CurseForge', href: links.plugin.curseforge, brand: 'curseforge', color: '#e1592c' };
const hangar: Download = { name: 'Hangar', href: links.plugin.hangar, color: '#2d6be0' };
const spigot: Download = { name: 'SpigotMC', href: links.plugin.spigot, brand: 'spigot', color: '#d99a06' };

export const platforms: Platform[] = [
    {
        id: 'paper',
        name: 'Paper & Spigot',
        alsoWorksOn: 'Purpur and other Bukkit-based servers',
        versions: '1.8 – latest',
        folder: 'plugins',
        downloads: [modrinth, hangar, spigot, curseforge],
    },
    {
        id: 'fabric',
        name: 'Fabric',
        versions: '1.16.5 – 26.2',
        folder: 'mods',
        downloads: [modrinth, curseforge],
    },
    {
        id: 'neoforge',
        name: 'NeoForge',
        versions: '1.21.1 – 26.2',
        folder: 'mods',
        downloads: [modrinth, curseforge],
    },
    {
        id: 'forge',
        name: 'Forge',
        versions: '1.16.5 – 1.20.x',
        folder: 'mods',
        downloads: [modrinth, curseforge],
    },
];

/** Shown under the platform picker. */
export const platformNotes = [
    'Hybrid servers (MohistMC, Magma, Arclight) use the Forge or NeoForge build.',
    'On Aternos, add Discord-Linker from the plugin list.',
];
