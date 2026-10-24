import { links } from './links';

export type Faq = { q: string; a: string };

/** Answers may contain simple inline HTML (links, code). */
export const faq: Faq[] = [
    {
        q: 'Is MC Linker free?',
        a: `Yes, every feature is free. An optional <em>Customize MC Linker</em> subscription lets you run MC Linker as your own bot with your own name, avatar and status. But <a href="${links.donate}" target="_blank" rel="noopener">donations</a> are always welcome to support our hard work 😁`,
    },
    {
        q: 'Do I need to host a bot or edit config files?',
        a: 'No. The bot is hosted for you, and everything is set up with slash commands in Discord. The plugin works out of the box.',
    },
    {
        q: 'Which servers are supported?',
        a: 'Paper, Spigot and Purpur from 1.8, Fabric 1.16.5 – 26.2, NeoForge 1.21.1 – 26.2, Forge 1.16.5 – 1.20.x and hybrid servers. Hosts like Aternos work too.',
    },
    {
        q: 'Can Bedrock or cracked players link their accounts?',
        a: 'Yes. Bedrock players joining through Geyser and Floodgate can link, and offline-mode (cracked) servers are supported.',
    },
    {
        q: 'Can I connect more than one Minecraft server?',
        a: 'Each Discord server links to one Minecraft server at a time. Running <code>/connect</code> again moves the link to the new server.',
    },
    {
        q: 'Where do I get help?',
        a: 'The <a href="https://guide.mclinker.com">guide</a> covers every command, and the team answers questions on the <a href="https://discord.gg/rX36kZUGNK">support server</a>.',
    },
];
