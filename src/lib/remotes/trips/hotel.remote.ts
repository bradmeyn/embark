import { command, form } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth/auth.remote';
import { db } from '$db';
import { hotelTable, dayTable } from '$db/schemas/itinerary';
import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { assertTripAccess } from '$lib/server/trip-access';
import { assertProAccess } from '$lib/server/subscription';
import { generateStructuredJson } from '$lib/server/ai';

function getMaxNightsForDay(
	days: Array<{ id: string; dayNumber: number; location: string }>,
	dayId: string
) {
	const startIndex = days.findIndex((d) => d.id === dayId);
	if (startIndex === -1) return 0;

	const startLocation = days[startIndex]?.location;
	let count = 0;

	for (let i = startIndex; i < days.length; i++) {
		if (days[i]?.location !== startLocation) break;
		count += 1;
	}

	return count;
}

const addHotelSchema = z.object({
	dayId: z.string(),
	name: z.string().min(1, 'Hotel name is required'),
	address: z.string().optional(),
	checkIn: z.string().optional(),
	checkOut: z.string().optional(),
	confirmationNumber: z.string().optional(),
	notes: z.string().optional(),
	cost: z.number().min(0).optional(),
	nights: z.number().int().min(1).optional()
});

const editHotelSchema = z.object({
	id: z.string(),
	name: z.string().min(1, 'Hotel name is required'),
	address: z.string().optional(),
	checkIn: z.string().optional(),
	checkOut: z.string().optional(),
	confirmationNumber: z.string().optional(),
	notes: z.string().optional(),
	cost: z.number().min(0).optional(),
	nights: z.number().int().min(1).optional()
});

export const addHotel = form(
	addHotelSchema,
	async ({ dayId, name, address, checkIn, checkOut, confirmationNumber, notes, cost, nights }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const day = await db.query.dayTable.findFirst({
			where: eq(dayTable.id, dayId)
		});

		if (!day) error(404, 'Day not found');

		await assertTripAccess(day.tripId, user.id);

		const tripDays = await db.query.dayTable.findMany({
			where: eq(dayTable.tripId, day.tripId),
			orderBy: [asc(dayTable.dayNumber)]
		});

		const requestedNights = nights ?? 1;
		const maxNights = getMaxNightsForDay(tripDays, day.id);

		if (requestedNights > maxNights) {
			error(
				400,
				`Invalid stay length. You can select up to ${maxNights} night${maxNights === 1 ? '' : 's'} starting on ${day.location}.`
			);
		}

		const [newHotel] = await db
			.insert(hotelTable)
			.values({
				dayId,
				name,
				address: address ?? null,
				checkIn: checkIn ?? null,
				checkOut: checkOut ?? null,
				confirmationNumber: confirmationNumber ?? null,
				notes: notes ?? null,
				cost: cost != null ? String(cost) : null,
				nights: nights ?? 1
			})
			.returning();

		return { success: true, hotel: newHotel };
	}
);

export const editHotel = form(
	editHotelSchema,
	async ({ id, name, address, checkIn, checkOut, confirmationNumber, notes, cost, nights }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const hotel = await db.query.hotelTable.findFirst({
			where: eq(hotelTable.id, id),
			with: {
				day: true
			}
		});

		if (!hotel) error(404, 'Hotel not found');

		await assertTripAccess(hotel.day.tripId, user.id);

		const tripDays = await db.query.dayTable.findMany({
			where: eq(dayTable.tripId, hotel.day.tripId),
			orderBy: [asc(dayTable.dayNumber)]
		});

		const requestedNights = nights ?? 1;
		const maxNights = getMaxNightsForDay(tripDays, hotel.dayId);

		if (requestedNights > maxNights) {
			error(
				400,
				`Invalid stay length. You can select up to ${maxNights} night${maxNights === 1 ? '' : 's'} starting on ${hotel.day.location}.`
			);
		}

		await db
			.update(hotelTable)
			.set({
				name,
				address: address ?? null,
				checkIn: checkIn ?? null,
				checkOut: checkOut ?? null,
				confirmationNumber: confirmationNumber ?? null,
				notes: notes ?? null,
				cost: cost != null ? String(cost) : null,
				nights: nights ?? 1
			})
			.where(eq(hotelTable.id, id));

		return { success: true };
	}
);

export const deleteHotel = command(z.object({ hotelId: z.string() }), async ({ hotelId }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const hotel = await db.query.hotelTable.findFirst({
		where: eq(hotelTable.id, hotelId),
		with: {
			day: true
		}
	});

	if (!hotel) error(404, 'Hotel not found');

	await assertTripAccess(hotel.day.tripId, user.id);

	await db.delete(hotelTable).where(eq(hotelTable.id, hotelId));

	return { success: true };
});

const suggestHotelSchema = z.object({
	dayId: z.string(),
	userPrompt: z.string().optional()
});

const suggestionHotelPayloadSchema = z.object({
	name: z.string().min(1),
	address: z.string().optional(),
	notes: z.string().optional(),
	cost: z.string().optional(),
	nights: z.number().int().min(1).max(14).default(1)
});

export const suggestHotelForDay = command(suggestHotelSchema, async ({ dayId, userPrompt }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');
	assertProAccess(user);

	const day = await db.query.dayTable.findFirst({ where: eq(dayTable.id, dayId) });
	if (!day) error(404, 'Day not found');

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
	if (!suggestion.success) error(500, 'Received invalid accommodation suggestion. Please try again.');

	return {
		success: true,
		suggestion: {
			...suggestion.data,
			nights: Math.min(suggestion.data.nights, maxNights)
		}
	};
});
