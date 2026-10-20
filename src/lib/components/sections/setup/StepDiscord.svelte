<script lang="ts">
    import BrandIcon from '$lib/components/BrandIcon.svelte';
    import { links } from '$lib/data';
    import DcButton from '$lib/discord/DcButton.svelte';
    import StepHeading from './StepHeading.svelte';
</script>

<!-- Step 1 happens in Discord. -->
<div class="band">
    <div class="copy">
        <StepHeading step={1} world="discord">Add MC Linker to your Discord server</StepHeading>
        <p>Invite the bot to the server you want to link. You need the <em>Manage Server</em> permission there.</p>
        <DcButton href={links.invite} external><BrandIcon brand="discord" size="1.25em" /> Add to Discord</DcButton>
        <p class="alt">or find it in the <a href={links.appDirectory} target="_blank" rel="noopener">App Directory</a> and on <a href={links.socials.topgg} target="_blank" rel="noopener">Top.gg</a></p>
    </div>
</div>

<style>
    .band {
        display: grid;
        grid-template-columns: minmax(0, 32rem);
        justify-content: center;
        padding: clamp(3rem, 6vw, 4.5rem) clamp(1rem, 4vw, 3rem);
        background: var(--color-ink);
        border-top: 2px solid rgb(255 255 255 / 0.1);
    }
    .copy p { margin: 0 0 1rem; color: #ced4da; line-height: 1.55; }
    .copy em { font-style: normal; color: #fff; font-weight: 600; }
    .copy .alt { margin-top: 0.75rem; font-size: 0.875rem; color: #adb5bd; }
    .alt a { color: #c9cdfb; }
</style>
