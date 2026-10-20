import { sleep } from '$lib/browser';
import { links } from '$lib/data';
import { type Author, bot, chatWebhook, colors, type DcMsg, type Embed, embedStyle, type SlashCommand, success, visitor } from '$lib/discord/types';
import type { McLine } from '$lib/mc/text';
import type { LookName } from '$lib/pixel/heads';

/*
 * The hero's pretend Minecraft server and Discord channel. Messages and
 * command replies mirror the real bot and plugin (formats taken from the
 * plugin config and the bot's language file).
 */

type Player = { name: string; look: LookName };

const players: Record<string, Player> = {
    cubey: { name: 'Cubey', look: 'cubey' },
    lianecx: { name: 'Lianecx', look: 'lianecx' },
    you: { name: 'You', look: 'newbie' },
};

const members = {
    theannoying: { name: 'TheAnnoying', avatar: { head: 'theannoying' }, color: '#f47b67' } satisfies Author,
    bnux: { name: 'Bnux', avatar: { head: 'bnux' }, color: '#3ba55d' } satisfies Author,
    you: visitor,
};

/** The visitor, as the user of a slash command. */
const you = { user: visitor.name, avatar: visitor.avatar };

export const demoCommands: SlashCommand[] = [
    {
        name: 'command',
        description: 'Execute any command on the Minecraft-server.',
        options: ['command'],
        suggestions: ['time set night', 'time set day', 'weather rain', 'weather thunder', 'weather clear', 'give Cubey diamond 64', 'gamemode creative Cubey', 'list', 'say Hello from Discord!'],
    },
    { name: 'serverinfo', description: 'View information about the connected Minecraft server.' },
    { name: 'inventory', description: 'Get an image of the current player\'s inventory.', options: ['user'], suggestions: ['TheAnnoying'] },
    { name: 'message', description: 'Send private chat messages to members on the server.', options: ['user', 'message'], suggestions: ['Cubey psst, behind you', 'Lianecx nice build!'] },
    { name: 'ban', description: 'Ban a player from the Minecraft server.', options: ['user', 'reason'], suggestions: ['Griefer too much TNT'] },
    { name: 'help', description: 'Detailed description of every command.' },
];

/** What the game says to commands it doesn't know. */
const UNKNOWN_COMMAND = 'Unknown or incomplete command, see below for error';

// The plugin's default config.yml formats.
const discordToMc = (name: string, text: string) => `&l&9Discord &8| &l&7${name} &8>>&r ${text}`;
const privateToMc = (name: string, text: string) => `&9&o&lDiscord &8&o| &7&o${name} whispers to you: ${text}`;

const shortcodes: Record<string, string> = {
    '💀': ':skull:', '😂': ':joy:', '❤️': ':heart:', '🔥': ':fire:', '👍': ':thumbsup:', '🛏️': ':bed:',
    '😭': ':sob:', '🎉': ':tada:', '👋': ':wave:', '😀': ':grinning:', '😄': ':smile:', '🙂': ':slight_smile:',
};
/** The bot turns emoji into :shortcodes: before sending them to Minecraft. */
const toShort = (text: string) =>
    text.replace(/\p{Extended_Pictographic}️?/gu, m => shortcodes[m] ?? shortcodes[m.replace('️', '')] ?? ':emoji:');

const webhookFor = (p: Player): Author => ({ name: p.name, avatar: { head: p.look }, tag: 'APP' });
const eventEmbed = (p: Player, description: string, color: string): Embed => ({
    color,
    author: { name: p.name, avatar: { head: p.look } },
    description,
});

/** Which way a message travels through the link. */
export type Direction = 'toDiscord' | 'toMinecraft';
/** The pages of the /serverinfo reply, switched with its buttons. */
type InfoPage = 'server' | 'world' | 'admin';

export class Bridge {
    mc = $state<McLine[]>([]);
    dc = $state<DcMsg[]>([]);
    night = $state(false);
    rain = $state(false);
    online = $state<string[]>(['Lianecx']);
    typing = $state<string | null>(null);
    dmToast = $state<string | null>(null);
    banned = $state<string[]>([]);

