<script lang="ts">
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { links } from '$lib/data';
    import DcButton from '$lib/discord/DcButton.svelte';
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import DcWindow from '$lib/discord/DcWindow.svelte';
    import { bot, type DcMsg } from '$lib/discord/types';
    import StepHeading from './StepHeading.svelte';

    // The message the bot posts when it joins a server (from the bot's language file, shortened).
    const welcome: DcMsg = {
        id: 1,
        author: bot,
        embeds: [{
            color: '#202225',
            title: 'Thanks for inviting MC Linker!',
            description: 'To get started, please connect your Minecraft server to the bot:\n\n'
                + `• Install the **Discord-Linker** plugin from [SpigotMC](${links.plugin.spigot}), [Modrinth](${links.plugin.modrinth}) or from the [Aternos Plugin List](${links.plugin.aternos}) to your Minecraft server.\n`
                + '• Execute </connect> in Discord.\n'
                + '• Run the command from the embed in Minecraft.\n\n'
                + '**That\'s it!**',
        }],
    };
</script>

<!-- Step 1 happens in Discord. -->
<div class="band">
    <div class="copy">
        <StepHeading step={1} world="discord">Add MC Linker to your Discord server</StepHeading>
        <p>Invite the bot to the server you want to link. You need the <em>Manage Server</em> permission there.</p>
        <DcButton href={links.invite} external><BrandIcon brand="discord" size="1.25em" /> Add to Discord</DcButton>
        <p class="alt">or find it in the <a href={links.appDirectory} target="_blank" rel="noopener">App Directory</a> and on <a href={links.socials.topgg} target="_blank" rel="noopener">Top.gg</a></p>
    </div>
    <div class="visual">
        <p class="caption">MC Linker says hi when it joins:</p>
        <DcWindow channel="general">
            <discord-messages no-background><DcMessage msg={welcome} /></discord-messages>
        </DcWindow>
    </div>
</div>

<style>
    .band {
        display: grid;
        grid-template-columns: minmax(0, 26rem) minmax(0, 32rem);
        justify-content: center;
        align-items: center;
        gap: clamp(2rem, 5vw, 4.5rem);
        padding: clamp(3rem, 6vw, 4.5rem) clamp(1rem, 4vw, 3rem);
        background: radial-gradient(50rem 24rem at 80% 10%, rgb(88 101 242 / 0.18), transparent 60%), var(--color-dc-3);
    }
    .copy p { margin: 0 0 1rem; color: #ced4da; line-height: 1.55; }
    .copy em { font-style: normal; color: #fff; font-weight: 600; }
    .copy .alt { margin-top: 0.75rem; font-size: 0.875rem; color: #adb5bd; }
    .alt a { color: #c9cdfb; }
    .caption { margin: 0 0 0.5rem; font-size: 0.85rem; color: var(--color-dc-muted); }

    @media (max-width: 860px) {
        .band { grid-template-columns: minmax(0, 32rem); }
    }
</style>
