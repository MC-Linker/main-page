import { links, site } from '$lib/data';

export const prerender = true;

// Every real page. The other routes are redirects and stay out.
const paths = ['/', links.pages.team, links.pages.terms, links.pages.privacy];

export const GET = () => new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
        paths.map(p => `  <url><loc>${site.url}${p === '/' ? '/' : p}</loc></url>`).join('\n')
    }\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
);
