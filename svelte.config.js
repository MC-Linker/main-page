import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Markdown pages (.svx, the terms and privacy policy) get the legal page layout.
    preprocess: [vitePreprocess(), mdsvex({
        layout: {
            _: path.resolve('src/routes/md/Layout.svelte'),
        },
    })],
    kit: { adapter: adapter() },
    extensions: ['.svelte', '.svx'],
};

export default config;
