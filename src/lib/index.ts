export const links = {
    plugin: {
        modrinth: "https://modrinth.com/plugin/discord-linker",
        spigot: "https://www.spigotmc.org/resources/discord-linker.98749/"
    },
    invites: {
        bot: "https://discord.com/oauth2/authorize?client_id=712759741528408064&permissions=275415092224&scope=applications.commands%20bot",
        server: "https://discord.gg/rX36kZUGNK",        
    },
    pages: {
        guide: "https://guide.mclinker.com",
        terms: "/md/terms",
        privacy: "/md/privacy"
    },
    socials: {
        youTube: "https://www.youtube.com/@lianecx",
        topgg: "https://top.gg/bot/712759741528408064",
        github: "https://github.com/MC-Linker"
    }
};

export const hero = [
    {
        image: "/hero/inventory.png",
        alt: "Inventory of TheAnnoying",
        title: "View Inventory",
        description: "View other player's inventories including information about every item.",
        link: "https://guide.mclinker.com/guide/main/inventory.html"
    },
    {
        image: "/hero/chatchannels.png",
        alt: "A Chat Channel setup success message followed by in-game Lianecx's message: 'okay, that's great'",
        title: "Chat Channel",
        description: "Adds a chat bridge between Minecraft and Discord and allows administrators to monitor commands sent by users",
        link: "https://guide.mclinker.com/guide/chatchannels/creating.html",
        reverse: true
    },
    {
        image: "/hero/moderation.png",
        alt: "Sucess message of a player ban from within Discord",
        title: "Moderation",
        description: "Moderate your server by executing any Minecraft command from Discord",
        link: "https://guide.mclinker.com/guide/moderation/commands.html"
    }
];

export const team = {
    core: [
        {
            username: "TheAnnoying",
            github: "TheAnnoying",
            about: "Hello,<br>I'm in charge of how the bot is presented to you.<br>I enjoy coding, designing images, editing videos and making websites.<br>I hope your experience with MC Linker is great!",
            roles: [ "Marketing", "Designer" ]
        },
        {
            username: "Lianecx",
            github: "Lianecx",
            about: "Hey 👋<br>I'm Lianecx and I manage and develop the MC Linker Discord bot.<br>I love programming (especially in Java and JS) and my favorite games are Minecraft and Rocket League 👀",
            roles: [ "Team Lead", "Developer" ]
        },
        {
            username: "Bnux",
            github: "Bnux256",
            about: "Hey!<br>I manage the deployment of the MC Linker Discord bot and the testing Minecraft server.<br>I also help with the architecture of the project.",
            roles: [ "DevOps" ]
        },
    ],
    specialthanks: [
        {
            username: "Hannibal",
            roles: [ "Donator" ]
        },
        {
            username: "fALECX",
            github: "falecx",
            roles: [ "Supporter" ]
        }
    ]
}