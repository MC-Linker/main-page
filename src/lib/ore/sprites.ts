import type { Sprite } from '$lib/pixel/sprites';

/**
 * Ore UI's small controls as pixel art, taken from the textures of bedrock-core's
 * ore-styled theme (MIT, https://github.com/bedrock-core/ui). One character is one
 * texture pixel; draw them with PixelArt.
 */

const outline = '#1e1e1f';

/** Ore UI's radio button is a diamond: grey when not chosen... */
export const radioOff: Sprite = {
    rows: ['......a......', '.....aba.....', '....abcba....', '...abcdcba...', '..abcdddcba..', '.abcdddddcba.', 'abedddddddeba', '.abfdddddfba.', '..abfdddfba..', '...abfdfba...', '....abfba....', '.....aba.....', '......a......'],
    palette: { a: outline, b: '#414143', c: '#a3a4a6', d: '#8c8d90', e: '#acadaf', f: '#97989b' },
};

/** ...and green with a white gem in it when chosen. */
export const radioOn: Sprite = {
    rows: ['......a......', '.....aba.....', '....abcba....', '...abcdcba...', '..abcdedcba..', '.abcdfefdcba.', 'abgdffhffdgba', '.abidhhhdiba.', '..abidhdiba..', '...abidiba...', '....abiba....', '.....aba.....', '......a......'],
    palette: { a: outline, b: '#273f22', c: '#639d52', d: '#3c8527', e: '#ffffff', f: '#e6e8eb', g: '#72a763', h: '#d0d1d4', i: '#4f913c' },
};

/** The dropdown's chevron. Recolour it with `chevron(colour)`. */
const chevronRows = ['a.....a', '.a...a.', '..a.a..', '...a...'];
export const chevron = (color = outline): Sprite => ({ rows: chevronRows, palette: { a: color } });

/** A row's "opens something" arrow, pointing right. */
export const chevronRight = (color = '#ffffff'): Sprite => ({ rows: ['a...', '.a..', '..a.', '...a', '..a.', '.a..', 'a...'], palette: { a: color } });

/** The header's back arrow. */
export const backArrow = (color = '#000000'): Sprite => ({ rows: ['...a', '..a.', '.a..', 'a...', '.a..', '..a.', '...a'], palette: { a: color } });

/** The header's "back to the top" arrow, pointing up. */
export const upArrow = (color = '#ffffff'): Sprite => ({ rows: ['...a...', '..a.a..', '.a...a.', 'a.....a'], palette: { a: color } });

/** A link that leaves the site: a small arrow pointing up and right. */
export const outArrow = (color = '#ffffff'): Sprite => ({
    rows: ['..aaaa', '....aa', '...a.a', '..a..a', '.a....', 'a.....'],
    palette: { a: color },
});

/** The chat's send button: an arrow pointing right. */
export const sendArrow = (color = '#ffffff'): Sprite => ({
    rows: ['...a...', '....a..', '.....a.', 'aaaaaaa', '.....a.', '....a..', '...a...'],
    palette: { a: color },
});
