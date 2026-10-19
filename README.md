# Main Page

> The landing page for [MC Linker](https://mclinker.com): the Discord bot that links your Minecraft server with Discord.

Built with [SvelteKit](https://svelte.dev/docs/kit), Svelte 5 and [Tailwind CSS](https://tailwindcss.com), deployed to Cloudflare. See [REDESIGN.md](REDESIGN.md) for the design concepts.

## Development

```bash
bun install
bun run dev      # http://localhost:5173
bun run check    # type-check
bun run build    # prerendered build for Cloudflare
```

## Where things live

```
src/
  lib/
    data/          Links, features, inventory items, platforms, FAQ and team. Edit content here.
    bridge.svelte.ts  The hero's pretend server: chat bridge, slash commands, demo script
    ui.svelte.ts   Shared UI state: the item tooltip
    components/
      sections/    The home page, top to bottom: Hero, Setup, Features, Faq, FinalCta
      hud/         The hotbar navigation and item tooltip
      inventory/   Inventory slot and item icon
    discord/       Discord UI. Messages and embeds come from @skyra/discord-components-core (also used by the guide);
                   DcMessage maps our message data onto it. DcWindow (channel frame) and DcComposer (input with
                   slash-command suggestions) fill in what the library does not have.
    mc/            Minecraft look-alike UI (world, chat, buttons)
    pixel/         Original pixel art drawn in code (heads, blocks, items)
  routes/
    +page.svelte   Home
    team/          Meet the team
    md/            Terms and privacy (copied from the bot repo's TERMS.md / PRIVACY.md)
    invite/ discord/ support/ guide/ plugin/ privacy/ terms/ tos/   Short-link redirects
static/
  fonts/           Minecraft Seven, Minecrafter and the Mojang Studios font (from the bot repo, subset to woff2)
  logo.png         Also used by the bot as the chat webhook avatar, keep the path
  emoji/           The bot's custom emoji, used in the simulated embeds
```

The hotbar (`components/hud/Hotbar.svelte`) is the site's navigation. Its left part lists the sections of the home page (keys 1 to 4); add a section there when you add one to `+page.svelte`. Its right part holds links to other pages.

Chat formats, embed titles and colours in the demos are taken from the bot's language file and the plugin's default `config.yml`, so they look like the real thing. If those change, update `bridge.svelte.ts` and `data/items.ts`.
