import { command, form, query } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth/auth.remote';
import { db } from '$db';
import { dayTable, hotelTable, tripTable } from '$db/schemas/itinerary';
import { error } from '@sveltejs/kit';
import { and, asc, eq, gt, gte, sql } from 'drizzle-orm';
import { geocodeLocation } from '$lib/server/geocode';
import { assertTripAccess } from '$lib/server/trip-access';
import { generateStructuredJson } from '$lib/server/ai';

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

	await db.transaction(async (tx) => {
		await tx.delete(dayTable).where(eq(dayTable.id, dayId));
		await tx
			.update(dayTable)
			.set({ dayNumber: sql`${dayTable.dayNumber} - 1` })
			.where(and(eq(dayTable.tripId, day.tripId), gt(dayTable.dayNumber, day.dayNumber)));
	});

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

const suggestDayOverviewSchema = z.object({
	dayId: z.string(),
	userPrompt: z.string().optional()
});

const suggestionDayOverviewPayloadSchema = z.object({
	location: z.string().min(1),
	overview: z.string().min(1)
});

export const suggestDayOverview = command(
	suggestDayOverviewSchema,
	async ({ dayId, userPrompt }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const day = await db.query.dayTable.findFirst({ where: eq(dayTable.id, dayId) });
		if (!day) error(404, 'Day not found');

		await assertTripAccess(day.tripId, user.id);

		const hotels = await db.query.hotelTable.findMany({
			where: eq(hotelTable.dayId, day.id),
			limit: 2
		});

		let modelOutput: unknown;
		try {
			modelOutput = await generateStructuredJson<unknown>({
				system:
					'Suggest a polished day location and overview as JSON only. Keep overview to 1-2 sentences.',
				user: JSON.stringify({
					day: {
						dayNumber: day.dayNumber,
						location: day.location,
						overview: day.overview
					},
					hotels: hotels.map((h) => ({ name: h.name, notes: h.notes })),
					userPrompt: userPrompt ?? null,
					requiredShape: {
						location: 'string',
						overview: 'string'
					}
				})
			});
		} catch (err) {
			console.error('AI day suggestion failed', err);
			error(500, 'Unable to suggest day details right now.');
		}

		const suggestion = suggestionDayOverviewPayloadSchema.safeParse(modelOutput);
		if (!suggestion.success) error(500, 'Received invalid day suggestion. Please try again.');

		return { success: true, suggestion: suggestion.data };
	}
);

const suggestNewDaySchema = z.object({
	tripId: z.string(),
	dayNumber: z.number().int().min(1),
	userPrompt: z.string().optional()
});

const suggestionNewDayPayloadSchema = z.object({
	location: z.string().min(1),
	overview: z.string().optional()
});

export const suggestNewDayForTrip = command(
	suggestNewDaySchema,
	async ({ tripId, dayNumber, userPrompt }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		await assertTripAccess(tripId, user.id);

		const trip = await db.query.tripTable.findFirst({ where: eq(tripTable.id, tripId) });
		if (!trip) error(404, 'Trip not found');

		const existingDays = await db.query.dayTable.findMany({
			where: eq(dayTable.tripId, tripId),
			orderBy: [asc(dayTable.dayNumber)],
			limit: 6
		});

		let modelOutput: unknown;
		try {
			modelOutput = await generateStructuredJson<unknown>({
				system:
					'Suggest the best location and short overview for one new trip day as JSON only. Keep overview to 1 sentence. Avoid repeating the same exact location on every day unless it is practical.',
				user: JSON.stringify({
					trip: {
						name: trip.name
					},
					targetDayNumber: dayNumber,
					existingDays: existingDays.map((d) => ({
						dayNumber: d.dayNumber,
						location: d.location,
						overview: d.overview
					})),
					userPrompt: userPrompt ?? null,
					requiredShape: {
						location: 'string',
						overview: 'string (optional)'
					}
				})
			});
		} catch (err) {
			console.error('AI new day suggestion failed', err);
			error(500, 'Unable to suggest a location right now.');
		}

		const suggestion = suggestionNewDayPayloadSchema.safeParse(modelOutput);
		if (!suggestion.success)
			error(500, 'Received invalid day location suggestion. Please try again.');

		return { success: true, suggestion: suggestion.data };
	}
);

const insertDaySchema = z.object({
	tripId: z.string().min(1),
	atPosition: z.number().int().min(1, 'Position must be at least 1'),
	location: z.string().min(1, 'Location is required'),
	overview: z.string().optional()
});

export const insertDay = form(
	insertDaySchema,
	async ({ tripId, atPosition, location, overview }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		await assertTripAccess(tripId, user.id);

		const coords = await geocodeLocation(location);

		await db.transaction(async (tx) => {
			// Shift all days at or after the insertion point up by 1
			await tx
				.update(dayTable)
				.set({ dayNumber: sql`${dayTable.dayNumber} + 1` })
				.where(and(eq(dayTable.tripId, tripId), gte(dayTable.dayNumber, atPosition)));

			// Insert the new day at the freed position
			await tx.insert(dayTable).values({
				tripId,
				dayNumber: atPosition,
				location,
				overview: overview ?? null,
				latitude: coords?.lat ?? null,
				longitude: coords?.lng ?? null
			});
		});

		return { success: true };
	}
);
