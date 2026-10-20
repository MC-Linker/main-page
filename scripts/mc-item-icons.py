"""Downloads the Minecraft item textures the feature inventory uses into static/mc/items.

Flat items are copied as they are. Blocks are drawn as the isometric cube the game shows
in an inventory slot, with the same three faces and shading as the grass block in
src/lib/pixel/GrassBlock.svelte.

Run: python3 scripts/mc-item-icons.py   (needs Pillow and network access)
"""
import io
import urllib.request
from pathlib import Path

from PIL import Image

BASE = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures'
OUT = Path(__file__).resolve().parent.parent / 'static' / 'mc' / 'items'

# name -> texture under item/
ITEMS = {
    'oak_sign': 'oak_sign',
    'writable_book': 'writable_book',
    'book': 'book',
    'experience_bottle': 'experience_bottle',
    'spyglass': 'spyglass',
    'compass': 'compass_16',
    'iron_sword': 'iron_sword',
    'clock': 'clock_00',
    'painting': 'painting',
    'name_tag': 'name_tag',
    'chain': 'chain',
    'iron_door': 'iron_door',
    'emerald': 'emerald',
}

# name -> (top, left, right) textures under block/
BLOCKS = {
    'barrel': ('barrel_top', 'barrel_side', 'barrel_side'),
    'command_block': ('command_block_back', 'command_block_front', 'command_block_side'),
    'repeating_command_block': ('repeating_command_block_back', 'repeating_command_block_front', 'repeating_command_block_side'),
}

SCALE = 4  # output pixels per viewBox unit; the cube is 32x34 units like GrassBlock


def fetch(path: str) -> Image.Image:
    with urllib.request.urlopen(f'{BASE}/{path}.png') as r:
        img = Image.open(io.BytesIO(r.read())).convert('RGBA')
    # Animated textures are a vertical strip of square frames: keep the first.
    return img.crop((0, 0, img.width, img.width)) if img.height > img.width else img


def cube(top: Image.Image, left: Image.Image, right: Image.Image) -> Image.Image:
    # Each face: (texture, matrix a b c d e f of x = a*u + c*v + e, y = b*u + d*v + f, shade), as in GrassBlock.
    faces = [
        (top, (1, .5, -1, .5, 16, 0), 0),
        (left, (1, .5, 0, 1.125, 0, 8), .15),
        (right, (1, -.5, 0, 1.125, 16, 16), .3),
    ]
    out = Image.new('RGBA', (32 * SCALE, 34 * SCALE))
    px = out.load()
    for fx in range(32 * SCALE):
        for fy in range(34 * SCALE):
            x, y = (fx + .5) / SCALE, (fy + .5) / SCALE
            for tex, (a, b, c, d, e, f), shade in faces:
                # Invert the 2x2 matrix to find the texture coordinate under this pixel.
                det = a * d - b * c
                u = (d * (x - e) - c * (y - f)) / det
                v = (-b * (x - e) + a * (y - f)) / det
                if 0 <= u < 16 and 0 <= v < 16:
                    r, g, bl, al = tex.getpixel((int(u * tex.width / 16), int(v * tex.height / 16)))
                    if al:
                        k = 1 - shade
                        px[fx, fy] = (round(r * k), round(g * k), round(bl * k), 255)
                        break
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, tex in ITEMS.items():
        fetch(f'item/{tex}').save(OUT / f'{name}.png', optimize=True)
    for name, (t, l, r) in BLOCKS.items():
        cube(fetch(f'block/{t}'), fetch(f'block/{l}'), fetch(f'block/{r}')).save(OUT / f'{name}.png', optimize=True)


if __name__ == '__main__':
    main()
