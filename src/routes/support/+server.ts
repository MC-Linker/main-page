import { redirect } from '@sveltejs/kit';
import { links } from '$lib/data';

export const GET = () => redirect(307, links.support);
