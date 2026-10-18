<script lang="ts">
    import { links } from '$lib/data';
</script>

<footer>
    <div class="cols">
        <nav aria-label="Plugin">
            <h2 class="mc-text">Plugin</h2>
            <a href={links.plugin.modrinth}>Modrinth</a>
            <a href={links.plugin.curseforge}>CurseForge</a>
            <a href={links.plugin.hangar}>Hangar</a>
            <a href={links.plugin.spigot}>SpigotMC</a>
        </nav>
        <nav aria-label="Community">
            <h2 class="mc-text">Community</h2>
            <a href={links.support}>Support server</a>
            <a href={links.socials.github}>GitHub</a>
            <a href={links.socials.youtube}>YouTube</a>
            <a href={links.socials.topgg}>Top.gg</a>
        </nav>
        <nav aria-label="More">
            <h2 class="mc-text">More</h2>
            <a href={links.guide}>Guide</a>
            <a href={links.pages.team}>Meet the team</a>
            <a href={links.pages.terms}>Terms of Service</a>
            <a href={links.pages.privacy}>Privacy Policy</a>
        </nav>
    </div>
    <p class="legal mc-text">Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft. Not affiliated with Discord.</p>
</footer>

<style>
    footer { padding: 3rem 1rem calc(var(--hud) + 2rem); border-top: 2px solid #000; background: rgb(0 0 0 / 0.5); }
    .cols { display: flex; flex-wrap: wrap; justify-content: center; gap: 3rem; }
    nav { display: flex; flex-direction: column; gap: 0.4rem; min-width: 9rem; }
    h2 { margin: 0 0 0.3rem; font-size: 1rem; font-weight: 400; color: var(--color-mc-yellow); }
    a { color: #ddd; text-decoration: none; }
    a:hover { color: #fff; text-decoration: underline; }
    .legal { margin: 2.5rem auto 0; max-width: 40rem; text-align: center; font-size: 0.85rem; color: #888; }
</style>
