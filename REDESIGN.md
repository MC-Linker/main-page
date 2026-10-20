# mclinker.com redesign

This file explains the redesign: what we learned about the project, the decisions every concept shares, and the concepts themselves. Each concept lives on its own branch so you can compare them side by side. The **final** branch combines the parts that worked best and is the one to keep building on.

| Branch | Concept | One-liner |
|---|---|---|
| `claude/mclinker-website-final-jy15ja` | **Final** | Two Worlds' split-screen hero with Crafting Table's title menu between the chats, then setup, the feature inventory, the server list and the FAQ as a written book. Navigation is a labelled hotbar. |
| `claude/mclinker-website-guide-redesign-jy15ja` | **Two Worlds** | The screen is split: Minecraft on the left, Discord on the right, the MC Linker logo links them. Every feature is shown happening on both sides at once. |
| `claude/mclinker-website-crafting-jy15ja` | **Crafting Table** | The site plays like Minecraft's UI. You craft the link in a crafting grid, browse features as items in an inventory, and earn advancements while scrolling. |
| `claude/mclinker-website-speedrun-jy15ja` | **Speedrun** | A light, bold, type-driven site built around "quick". A speedrun timer runs your setup with splits, and you can actually time your own run. |

## What MC Linker is (research summary)

- **Two halves:** the *MC Linker* Discord bot (hosted by the team) and the *Discord-Linker* plugin/mod on the user's Minecraft server. They talk over a WebSocket. Users never host a bot or edit config files: everything is slash commands.
- **Setup is 3 steps:** invite the bot → install the plugin → run `/connect` in Discord and paste `/linker connect <code>` in Minecraft.
- **Platforms:** Spigot/Paper/Purpur 1.8+, Fabric 1.16.5–26.2, Forge 1.16.5–1.20.x, NeoForge 1.21.1–26.2, hybrid servers (Mohist, Magma, Arclight). Downloads: Modrinth, CurseForge, Hangar, SpigotMC, Aternos.
- **Features:** chat bridge (chat, join/quit, deaths, advancements, player/console/command-block commands, start/stop) · console channel · `/inventory` `/stats` `/advancements` rendered as images · `/userinfo` `/serverinfo` · `/command` with live tab-completion · `/ban` `/unban` `/kick` `/op` `/deop` `/gamemode` · stat channels with templates (`%count%`, `%ip%`, `%time%`, `%version%`) · role sync with teams, LuckPerms and Vault (both directions) · account linking (`/account connect` + `/verify`), per-server accounts, cracked and Bedrock (Floodgate) players · join requirements (linked account or Discord roles) · Discord Linked Roles · in-game `/dm` to Discord with replies · `/customize` (server nickname/avatar/banner/bio) · premium custom bot.
- **Character:** simple, quick, playful. The logo is a chain link made of grass and dirt.

## Problems with the current site

- Generic layout: centered banner + four alternating image/text rows. Nothing about it says "Minecraft meets Discord".
- Every "Learn more" link points to guide pages that no longer exist.
- `mclinker.com/invite`, `/privacy` and `/tos` are linked from the guide and the bot README but don't exist.
- Only four features are shown; most of what the bot can do is missing.

## Shared foundations (all branches)

- **Same stack:** SvelteKit 2, Svelte 5, Tailwind 4, Cloudflare adapter. No new heavy dependencies; animations are CSS and Svelte transitions.
- **Content from one place:** `src/lib/data/*` holds links, features, platforms, FAQ and guide URLs, all checked against the bot and plugin source.
- **Short links:** `/invite`, `/discord`, `/guide`, `/plugin`, `/privacy`, `/terms`, `/tos` redirect to the right place.
- **Pixel art:** player heads and the hero's items and blocks are drawn in code (`PixelArt`). The feature inventory uses real Minecraft item textures (`scripts/mc-item-icons.py` downloads them into `static/mc/items`). Real bot output screenshots are only used where they show actual bot output.
- **Fonts:** the Minecraft fonts from the bot repo (`resources/fonts`): Minecraft Seven for in-game text, Minecrafter for logo words and the Mojang Studios font for small labels, self-hosted as subset woff2 files. The Mojang font draws B, D, M, N, Q, T and Y as lowercase letters, so those seven are redrawn as capitals in the same style (`scripts/mojang-capitals.py`). DM Sans (OFL) for body text. Pixelify Sans only fills in symbols the Minecraft font lacks.
- **Accessible and fast:** semantic HTML, keyboard support, `prefers-reduced-motion` turns off auto-play, works at phone width with no horizontal scroll.
- **Pages kept:** Team, Terms, Privacy (restyled). The 404 page gets a playful "You died!" treatment.

## Concept 1: Two Worlds

The idea suggested in the brief, built out fully.

