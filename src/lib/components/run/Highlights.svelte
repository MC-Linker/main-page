<script lang="ts">
    import DcMessage from '$lib/discord/DcMessage.svelte';
    import McChat from '$lib/mc/McChat.svelte';
</script>

<section class="reel" aria-labelledby="reel-title">
    <header class="head">
        <h2 id="reel-title">Highlight reel.</h2>
        <p>What it actually looks like, on both sides.</p>
    </header>
    <div class="clips">
        <figure class="clip sticker">
            <div class="frame dc">
                <DcMessage compact msg={{ id: 1, author: { name: 'Cubey', avatar: { head: 'cubey' }, tag: 'APP' }, content: 'anyone up for the nether?' }} />
                <DcMessage compact msg={{ id: 2, author: { name: 'TheAnnoying', avatar: { head: 'theannoying' }, color: '#f47b67' }, content: 'omw! save me a bed 🛏️' }} />
            </div>
            <div class="frame mc">
                <McChat lines={[{ id: 1, text: '<Cubey> anyone up for the nether?' }, { id: 2, text: '&l&9Discord &8| &l&7TheAnnoying &8>>&r omw! save me a bed :bed:' }]} />
            </div>
            <figcaption><b>Chat bridge.</b> Same conversation, two worlds.</figcaption>
        </figure>
        <figure class="clip sticker">
            <div class="frame img"><img src="/hero/inventory.png" alt="A player's inventory rendered by MC Linker in Discord" loading="lazy" /></div>
            <figcaption><b>/inventory.</b> Rendered straight from your server's files.</figcaption>
        </figure>
        <figure class="clip sticker">
            <div class="frame img stat"><img src="/showcase/statchannel.png" alt="Discord channels showing server status, member count and IP" loading="lazy" /></div>
            <figcaption><b>Stat channels.</b> Live player count in your channel list.</figcaption>
        </figure>
    </div>
</section>

<style>
    .reel { padding: clamp(4rem, 9vw, 7rem) clamp(1rem, 4vw, 2rem); background: var(--color-ink); color: var(--color-paper); }
    .head { max-width: 40rem; margin: 0 auto 2.5rem; text-align: center; }
    h2 { margin: 0; font-size: clamp(2.2rem, 5vw, 3.6rem); font-weight: 900; letter-spacing: -0.03em; }
    .head p { margin: 1rem 0 0; font-size: 1.1rem; color: #bdb6a6; }
    .clips { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr)); gap: 1.6rem; max-width: 72rem; margin: 0 auto; }
    .clip { display: flex; flex-direction: column; margin: 0; padding: 0.9rem; background: var(--color-paper); color: var(--color-ink); border-color: var(--color-paper); box-shadow: 6px 6px 0 var(--color-grass-bright); }
    .clip:nth-child(2) { transform: rotate(-1deg); box-shadow: 6px 6px 0 var(--color-dc-blurple); }
    .clip:nth-child(3) { transform: rotate(1deg); box-shadow: 6px 6px 0 var(--color-gold); }
    .frame { border-radius: 10px; overflow: hidden; }
    .frame + .frame { margin-top: 0.6rem; }
    .dc { padding: 0.5rem 0.9rem; background: var(--color-dc); color: var(--color-dc-text); }
    .mc { padding: 0.7rem; background: linear-gradient(#78a6f7, #b4d3ff); border: 3px solid #000; border-radius: 4px; font-size: 0.85rem; }
    .img { display: grid; place-items: center; background: #1e1f22; padding: 0.5rem; flex: 1; }
    .img img { display: block; max-width: 100%; height: auto; }
    .stat img { width: 80%; }
    figcaption { margin-top: auto; padding-top: 0.8rem; font-size: 0.95rem; line-height: 1.45; }
</style>
