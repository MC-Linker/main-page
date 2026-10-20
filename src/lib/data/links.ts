const guideBase = 'https://guide.mclinker.com';

/** Builds a link into the guide. `path` is relative to the guide root, e.g. `features/chat-bridge`. */
export const guide = (path = '') => `${guideBase}/${path ? `guide/${path}.html` : ''}`;

export const links = {
    invite: 'https://discord.com/api/oauth2/authorize?client_id=712759741528408064',
    appDirectory: 'https://discord.com/application-directory/712759741528408064',
    support: 'https://discord.gg/rX36kZUGNK',
    guide: guideBase,
    plugin: {
        modrinth: 'https://modrinth.com/plugin/discord-linker',
        /** The Bukkit plugin's page. Not set up yet. */
        curseforge: 'https://www.curseforge.com/minecraft/bukkit-plugins/discord-linker',
        curseforgeMods: 'https://www.curseforge.com/minecraft/mc-mods/discord-linker',
        hangar: 'https://hangar.papermc.io/Lianecx/Discord-Linker',
        spigot: 'https://www.spigotmc.org/resources/discord-linker.98749/',
        aternos: 'https://aternos.org/addons/a/spigot/98749',
    },
    socials: {
        youtube: 'https://www.youtube.com/@lianecx',
        topgg: 'https://top.gg/bot/712759741528408064',
        github: 'https://github.com/MC-Linker',
        crowdin: 'https://crowdin.com/project/minecraft-smp-bot',
    },
    pages: {
        team: '/team',
        terms: '/md/terms',
        privacy: '/md/privacy',
    },
} as const;
