/**
 * Original pixel art, drawn in code. Each sprite is a list of rows where every
 * character is a palette key; keys missing from the palette are transparent.
 * This file holds the block textures; see heads.ts and items.ts for the rest.
 */
export type Sprite = { rows: string[]; palette: Record<string, string> };

export const grassTop: Sprite = {
    rows: ['gGgggGgg', 'ggggGggg', 'gGggggGg', 'gggGgggg', 'ggggggGg', 'gGgggggg', 'gggggGgg', 'ggGggggg'],
    palette: { g: '#6f9e2d', G: '#5d8a24' },
};

export const grassSide: Sprite = {
    rows: ['gGgggGgg', 'gggGgggG', 'dgdgggdg', 'ddDdddgd', 'dddddDdd', 'dlddDddd', 'dddDdddl', 'Dddddldd'],
    palette: { g: '#6f9e2d', G: '#5d8a24', d: '#915d2a', D: '#79491f', l: '#a8703a' },
};

export const dirt: Sprite = {
    rows: ['dddDdddl', 'dlddddDd', 'ddddlddd', 'Ddddddld', 'dddDdddd', 'ddlddDdd', 'dDdddddl', 'ddddlddd'],
    palette: { d: '#915d2a', D: '#79491f', l: '#a8703a' },
};

export const stone: Sprite = {
    rows: ['ssSsslss', 'sSssssSs', 'sslssSss', 'Ssssssls', 'ssSlssss', 'lsssSsss', 'ssssslSs', 'sSlsssss'],
    palette: { s: '#7d7d7d', S: '#686868', l: '#929292' },
};

export const deepslate: Sprite = {
    rows: ['dddDdddd', 'DDdddlld', 'ddddDddd', 'ldddddDD', 'dDDddddd', 'ddddlldd', 'DdddddDd', 'ddlDdddd'],
    palette: { d: '#4d4d55', D: '#3c3c43', l: '#5f5f69' },
};
