/** Formats milliseconds like a speedrun timer: 1:02.3, or 0:51.7. */
export function fmt(ms: number, digits: 1 | 2 = 1): string {
    const t = Math.max(0, ms) / 1000;
    const m = Math.floor(t / 60);
    const s = t - m * 60;
    return `${m}:${s.toFixed(digits).padStart(digits + 3, '0')}`;
}

/** Formats a split delta: -1.2 or +0.8. */
export const fmtDelta = (ms: number) => `${ms < 0 ? '−' : '+'}${(Math.abs(ms) / 1000).toFixed(1)}`;

const read = <T>(key: string): T | null => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : null; }
    catch { return null; }
};
const write = (key: string, value: unknown) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* private mode: the run still works, it just isn't remembered */ }
};

/**
 * A speedrun of the real setup. Times are cumulative per split, like LiveSplit.
 * The personal best and attempt count live in the visitor's browser only.
 */
export class Run {
    times = $state<(number | null)[]>([]);
    start = $state<number | null>(null);
    now = $state(0);
    finished = $state(false);
    newPb = $state(false);
    pb = $state<number[] | null>(null);
    /** The PB as it was when this run started, so a new PB doesn't compare against itself. */
    compare = $state<number[] | null>(null);
    attempts = $state(0);

    private raf = 0;

    constructor(public readonly count: number, private readonly key = 'mclinker-run') {
        this.times = Array(count).fill(null);
    }

    /** Call once in the browser to load the saved PB and attempts. */
    load() {
        const saved = read<{ pb: number[] | null; attempts: number }>(this.key);
        if(saved) { this.pb = saved.pb; this.attempts = saved.attempts ?? 0; }
    }

    get running() { return this.start !== null && !this.finished; }
    get index() { return this.times.findIndex(t => t === null); }
    get elapsed() {
        if(this.start === null) return 0;
        if(this.finished) return this.times[this.count - 1] ?? 0;
        return this.now - this.start;
    }

    delta(i: number): number | null {
        const t = this.times[i];
        return t !== null && this.compare ? t - this.compare[i] : null;
    }

    /** Whether the segment ending at split i beat the PB's segment. */
    gold(i: number): boolean {
        const t = this.times[i];
        if(t === null || !this.compare) return false;
        const seg = t - (i ? this.times[i - 1] ?? 0 : 0);
        const best = this.compare[i] - (i ? this.compare[i - 1] : 0);
        return seg < best;
    }

    begin() {
        if(this.running) return;
        this.reset();
        this.compare = this.pb ? [...this.pb] : null;
        this.start = performance.now();
        this.attempts++;
        write(this.key, { pb: this.pb, attempts: this.attempts });
        const tick = () => { this.now = performance.now(); this.raf = requestAnimationFrame(tick); };
        tick();
    }

    split() {
        if(!this.running) return this.begin();
        const i = this.index;
        this.times[i] = performance.now() - this.start!;
        if(i === this.count - 1) this.finish();
    }

    undo() {
        if(!this.running) return;
        const i = this.index;
        if(i > 0) this.times[i - 1] = null;
    }

    private finish() {
        this.finished = true;
        cancelAnimationFrame(this.raf);
        const total = this.times[this.count - 1]!;
        if(!this.pb || total < this.pb[this.count - 1]) {
            this.pb = [...this.times] as number[];
            this.newPb = true;
        }
        write(this.key, { pb: this.pb, attempts: this.attempts });
    }

    reset() {
        cancelAnimationFrame(this.raf);
        this.times = Array(this.count).fill(null);
        this.start = null;
        this.finished = false;
        this.newPb = false;
    }
}