- **Hero:** the viewport is split down the middle. Left: a Minecraft world (sky, drifting clouds, grass and dirt, in-game chat). Right: Discord (dark UI, `#minecraft-chat`). The logo sits on the seam. The seam's Minecraft edge is pixel-stepped like the grass edge in the logo. CTAs are styled in their world's language: a Minecraft button "Get the plugin" and a Discord button "Add to Discord".
- **Live bridge playground:** a scripted conversation plays across the seam (messages fly through the logo). You can join in: type in Minecraft chat (press **T**) and it shows up in Discord, type in Discord and it shows up in Minecraft as `Discord | you >> …`. Discord slash commands also work: `/command time set night` turns the sky dark, `/command weather rain` makes it rain, `/ban`, `/serverinfo` and more.
- **Feature scenes:** each feature is a split band. The Minecraft side shows what happens in-game, the Discord side shows what you see in Discord, and the chain runs down the seam through the whole page. Each scene has a small control so it can be tried, not just watched:
  1. Chat bridge with message-type toggles (mirrors the real `/chatchannel add` menu)
  2. `/command give` with autocomplete; diamonds land in the hotbar
  3. `/userinfo`: the in-game HUD (hearts, food, XP) maps to the embed fields
  4. Moderation: `/ban`, `/kick`, `/op`, `/gamemode`
  5. Stat channels with a live template editor
  6. Role sync with a role toggle and sync direction
  7. Account linking and join requirements, including the real disconnect screen
- **Setup in 3 steps** alternating sides, with a platform picker for the right download.
- **FAQ, final CTA and a split footer** (dirt on one side, Discord on the other).

## Concept 2: Crafting Table

The whole site uses Minecraft's game UI as its language. No split screen; this one is immersive.

- **Hero:** a crafting table GUI. Drag (or tap) *Discord Server* + *Plugin* + *Minecraft Server* into the grid and craft the MC Linker item. Taking the result fires an "Advancement Made!" toast and reveals the invite buttons. A ghost recipe shows how for people who don't want to play.
- **Features as an inventory:** creative-mode tabs (Chat, Players, Moderation, Server, Accounts). Each feature is an item; hovering shows a Minecraft tooltip with the description, clicking opens a container panel with the Discord result.
- **Setup as a recipe book**, an **XP bar** that fills with scroll progress, and advancement toasts as you reach sections.
- Classic gray bevel panels and buttons on a dark, blocky background.

## Concept 3: Speedrun

The opposite of the other two: light, bold, typographic, almost no UI mimicry. It leans on "quick".

- **Hero:** "Minecraft ⇄ Discord, any%" with a big LiveSplit-style timer and splits for the three setup steps.
- **Interactive run:** press *Start run*, follow each step (links open in a new tab), hit *Split* when done. At the end you get your time, a personal best (saved in your browser) and a share line.
- **Features as categories** in a bold grid with small looping pixel animations; FAQ and CTA in big type.
- Cream background, grass green and dirt brown, chunky type, sticker-like pixel icons.

## Guide

The guide (`MC-Linker/guide`, same branch name) is restructured and completed in parallel. Feature links on every concept point to the new guide URLs, and the guide keeps redirects for old URLs.

## Final

The parts that worked best, in one page:

1. **Hero: a Minecraft title screen, split in two.** Both halves are out of focus like the title screen's panorama: rolling Minecraft hills on the left, a Discord app on the right, with the pixel-stepped seam between them. On top: a stone "Minecraft" logo and a 3D "Discord" wordmark joined by the MC Linker chain, a yellow splash text, "Linked by MC Linker" in place of "Java Edition", plain stacked menu buttons (Add to Discord, Get the Plugin, Guide, Support..., How does it work?) and the version and disclaimer lines in the bottom corners. The live chat bridge stays: Minecraft chat on the left, the Discord channel on the right.
2. **Linked in three steps**, in the guide's order. Step 1 happens in Discord: add the bot, next to the welcome message it posts. Step 2 happens in Minecraft: pick your server software in the game's server list screen and download from Modrinth (recommended), Hangar, SpigotMC or CurseForge, each in its own colour. Step 3 is both: `/connect` in Discord, paste the code in Minecraft.
3. **Features (Crafting Table):** the creative inventory. The selected item opens as a big item tooltip with what it does in Minecraft and in Discord.
4. **FAQ:** a written book, drawn in pixel art: leather cover, cream pages, "Page 1 of 8", page-turn arrows, all text in the Minecraft font. Two pages side by side on wide screens, one page on phones; arrow keys and swipes turn pages. The first page is the contents, the last one points to the guide's FAQ and troubleshooting pages.
5. **Final call to action and footer (Two Worlds).**

**Hotbar navigation.** Bigger slots, each with a label under its icon. It has two clearly separate parts:

- **This page** (left): the home page sections. The XP bar above it fills as you scroll and the selected slot follows where you are. Keys 1 to 4 jump to a section. On other pages it reads "Home page" and leads back to those sections.
- **Links** (right): Add bot, Guide, Support and Team. Each slot has a small arrow that says "this leaves the page"; the ones that open Discord open in a new tab.

On phones the link slots fold into one "Links" slot that opens a small list, so the bar stays readable.

**Phones.** Everything stacks into one column: Minecraft on top, Discord below. Sending a message in one chat closes the keyboard and scrolls to the other chat so you can watch it arrive. The inventory shows six bigger slots per row and scrolls to the item you tap. The book shows one page and turns with a swipe. Text fields use 16px text so phones don't zoom in, tooltips only appear for a mouse, and the hotbar hides while you type. Held sideways, the hotbar gets slimmer.

**Link previews.** Posting a link to the site in Discord shows a custom preview built from Discord's new component embeds: the logo and pitch, four screenshots of the bot and buttons for Add to Discord, the plugin, the guide and support (home page); each member with their avatar and roles (team page); a short summary (terms and privacy). The guide does the same for every page.

**Team page.** A title-screen header ("The Team" in the stone logo style over the blurred hills), then every member as a Discord profile card with their about text and roles, all visible at once. Each card's banner has the member's colour with a stone grain and a Minecraft nametag.

