import { command } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { asc, eq } from 'drizzle-orm';
import { db } from '$db';
import {
	activityTable,
	dayTable,
	hotelTable,
	tripTable,
	type Day,
	type Hotel
} from '$db/schemas/itinerary';
import { getCurrentUser } from '$lib/remotes/auth.remote';
import { assertTripAccess } from '$lib/server/trip-access';
import { geocodeLocation } from '$lib/server/geocode';
import { generateStructuredJson } from '$lib/server/ai';

const tripAgentInputSchema = z.object({
	destinations: z.string().min(1, 'At least one destination is required'),
	numberOfDays: z.number().int().min(1, 'Trip must be at least 1 day').max(30, 'Maximum is 30 days'),
	budget: z.string().min(1, 'Budget is required'),
	style: z.string().min(1, 'Travel style is required'),
	pace: z.string().min(1, 'Pace is required'),
	interests: z.string().min(1, 'At least one interest is required')
});

const generatedActivitySchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	location: z.string().optional(),
	startTime: z.string().optional(),
	cost: z.string().optional()
});

const generatedHotelSchema = z.object({
	name: z.string().min(1),
	address: z.string().optional(),
	notes: z.string().optional(),
	cost: z.string().optional(),
	nights: z.number().int().min(1).max(14).default(1)
});

const generatedDaySchema = z.object({
	dayNumber: z.number().int().min(1),
	location: z.string().min(1),
	overview: z.string().optional(),
	latitude: z.number().nullable().optional(),
	longitude: z.number().nullable().optional(),
	activities: z.array(generatedActivitySchema).default([]),
	hotels: z.array(generatedHotelSchema).default([])
});

const generatedTripSchema = z.object({
	tripName: z.string().min(1),
	summary: z.string().optional(),
	days: z.array(generatedDaySchema).min(1)
});

const generateTripSchema = z.object({
	input: tripAgentInputSchema
});

const saveGeneratedTripSchema = z.object({
	draft: generatedTripSchema
});

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

const parseMoney = (value?: string | null) => {
	if (!value) return null;
	const parsed = Number(value.replace(/[^\d.-]/g, ''));
	if (Number.isNaN(parsed)) return null;
	return parsed.toFixed(2);
};

const normalizeTime = (value?: string) => {
	if (!value) return null;
	const [hour, minute] = value.split(':');
	if (!hour || !minute) return null;
	return new Date(`1970-01-01T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`);
};

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

const getMaxNightsForDraftDay = (
	days: Array<{ location: string }>,
	startIndex: number
) => {
	const startLocation = days[startIndex]?.location;
	if (!startLocation) return 1;

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

export const generateTripDraft = command(generateTripSchema, async ({ input }) => {
	await getAuthedUser();

	let modelOutput: unknown;
	try {
		modelOutput = await generateStructuredJson<unknown>({
			system:
				'You are a travel planning assistant. Return only strict JSON and no prose. Build practical itineraries with realistic pacing. Include days with concise overviews, 2-4 activities/day, and optional hotel suggestions. Never include flights. Always generate exactly the requested number of days.',
			user: JSON.stringify({
				request: input,
				requiredShape: {
					tripName: 'string',
					summary: 'string (optional)',
					dayCount: input.numberOfDays,
					days: [
						{
							dayNumber: 'integer starting at 1',
							location: 'string',
							overview: 'string (optional)',
							activities: [
								{
									name: 'string',
									description: 'string (optional)',
									location: 'string (optional)',
									startTime: 'HH:MM 24h (optional)',
									cost: 'string currency (optional)'
								}
							],
							hotels: [
								{
									name: 'string',
									address: 'string (optional)',
									notes: 'string (optional)',
									cost: 'string currency (optional)',
									nights: 'integer >= 1'
								}
							]
						}
					]
				}
			})
		});
	} catch (err) {
		console.error('AI trip generation failed', err);
		error(500, 'Unable to generate itinerary right now. Please try again.');
	}

	const draft = generatedTripSchema.safeParse(modelOutput);
	if (!draft.success) {
		error(500, 'Generated itinerary had an unexpected format. Please regenerate.');
	}

	const sortedDays = [...draft.data.days].sort((a, b) => a.dayNumber - b.dayNumber);
	const fallbackLocation =
		sortedDays[sortedDays.length - 1]?.location ??
		input.destinations.split(',')[0]?.trim() ??
		input.destinations;

	const normalizedDays = Array.from({ length: input.numberOfDays }, (_, index) => {
		const existing = sortedDays[index];
		if (existing) {
			return { ...existing, dayNumber: index + 1 };
		}

		return {
			dayNumber: index + 1,
			location: fallbackLocation,
			overview: `Flexible day to explore ${fallbackLocation}.`,
			activities: [],
			hotels: []
		};
	});

	const daysWithCoords = await Promise.all(
		normalizedDays.map(async (day) => {
			const coords = await geocodeLocation(day.location);
			return {
				...day,
				latitude: coords?.lat ?? null,
				longitude: coords?.lng ?? null
			};
		})
	);

	return {
		success: true,
		draft: {
			...draft.data,
			days: daysWithCoords
		}
	};
});

export const saveGeneratedTrip = command(saveGeneratedTripSchema, async ({ draft }) => {
	const user = await getAuthedUser();

	const [trip] = await db
		.insert(tripTable)
		.values({
			name: draft.tripName,
			userId: user.id
		})
		.returning();

	for (const [dayIndex, day] of draft.days.entries()) {
		const coords =
			day.latitude != null && day.longitude != null
				? { lat: day.latitude, lng: day.longitude }
				: await geocodeLocation(day.location);
		const [insertedDay] = await db
			.insert(dayTable)
			.values({
				tripId: trip.id,
				dayNumber: day.dayNumber,
				location: day.location,
				overview: day.overview ?? null,
				latitude: coords?.lat ?? null,
				longitude: coords?.lng ?? null
			})
			.returning();

		if (day.activities.length > 0) {
			await db.insert(activityTable).values(
				day.activities.map((activity) => ({
					dayId: insertedDay.id,
					name: activity.name,
					description: activity.description ?? null,
					location: activity.location ?? null,
					time: normalizeTime(activity.startTime),
					cost: parseMoney(activity.cost)
				}))
			);
		}

		if (day.hotels.length > 0) {
			const maxNights = getMaxNightsForDraftDay(draft.days, dayIndex);

			await db.insert(hotelTable).values(
				day.hotels.map((hotel) => ({
					dayId: insertedDay.id,
					name: hotel.name,
					address: hotel.address ?? null,
					notes: hotel.notes ?? null,
					cost: parseMoney(hotel.cost),
					nights: Math.min(hotel.nights ?? 1, maxNights)
				}))
			);
		}
	}

	return { success: true, tripId: trip.id };
});

export const suggestActivityForDay = command(suggestActivitySchema, async ({ dayId, userPrompt }) => {
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
});

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

export type TripAgentInput = z.infer<typeof tripAgentInputSchema>;
export type GeneratedTripDraft = z.infer<typeof generatedTripSchema>;