import type { ItemIcon } from '$lib/mc/item';
import { book, chest, craftingTable, discordBlock, emerald, letter, map } from '$lib/pixel/items';
import { links } from './links';

/** The header's section tabs: sections of the home page. Keep in sync with routes/+page.svelte. */
export type HomeSection = { id: string; name: string; title: string; icon: ItemIcon };

export const homeSections: HomeSection[] = [
    { id: 'top', name: 'Home', title: 'Minecraft, linked with Discord', icon: { block: 'grass' } },
    { id: 'setup', name: 'Setup', title: 'Linked in three steps', icon: { sprite: craftingTable } },
    { id: 'features', name: 'Features', title: 'Everything MC Linker can do', icon: { sprite: chest } },
    { id: 'faq', name: 'FAQ', title: 'Questions and answers', icon: { sprite: book } },
];

/** The header's "Links" dropdown: links that leave the page. */
export type SiteLink = { name: string; title: string; hint: string; href: string; icon: ItemIcon; newTab?: boolean; cta?: boolean };

export const siteLinks: SiteLink[] = [
    { name: 'Add bot', title: 'Add to Discord', hint: 'Opens Discord in a new tab', href: links.invite, icon: { sprite: discordBlock }, newTab: true, cta: true },
    { name: 'Plugin', title: 'Get the plugin', hint: 'Opens Modrinth in a new tab', href: links.plugin.modrinth, icon: { sprite: emerald }, newTab: true },
    { name: 'Guide', title: 'Guide', hint: 'Every command and setting', href: links.guide, icon: { sprite: map } },
    { name: 'Support', title: 'Support server', hint: 'Opens Discord in a new tab', href: links.support, icon: { sprite: letter }, newTab: true },
    { name: 'Team', title: 'Meet the team', hint: 'The people behind MC Linker', href: links.pages.team, icon: { head: 'lianecx' } },
];

/** The header's trail on pages other than the home page, after "MC Linker". */
export const pageTrails: Record<string, string[]> = {
    [links.pages.team]: ['The team'],
    [links.pages.terms]: ['Legal', 'Terms of Service'],
    [links.pages.privacy]: ['Legal', 'Privacy Policy'],
};
