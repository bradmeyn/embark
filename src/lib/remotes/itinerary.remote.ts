import { command, query, form } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth.remote';
import { db } from '$db';
import { itineraryTable } from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const itinerarySchema = z.object({
	tripId: z.string().min(1, 'Trip ID is required'),
	name: z.string().min(1, 'Name is required')
});

export const getItineraries = query(z.string(), async (tripId: string) => {
	const user = await getCurrentUser();
	if (!user) {
		error(401, 'Unauthorized');
	}

	const itineraries = await db.query.itineraryTable.findMany({
		where: eq(itineraryTable.tripId, tripId),
		with: {
			days: true
		}
	});

	return itineraries;
});

export const getItinerary = query(z.string(), async (id: string) => {
	const user = await getCurrentUser();
	if (!user) {
		error(401, 'Unauthorized');
	}

	const itinerary = await db.query.itineraryTable.findFirst({
		where: eq(itineraryTable.id, id),
		with: {
			trip: true,
			days: {
				orderBy: (day, { asc }) => [asc(day.dayNumber)],
				with: {
					activities: {
						orderBy: (activity, { asc }) => [asc(activity.time), asc(activity.createdAt)]
					}
				}
			}
		}
	});

	if (!itinerary) {
		error(404, 'Itinerary not found');
	}

	return itinerary;
});

export const addItinerary = form(itinerarySchema, async (data) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const [itinerary] = await db
		.insert(itineraryTable)
		.values({
			tripId: data.tripId,
			name: data.name
		})
		.returning();

	return { success: true, itinerary };
});

export const deleteItinerary = command(z.string(), async (id: string) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const itinerary = await db.delete(itineraryTable).where(eq(itineraryTable.id, id)).returning();

	if (itinerary.length === 0) {
		error(404, 'Itinerary not found');
	}

	return { success: true };
});
