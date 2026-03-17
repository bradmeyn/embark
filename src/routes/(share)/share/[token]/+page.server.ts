import { getTripByShareToken } from '$lib/server/share';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const trip = await getTripByShareToken(params.token);

	if (!trip) {
		error(404, 'This share link is invalid or has been revoked.');
	}

	return { trip };
};
