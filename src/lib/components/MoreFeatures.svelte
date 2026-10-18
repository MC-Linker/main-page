<script lang="ts">
    import { featureById, guide, links } from '$lib/data';

    type Card = { title: string; text: string; icon: string; href: string; commands?: string[] };

    const pick = (id: string, icon: string): Card => {
        const f = featureById(id);
        return { title: f.title, text: f.description, icon, href: f.guide, commands: f.commands };
    };

    const cards: Card[] = [
        pick('console', '⌨️'),
        { ...pick('player-info', '🎒'), text: 'Inventories (including shulker boxes), statistics and advancements are rendered as images, using your server\'s own Minecraft version.' },
        pick('dms', '📬'),
        pick('linked-roles', '🏷️'),
        pick('customize', '🎨'),
        { title: 'Bedrock & cracked players', icon: '🧱', text: 'Players joining through Geyser and Floodgate can link their accounts, and offline-mode servers are supported too.', href: guide('features/account-linking') },
        { title: 'Server info', icon: '🗺️', text: '/serverinfo shows your MOTD, player count, world settings, changed gamerules, plugins and more.', href: guide('commands/serverinfo'), commands: ['/serverinfo'] },
        { title: 'Speaks your language', icon: '🌍', text: 'MC Linker is translated by its community on Crowdin. Help bring it to your language.', href: links.socials.crowdin },
    ];
</script>

<section class="more" aria-labelledby="more-title">
    <h2 id="more-title"><span class="mc-text">And a lot more</span></h2>
    <p class="sub">Everything below is free and set up with a slash command or two.</p>
    <ul class="grid">
        {#each cards as c (c.title)}
            <li>
                <a href={c.href} class="card">
                    <span class="strip" aria-hidden="true"></span>
                    <span class="icon" aria-hidden="true">{c.icon}</span>
                    <span class="title">{c.title}</span>
                    <span class="text">{c.text}</span>
                    {#if c.commands?.length}
                        <span class="cmds">{#each c.commands as cmd (cmd)}<code>{cmd}</code>{/each}</span>
                    {/if}
                </a>
            </li>
        {/each}
    </ul>
</section>

<style>
    .more {
        padding: clamp(4rem, 9vw, 7rem) clamp(1rem, 4vw, 3rem);
        background: var(--color-ink);
        text-align: center;
    }
    h2 { margin: 0; font-size: clamp(2rem, 4.5vw, 3.25rem); font-weight: 700; color: #fff; }
    .sub { margin: 0.75rem auto 0; max-width: 34rem; color: #adb5bd; }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
        gap: 1rem;
        max-width: 72rem;
        margin: 2.5rem auto 0;
        padding: 0;
        list-style: none;
        text-align: left;
    }
    .card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        height: 100%;
        padding: 1.5rem 1.25rem 1.25rem;
        border-radius: 14px;
        background: #161b21;
        box-shadow: 0 0 0 1px rgb(255 255 255 / 0.06);
        color: inherit;
        text-decoration: none;
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover { transform: translateY(-3px); box-shadow: 0 0 0 1px rgb(255 255 255 / 0.14), 0 14px 30px rgb(0 0 0 / 0.35); }
    .strip {
        position: absolute; inset: 0 0 auto; height: 4px;
        background: linear-gradient(90deg, var(--color-grass) 50%, var(--color-dc-blurple) 50%);
    }
    .icon { font-size: 1.6rem; }
    .title { font-weight: 700; font-size: 1.1rem; color: #fff; }
    .text { font-size: 0.925rem; line-height: 1.5; color: #adb5bd; }
    .cmds { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: auto; padding-top: 0.5rem; }
    .cmds code { padding: 0.1rem 0.4rem; border-radius: 5px; background: rgb(88 101 242 / 0.16); color: #c9cdfb; font-size: 0.78rem; }
</style>
