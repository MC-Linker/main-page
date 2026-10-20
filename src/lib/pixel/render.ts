import type { Sprite } from './sprites';

/** A horizontal run of same-coloured pixels in one row of a sprite. */
export type PixelRun = { x: number; y: number; w: number; fill: string };

/** A sprite's size in pixels: its widest row by its number of rows. */
export function spriteSize(sprite: Sprite): { w: number; h: number } {
    return { w: Math.max(...sprite.rows.map(r => r.length)), h: sprite.rows.length };
}

/**
 * Merges neighbouring pixels of the same colour in each row into one run,
 * so a sprite draws with few shapes. Transparent pixels are skipped.
 */
export function spriteRuns(sprite: Sprite): PixelRun[] {
    const runs: PixelRun[] = [];
    sprite.rows.forEach((row, y) => {
        let x = 0;
        while(x < row.length) {
            const key = row[x];
            let w = 1;
            while(row[x + w] === key) w++;
            const fill = sprite.palette[key];
            if(fill) runs.push({ x, y, w, fill });
            x += w;
        }
    });
    return runs;
}

/** The sprite as an SVG data URI, for image sources and avatars. */
export function spriteDataUri(sprite: Sprite): string {
    const { w, h } = spriteSize(sprite);
    const rects = spriteRuns(sprite)
        .map(r => `<rect x='${r.x}' y='${r.y}' width='${r.w + 0.02}' height='1.02' fill='${r.fill}'/>`)
        .join('');
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' width='${w}' height='${h}' shape-rendering='crispEdges'>${rects}</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The sprite as a CSS `url(...)` value, for background tiles. */
export const spriteUri = (sprite: Sprite) => `url("${spriteDataUri(sprite)}")`;
