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

export const sign: Sprite = {
    rows: ['oooooooooo', 'oSSSSSSSSo', 'oSkkkkkkSo', 'oSSSSSSSSo', 'oSkkkkSSSo', 'oSSSSSSSSo', 'oooooooooo', '....oo....', '....oo....', '....oo....'],
    palette: { o: '#3b2611', S: '#b8945f', k: '#5a4020' },
};

export const sword: Sprite = {
    rows: ['........oo', '.......owo', '......owwo', '.....owwo.', 'o...owwo..', 'oo.owwo...', '.oowwo....', '..obo.....', '.obbo.....', 'obo.......'],
    palette: { o: '#1f1f1f', w: '#d9d9d9', b: '#7a5230' },
};

export const clock: Sprite = {
    rows: ['..oooooo..', '.oYYYYYYo.', 'oYYbbbbYYo', 'oYbbbwbbYo', 'oYbbwbbbYo', 'oYbbbbbbYo', 'oYYbbbbYYo', '.oYYYYYYo.', '..oooooo..'],
    palette: { o: '#4a3500', Y: '#f2c230', b: '#5a8fe0', w: '#ffffff' },
};

export const nameTag: Sprite = {
    rows: ['.....ooooo', '....owwwwo', '...owwwwwo', '..owwwwwwo', '.owwwwwwo.', 'owwwwwwo..', 'owwwwwo...', 'oswwwo....', '.oooo.....'],
    palette: { o: '#3a3a3a', w: '#e9e2cf', s: '#7a5230' },
};

/** Like Minecraft's chain: links seen from the front, joined by links seen edge-on. */
export const chain: Sprite = {
    rows: ['...oooo...', '..owggwo..', '..og..go..', '..owggwo..', '...oggo...', '....gg....', '....gg....', '...oggo...', '..owggwo..', '..og..go..', '..owggwo..', '...oooo...'],
    palette: { o: '#1e2228', g: '#7d8794', w: '#b9c2cc' },
};

export const door: Sprite = {
    rows: ['.oooooo.', '.oggggo.', '.ogkkgo.', '.oggggo.', '.ogkkgo.', '.oggggo.', '.oggggo.', '.oggYgo.', '.oggggo.', '.oooooo.'],
    palette: { o: '#2a2a2a', g: '#cfcfcf', k: '#8a8a8a', Y: '#5a5a5a' },
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

export const commandBlock: Sprite = {
    rows: ['oooooooo', 'obbbbbbo', 'obkkkkbo', 'obkgkkbo', 'obkkgkbo', 'obkgkkbo', 'obbbbbbo', 'oooooooo'],
    palette: { o: '#7a4a2a', b: '#c98b5b', k: '#1d1d1d', g: '#e8e8e8' },
};

export const repeatingCommandBlock = recolor(commandBlock, { o: '#3d2a6b', b: '#8a6ad1' });

export const craftingTable: Sprite = {
    rows: ['oooooooooo', 'otTttTttTo', 'oTTTTTTTTo', 'otTttTttTo', 'oTTTTTTTTo', 'osSssssSso', 'osSssssSso', 'osSsWWsSso', 'osSssssSso', 'oooooooooo'],
    palette: { o: '#3b2611', t: '#c49a62', T: '#8a6a3d', s: '#9c6f3e', S: '#6e4b28', W: '#cfcfcf' },
};
