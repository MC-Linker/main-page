import type { CommandTree } from './suggest';

/*
 * Vanilla Minecraft's commands, as a tree of what the game suggests for each word.
 * The bot's /command asks the server for these same suggestions as you type, so the
 * demos use this tree for both the Discord option and the Minecraft chat.
 *
 * Every vanilla command is listed. The common ones go a few words deep; the rest only
 * show a grey usage hint after their name.
 */

const leaf = (words: string[], rest: CommandTree = {}): CommandTree => Object.fromEntries(words.map(w => [w, rest]));

/** The players the demo server has online, plus the game's target selectors. */
export const demoPlayers = ['Cubey', 'Lianecx'];
const targets = (rest: CommandTree = {}) => leaf(['@a', '@e', '@p', '@r', '@s', ...demoPlayers], rest);
const players = (rest: CommandTree = {}) => leaf(['@a', '@p', '@r', '@s', ...demoPlayers], rest);

const modes = ['adventure', 'creative', 'spectator', 'survival'];
const items = [
    'apple', 'arrow', 'beacon', 'bow', 'bread', 'cake', 'cooked_beef', 'diamond', 'diamond_axe', 'diamond_block', 'diamond_chestplate',
    'diamond_pickaxe', 'diamond_sword', 'elytra', 'emerald', 'ender_pearl', 'experience_bottle', 'firework_rocket', 'golden_apple',
    'golden_carrot', 'iron_ingot', 'netherite_ingot', 'netherite_sword', 'oak_log', 'shulker_box', 'spyglass', 'stone', 'tnt', 'torch', 'totem_of_undying', 'trident',
];
const effects = [
    'absorption', 'fire_resistance', 'glowing', 'haste', 'invisibility', 'jump_boost', 'levitation', 'night_vision', 'regeneration',
    'resistance', 'saturation', 'slow_falling', 'slowness', 'speed', 'strength', 'water_breathing',
];
const enchantments = [
    'efficiency', 'feather_falling', 'fire_aspect', 'fortune', 'infinity', 'knockback', 'looting', 'mending', 'power',
    'protection', 'sharpness', 'silk_touch', 'unbreaking',
];
const entities = [
    'allay', 'axolotl', 'bee', 'cat', 'chicken', 'cow', 'creeper', 'ender_dragon', 'enderman', 'fox', 'horse', 'iron_golem',
    'lightning_bolt', 'pig', 'sheep', 'skeleton', 'villager', 'warden', 'wither', 'wolf', 'zombie',
];
const boolRules = [
    'announceAdvancements', 'doDaylightCycle', 'doFireTick', 'doImmediateRespawn', 'doInsomnia', 'doMobSpawning',
    'doWeatherCycle', 'keepInventory', 'mobGriefing', 'showDeathMessages',
];
const intRules = ['playersSleepingPercentage', 'randomTickSpeed', 'spawnRadius'];
const message = { '<message>': {} };

/** Commands that only show their usage after the name. */
const usageOnly: Record<string, string> = {
    advancement: '(grant|revoke)', attribute: '<target>', 'ban-ip': '<target>', bossbar: '(add|get|list|remove|set)',
    clone: '<begin> <end> <destination>', damage: '<target> <amount>', data: '(get|merge|modify|remove)', datapack: '(disable|enable|list)',
    debug: '(start|stop)', execute: '<subcommand>', fill: '<from> <to> <block>', fillbiome: '<from> <to> <biome>', forceload: '(add|query|remove)',
    function: '<name>', item: '(modify|replace)', jfr: '(start|stop)', locate: '(biome|poi|structure)', loot: '<target> <source>',
    'pardon-ip': '<target>', particle: '<name>', perf: '(start|stop)', place: '(feature|jigsaw|structure|template)', playsound: '<sound>',
    random: '(reset|roll|value)', recipe: '(give|take)', return: '<value>', ride: '<target>', rotate: '<target> <rotation>', schedule: '(clear|function)',
    scoreboard: '(objectives|players)', setblock: '<pos> <block>', setidletimeout: '<minutes>', setworldspawn: '<pos>', spawnpoint: '<targets>',
    spectate: '<target>', spreadplayers: '<center> <spreadDistance> <maxRange>', stopsound: '<targets>', tag: '<targets>', team: '(add|join|leave|list)',
    teammsg: '<message>', test: '(run|runall|create)', tick: '(freeze|query|rate|step)', title: '<targets>', tm: '<message>', transfer: '<hostname>',
    trigger: '<objective>', waypoint: '(list|modify)', worldborder: '(add|center|get|set)',
};

const experience: CommandTree = {
    add: players({ '<amount>': leaf(['levels', 'points']) }),
    set: players({ '<amount>': leaf(['levels', 'points']) }),
    query: players(leaf(['levels', 'points'])),
};
const teleport: CommandTree = targets({ ...leaf(['@a', '@e', '@p', '@r', '@s', ...demoPlayers]), '<location>': {} });

export const vanillaCommands: CommandTree = {
    ...Object.fromEntries(Object.entries(usageOnly).map(([name, usage]) => [name, { [usage]: {} }])),
    ban: players({ '<reason>': {} }),
    banlist: leaf(['ips', 'players']),
    clear: players(leaf(items)),
    defaultgamemode: leaf(modes),
    deop: players(),
    difficulty: leaf(['easy', 'hard', 'normal', 'peaceful']),
    effect: { give: targets(leaf(effects, { '<seconds>': {} })), clear: targets(leaf(effects)) },
    enchant: targets(leaf(enchantments)),
    experience,
    gamemode: leaf(modes, players()),
    gamerule: { ...leaf(boolRules, leaf(['false', 'true'])), ...leaf(intRules, { '<value>': {} }) },
    give: players(leaf(items, { '<count>': {} })),
    help: {},
    kick: players({ '<reason>': {} }),
    kill: targets(),
    list: leaf(['uuids']),
    me: { '<action>': {} },
    msg: players(message),
    op: players(),
    pardon: leaf(['Griefer']),
    reload: {},
    'save-all': leaf(['flush']),
    'save-off': {},
    'save-on': {},
    say: message,
    seed: {},
    stop: {},
    summon: leaf(entities, { '<pos>': {} }),
    teleport,
    tell: players(message),
    tellraw: players({ '<message>': {} }),
    time: { add: { '<time>': {} }, query: leaf(['day', 'daytime', 'gametime']), set: { ...leaf(['day', 'midnight', 'night', 'noon']), '<time>': {} } },
    tp: teleport,
    w: players(message),
    weather: leaf(['clear', 'rain', 'thunder'], { '<duration>': {} }),
    whitelist: { add: players(), list: {}, off: {}, on: {}, reload: {}, remove: players() },
    xp: experience,
};
