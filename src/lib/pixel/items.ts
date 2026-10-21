/* Item sprites: the icons for the header's sections and links, and the server software list. */
import type { Sprite } from './sprites';

/** Swaps palette colours of a sprite, for colour variants of the same shape. */
const recolor = (s: Sprite, palette: Record<string, string>): Sprite => ({ rows: s.rows, palette: { ...s.palette, ...palette } });

export const chest: Sprite = {
    rows: ['.oooooooo.', 'oBBBBBBBBo', 'oBbbbbbbBo', 'oBbbbbbbBo', 'ooooYYoooo', 'oBbbYYbbBo', 'oBbbbbbbBo', 'oBbbbbbbBo', 'oBBBBBBBBo', '.oooooooo.'],
    palette: { o: '#2b1a0b', B: '#6e4b28', b: '#a8743c', Y: '#e8c84a' },
};

export const book: Sprite = {
    rows: ['.ooooooooo', 'oRRRRRRRRo', 'oRRwwwwRRo', 'oRRRRRRRRo', 'oRRRRRRRRo', 'oRRRRRRRRo', 'oRRRRRRRRo', 'oRRRRRRRRo', 'oppppppppo', 'oooooooooo'],
    palette: { o: '#2a0f0b', R: '#8b3a2e', w: '#e8d9b0', p: '#efe6cc' },
};

export const enchantedBook = recolor(book, { R: '#6a3d9a', w: '#f3c94a', o: '#1d0d2e' });

export const map: Sprite = {
    rows: ['oooooooooo', 'oPPPPPPPPo', 'oPgggbbbPo', 'oPggbbbgPo', 'oPgbbbggPo', 'oPbbbgggPo', 'oPggggggPo', 'oPgggRggPo', 'oPPPPPPPPo', 'oooooooooo'],
    palette: { o: '#3a2e1c', P: '#d8c8a0', g: '#6f9e2d', b: '#4a7fd6', R: '#d33a2c' },
};

/** A Discord server, as a friendly blurple block. */
export const discordBlock: Sprite = {
    rows: ['.oooooooo.', 'oBBBBBBBBo', 'oBBBBBBBBo', 'oBwwBBwwBo', 'oBwwBBwwBo', 'oBBBBBBBBo', 'oBwBBBBwBo', 'oBBwwwwBBo', 'oBBBBBBBBo', '.oooooooo.'],
    palette: { o: '#232a7a', B: '#5865f2', w: '#ffffff' },
};

export const diamond: Sprite = {
    rows: ['..oooooo..', '.ollmmmmo.', 'olllmmmmdo', 'oommmmmddo', '.ommmmddo.', '..ommmdo..', '...omdo...', '....oo....'],
    palette: { o: '#0f4c46', l: '#e3fffa', m: '#4aedd9', d: '#1a9e93' },
};

export const emerald = recolor(diamond, { o: '#0b3d1b', l: '#d3ffd9', m: '#41d36b', d: '#1a8f3e' });

export const letter: Sprite = {
    rows: ['oooooooooo', 'owwwwwwwwo', 'oowwwwwwoo', 'owowwwwowo', 'owwowwowwo', 'owwwoowwwo', 'owwwwwwwwo', 'oooooooooo'],
    palette: { o: '#5c5c5c', w: '#f4f1e8' },
};

export const painting: Sprite = {
    rows: ['oooooooooo', 'oFFFFFFFFo', 'oFbbbbbbFo', 'oFbbYbbbFo', 'oFggbbggFo', 'oFggggggFo', 'oFFFFFFFFo', 'oooooooooo'],
    palette: { o: '#2b1a0b', F: '#8a5a2b', b: '#7fb3ff', Y: '#ffe066', g: '#5d8a24' },
};

export const craftingTable: Sprite = {
    rows: ['oooooooooo', 'otTttTttTo', 'oTTTTTTTTo', 'otTttTttTo', 'oTTTTTTTTo', 'osSssssSso', 'osSssssSso', 'osSsWWsSso', 'osSssssSso', 'oooooooooo'],
    palette: { o: '#3b2611', t: '#c49a62', T: '#8a6a3d', s: '#9c6f3e', S: '#6e4b28', W: '#cfcfcf' },
};
