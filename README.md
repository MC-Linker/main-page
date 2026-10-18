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
    data/          Links, features, platforms, FAQ and team. Edit content here.
    bridge.svelte.ts  The hero's pretend server: chat bridge, slash commands, demo script
    components/    Page sections (Hero, Scene, Setup, Faq, Footer, …)
      scenes/      One file per feature scene ("In Minecraft" / "In Discord")
    discord/       Discord look-alike UI (messages, embeds, composer)
    mc/            Minecraft look-alike UI (world, chat, buttons, hotbar)
    pixel/         Original pixel art drawn in code (heads, blocks, items)
  routes/
    +page.svelte   Home
    team/          Meet the team
    md/            Terms and privacy (copied from the bot repo's TERMS.md / PRIVACY.md)
    invite/ discord/ support/ guide/ plugin/ privacy/ terms/ tos/   Short-link redirects
static/
  logo.png         Also used by the bot as the chat webhook avatar, keep the path
  emoji/           The bot's custom emoji, used in the simulated embeds
```

Chat formats, embed titles and colours in the demos are taken from the bot's language file and the plugin's default `config.yml`, so they look like the real thing. If those change, update `bridge.svelte.ts` and the scenes.
