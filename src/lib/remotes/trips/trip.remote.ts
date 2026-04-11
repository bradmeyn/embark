import { command, form, query } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth/auth.remote';
import { db } from '$db';
import {
	tripTable,
	tripCollaboratorTable,
	dayTable,
	activityTable,
	hotelTable,
	flightTable,
	travelSegmentTable
} from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { assertTripAccess, assertTripOwner } from '$lib/server/trip-access';

const tripSchema = z.object({
	name: z.string().min(1, 'Name is required')
});

export const getMyTrips = query(async () => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const trips = await db.query.tripTable.findMany({
		where: eq(tripTable.userId, user.id),
		with: {
			days: true
		}
	});

	return trips;
});

export const getSharedTrips = query(async () => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const rows = await db.query.tripCollaboratorTable.findMany({
		where: eq(tripCollaboratorTable.userId, user.id),
		with: {
			trip: {
				with: { days: true }
			}
		}
	});

	return rows.map((r) => r.trip);
});

export const getTrip = query(z.string(), async (id: string) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	await assertTripAccess(id, user.id);

	const trip = await db.query.tripTable.findFirst({
		where: eq(tripTable.id, id),
		with: {
			days: {
				with: {
					activities: true,
					hotels: true,
					flights: true
				},
				orderBy: (day, { asc }) => [asc(day.dayNumber)]
			},
			travelSegments: true
		}
	});

	if (!trip) {
		error(404, 'Trip not found');
	}

	return trip;
});

export const addTrip = form(tripSchema, async ({ name }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	await db
		.insert(tripTable)
		.values({
			name,
			userId: user.id
		})
		.returning();

	return { success: true };
});

export const editTrip = form(
	z.object({
		id: z.string(),
		name: z.string().min(1, 'Name is required'),
		coverImage: z.string().url().optional().or(z.literal(''))
	}),
	async ({ id, name, coverImage }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		await assertTripOwner(id, user.id);

		const [updatedTrip] = await db
			.update(tripTable)
			.set({ name, coverImage: coverImage || null })
			.where(eq(tripTable.id, id))
			.returning();

		return { success: true, updatedTrip };
	}
);

export const duplicateTrip = command(z.object({ tripId: z.string() }), async ({ tripId }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	await assertTripOwner(tripId, user.id);

	const trip = await db.query.tripTable.findFirst({
		where: eq(tripTable.id, tripId),
		with: {
			days: {
				with: { activities: true, hotels: true, flights: true },
				orderBy: (day, { asc }) => [asc(day.dayNumber)]
			}
		}
	});

	if (!trip) error(404, 'Trip not found');

	const [newTrip] = await db
		.insert(tripTable)
		.values({ name: `Copy of ${trip.name}`, userId: user.id, coverImage: trip.coverImage })
		.returning();

	for (const day of trip.days) {
		const [newDay] = await db
			.insert(dayTable)
			.values({
				tripId: newTrip.id,
				dayNumber: day.dayNumber,
				location: day.location,
				overview: day.overview,
				date: day.date,
				latitude: day.latitude,
				longitude: day.longitude
			})
			.returning();

		if (day.activities.length > 0) {
			await db.insert(activityTable).values(
				day.activities.map((a) => ({
					dayId: newDay.id,
					name: a.name,
					description: a.description,
					time: a.time,
					location: a.location,
					cost: a.cost
				}))
			);
		}

		if (day.hotels.length > 0) {
			await db.insert(hotelTable).values(
				day.hotels.map((h) => ({
					dayId: newDay.id,
					name: h.name,
					address: h.address,
					checkIn: h.checkIn,
					checkOut: h.checkOut,
					confirmationNumber: h.confirmationNumber,
					notes: h.notes,
					cost: h.cost,
					nights: h.nights
				}))
			);
		}

		if (day.flights.length > 0) {
			await db.insert(flightTable).values(
				day.flights.map((f) => ({
					dayId: newDay.id,
					airline: f.airline,
					flightNumber: f.flightNumber,
					departureAirport: f.departureAirport,
					arrivalAirport: f.arrivalAirport,
					departureTime: f.departureTime,
					arrivalTime: f.arrivalTime,
					confirmationNumber: f.confirmationNumber,
					notes: f.notes,
					cost: f.cost
				}))
			);
		}
	}

	await getMyTrips().refresh();

	return { success: true, tripId: newTrip.id };
});

export const deleteTrip = command(
	z.object({
		id: z.string()
	}),
	async ({ id }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		await assertTripOwner(id, user.id);

		await db.delete(tripTable).where(eq(tripTable.id, id));

		await getMyTrips().refresh();

		return { success: true };
	}
);
