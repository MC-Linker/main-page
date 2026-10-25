import type { Sprite } from './sprites';

/** What a player head looks like. Colours are hex strings. */
export type Look = {
    skin: string;
    hair: string;
    eye?: string;
    style?: 'short' | 'long' | 'cap' | 'bald';
    cap?: string;
    beard?: string;
};

/** The people and players that show up in the demos. */
export const looks = {
    lianecx: { skin: '#d6a07a', hair: '#3b2a1f', eye: '#2b8a3e' },
    theannoying: { skin: '#e8b48f', hair: '#c92a2a', eye: '#1c7ed6', style: 'cap', cap: '#e03131' },
    bnux: { skin: '#c68b62', hair: '#1f1f1f', eye: '#5f3dc4', beard: '#2b2b2b' },
    cubey: { skin: '#f1c7a4', hair: '#f59f00', eye: '#2f9e44', style: 'long' },
    newbie: { skin: '#e6b08c', hair: '#868e96', eye: '#1c7ed6', style: 'bald' },
} satisfies Record<string, Look>;

export type LookName = keyof typeof looks;

/** Lightens (positive amount) or darkens (negative) a hex colour. */
function shade(hex: string, amount: number): string {
    const n = parseInt(hex.slice(1), 16);
    const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amount * 255)));
    const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const faces: Record<NonNullable<Look['style']>, string[]> = {
    short: ['hhhhhhhh', 'hhhhhhhh', 'hssssssh', 'ssssssss', 'swessews', 'ssssssss', 'ssdmmdss', 'ssssssss'],
    long: ['hhhhhhhh', 'hhhhhhhh', 'hhsssshh', 'hssssssh', 'hwessewh', 'hssssssh', 'hsdmmdsh', 'hssssssh'],
    cap: ['cccccccc', 'cccccccc', 'CCCCCCCC', 'hssssssh', 'swessews', 'ssssssss', 'ssdmmdss', 'ssssssss'],
    bald: ['dsssssss', 'ssssssss', 'ssssssss', 'ssssssss', 'swessews', 'ssssssss', 'ssdmmdss', 'ssssssss'],
};

/** An 8x8 player head, like a Minecraft skin's face. */
export function head(look: Look): Sprite {
    let rows = faces[look.style ?? 'short'];
    if(look.beard) rows = [...rows.slice(0, 6), 'sbbmmbbs', 'sbbbbbbs'];
    return {
        rows,
        palette: {
            h: look.hair,
            s: look.skin,
            d: shade(look.skin, -0.12),
            m: shade(look.skin, -0.3),
            w: '#ffffff',
            e: look.eye ?? '#3b5bdb',
            c: look.cap ?? '#c92a2a',
            C: shade(look.cap ?? '#c92a2a', -0.15),
            b: look.beard ?? look.hair,
        },
    };
}

/** A head by name or by look. */
export const headOf = (look: LookName | Look) => head(typeof look === 'string' ? looks[look] : look);
