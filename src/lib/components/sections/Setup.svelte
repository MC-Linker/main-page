<script lang="ts">
    import StepConnect from './setup/StepConnect.svelte';
    import StepDiscord from './setup/StepDiscord.svelte';
    import StepPlugin from './setup/StepPlugin.svelte';
</script>

<!-- The three steps, in the same order as the guide's quick start. -->
<section id="setup" class="setup" aria-labelledby="setup-title">
    <header class="section-head head">
        <p class="kicker ore-text">Setup</p>
        <h2 id="setup-title" class="ore-title">Linked in three steps</h2>
        <p>No bot to host, no config files. Most people are done in about a minute.</p>
    </header>
    <div class="steps">
        <StepDiscord />
        <StepPlugin />
        <StepConnect />
    </div>
</section>

<style>
    .setup { padding: clamp(4rem, 9vw, 6.5rem) 1rem clamp(4rem, 8vw, 6rem); background: var(--color-ore-dark); }
    .head { margin-bottom: clamp(2rem, 5vw, 3rem); }
    .steps { display: flex; flex-direction: column; gap: 1.75rem; max-width: 64rem; margin: 0 auto; }
</style>
