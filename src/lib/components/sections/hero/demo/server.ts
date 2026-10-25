import { UNKNOWN_COMMAND } from './data';

/** What the pretend server knows when it runs a command. */
export type World = { online: string[] };
/** A command's result: its output line, and what it changed. `said` is a line to show as [Server]. */
export type Result = { output: string | null; night?: boolean; rain?: boolean; said?: string };

/** Runs a vanilla-ish command on the pretend server. Pure: the caller applies what changed. */
export function execute(world: World, command: string): Result {
    const [verb, ...a] = command.replace(/^\//, '').trim().split(/\s+/);
    const v = verb?.toLowerCase();
    if(v === 'time' && a[0] === 'set') {
        const ticks: Record<string, number> = { day: 1000, noon: 6000, night: 13000, midnight: 18000 };
        const t = ticks[a[1]] ?? Number(a[1]);
        if(Number.isNaN(t) || a[1] === undefined) return { output: UNKNOWN_COMMAND };
        return { output: `Set the time to ${t}`, night: (t % 24000) >= 12500 && (t % 24000) < 23500 };
    }
    if(v === 'weather') {
        if(a[0] === 'clear') return { output: 'Set the weather to clear', rain: false };
        if(a[0] === 'rain') return { output: 'Set the weather to rain', rain: true };
        if(a[0] === 'thunder') return { output: 'Set the weather to rain & thunder', rain: true };
    }
    if(v === 'say' && a.length) return { output: null, said: a.join(' ') };
    if(v === 'list') return { output: `There are ${world.online.length} of a max of 20 players online: ${world.online.join(', ')}` };
    if(v === 'gamemode' && ['survival', 'creative', 'adventure', 'spectator'].includes(a[0])) {
        const mode = a[0][0].toUpperCase() + a[0].slice(1);
        return { output: a[1] ? `Set ${a[1]}'s game mode to ${mode} Mode` : `Set own game mode to ${mode} Mode` };
    }
    if(v === 'give' && a[0] && a[1]) {
        const item = a[1].replace('minecraft:', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return { output: `Gave ${a[2] ?? 1} [${item}] to ${a[0]}` };
    }
    return { output: UNKNOWN_COMMAND };
}
