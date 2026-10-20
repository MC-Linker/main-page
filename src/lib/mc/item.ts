import type { LookName } from '$lib/pixel/heads';
import type { Sprite } from '$lib/pixel/sprites';

/** What an item looks like: a sprite, an image, the grass block or a player head. */
export type ItemIcon = { sprite: Sprite } | { image: string } | { block: 'grass' } | { head: LookName };

/** A Minecraft item: its icon, name, rarity colour and lore. */
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
