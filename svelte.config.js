import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import path from 'path';

/**
 * The terms and privacy policy are copied as-is from the bot repo, where every section is a `#`
 * heading. The page title is the page's only h1, so move every markdown heading down one level.
 */
function demoteHeadings() {
    const walk = node => {
        if(node.type === 'heading') node.depth = Math.min(node.depth + 1, 6);
        node.children?.forEach(walk);
    };
    return walk;
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Markdown pages (.svx, the terms and privacy policy) get the legal page layout.
    preprocess: [vitePreprocess(), mdsvex({
        remarkPlugins: [demoteHeadings],
        layout: {
            _: path.resolve('src/routes/md/Layout.svelte'),
        },
    })],
    kit: { adapter: adapter() },
    extensions: ['.svelte', '.svx'],
};

export default config;