    /** Replaced by the hero with the "message flies through the logo" animation. */
    transfer: (dir: Direction) => Promise<void> = async () => {};

    private lineId = 1;
    private messageId = 1;
    private scriptRunning = false;

    mcLine(text: string) {
        this.mc.push({ id: this.lineId++, text });
        if(this.mc.length > 40) this.mc.shift();
    }

    dcPost(msg: Omit<DcMsg, 'id'>) {
        const id = this.messageId++;
        this.dc.push({ ...msg, id });
        if(this.dc.length > 30) this.dc.shift();
        return id;
    }

    /** Changes a message in place, like the bot editing its reply after a button click. */
    dcEdit(id: number, patch: Partial<Omit<DcMsg, 'id'>>) {
        const i = this.dc.findIndex(m => m.id === id);
        if(i !== -1) this.dc[i] = { ...this.dc[i], ...patch };
    }

    /** The "is thinking..." message of the slash command that is running, which the reply replaces. */
    private pending: number | null = null;

    private botReply(command: string, embeds: Embed[], buttons?: DcMsg['buttons']) {
        if(this.pending !== null) {
            const id = this.pending;
            this.pending = null;
            this.dcEdit(id, { embeds, buttons, thinking: false });
            return id;
        }
        return this.dcPost({ author: bot, interaction: { ...you, command }, embeds, buttons });
    }

    // ── Minecraft → Discord ──────────────────────────────────────────────
    async playerChat(p: Player, text: string) {
        this.mcLine(`<${p.name}> ${text}`);
        await this.transfer('toDiscord');
        this.dcPost({ author: webhookFor(p), content: text });
    }

    async join(p: Player) {
        this.mcLine(`&e${p.name} joined the game`);
        if(!this.online.includes(p.name)) this.online.push(p.name);
        await this.transfer('toDiscord');
        this.dcPost({ author: chatWebhook, embeds: [eventEmbed(p, `:join: **${p.name}** joined the game`, colors.yellow)] });
    }

    async advancement(p: Player, title: string, description: string) {
        this.mcLine(`${p.name} has made the advancement &a[${title}]`);
        await this.transfer('toDiscord');
        this.dcPost({
            author: chatWebhook,
            embeds: [eventEmbed(p, `**${p.name}** has made the advancement: [**${title}**]\n*${description}*`, colors.pink)],
        });
    }

    async death(p: Player, message: string) {
        this.mcLine(message);
        await this.transfer('toDiscord');
        this.dcPost({ author: chatWebhook, embeds: [eventEmbed(p, `:death: ${message}`, colors.darkPurple)] });
    }

    // ── Discord → Minecraft ──────────────────────────────────────────────
    async discordChat(author: Author, text: string) {
        this.dcPost({ author, content: text });
        await this.transfer('toMinecraft');
        this.mcLine(discordToMc(author.name, toShort(text)));
    }

    /** Handles whatever the visitor types into the Discord composer. */
    runDiscord(text: string) {
        if(!text.startsWith('/')) return this.discordChat(members.you, text);
        // Slash commands run one after another, each with its own "is thinking..." message.
        this.slashQueue = this.slashQueue.then(() => this.slash(text)).catch(() => {});
        return this.slashQueue;
    }

    private slashQueue: Promise<void> = Promise.resolve();

    private async slash(text: string) {
        const [name, ...rest] = text.slice(1).split(/\s+/);
        const arg = rest.join(' ');
        // Like Discord: the app takes a moment to answer, and shows that it is thinking.
        this.pending = this.dcPost({ author: bot, interaction: { ...you, command: `/${name}` }, thinking: true });
        await sleep(900);
        switch(name.toLowerCase()) {
            case 'command': return this.remoteCommand(arg);
            case 'serverinfo': return this.serverInfo();
            case 'inventory': return this.inventory(rest[0]);
            case 'message': return this.message(rest[0], rest.slice(1).join(' '));
            case 'ban': return this.ban(rest[0], rest.slice(1).join(' '));
            case 'help': return this.help();
            default: {
                const id = this.pending!;
                this.pending = null;
                this.dcEdit(id, {
                    thinking: false,
                    content: 'In this demo you can try `/command`, `/serverinfo`, `/inventory`, `/message`, `/ban` and `/help`. The real bot has a lot more.',
                    ephemeral: true,
                });
            }
        }
    }

