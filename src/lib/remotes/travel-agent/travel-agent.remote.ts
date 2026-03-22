import { command, form } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$db';
import { activityTable, dayTable, hotelTable, tripTable } from '$db/schemas/itinerary';
import { getCurrentUser } from '$lib/remotes/auth/auth.remote';
import { geocodeLocation } from '$lib/server/geocode';
import { generateStructuredJson } from '$lib/server/ai';

const tripAgentInputSchema = z.object({
	destinations: z.string().min(1, 'At least one destination is required'),
	numberOfDays: z
		.number()
		.int()
		.min(1, 'Trip must be at least 1 day')
		.max(30, 'Maximum is 30 days'),
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

const saveGeneratedTripSchema = z.object({
	draft: generatedTripSchema
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

const getMaxNightsForDraftDay = (days: Array<{ location: string }>, startIndex: number) => {
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

export const generateTripDraft = form(tripAgentInputSchema, async (input) => {
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

export type TripAgentInput = z.infer<typeof tripAgentInputSchema>;
export type GeneratedTripDraft = z.infer<typeof generatedTripSchema>;
