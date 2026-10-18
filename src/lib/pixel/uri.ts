import type { Sprite } from './sprites';

/** Turns a sprite into an SVG data URI for use as a CSS background tile. */
export function spriteUri(sprite: Sprite): string {
    const h = sprite.rows.length;
    const w = Math.max(...sprite.rows.map(r => r.length));
    let rects = '';
    sprite.rows.forEach((row, y) => {
        let x = 0;
        while(x < row.length) {
            const key = row[x];
            let len = 1;
            while(row[x + len] === key) len++;
            const fill = sprite.palette[key];
            if(fill) rects += `<rect x='${x}' y='${y}' width='${len + 0.02}' height='1.02' fill='${fill}'/>`;
            x += len;
        }
    });
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' width='${w}' height='${h}' shape-rendering='crispEdges'>${rects}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
