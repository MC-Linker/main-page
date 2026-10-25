import { MediaQuery } from 'svelte/reactivity';

/** True when the visitor asked for less motion. Auto-play and ambient animation check this. */
export const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

/** Smooth scrolling, unless the visitor asked for less motion. */
export const scrollBehavior = (): ScrollBehavior => (reducedMotion.current ? 'auto' : 'smooth');

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/** True while typing in a text field, where single-key shortcuts must not fire. */
export const isTextField = (target: EventTarget | null) =>
    target instanceof HTMLElement && !!target.closest('input, textarea, select, [contenteditable]');
