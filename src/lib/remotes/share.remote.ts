import { command } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth.remote';
import { db } from '$db';
import { tripTable } from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { randomBytes } from 'crypto';
import { assertTripOwner } from '$lib/server/trip-access';
import { getTrip } from '$lib/remotes/trip.remote';

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
