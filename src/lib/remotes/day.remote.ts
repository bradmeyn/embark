import { command, form, query } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth.remote';
import { db } from '$db';
import { dayTable } from '$db/schemas/itinerary';
import { error } from '@sveltejs/kit';
import { and, eq, gt, sql } from 'drizzle-orm';
import { geocodeLocation } from '$lib/server/geocode';
import { assertTripAccess } from '$lib/server/trip-access';

const daySchema = z.object({
	dayNumber: z.number().int().min(1, 'Day number must be at least 1'),
	overview: z.string().optional(),
	location: z.string().min(1, 'Location is required'),
	tripId: z.string()
});

const daysArraySchema = z.object({
	days: z.array(daySchema)
});

export const addDay = form(daySchema, async ({ location, tripId, dayNumber }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	await assertTripAccess(tripId, user.id);

	const coords = await geocodeLocation(location);

	await db
		.insert(dayTable)
		.values({
			dayNumber,
			location,
			tripId,
			latitude: coords?.lat ?? null,
			longitude: coords?.lng ?? null
		})
		.returning();

	return { success: true };
});

export const getDays = query(z.string(), async (tripId: string) => {
	const user = await getCurrentUser();
	if (!user) {
		error(401, 'Unauthorized');
	}

	await assertTripAccess(tripId, user.id);

	const days = await db.query.dayTable.findMany({
		where: eq(dayTable.tripId, tripId),
		orderBy: (day, { asc }) => [asc(day.dayNumber)]
	});

	return days;
});

export const addDays = form(daysArraySchema, async ({ days }) => {
	const user = await getCurrentUser();
	if (!user) {
		error(401, 'Unauthorized');
	}

	if (days.length > 0) {
		await assertTripAccess(days[0].tripId, user.id);
	}

	const coordsResults = await Promise.all(days.map((d) => geocodeLocation(d.location)));

	const inserted = await db
		.insert(dayTable)
		.values(
			days.map(({ dayNumber, location, tripId }, i) => ({
				dayNumber,
				location,
				tripId,
				latitude: coordsResults[i]?.lat ?? null,
				longitude: coordsResults[i]?.lng ?? null
			}))
		)
		.returning();

	return { success: true, inserted };
});

export const deleteDay = command(z.object({ dayId: z.string() }), async ({ dayId }) => {
	const user = await getCurrentUser();
	if (!user) {
		error(401, 'Unauthorized');
	}

	const day = await db.query.dayTable.findFirst({
		where: eq(dayTable.id, dayId)
	});

	if (!day) {
		error(404, 'Day not found');
	}

	await assertTripAccess(day.tripId, user.id);

	await db.delete(dayTable).where(eq(dayTable.id, dayId));

	await db
		.update(dayTable)
		.set({
			dayNumber: sql`${dayTable.dayNumber} - 1`
		})
		.where(and(eq(dayTable.tripId, day.tripId), gt(dayTable.dayNumber, day.dayNumber)));

	return { success: true };
});

const editDaySchema = z.object({
	id: z.string(),
	location: z.string().min(1, 'Location is required'),
	overview: z.string().optional()
});

export const editDay = form(editDaySchema, async ({ id, location, overview }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const day = await db.query.dayTable.findFirst({
		where: eq(dayTable.id, id)
	});

	if (!day) error(404, 'Day not found');

	await assertTripAccess(day.tripId, user.id);

	const locationChanged = location !== day.location;
	const coords = locationChanged ? await geocodeLocation(location) : null;

	const updateData: {
		location: string;
		overview: string | null;
		latitude?: number | null;
		longitude?: number | null;
	} = {
		location,
		overview: overview ?? null
	};

	if (locationChanged) {
		updateData.latitude = coords?.lat ?? null;
		updateData.longitude = coords?.lng ?? null;
	}

	await db.update(dayTable).set(updateData).where(eq(dayTable.id, id)).returning();

	return { success: true };
});
