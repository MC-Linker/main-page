# Main Page

> The landing page for [MC Linker](https://mclinker.com): the Discord bot that links your Minecraft server with Discord.

The site looks like both apps at once: Minecraft on one side, Discord on the other, and the MC Linker logo links them. This branch draws the Minecraft side in **Ore UI**, the look of Bedrock Edition's menus: flat grey panels with dark outlines, green and white buttons that stand up on a darker edge and sink when pressed, a light header bar, tabs and toggle buttons. It has a playable chat demo, the setup in three steps, every feature in a browse list and the FAQ as collapsible rows. See [REDESIGN.md](REDESIGN.md) for the design and how it came about.

## Development

```bash
bun install
bun run dev      # http://localhost:5173
bun run check    # type-check (svelte-check)
bun run build    # prerendered build for Cloudflare
```

Before you push, run `bun run check` and `bun run build`, and look at your change at phone width too (every page works down to 320px).

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) 2 with Svelte 5 (runes) and TypeScript. Every page is prerendered to static HTML (`routes/+layout.ts`), then hydrated for the interactive parts.
- [Cloudflare adapter](https://svelte.dev/docs/kit/adapter-cloudflare): deployed to Cloudflare Pages, with a preview for every branch.
- [Tailwind CSS](https://tailwindcss.com) 4, used lightly: its reset, `sr-only`, the theme tokens in `app.css` and `prose` (typography plugin) for the legal pages. Components have their own scoped `<style>`; the Ore UI faces and surfaces are global classes in `app.css`.
- [mdsvex](https://mdsvex.pngwn.io) for the markdown pages (terms, privacy).
- [@skyra/discord-components-core](https://github.com/skyra-project/discord-components) for Discord messages, embeds and buttons (the guide uses it too).
- [nprogress](https://github.com/rstacruz/nprogress) for the thin loading bar between pages.

## Where things live

```
src/
  app.css            Fonts, colour tokens, Ore UI faces and surfaces (.ore-face and its palettes, .ore-card, .ore-header,
                     .ore-field, .ore-divider, .ore-tag), text classes (.ore-text, .ore-title, .mc-text), .section-head
  routes/
    +layout.svelte   Page head, block textures, header bar, footer
    +page.svelte     Home: the five sections, top to bottom
    team/            Meet the team
    md/              Terms and privacy (copied from the bot repo's TERMS.md / PRIVACY.md) and their layout
    +error.svelte    "You died!", the death screen (404 and other errors)
    invite/ discord/ support/ guide/ plugin/ privacy/ terms/ tos/   Short links that redirect
  lib/
    data/            All content: links, site info, features, platforms, FAQ, team, navigation. Edit text here.
    components/
      sections/      Home page sections: Hero, Setup, Features, Faq, FinalCta
        hero/        The chat demo: bridge.svelte.ts (pretend server and channel), DemoChannel, packet.ts (animation)
        setup/       The three setup steps, each an Ore UI panel (StepCard)
      nav/           OreNav: the header bar (site navigation)
      Footer, BrandIcon, LinkPreview
    ore/             Ore UI kit: OreButton, OreSegments (tabs, toggle buttons), OreDropdown, OreMenuRow,
                     OreRadioGroup, and sprites.ts (radio diamonds, chevrons, arrows)
    mc/              What you see in the game world: McChat, McText, McWorld (title-screen panorama), McItemIcon
    discord/         Discord UI kit: DcMessage, DcWindow, DcComposer, DcBackdrop, markdown, types
    pixel/           Pixel art drawn in code: block textures, player heads, items, and the components that draw them
    linkPreview.ts   Discord link previews (component embeds) for each page
    browser.ts       Reduced motion, smooth scrolling, sleep, text-field check
    actions/         inview (runs something when an element scrolls into view)
scripts/
  mojang-capitals.py Rebuilds static/fonts/mojang-studios.woff2 (see Fonts below)
static/              Fonts, logo, banner, the bot's emoji, team pictures, bot screenshots
```

## How it fits together

**Content is data.** Text, links and lists live in `lib/data` and the components render them. To change a feature, a download link or a FAQ answer, edit the data file, not the component.

**Three UI kits.** `lib/ore` draws menus the way Bedrock's Ore UI does (buttons, tabs, toggle buttons, dropdowns, list rows, radio diamonds). `lib/mc` draws what's in the game world (chat with `&` colour codes, the title-screen panorama, item icons). `lib/discord` does the same for Discord. Messages render through discord-components; `DcMessage` maps our message data (`discord/types.ts`) onto its elements, and `DcWindow` and `DcComposer` (with slash-command suggestions) fill in what the library doesn't have. Components are named after their kit: `Ore…`, `Mc…` and `Dc…`.

**Ore UI in CSS.** Every Ore UI control is its texture drawn in CSS, with one texture pixel = `--t` (2px). A button, tab or toggle button is an element with `.ore-face` and a palette class (`.ore-green`, `.ore-white`, `.ore-dark`, `.ore-red`, `.ore-purple`, `.ore-blurple`, `.ore-clear`): a dark outline, a light top-left edge, a shaded bottom-right one, and a darker edge along the bottom that makes it stand up. `.sunk` (or pressing it) pushes the face down into that edge; `.marked` adds the white line a chosen tab has. Panels are `.ore-card` (`.light`, `.dark`, `.raised`), the light title bar is `.ore-header`, text fields `.ore-field`. Small sprites (radio diamonds, chevrons, arrows) are in `ore/sprites.ts`. The colours are sampled from the textures of bedrock-core's [ore-styled theme](https://bedrock-core.drav.dev/docs/ore-styled/theme) (MIT); keep new controls to those colours. Ore UI text is flat: no drop shadow (`.ore-text`). Text in the world (chat, splash texts) keeps the game's shadow (`.mc-text`).

**Pixel art is code.** Every sprite is a few rows of characters and a palette (`pixel/sprites.ts`, `heads.ts`, `items.ts`). `PixelArt` draws one as SVG; `render.ts` also turns sprites into data URIs. The layout puts the block textures on the page once as CSS variables (`--tex-dirt`, `--tex-stone`, `--tex-grass-side`, `--tex-deepslate`), so any component can tile one: `background: var(--tex-dirt) 0 0 / 64px 64px`.

**The seam.** Where a Minecraft half meets a Discord half, the Minecraft side ends in a pixel-stepped edge: `mask: var(--seam-mask)`, with the Discord side reaching `var(--seam-width)` under it.

**The chat demo.** `hero/bridge.svelte.ts` is a pretend Minecraft server plus Discord channel. It plays a short conversation on load and answers what visitors type: chat goes across, `/command time set night` makes the world dark, `/ban`, `/serverinfo`, `/help` and more reply like the bot. Chat formats, embed titles and colours come from the bot's language file and the plugin's default `config.yml`; if those change, update `bridge.svelte.ts` and `data/features.ts` too. With reduced motion the conversation appears at once and nothing flies through the logo.

**Navigation.** The header bar (`nav/OreNav.svelte`) is the site menu, like the header of an Ore UI screen: a back arrow, the trail of where you are ("MC Linker › Setup"), the home page sections from `data/navigation.ts` as toggle buttons (keys 1 to 4, and it follows your scroll), and a "Links" dropdown for links that leave the page. Its bottom edge fills green as you scroll. On the home page it stays out of sight while the title screen's menu (`[data-title-menu]`) is on screen. On phones, sections and links share one "Menu" dropdown. When you add a section to `+page.svelte`, add it to `homeSections` too; a new page gets its trail in `pageTrails`.

**Link previews.** Each page sets its Open Graph tags and a Discord component embed through `LinkPreview` (`lib/linkPreview.ts` builds the embeds). Discord shows these when someone posts a link. Test a URL with Discord's [Embed Debugger](https://discord.com/developers/embeds).

## Adding things

- **A feature:** an entry in `data/features.ts` (it appears in the Features list, with its tab, icon, commands and preview).
- **Server software or a download site:** `data/platforms.ts`.
- **A team member:** `data/team.ts`, plus their picture in `static/profiles/<username>.png`.
- **A FAQ entry:** `data/faq.ts`.
- **A home page section:** the component in `components/sections`, then `+page.svelte` and `data/navigation.ts`.

## Code style

The same rules as the bot repo (its `eslint.config.js`): 4-space indentation, single quotes, semicolons, trailing commas in multi-line lists, Stroustrup braces (`}` then `else {` on the next line), no space after `if`, `for`, `while`, `switch` and `catch`, and members of an import sorted alphabetically. In Svelte, props are declared with `let { … } = $props()`.

## Resources

**Fonts.** Minecraft Seven (game text, standing in for Ore UI's Mojangles) and the Mojangs font (small labels) come from the bot repo's `resources/fonts`, subset to woff2 in `static/fonts`. The Mojangs font draws B, D, M, N, Q, T and Y as lowercase letters; `scripts/mojang-capitals.py` (fontTools, skia-pathops, brotli) redraws them as capitals in the same style. Ore UI draws titles and hero buttons in Minecraft Ten, which has no free licence, so they use Minecraft Seven drawn bold the way the game draws bold text (`.ore-title`); to switch, add the font to `static/fonts` and put it first in `--font-title` in `app.css`. Whitney, Discord's font, loads from the discord-components project's CDN (`cdn.skyra.pw`), as in the guide. Noto Sans, the game's "smooth font", is the body font, and Pixelify Sans fills in symbols the Minecraft font lacks (both via Fontsource).

**Images.** The logo and banner are MC Linker's. `static/emoji` holds the bot's custom emoji, `static/hero` and `static/showcase` real screenshots of bot output, and `static/profiles` the team's pictures. Brand icons are [Simple Icons](https://simpleicons.org) paths (CC0) in `data/brands.ts`. The feature icons in `static/mc/items` are Minecraft's item textures (`scripts/mc-item-icons.py`). The Ore UI sprites in `ore/sprites.ts` come from bedrock-core's textures ([MIT](https://github.com/bedrock-core/ui)). Everything else (worlds, blocks, player heads) is original pixel art drawn in code.

**Keep these paths.** `logo.png` is the bot's chat webhook avatar, and the guide's link previews use pictures from `hero/` and `showcase/`. Old links may point at the other files in `static/` too.

**Content sources.** Embed texts and colours: the bot's language file. Chat formats: the plugin's `config.yml`. Terms and privacy: the bot repo's `TERMS.md` and `PRIVACY.md`. Feature details and versions: the bot, the plugin and the [guide](https://guide.mclinker.com).