    /** Runs a vanilla-ish command on the pretend server and returns its output. */
    private execute(command: string): string | null {
        const [verb, ...a] = command.replace(/^\//, '').trim().split(/\s+/);
        const v = verb?.toLowerCase();
        if(v === 'time' && a[0] === 'set') {
            const ticks: Record<string, number> = { day: 1000, noon: 6000, night: 13000, midnight: 18000 };
            const t = ticks[a[1]] ?? Number(a[1]);
            if(Number.isNaN(t) || a[1] === undefined) return UNKNOWN_COMMAND;
            this.night = (t % 24000) >= 12500 && (t % 24000) < 23500;
            return `Set the time to ${t}`;
        }
        if(v === 'weather') {
            if(a[0] === 'clear') { this.rain = false; return 'Set the weather to clear'; }
            if(a[0] === 'rain') { this.rain = true; return 'Set the weather to rain'; }
            if(a[0] === 'thunder') { this.rain = true; return 'Set the weather to rain & thunder'; }
        }
        if(v === 'say' && a.length) {
            this.mcLine(`[Server] ${a.join(' ')}`);
            return null;
        }
        if(v === 'list') return `There are ${this.online.length} of a max of 20 players online: ${this.online.join(', ')}`;
        if(v === 'gamemode' && ['survival', 'creative', 'adventure', 'spectator'].includes(a[0])) {
            const mode = a[0][0].toUpperCase() + a[0].slice(1);
            return a[1] ? `Set ${a[1]}'s game mode to ${mode} Mode` : `Set own game mode to ${mode} Mode`;
        }
        if(v === 'give' && a[0] && a[1]) {
            const item = a[1].replace('minecraft:', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `Gave ${a[2] ?? 1} [${item}] to ${a[0]}`;
        }
        return UNKNOWN_COMMAND;
    }

    private async remoteCommand(command: string) {
        await this.transfer('toMinecraft');
        const output = this.execute(command);
        if(output) this.mcLine(`&7&o[Server: ${output}]`);
        await this.transfer('toDiscord');
        this.botReply('/command', [{
            ...embedStyle.success,
            color: colors.blue,
            title: 'Command Executed',
            description: output
                ? `\`\`\`${output}\`\`\``
                : 'No response message! Some commands do not have any response messages.',
        }]);
    }

    /** /serverinfo has three pages; its buttons switch between them by editing the reply. */
    private serverInfo() {
        const id = this.botReply('/serverinfo', []);
        this.showInfoPage(id, 'server');
    }

    private showInfoPage(id: number, page: InfoPage) {
        const pages: Record<InfoPage, { label: string; style?: 'danger'; embed: () => Embed }> = {
            server: { label: 'Server Information', embed: () => this.serverEmbed() },
            world: { label: 'World Information', embed: () => this.worldEmbed() },
            admin: { label: 'Admin Information', style: 'danger', embed: () => this.adminEmbed() },
        };
        const others = (Object.keys(pages) as InfoPage[]).filter(p => p !== page);
        this.dcEdit(id, {
            embeds: [pages[page].embed()],
            buttons: others.map(p => ({ label: pages[p].label, style: pages[p].style, onclick: () => this.showInfoPage(id, p) })),
        });
    }

    private serverEmbed(): Embed {
        return {
            ...embedStyle.success,
            color: colors.brand,
            title: 'Server Information',
            fields: [
                { name: 'Name', value: 'Linker SMP', inline: true },
                { name: 'MOTD', value: 'A cozy survival server', inline: true },
                { name: 'Players', value: `${this.online.length}/20`, inline: true },
                { name: 'Online', value: this.online.length ? this.online.join(', ') : 'Nobody' },
            ],
            footer: 'Server IP: testing.mclinker.com (26.2)',
        };
    }

    private worldEmbed(): Embed {
        return {
            ...embedStyle.success,
            color: colors.brand,
            title: 'World Information',
            fields: [
                { name: 'World', value: 'world', inline: true },
                { name: 'Difficulty', value: 'Normal', inline: true },
                { name: 'Hardcore', value: 'No', inline: true },
                { name: 'Time', value: this.night ? 'Night 🌙' : 'Day ☀️', inline: true },
                { name: 'Weather', value: this.rain ? 'Rain 🌧️' : 'Clear', inline: true },
                { name: 'Spawn', value: '0, 64, 0', inline: true },
            ],
            footer: 'Try /command time set night, then check again',
        };
    }

    private adminEmbed(): Embed {
        return {
            ...embedStyle.success,
            color: colors.red,
            title: 'Admin Information',
            fields: [
                { name: 'Operators', value: 'Lianecx', inline: true },
                { name: 'Whitelist', value: 'Off', inline: true },
                { name: 'Banned players', value: this.banned.length ? this.banned.join(', ') : 'None', inline: true },
                { name: 'Plugins', value: 'Discord-Linker, EssentialsX, WorldEdit' },
            ],
            footer: 'Only server admins can see this page',
        };
    }

    private inventory(user?: string) {
        if(!user || user.toLowerCase() === 'theannoying') {
            this.botReply('/inventory', [success('Player Inventory', 'Here\'s the inventory of **TheAnnoying**:', {
                image: '/hero/inventory.png',
            })]);
            return;
        }
        this.botReply('/inventory', [{
            ...embedStyle.warning,
            title: 'Could Not Download',
            description: 'Could not download inventory files. The user most likely never joined the server.',
        }]);
    }

    private async message(user = '', text = '') {
        const target = this.online.find(n => n.toLowerCase() === user.toLowerCase());
        if(!target) {
            this.botReply('/message', [{ ...embedStyle.warning, title: 'Player Not Online', description: `Player **${user || '?'}** is not online and cannot receive messages.` }]);
            return;
        }
        await this.transfer('toMinecraft');
        this.mcLine(privateToMc('you', toShort(text || 'hi!')));
        this.botReply('/message', [{ ...embedStyle.success, color: colors.blue, title: 'Send Message', description: `Successfully sent message to player **${target}**` }]);
    }

    private async ban(user = '', reason = '') {
        if(!user) {
            this.botReply('/ban', [{ ...embedStyle.warning, title: 'No User Specified', description: 'Please ping a user or specify a Minecraft username.' }]);
            return;
        }
        reason ||= 'Banned by an operator.';
        if(!this.banned.includes(user)) this.banned.push(user);
        await this.transfer('toMinecraft');
        if(this.online.includes(user)) {
            this.online = this.online.filter(n => n !== user);
            this.mcLine(`&e${user} left the game`);
        }
        this.mcLine(`&7&o[Server: Banned ${user}: ${reason}]`);
        await this.transfer('toDiscord');
        this.botReply('/ban', [{
            ...embedStyle.success,
            color: colors.orange,
            title: 'Ban Player',
            description: `Successfully banned player **${user}**: \`${reason}\`\n\`\`\`Banned ${user}: ${reason}\`\`\``,
        }]);
    }

    private help() {
        this.botReply('/help', [{
            color: colors.blue,
            author: { name: 'MC Linker', icon: '/logo.png' },
            title: 'Help Menu',
            fields: [
                { name: 'Main', value: 'Main commands such as `/inventory`, or `/advancements`.' },
                { name: 'Moderation', value: 'Moderation commands such as `/ban` or `/command`.' },
                { name: 'Other', value: 'Other commands such as `/message` or `/serverinfo`.' },
                { name: 'Settings', value: 'Setup and settings such as `/connect` or `/chatchannel`.' },
                { name: '​', value: `**Still need help?** [Read the guide](${links.guide})` },
            ],
        }]);
    }

    // ── What the visitor types in Minecraft ──────────────────────────────
    async runMinecraft(text: string) {
        if(!text.startsWith('/')) return this.playerChat(players.you, text);

        const [verb, ...a] = text.slice(1).split(/\s+/);
        switch(verb.toLowerCase()) {
            case 'discord':
                this.mcLine(`&aClick the following link to join the Discord server: &9${links.support.replace('https://', '')}`);
                return;
            case 'verify':
                this.mcLine('&eYou are not awaiting verification. Please execute "/account connect" in discord first');
                return;
            case 'linker':
                this.mcLine('&cYou do not have permission to use this command!');
                return;
            case 'dm': return this.dm(a[0], a.slice(1).join(' '));
        }

        const output = this.execute(text);
        if(output === UNKNOWN_COMMAND) {
            this.mcLine(`&c${output}`);
            return;
        }
        if(output) this.mcLine(output);
        // Player commands show up in Discord when "Player Command Messages" are enabled.
        await this.transfer('toDiscord');
        this.dcPost({
            author: chatWebhook,
            embeds: [eventEmbed(players.you, `:command: **You** has executed the command: [**${text}**]`, colors.darkGold)],
        });
    }

    private async dm(user = '', text = '') {
        if(!user || !text) {
            this.mcLine('&cUsage: /dm <user> <message>');
            return;
        }
        const member = Object.values(members).find(m => m.name.toLowerCase() === user.toLowerCase() && m !== members.you);
        if(!member) {
            this.mcLine('&cCould not find a valid Discord account. The user has to be in the linked Discord server.');
            return;
        }
        await this.transfer('toDiscord');
        this.mcLine(`&aDM sent to ${member.name}: ${text}`);
        this.dmToast = text;
        setTimeout(() => { if(this.dmToast === text) this.dmToast = null; }, 4000);
    }

    // ── The conversation that plays on load ──────────────────────────────
    /** The first two messages, shown before the script starts (also in the prerendered HTML). */
    seed() {
        this.mcLine('&eLianecx joined the game');
        this.mcLine('<Lianecx> morning!');
        this.dcPost({ author: chatWebhook, embeds: [eventEmbed(players.lianecx, ':join: **Lianecx** joined the game', colors.yellow)] });
        this.dcPost({ author: webhookFor(players.lianecx), content: 'morning!' });
    }

    private async typingThen(author: Author, text: string) {
        this.typing = author.name;
        await sleep(800);
        this.typing = null;
        await this.discordChat(author, text);
    }

    async playScript(animate: boolean) {
        if(this.scriptRunning) return;
        this.scriptRunning = true;
        if(this.mc.length === 0) this.seed();
        if(!animate) {
            this.online.push('Cubey');
            this.mcLine('&eCubey joined the game');
            this.mcLine('<Cubey> anyone up for the nether?');
            this.mcLine(discordToMc('TheAnnoying', 'omw! save me a bed :bed:'));
            this.dcPost({ author: chatWebhook, embeds: [eventEmbed(players.cubey, ':join: **Cubey** joined the game', colors.yellow)] });
            this.dcPost({ author: webhookFor(players.cubey), content: 'anyone up for the nether?' });
            this.dcPost({ author: members.theannoying, content: 'omw! save me a bed 🛏️' });
            return;
        }
        const steps: [number, () => Promise<void>][] = [
            [900, () => this.join(players.cubey)],
            [700, () => this.playerChat(players.cubey, 'anyone up for the nether?')],
            [300, () => this.typingThen(members.theannoying, 'omw! save me a bed 🛏️')],
            [1000, () => this.advancement(players.cubey, 'We Need to Go Deeper', 'Build, light and enter a Nether Portal')],
            [1100, () => this.death(players.cubey, 'Cubey tried to swim in lava')],
            [300, () => this.typingThen(members.bnux, 'rip 💀')],
            [1200, () => this.playerChat(players.lianecx, 'try typing in either chat, it goes through the link :)')],
        ];
        for(const [wait, step] of steps) {
            await sleep(wait);
            await step();
        }
    }
}
