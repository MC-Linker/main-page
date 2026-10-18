<script lang="ts">
    import { grassSide, grassTop, type Sprite } from './sprites';

    /**
     * Isometric grass block, like an inventory icon. Drawn as one flat SVG
     * (no 3D transforms), so every browser shows all three faces.
     */
    let { size = 64, class: className = '' }: { size?: number | string; class?: string } = $props();
    const s = $derived(typeof size === 'number' ? `${size}px` : size);

    type Rect = { x: number; y: number; w: number; fill: string };
    function rects(sprite: Sprite): Rect[] {
        const out: Rect[] = [];
        sprite.rows.forEach((row, y) => {
            let x = 0;
            while(x < row.length) {
                const key = row[x];
                let len = 1;
                while(row[x + len] === key) len++;
                const fill = sprite.palette[key];
                if(fill) out.push({ x, y, w: len, fill });
                x += len;
            }
        });
        return out;
    }
    const top = rects(grassTop);
    const side = rects(grassSide);
    // Sprites can be any size; stretch each one over a 16×16 face.
    const fit = (sp: Sprite) => `scale(${16 / Math.max(...sp.rows.map(r => r.length))} ${16 / sp.rows.length})`;
    const sideW = Math.max(...grassSide.rows.map(r => r.length));
    const sideH = grassSide.rows.length;

    // Each 16×16 face mapped onto the block: top, left and right.
    const faces = [
        { matrix: `matrix(1 0.5 -1 0.5 16 0) ${fit(grassTop)}`, rects: top, shade: 0 },
        { matrix: `matrix(1 0.5 0 1.125 0 8) ${fit(grassSide)}`, rects: side, shade: 0.15 },
        { matrix: `matrix(1 -0.5 0 1.125 16 16) ${fit(grassSide)}`, rects: side, shade: 0.3 },
    ];
</script>

<div class="block-wrap {className}" style:--s={s} aria-hidden="true">
    <svg viewBox="0 0 32 34" shape-rendering="crispEdges">
        {#each faces as f, i (i)}
            <g transform={f.matrix}>
                {#each f.rects as r, j (j)}<rect x={r.x} y={r.y} width={r.w + 0.03} height="1.03" fill={r.fill} />{/each}
                {#if f.shade}<rect width={sideW} height={sideH} fill="#000" opacity={f.shade} />{/if}
            </g>
        {/each}
    </svg>
</div>

<style>
    .block-wrap {
        width: calc(var(--s) * 1.42);
        height: calc(var(--s) * 1.6);
        display: grid;
        place-items: center;
    }
    svg { display: block; width: 100%; height: auto; overflow: visible; }
</style>
