import { command } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { asc, eq } from 'drizzle-orm';
import { db } from '$db';
import { dayTable, hotelTable, tripTable, type Day, type Hotel } from '$db/schemas/itinerary';
import { getCurrentUser } from '$lib/remotes/auth.remote';
import { assertTripAccess } from '$lib/server/trip-access';
import { generateStructuredJson } from '$lib/server/ai';

const suggestActivitySchema = z.object({
	dayId: z.string(),
	userPrompt: z.string().optional()
});

const suggestHotelSchema = z.object({
	dayId: z.string(),
	userPrompt: z.string().optional()
});

const suggestDayOverviewSchema = z.object({
	dayId: z.string(),
	userPrompt: z.string().optional()
});

const suggestNewDaySchema = z.object({
	tripId: z.string(),
	dayNumber: z.number().int().min(1),
	userPrompt: z.string().optional()
});

const suggestionActivitySchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	location: z.string().optional(),
	startTime: z.string().optional(),
	cost: z.string().optional()
});

const suggestionHotelPayloadSchema = z.object({
	name: z.string().min(1),
	address: z.string().optional(),
	notes: z.string().optional(),
	cost: z.string().optional(),
	nights: z.number().int().min(1).max(14).default(1)
});

const suggestionDayOverviewPayloadSchema = z.object({
	location: z.string().min(1),
	overview: z.string().min(1)
});

const suggestionNewDayPayloadSchema = z.object({
	location: z.string().min(1),
	overview: z.string().optional()
});

const getMaxNightsForDay = (days: Day[], dayId: string) => {
	const startIndex = days.findIndex((d) => d.id === dayId);
	if (startIndex === -1) return 1;

	const startLocation = days[startIndex]?.location;
	let count = 0;

	for (let i = startIndex; i < days.length; i++) {
		if (days[i]?.location !== startLocation) break;
		count += 1;
	}

	return count;
};

async function getAuthedUser() {
	const user = await getCurrentUser();
	if (!user) {
		error(401, 'Unauthorized');
	}
	return user;
}

export const suggestActivityForDay = command(
	suggestActivitySchema,
	async ({ dayId, userPrompt }) => {
		const user = await getAuthedUser();

		const day = await db.query.dayTable.findFirst({ where: eq(dayTable.id, dayId) });
		if (!day) {
			error(404, 'Day not found');
		}

		await assertTripAccess(day.tripId, user.id);

		let modelOutput: unknown;
		try {
			modelOutput = await generateStructuredJson<unknown>({
				system:
					'Suggest one concrete travel activity as JSON only. Keep it realistic and concise. Include startTime as HH:MM only when useful.',
				user: JSON.stringify({
					day: {
						dayNumber: day.dayNumber,
						location: day.location,
						overview: day.overview
					},
					userPrompt: userPrompt ?? null,
					requiredShape: {
						name: 'string',
						description: 'string (optional)',
						location: 'string (optional)',
						startTime: 'HH:MM (optional)',
						cost: 'string currency (optional)'
					}
				})
			});
		} catch (err) {
			console.error('AI activity suggestion failed', err);
			error(500, 'Unable to suggest an activity right now.');
		}

		const suggestion = suggestionActivitySchema.safeParse(modelOutput);
		if (!suggestion.success) {
			error(500, 'Received invalid activity suggestion. Please try again.');
		}

		return { success: true, suggestion: suggestion.data };
	}
);

export const suggestHotelForDay = command(suggestHotelSchema, async ({ dayId, userPrompt }) => {
	const user = await getAuthedUser();

	const day = await db.query.dayTable.findFirst({ where: eq(dayTable.id, dayId) });
	if (!day) {
		error(404, 'Day not found');
	}

	await assertTripAccess(day.tripId, user.id);

	const days = await db.query.dayTable.findMany({
		where: eq(dayTable.tripId, day.tripId),
		orderBy: [asc(dayTable.dayNumber)]
	});
	const maxNights = getMaxNightsForDay(days, day.id);

	let modelOutput: unknown;
	try {
		modelOutput = await generateStructuredJson<unknown>({
			system:
				'Suggest one accommodation option as JSON only. Keep values practical and concise. Nights must be between 1 and the provided maxNights.',
			user: JSON.stringify({
				day: {
					dayNumber: day.dayNumber,
					location: day.location,
					overview: day.overview
				},
				maxNights,
				userPrompt: userPrompt ?? null,
				requiredShape: {
					name: 'string',
					address: 'string (optional)',
					notes: 'string (optional)',
					cost: 'string currency (optional)',
					nights: `integer between 1 and ${maxNights}`
				}
			})
		});
	} catch (err) {
		console.error('AI hotel suggestion failed', err);
		error(500, 'Unable to suggest accommodation right now.');
	}

	const suggestion = suggestionHotelPayloadSchema.safeParse(modelOutput);
	if (!suggestion.success) {
		error(500, 'Received invalid accommodation suggestion. Please try again.');
	}

	return {
		success: true,
		suggestion: {
			...suggestion.data,
			nights: Math.min(suggestion.data.nights, maxNights)
		}
	};
});

export const suggestDayOverview = command(
	suggestDayOverviewSchema,
	async ({ dayId, userPrompt }) => {
		const user = await getAuthedUser();

		const day = await db.query.dayTable.findFirst({ where: eq(dayTable.id, dayId) });
		if (!day) {
			error(404, 'Day not found');
		}

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
					hotels: hotels.map((h: Hotel) => ({ name: h.name, notes: h.notes })),
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
		if (!suggestion.success) {
			error(500, 'Received invalid day suggestion. Please try again.');
		}

		return { success: true, suggestion: suggestion.data };
	}
);

export const suggestNewDayForTrip = command(
	suggestNewDaySchema,
	async ({ tripId, dayNumber, userPrompt }) => {
		const user = await getAuthedUser();

		await assertTripAccess(tripId, user.id);

		const trip = await db.query.tripTable.findFirst({
			where: eq(tripTable.id, tripId)
		});
		if (!trip) {
			error(404, 'Trip not found');
		}

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
		if (!suggestion.success) {
			error(500, 'Received invalid day location suggestion. Please try again.');
		}

		return { success: true, suggestion: suggestion.data };
	}
);
