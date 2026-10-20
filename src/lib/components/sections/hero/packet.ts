import type { Direction } from './bridge.svelte';

/** The two chats and the logo between them. */
type Ends = { mc: HTMLElement; dc: HTMLElement; logo: HTMLElement };

/**
 * Sends a small glowing pixel (styled as `.packet` by the hero) from one chat,
 * through the logo, to the other. Resolves when it has arrived.
 */
export async function flyPacket(stage: HTMLElement, ends: Ends, dir: Direction): Promise<void> {
    const box = stage.getBoundingClientRect();
    const point = (el: HTMLElement, side?: 'left' | 'right' | 'top') => {
        const r = el.getBoundingClientRect();
        const x = side === 'left' ? r.left + 12 : side === 'right' ? r.right - 12 : r.left + r.width / 2;
        const y = side === 'top' ? r.top + 12 : r.top + r.height / 2;
        return [x - box.left, y - box.top];
    };
    // Side by side the chats face each other; stacked (phones) they sit above and below the logo.
    const stacked = ends.mc.getBoundingClientRect().bottom <= ends.dc.getBoundingClientRect().top;
    const [mx, my] = point(ends.mc, stacked ? undefined : 'right');
    const [dx, dy] = point(ends.dc, stacked ? 'top' : 'left');
    const [lx, ly] = point(ends.logo);
    const [x0, y0, x1, y1] = dir === 'toDiscord' ? [mx, my, dx, dy] : [dx, dy, mx, my];

    const packet = document.createElement('span');
    packet.className = `packet ${dir}`;
    stage.appendChild(packet);
    const anim = packet.animate([
        { transform: `translate(${x0}px, ${y0}px) scale(0.6)`, opacity: 0 },
        { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1, offset: 0.08 },
        { transform: `translate(${lx}px, ${ly}px) scale(1.6)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${x1}px, ${y1}px) scale(1)`, opacity: 1, offset: 0.92 },
        { transform: `translate(${x1}px, ${y1}px) scale(0.6)`, opacity: 0 },
    ], { duration: 800, easing: 'cubic-bezier(.45,0,.55,1)' });
    await anim.finished.catch(() => {});
    packet.remove();
}
