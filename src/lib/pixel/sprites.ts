/**
 * Original pixel art, drawn in code. Each sprite is a list of rows where every
 * character is a palette key; keys missing from the palette are transparent.
 */
export type Sprite = { rows: string[]; palette: Record<string, string> };

export type Look = {
    skin: string;
    hair: string;
    eye?: string;
    style?: 'short' | 'long' | 'cap' | 'bald';
    cap?: string;
    beard?: string;
    shirt?: string;
    pants?: string;
    shoes?: string;
};

const shade = (hex: string, amount: number) => {
    const n = parseInt(hex.slice(1), 16);
    const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amount * 255)));
    const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

const faces: Record<NonNullable<Look['style']>, string[]> = {
    short: ['hhhhhhhh', 'hhhhhhhh', 'hssssssh', 'ssssssss', 'swessews', 'ssssssss', 'ssdmmdss', 'ssssssss'],
    long: ['hhhhhhhh', 'hhhhhhhh', 'hhsssshh', 'hssssssh', 'hwessewh', 'hssssssh', 'hsdmmdsh', 'hssssssh'],
    cap: ['cccccccc', 'cccccccc', 'CCCCCCCC', 'hssssssh', 'swessews', 'ssssssss', 'ssdmmdss', 'ssssssss'],
    bald: ['dsssssss', 'ssssssss', 'ssssssss', 'ssssssss', 'swessews', 'ssssssss', 'ssdmmdss', 'ssssssss'],
};

const palette = (o: Look) => ({
    h: o.hair,
    s: o.skin,
    d: shade(o.skin, -0.12),
    m: shade(o.skin, -0.3),
    w: '#ffffff',
    e: o.eye ?? '#3b5bdb',
    c: o.cap ?? '#c92a2a',
    C: shade(o.cap ?? '#c92a2a', -0.15),
    b: o.beard ?? o.hair,
});

export function head(o: Look): Sprite {
    let rows = faces[o.style ?? 'short'];
    if(o.beard) rows = [...rows.slice(0, 6), 'sbbmmbbs', 'sbbbbbbs'];
    return { rows, palette: palette(o) };
}

/** A whole player, front view, 16x32. */
export function player(o: Look): Sprite {
    const face = head(o).rows;
    const rows: string[] = [];
    for(const r of face) rows.push(`....${r}....`);
    for(let i = 0; i < 12; i++) {
        const arm = i < 4 ? 'TTTT' : 'ssss';
        rows.push(`${arm}${i === 0 ? 'TTTnnTTT' : 'TTTTTTTT'}${arm}`);
    }
    for(let i = 0; i < 12; i++) rows.push(i < 10 ? '....PPPPpppp....' : '....OOOOOOOO....');
    return {
        rows,
        palette: {
            ...palette(o),
            T: o.shirt ?? '#2f9e9e',
            n: shade(o.shirt ?? '#2f9e9e', -0.2),
            P: o.pants ?? '#3b4cca',
            p: shade(o.pants ?? '#3b4cca', -0.08),
            O: o.shoes ?? '#555555',
        },
    };
}

export const looks = {
    lianecx: { skin: '#d6a07a', hair: '#3b2a1f', eye: '#2b8a3e', shirt: '#6f9e2d', pants: '#2d3a8c' },
    theannoying: { skin: '#e8b48f', hair: '#c92a2a', eye: '#1c7ed6', style: 'cap', cap: '#e03131', shirt: '#c92a2a', pants: '#343a40' },
    bnux: { skin: '#c68b62', hair: '#1f1f1f', eye: '#5f3dc4', beard: '#2b2b2b', shirt: '#1971c2', pants: '#495057' },
    cubey: { skin: '#f1c7a4', hair: '#f59f00', eye: '#2f9e44', style: 'long', shirt: '#ae3ec9', pants: '#5c3d2e' },
    griefer: { skin: '#9fb38f', hair: '#2b2b2b', eye: '#e03131', style: 'cap', cap: '#212529', shirt: '#212529', pants: '#212529' },
    newbie: { skin: '#e6b08c', hair: '#868e96', eye: '#1c7ed6', style: 'bald', shirt: '#74b816', pants: '#364fc7' },
} satisfies Record<string, Look>;

export type LookName = keyof typeof looks;

export const diamond: Sprite = {
    rows: ['..oooooo..', '.ollmmmmo.', 'olllmmmmdo', 'oommmmmddo', '.ommmmddo.', '..ommmdo..', '...omdo...', '....oo....'],
    palette: { o: '#0f4c46', l: '#e3fffa', m: '#4aedd9', d: '#1a9e93' },
};

export const heart: Sprite = {
    rows: ['.ooo.ooo.', 'orrrorrro', 'orwrrrrro', 'orrrrrrro', '.orrrrro.', '..orrro..', '...oro...', '....o....'],
    palette: { o: '#1b0b0b', r: '#e03131', w: '#ffc9c9' },
};

export const heartEmpty: Sprite = { rows: heart.rows, palette: { o: '#1b0b0b', r: '#3a1a1a', w: '#3a1a1a' } };

export const drumstick: Sprite = {
    rows: ['.....ooo.', '....obbbo', '...obmbbo', '...obbbbo', '..owobbo.', '.owwooo..', 'owwo.....', 'oo.......'],
    palette: { o: '#2b1608', b: '#b8612f', m: '#e8a36c', w: '#f2eedc' },
};

export const tnt: Sprite = {
    rows: ['rRrRrRrR', 'RrRrRrRr', 'rRrRrRrR', 'wwwwwwww', 'wkwkkwkw', 'wwwwwwww', 'RrRrRrRr', 'rRrRrRrR'],
    palette: { r: '#db2b2b', R: '#a51d1d', w: '#f1f3f5', k: '#212529' },
};

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

export const commandBlock: Sprite = {
    rows: ['oooooooo', 'obbbbbbo', 'obkkkkbo', 'obkgkkbo', 'obkkgkbo', 'obkgkkbo', 'obbbbbbo', 'oooooooo'],
    palette: { o: '#7a4a2a', b: '#c98b5b', k: '#1d1d1d', g: '#e8e8e8' },
};
