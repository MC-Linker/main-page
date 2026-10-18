<script lang="ts">
    /**
     * An out-of-focus Discord app (server list, channels, messages, members),
     * the Discord side's version of Minecraft's blurred title screen world.
     * Purely decorative.
     */
    let { blur = 6, class: className = '' }: { blur?: number; class?: string } = $props();

    const guilds = ['#5865f2', '#6f9e2d', '#f47b67', '#3ba55d', '#faa61a', '#eb459e', '#4f5660'];
    const channels = [62, 48, 70, 55, 40, 66, 52, 44, 58, 36];
    const messages = [[38, 72], [30, 54], [44, 80], [26, 46], [40, 64], [34, 58], [48, 76], [28, 40]];
    const members = [52, 40, 64, 46, 58, 36, 50, 42, 60];
</script>

<div class="app {className}" style:--blur="{blur}px" aria-hidden="true">
    <div class="guilds">
        <i class="home"></i>
        <b></b>
        {#each guilds as c (c)}<i style:background={c}></i>{/each}
    </div>
    <div class="channels">
        <div class="server"></div>
        {#each channels as w, i (i)}<div class="channel" class:active={i === 2}><span style:width="{w}%"></span></div>{/each}
        <div class="me"><i></i><span></span></div>
    </div>
    <div class="chat">
        <div class="bar"></div>
        <div class="messages">
            {#each messages as [a, b], i (i)}
                <div class="msg"><i style:background={guilds[i % guilds.length]}></i><div><span style:width="{a}%"></span><span style:width="{b}%"></span></div></div>
            {/each}
        </div>
        <div class="composer"></div>
    </div>
    <div class="members">
        {#each members as w, i (i)}<div class="member"><i style:background={guilds[(i + 3) % guilds.length]}></i><span style:width="{w}%"></span></div>{/each}
    </div>
</div>

<style>
    .app {
        position: absolute;
        inset: calc(var(--blur) * -3);
        display: grid;
        grid-template-columns: 4.5rem 15rem minmax(0, 1fr) 15rem;
        background: #313338;
        filter: blur(var(--blur));
    }
    .guilds { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem 0; background: #1e1f22; }
    .guilds i { width: 3rem; height: 3rem; border-radius: 50%; flex: none; }
    .guilds .home { border-radius: 1rem; background: #5865f2; }
    .guilds b { width: 2rem; height: 2px; background: #35363c; }
    .channels { display: flex; flex-direction: column; gap: 0.35rem; padding: 0 0.5rem; background: #2b2d31; }
    .server { height: 3rem; margin: 0 -0.5rem 0.5rem; border-bottom: 1px solid #1f2023; }
    .channel { height: 2rem; padding: 0.6rem 0.5rem; border-radius: 4px; }
    .channel.active { background: #404249; }
    .channel span, .member span, .msg span { display: block; height: 0.8rem; border-radius: 0.4rem; background: #4e5058; }
    .me { display: flex; align-items: center; gap: 0.5rem; margin: auto -0.5rem 0; padding: 0.6rem; background: #232428; }
    .me i { width: 2rem; height: 2rem; border-radius: 50%; background: #5865f2; }
    .me span { width: 50%; height: 0.8rem; border-radius: 0.4rem; background: #4e5058; }
    .chat { display: flex; flex-direction: column; min-width: 0; }
    .bar { height: 3rem; border-bottom: 1px solid #26282c; }
    .messages { display: flex; flex-direction: column; justify-content: flex-end; gap: 1.25rem; flex: 1; padding: 1rem; }
    .msg { display: flex; gap: 1rem; }
    .msg i { width: 2.5rem; height: 2.5rem; border-radius: 50%; flex: none; }
    .msg div { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; padding-top: 0.2rem; }
    .msg span:first-child { background: #6d6f78; }
    .composer { height: 2.75rem; margin: 0 1rem 1.5rem; border-radius: 8px; background: #383a40; }
    .members { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem 0.75rem; background: #2b2d31; }
    .member { display: flex; align-items: center; gap: 0.6rem; }
    .member i { width: 2rem; height: 2rem; border-radius: 50%; flex: none; }
    @media (max-width: 1280px) { .app { grid-template-columns: 4.5rem 15rem minmax(0, 1fr); } .members { display: none; } }
</style>
