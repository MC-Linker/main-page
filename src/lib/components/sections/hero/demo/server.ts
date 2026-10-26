import { UNKNOWN_COMMAND } from './data';

/** What the pretend server knows when it runs a command. */
export type World = { online: string[] };
/** A command's result: its output line, and what it changed. `said` is a line to show as [Server]. */
export type Result = { output: string | null; night?: boolean; rain?: boolean; said?: string };

const title = (id: string) => id.replace('minecraft:', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const roman = ['', 'I', 'II', 'III', 'IV', 'V'];

/**
 * Runs a vanilla-ish command on the pretend server, with the game's own replies.
 * `self` is who @s means: the player typing, or the linked account of whoever used /command.
 * Pure: the caller applies what changed.
 */
export function execute(world: World, command: string, self = 'You'): Result {
    const [verb, ...a] = command.replace(/^\//, '').trim().split(/\s+/);
    const v = verb?.toLowerCase();
    const known = [...new Set([...world.online, self])];

    /** Who a target means, as the game names them in its reply. Null if nobody matches. */
    const who = (t?: string, entities = false): string | null => {
        if(!t) return null;
        if(t === '@s') return self;
        if(t === '@p' || t === '@r') return world.online[0] ?? self;
        if(t === '@a') return world.online.length === 1 ? world.online[0] : `${world.online.length} players`;
        if(t === '@e') return entities ? `${world.online.length + 46} entities` : null;
        return known.find(n => n.toLowerCase() === t.toLowerCase()) ?? null;
    };
    const noPlayer = { output: 'No player was found' };

    switch(v) {
        case 'time': {
            if(a[0] === 'query') {
                const q: Record<string, string> = { day: 'The time is 1', daytime: 'The time is 1000', gametime: 'The time is 25000' };
                return { output: q[a[1]] ?? UNKNOWN_COMMAND };
            }
            const ticks: Record<string, number> = { day: 1000, noon: 6000, night: 13000, midnight: 18000 };
            const t = ticks[a[1]] ?? Number(a[1]);
            if((a[0] !== 'set' && a[0] !== 'add') || Number.isNaN(t) || a[1] === undefined) return { output: UNKNOWN_COMMAND };
            const now = a[0] === 'add' ? 1000 + t : t;
            return { output: `Set the time to ${now}`, night: (now % 24000) >= 12500 && (now % 24000) < 23500 };
        }
        case 'weather':
            if(a[0] === 'clear') return { output: 'Set the weather to clear', rain: false };
            if(a[0] === 'rain') return { output: 'Set the weather to rain', rain: true };
            if(a[0] === 'thunder') return { output: 'Set the weather to rain & thunder', rain: true };
            break;
        case 'say':
            if(a.length) return { output: null, said: a.join(' ') };
            break;
        case 'msg': case 'tell': case 'w': {
            if(!a[1]) break;
            const p = who(a[0]);
            return p ? { output: `You whisper to ${p}: ${a.slice(1).join(' ')}` } : noPlayer;
        }
        case 'list':
            return { output: `There are ${world.online.length} of a max of 20 players online: ${world.online.join(', ')}` };
        case 'seed':
            return { output: 'Seed: [-4172144997902289642]' };
        case 'reload':
            return { output: 'Reloading!' };
        case 'save-all':
            return { output: 'Saved the game' };
        case 'banlist':
            return { output: 'There is 1 ban(s): Griefer was banned by Server: Too much TNT' };
        case 'difficulty':
            if(['peaceful', 'easy', 'normal', 'hard'].includes(a[0])) return { output: `The difficulty has been set to ${title(a[0])}` };
            break;
        case 'defaultgamemode':
            if(['survival', 'creative', 'adventure', 'spectator'].includes(a[0])) return { output: `The default game mode is now ${title(a[0])} Mode` };
            break;
        case 'gamemode': {
            if(!['survival', 'creative', 'adventure', 'spectator'].includes(a[0])) break;
            const mode = title(a[0]);
            if(!a[1]) return { output: `Set own game mode to ${mode} Mode` };
            const p = who(a[1]);
            return p ? { output: `Set ${p}'s game mode to ${mode} Mode` } : noPlayer;
        }
        case 'give': {
            if(!a[0] || !a[1]) break;
            const p = who(a[0]);
            return p ? { output: `Gave ${a[2] ?? 1} [${title(a[1])}] to ${p}` } : noPlayer;
        }
        case 'clear': {
            const p = who(a[0] ?? '@s');
            return p ? { output: `Removed ${a[1] ? `all ${title(a[1])}` : '36 item(s)'} from ${p}` } : noPlayer;
        }
        case 'kill': {
            const p = who(a[0] ?? '@s', true);
            return p ? { output: `Killed ${p}` } : noPlayer;
        }
        case 'effect': {
            const p = who(a[1], true);
            if(!p) return a[1] ? noPlayer : { output: UNKNOWN_COMMAND };
            if(a[0] === 'give' && a[2]) return { output: `Applied effect ${title(a[2])} to ${p}` };
            if(a[0] === 'clear') return { output: a[2] ? `Removed effect ${title(a[2])} from ${p}` : `Removed every effect from ${p}` };
            break;
        }
        case 'enchant': {
            if(!a[1]) break;
            const p = who(a[0], true);
            return p ? { output: `Applied enchantment ${title(a[1])} ${roman[Number(a[2] ?? 1)] ?? a[2]} to ${p}'s item` } : noPlayer;
        }
        case 'experience': case 'xp': {
            const p = who(a[1]);
            if(!p) return a[1] ? noPlayer : { output: UNKNOWN_COMMAND };
            if(a[0] === 'query') return { output: `${p} has ${a[2] === 'points' ? '12 experience points' : '30 experience levels'}` };
            if(a[2] === undefined || Number.isNaN(Number(a[2]))) break;
            const unit = a[3] === 'levels' ? 'experience levels' : 'experience points';
            return { output: a[0] === 'set' ? `Set ${a[2]} ${unit} on ${p}` : `Gave ${a[2]} ${unit} to ${p}` };
        }
        case 'gamerule':
            if(!a[0]) break;
            return { output: a[1] ? `Gamerule ${a[0]} is now set to: ${a[1]}` : `Gamerule ${a[0]} is currently set to: false` };
        case 'op': case 'deop': {
            const p = who(a[0]);
            if(!p) return a[0] ? noPlayer : { output: UNKNOWN_COMMAND };
            return { output: v === 'op' ? `Made ${p} a server operator` : `Made ${p} no longer a server operator` };
        }
        case 'kick': {
            const p = who(a[0]);
            if(!p) return a[0] ? noPlayer : { output: UNKNOWN_COMMAND };
            return { output: `Kicked ${p}: ${a.slice(1).join(' ') || 'Kicked by an operator'}` };
        }
        case 'ban':
            if(!a[0]) break;
            return { output: `Banned ${who(a[0]) ?? a[0]}: ${a.slice(1).join(' ') || 'Banned by an operator.'}` };
        case 'pardon':
            if(!a[0]) break;
            return { output: `Unbanned ${a[0]}` };
        case 'whitelist': {
            if(a[0] === 'on') return { output: 'Whitelist is now turned on' };
            if(a[0] === 'off') return { output: 'Whitelist is now turned off' };
            if(a[0] === 'reload') return { output: 'Reloaded the whitelist' };
            if(a[0] === 'list') return { output: 'There are 3 whitelisted player(s): Cubey, Lianecx, TheAnnoying' };
            const p = who(a[1]);
            if(!p) return a[1] ? noPlayer : { output: UNKNOWN_COMMAND };
            if(a[0] === 'add') return { output: `Added ${p} to the whitelist` };
            if(a[0] === 'remove') return { output: `Removed ${p} from the whitelist` };
            break;
        }
        case 'tp': case 'teleport': {
            const p = who(a[0], true);
            if(!p) return a[0] ? noPlayer : { output: UNKNOWN_COMMAND };
            if(!a[1]) return { output: `Teleported ${self} to ${p}` };
            const to = who(a[1], true);
            if(to) return { output: `Teleported ${p} to ${to}` };
            const [x, y, z] = a.slice(1, 4);
            if(z !== undefined) return { output: `Teleported ${p} to ${x}, ${y}, ${z}` };
            break;
        }
        case 'summon':
            if(a[0]) return { output: `Summoned new ${title(a[0])}` };
            break;
        case 'help':
            return { output: '/advancement (grant|revoke) <targets> (everything|only|from|through|until)' };
    }
    return { output: UNKNOWN_COMMAND };
}
