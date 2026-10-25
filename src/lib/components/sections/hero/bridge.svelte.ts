import { sleep } from '$lib/browser';
import { links } from '$lib/data';
import { type Author, bot, chatWebhook, colors, type DcMsg, type Embed, embedStyle, success } from '$lib/discord/types';
import type { McLine } from '$lib/mc/text';
import { discordToMc, eventEmbed, members, type Player, players, privateToMc, toShort, UNKNOWN_COMMAND, webhookFor, you } from './demo/data';
import { adminEmbed, helpEmbed, serverEmbed, worldEmbed } from './demo/embeds';
import { execute } from './demo/server';

export { demoCommands, mcCommands } from './demo/data';

/*
 * The hero's pretend Minecraft server and Discord channel: the state both chats show, what
 * happens when the visitor types in either, and the short conversation that plays on load.
 * The cast and wording are in demo/data.ts, the server's commands in demo/server.ts, and
 * the bot's bigger replies in demo/embeds.ts.
 */

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
    /** While true, the script waits before its next step (the hero's intro is showing). */
    paused = false;
    /** Set when the hero goes away: the script stops at its next step and timers are cleared. */
    private destroyed = false;
    private toastTimer = 0;

    destroy() {
        this.destroyed = true;
        clearTimeout(this.toastTimer);
    }

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
            case 'help': return void this.botReply('/help', [helpEmbed()]);
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

    /** Runs a command on the pretend server and applies what it changed. */
    private run(command: string) {
        const r = execute(this, command);
        if(r.night !== undefined) this.night = r.night;
        if(r.rain !== undefined) this.rain = r.rain;
        if(r.said) this.mcLine(`[Server] ${r.said}`);
        return r.output;
    }

    private async remoteCommand(command: string) {
        await this.transfer('toMinecraft');
        const output = this.run(command);
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
            server: { label: 'General Information', embed: () => serverEmbed(this) },
            world: { label: 'World Information', embed: () => worldEmbed(this) },
            admin: { label: 'Admin Information', style: 'danger', embed: () => adminEmbed(this) },
        };
        // Like the real bot (its Pagination helper): all buttons stay, and the open page's turns blurple.
        this.dcEdit(id, {
            embeds: [pages[page].embed()],
            buttons: (Object.keys(pages) as InfoPage[]).map(p => ({
                label: pages[p].label, style: p === page ? 'primary' : pages[p].style, onclick: () => this.showInfoPage(id, p),
            })),
        });
    }

    private inventory(user?: string) {
        if(!user || user.toLowerCase() === 'theannoying') {
            this.botReply('/inventory', [success('Player Inventory', 'Here\'s the inventory of **TheAnnoying**:', {
                image: '/features/inventory.png',
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
        // Names aren't case-sensitive, like in the game: `/ban cubey` bans and kicks Cubey.
        user = this.online.find(n => n.toLowerCase() === user.toLowerCase())
            ?? this.banned.find(n => n.toLowerCase() === user.toLowerCase()) ?? user;
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

        const output = this.run(text);
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
        clearTimeout(this.toastTimer);
        this.toastTimer = window.setTimeout(() => { if(this.dmToast === text) this.dmToast = null; }, 4000);
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
            while(this.paused && !this.destroyed) await sleep(200);
            if(this.destroyed) return;
            await step();
        }
    }
}
