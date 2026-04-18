import { error } from '@sveltejs/kit';

export function assertProAccess(user: { plan?: string | null }) {
	if (user.plan !== 'pro') {
		error(403, 'Pro subscription required');
	}
}
