import { MediaQuery } from 'svelte/reactivity';

/** True when the visitor asked for less motion. Auto-play and ambient animation check this. */
export const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
