<script lang="ts">
    import StepConnect from './setup/StepConnect.svelte';
    import StepDiscord from './setup/StepDiscord.svelte';
    import StepPlugin from './setup/StepPlugin.svelte';
</script>

<!-- The three steps, in the same order as the guide's quick start. -->
<section id="setup" class="setup" aria-labelledby="setup-title">
    <header class="section-head head">
        <p class="kicker mojang">Setup</p>
        <h2 id="setup-title" class="mc-text">Linked in three steps</h2>
        <p>No bot to host, no config files. Most people are done in about a minute.</p>
    </header>
    <StepDiscord />
    <StepPlugin />
    <StepConnect />
</section>

<style>
    .setup { position: relative; background: var(--color-ink); }
    .head { padding-top: clamp(4rem, 9vw, 7rem); padding-bottom: 2.5rem; }
</style>
