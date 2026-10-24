import { redirect } from '@sveltejs/kit';
import { links } from '$lib/data';

export const GET = () => redirect(308, links.pages.privacy);
