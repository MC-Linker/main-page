import { dirt, grassSide, stone, type Sprite } from '$lib/pixel/sprites';

/**
 * The panorama hills drawn with WebGL instead of moving DOM columns.
 *
 * Moving pixel art by fractions of a pixel with CSS makes each texel round to a
 * different width every frame, which shows as flicker. Here the whole strip is
 * one small texture, and the shader samples it "sharp bilinear": texels stay
 * hard-edged and only the single screen pixel on a texel border is blended.
 * That lets the strip slide smoothly at any speed and any screen scale.
 */

/** Texels per block, the size of the block textures. */
export const TEX = 8;
/** Height of the strip in blocks: the tallest column plus a tree on top. */
export const STRIP_BLOCKS = 13;

export type Land = { heights: number[]; trees: Set<number>; tree: Sprite };

function paint(ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, y: number, px: number) {
    sprite.rows.forEach((row, ry) => {
        [...row].forEach((key, rx) => {
            const fill = sprite.palette[key];
            if(!fill) return;
            ctx.fillStyle = fill;
            ctx.fillRect(x + rx * px, y + ry * px, px, px);
        });
    });
}

/** One loop of the hills at one texel per pixel. */
function drawLand({ heights, trees, tree }: Land): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = heights.length * TEX;
    canvas.height = STRIP_BLOCKS * TEX;
    const ctx = canvas.getContext('2d')!;
    heights.forEach((h, i) => {
        const x = i * TEX;
        const top = canvas.height - h * TEX;
        for(let b = 0; b < h; b++) paint(ctx, b === 0 ? grassSide : b < 3 ? dirt : stone, x, top + b * TEX, 1);
    });
    // Trees go on after all columns so a neighbour never covers their leaves.
    // Like the DOM version: 2.5 blocks wide, starting 0.75 blocks left of the column.
    const px = (TEX * 2.5) / Math.max(...tree.rows.map(r => r.length));
    heights.forEach((h, i) => {
        if(!trees.has(i)) return;
        const top = canvas.height - h * TEX - tree.rows.length * px;
        paint(ctx, tree, i * TEX - TEX * 0.75, top, px);
    });
    return canvas;
}

const vertex = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const fragment = `
precision highp float;
uniform sampler2D tex;
uniform vec2 size;     // texture size in texels
uniform float scale;   // device pixels per texel
uniform float offset;  // pan, in texels

vec4 texel(vec2 c) {
    c.x = mod(c.x, size.x);
    if(c.y < 0.0 || c.y >= size.y) return vec4(0.0);
    return texture2D(tex, (c + 0.5) / size);
}

void main() {
    // Position in texels; y counts up from the bottom like the texture.
    vec2 p = vec2(gl_FragCoord.x / scale + offset, gl_FragCoord.y / scale) - 0.5;
    vec2 i = floor(p);
    // Sharp bilinear: hard texels, blended only across the one pixel on a border.
    vec2 f = clamp((p - i - 0.5) * scale + 0.5, 0.0, 1.0);
    vec4 bottom = mix(texel(i), texel(i + vec2(1.0, 0.0)), f.x);
    vec4 top = mix(texel(i + vec2(0.0, 1.0)), texel(i + 1.0), f.x);
    gl_FragColor = mix(bottom, top, f.y);
}
`;

export type Hills = {
    /** Draws one frame with the strip panned by `offset` texels. */
    draw(offset: number): void;
    /** Width of one loop of the strip, in texels. */
    loop: number;
    destroy(): void;
};

/** Sets up WebGL on the canvas, or returns null when it is not available. */
export function createHills(canvas: HTMLCanvasElement, land: Land): Hills | null {
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if(!gl) return null;

    const shader = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(program, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    const image = drawLand(land);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // The shader does its own blending and wrapping, so plain nearest/clamp works for any texture size.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const uSize = gl.getUniformLocation(program, 'size');
    const uScale = gl.getUniformLocation(program, 'scale');
    const uOffset = gl.getUniformLocation(program, 'offset');
    gl.uniform2f(uSize, image.width, image.height);

    return {
        loop: image.width,
        draw(offset) {
            // The canvas is exactly STRIP_BLOCKS tall, so its height sets the scale.
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(uScale, canvas.height / image.height);
            gl.uniform1f(uOffset, offset % image.width);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
        destroy() {
            gl.deleteTexture(texture);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
        },
    };
}
