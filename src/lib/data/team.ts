export type Member = {
    username: string;
    github?: string;
    about?: string;
    roles: string[];
    /** Accent used for the profile banner. */
    color: string;
    /** Discord-style presence on the card. Defaults to online. */
    status?: 'online' | 'offline';
};

export const team: { core: Member[]; specialThanks: Member[] } = {
    core: [
        {
            username: 'Lianecx',
            github: 'Lianecx',
            about: 'Hey 👋 I\'m Lianecx and I manage and develop the MC Linker Discord bot. I love programming (especially in Java and JS) and my favorite games are Minecraft and Rocket League 👀',
            roles: ['Team Lead', 'Developer'],
            color: '#6f9e2d',
        },
        {
            username: 'TheAnnoying',
            github: 'TheAnnoying',
            about: 'Hello, I\'m in charge of how the bot is presented to you. I enjoy coding, designing images, editing videos and making websites. I hope your experience with MC Linker is great!',
            roles: ['Marketing', 'Designer'],
            color: '#5865f2',
        },
        {
            username: 'Bnux',
            github: 'Bnux256',
            about: 'Hey! I manage the deployment of the MC Linker Discord bot and the testing Minecraft server. I also help with the architecture of the project.',
            roles: ['DevOps'],
            color: '#915d2a',
            status: 'offline',
        },
    ],
    specialThanks: [
        { username: 'Hannibal', github: 'N1Lowbob', roles: ['Donator'], color: '#c27c0e' },
        { username: 'fALECX', github: 'falecx', roles: ['Supporter'], color: '#3b8ea5' },
        { username: 'Ewan', github: 'ewanhowell5195', roles: ['Contributor'], color: '#df5050' },
        { username: 'Punch the Monkey', roles: ['Donator', 'Supporter'], color: '#009506' },
    ],
};

/** Role colours, like rank tags on a Minecraft server. */
export const roleColors: Record<string, string> = {
    'Team Lead': '#ffaa00',
    Developer: '#55ff55',
    Marketing: '#ff55ff',
    Designer: '#55ffff',
    DevOps: '#5555ff',
    Donator: '#ffff55',
    Supporter: '#aaaaaa',
    Contributor: '#ff5555',
};
