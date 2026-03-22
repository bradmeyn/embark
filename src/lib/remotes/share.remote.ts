import { command, query } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth/auth.remote';
import { db } from '$db';
import { tripTable } from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { randomBytes } from 'crypto';
import { assertTripOwner } from '$lib/server/trip-access';
import { getTrip } from '$lib/remotes/trips/trip.remote';
import { getTripByShareToken } from '$lib/server/share';

export const getSharedTrip = query(z.string(), async (token: string) => {
	const trip = await getTripByShareToken(token);
	if (!trip) error(404, 'This share link is invalid or has been revoked.');
	return trip;
});

export const generateShareLink = command(
	z.object({ tripId: z.string() }),
	async ({ tripId }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		await assertTripOwner(tripId, user.id);

		const shareToken = randomBytes(24).toString('base64url');

		await db.update(tripTable).set({ shareToken }).where(eq(tripTable.id, tripId));

		await getTrip(tripId).refresh();

		return { shareToken };
	}
);

export const revokeShareLink = command(
	z.object({ tripId: z.string() }),
	async ({ tripId }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		await assertTripOwner(tripId, user.id);

		await db.update(tripTable).set({ shareToken: null }).where(eq(tripTable.id, tripId));

		await getTrip(tripId).refresh();

		return { success: true };
	}
);
