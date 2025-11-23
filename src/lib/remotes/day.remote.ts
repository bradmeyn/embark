import { command, form, query } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth.remote';
import { db } from '$db';
import { dayTable } from '$db/schemas/itinerary';
import { error } from '@sveltejs/kit';
import { and, eq, gt, sql } from 'drizzle-orm';

const daySchema = z.object({
	dayNumber: z.number().int().min(1, 'Day number must be at least 1'),
	overview: z.string().optional(),
	location: z.string().min(1, 'Location is required'),
	itineraryId: z.string()
});

const daysArraySchema = z.object({
	days: z.array(daySchema)
});

export const addDay = form(daySchema, async ({ location, itineraryId, dayNumber }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	await db
		.insert(dayTable)
		.values({
			dayNumber,
			location,
			itineraryId
		})
		.returning();

	return { success: true };
});

export const getDays = query(z.string(), async (itineraryId: string) => {
	const user = await getCurrentUser();
	if (!user) {
		error(401, 'Unauthorized');
	}
	const days = await db.query.dayTable.findMany({
		where: eq(dayTable.itineraryId, itineraryId),
		orderBy: (day, { asc }) => [asc(day.dayNumber)]
	});

	return days;
});

export const addDays = form(daysArraySchema, async ({ days }) => {
	const user = await getCurrentUser();
	if (!user) {
		error(401, 'Unauthorized');
	}

	const inserted = await db
		.insert(dayTable)
		.values(
			days.map(({ dayNumber, location, itineraryId }) => ({
				dayNumber,
				location,
				itineraryId
			}))
		)
		.returning();

	return inserted;
});

export const deleteDay = command(z.object({ dayId: z.string() }), async ({ dayId }) => {
	const user = await getCurrentUser();
	if (!user) {
		error(401, 'Unauthorized');
	}

	const day = await db.query.dayTable.findFirst({
		where: eq(dayTable.id, dayId),
		with: {
			itinerary: {
				with: {
					trip: true
				}
			}
		}
	});

	if (!day) {
		error(404, 'Day not found');
	}

	if (day.itinerary.trip.userId !== user.id) {
		error(403, 'Forbidden');
	}

	await db.delete(dayTable).where(eq(dayTable.id, dayId));

	await db
		.update(dayTable)
		.set({
			dayNumber: sql`${dayTable.dayNumber} - 1`
		})
		.where(and(eq(dayTable.itineraryId, day.itineraryId), gt(dayTable.dayNumber, day.dayNumber)));

	return { success: true };
});
