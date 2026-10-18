import type { Action } from 'svelte/action';

type Options = { once?: boolean; threshold?: number; rootMargin?: string; onchange: (visible: boolean) => void };

/** Calls `onchange` when the element enters (and, unless `once`, leaves) the viewport. */
export const inview: Action<HTMLElement, Options> = (node, options) => {
    let opts = options;
    const io = new IntersectionObserver(entries => {
        for(const entry of entries) {
            opts.onchange(entry.isIntersecting);
            if(entry.isIntersecting && opts.once) io.disconnect();
        }
    }, { threshold: opts.threshold ?? 0.25, rootMargin: opts.rootMargin ?? '0px' });
    io.observe(node);
    return {
        update(next) { opts = next; },
        destroy() { io.disconnect(); },
    };
};
