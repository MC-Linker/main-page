/**
 * Minecraft's command suggestions: as you type a command, the options for the word
 * you are on show above the chat bar, and Tab fills one in.
 *
 * A command tree maps each word to what may follow it. A key in angle brackets
 * (`<message>`) is free text: it can't be filled in, so it shows as a grey hint.
 */
export type CommandTree = { [word: string]: CommandTree };

export type Suggestions = {
    /** Where the word being completed starts in the input. */
    start: number;
    /** Words that fit what has been typed so far. */
    options: string[];
    /** The usage of the next free-text argument, like `<message>`, when there is nothing to pick. */
    hint?: string;
};

const isFree = (key: string) => key.startsWith('<');
/** The branch for a typed word, ignoring case. */
const branch = (node: CommandTree, word: string) => {
    const key = Object.keys(node).find(k => !isFree(k) && k.toLowerCase() === word.toLowerCase());
    return key === undefined ? undefined : node[key];
};

export function suggest(tree: CommandTree, value: string): Suggestions | null {
    if(!value.startsWith('/')) return null;
    const words = value.slice(1).split(' ');
    let node: CommandTree | undefined = tree;
    let start = 1;
    // Walk down the words already finished (followed by a space).
    for(const word of words.slice(0, -1)) {
        start += word.length + 1;
        if(!node) return null;
        const known: CommandTree | undefined = branch(node, word);
        const free: string | undefined = Object.keys(node).find(isFree);
        // Free text (a message) takes the rest of the line.
        if(!known && free && Object.keys(node[free]).length === 0) return null;
        node = known ?? (free ? node[free] : undefined);
    }
    if(!node) return null;
    const current = words.at(-1)!.toLowerCase();
    const keys = Object.keys(node);
    const options = keys.filter(k => !isFree(k) && k.toLowerCase().startsWith(current) && k.toLowerCase() !== current).sort((a, b) => a.localeCompare(b));
    const free = keys.find(isFree);
    if(!options.length && !free) return null;
    return { start, options, hint: !options.length && !current ? free : undefined };
}

/** The input after picking `option` for the word that starts at `start`. */
export function complete(tree: CommandTree, value: string, start: number, option: string): string {
    const filled = value.slice(0, start) + option;
    // Add the space when more can follow, so the next suggestions show straight away.
    const after = suggest(tree, filled + ' ');
    return after && (after.options.length || after.hint) ? filled + ' ' : filled;
}
