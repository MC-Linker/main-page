import { spriteUri } from './render';
import { bedrock, deepslate, dirt, grassSide, stone } from './sprites';

/**
 * Block textures as CSS variables, set once on :root by the root layout.
 * Tile one with e.g. `background: var(--tex-dirt) 0 0 / 64px 64px`.
 */
const textures = { dirt, stone, deepslate, bedrock, 'grass-side': grassSide };

export const textureVars = Object.entries(textures)
    .map(([name, sprite]) => `--tex-${name}:${spriteUri(sprite)}`)
    .join(';');
