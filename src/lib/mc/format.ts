export type McSegment = {
    text: string;
    color: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
};

export const mcColors: Record<string, string> = {
    '0': '#000000', '1': '#0000aa', '2': '#00aa00', '3': '#00aaaa',
    '4': '#aa0000', '5': '#aa00aa', '6': '#ffaa00', '7': '#aaaaaa',
    '8': '#555555', '9': '#5555ff', a: '#55ff55', b: '#55ffff',
    c: '#ff5555', d: '#ff55ff', e: '#ffff55', f: '#ffffff',
};

/** Minecraft draws a text's shadow in the same colour at a quarter of the brightness. */
export const mcShadow = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const q = (v: number) => Math.floor(v / 4).toString(16).padStart(2, '0');
    return `#${q(n >> 16)}${q((n >> 8) & 255)}${q(n & 255)}`;
};

/** Splits text with `&` or `§` formatting codes into styled segments. */
export function parseMc(input: string, base = '#ffffff'): McSegment[] {
    const segments: McSegment[] = [];
    let cur: McSegment = { text: '', color: base };
    const push = () => { if(cur.text) segments.push(cur); };

    for(let i = 0; i < input.length; i++) {
        const ch = input[i];
        const code = input[i + 1]?.toLowerCase();
        if((ch === '&' || ch === '§') && code && /[0-9a-fk-or]/.test(code)) {
            push();
            const next: McSegment = { ...cur, text: '' };
            if(mcColors[code]) Object.assign(next, { color: mcColors[code], bold: false, italic: false, underline: false, strike: false });
            else if(code === 'l') next.bold = true;
            else if(code === 'o') next.italic = true;
            else if(code === 'n') next.underline = true;
            else if(code === 'm') next.strike = true;
            else if(code === 'r') Object.assign(next, { color: base, bold: false, italic: false, underline: false, strike: false });
            cur = next;
            i++;
            continue;
        }
        cur.text += ch;
    }
    push();
    return segments;
}
