import { command, form, query } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth.remote';
import { db } from '$db';
import { itineraryTable, tripTable } from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const tripSchema = z.object({
	name: z.string().min(1, 'Name is required')
});

export const getTrips = query(async () => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const trips = await db.query.tripTable.findMany({
		where: eq(tripTable.userId, user.id),
		with: {
			itineraries: {
				with: {
					days: true
				}
			}
		}
	});

	return trips;
});

export const getTrip = query(z.string(), async (id: string) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const trip = await db.query.tripTable.findFirst({
		where: eq(tripTable.id, id),
		with: {
			itineraries: {
				with: {
					days: {
						with: {
							activities: true
						}
					}
				}
			}
		}
	});

	if (!trip) {
		error(404, 'Trip not found');
	}

	// Check if user owns this trip
	if (trip.userId !== user.id) {
		error(403, 'Forbidden');
	}

	return trip;
});

export const addTrip = form(tripSchema, async ({ name }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const [newTrip] = await db
		.insert(tripTable)
		.values({
			name,
			userId: user.id
		})
		.returning();

	await db.insert(itineraryTable).values({
		name: `${name} 1`,
		tripId: newTrip.id
	});
	return { success: true };
});

export const editTrip = form(
	z.object({
		id: z.string(),
		name: z.string().min(1, 'Name is required')
	}),
	async ({ id, name }) => {
		console.log('Editing trip:', id, name);
		await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay

		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const trip = await db.query.tripTable.findFirst({
			where: eq(tripTable.id, id)
		});

		if (!trip) {
			error(404, 'Trip not found');
		}

		// Check if user owns this trip
		if (trip.userId !== user.id) {
			error(403, 'Forbidden');
		}

		const [updatedTrip] = await db
			.update(tripTable)
			.set({ name })
			.where(eq(tripTable.id, id))
			.returning();

		return { success: true, updatedTrip };
	}
);

export const deleteTrip = command(
	z.object({
		id: z.string()
	}),
	async ({ id }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const trip = await db.query.tripTable.findFirst({
			where: eq(tripTable.id, id)
		});

		if (!trip) {
			error(404, 'Trip not found');
		}

		// Check if user owns this trip
		if (trip.userId !== user.id) {
			error(403, 'Forbidden');
		}

		await db.delete(tripTable).where(eq(tripTable.id, id));

		await getTrips().refresh();

		return { success: true };
	}
);
