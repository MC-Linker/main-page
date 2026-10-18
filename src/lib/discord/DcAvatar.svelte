<script lang="ts">
    import PixelHead from '$lib/pixel/PixelHead.svelte';
    import type { Avatar } from './types';

    let { avatar, size = 40, alt = '' }: { avatar: Avatar; size?: number; alt?: string } = $props();
</script>

<span class="avatar" style:--size="{size}px" aria-hidden={alt ? undefined : 'true'}>
    {#if 'image' in avatar}
        <img src={avatar.image} {alt} width={size} height={size} />
    {:else if 'head' in avatar}
        <PixelHead look={avatar.head} size="100%" title={alt || undefined} />
    {:else}
        <span class="letter" style:background={avatar.color}>{avatar.letter}</span>
    {/if}
</span>

<style>
    .avatar {
        display: inline-grid;
        width: var(--size);
        height: var(--size);
        flex: none;
        border-radius: 50%;
        overflow: hidden;
        background: #1e1f22;
    }
    img { width: 100%; height: 100%; object-fit: contain; padding: 12%; }
    .letter {
        display: grid;
        place-items: center;
        color: white;
        font-weight: 700;
        font-size: calc(var(--size) * 0.45);
    }
</style>
