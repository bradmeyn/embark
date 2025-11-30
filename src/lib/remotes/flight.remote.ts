import { command, form } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth.remote';
import { db } from '$db';
import { flightTable, dayTable } from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const addFlightSchema = z.object({
	dayId: z.string(),
	airline: z.string().min(1, 'Airline is required'),
	flightNumber: z.string().optional(),
	departureAirport: z.string().min(1, 'Departure airport is required'),
	arrivalAirport: z.string().min(1, 'Arrival airport is required'),
	departureTime: z.string().optional(),
	arrivalTime: z.string().optional(),
	confirmationNumber: z.string().optional(),
	notes: z.string().optional(),
	cost: z.number().min(0).optional()
});

const editFlightSchema = z.object({
	id: z.string(),
	airline: z.string().min(1, 'Airline is required'),
	flightNumber: z.string().optional(),
	departureAirport: z.string().min(1, 'Departure airport is required'),
	arrivalAirport: z.string().min(1, 'Arrival airport is required'),
	departureTime: z.string().optional(),
	arrivalTime: z.string().optional(),
	confirmationNumber: z.string().optional(),
	notes: z.string().optional(),
	cost: z.number().min(0).optional()
});

export const addFlight = form(addFlightSchema, async ({ dayId, airline, flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, confirmationNumber, notes, cost }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	// Verify the day exists and belongs to the current user
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

	if (!day) error(404, 'Day not found');
	if (day.itinerary.trip.userId !== user.id) error(403, 'Forbidden');

	const [newFlight] = await db
		.insert(flightTable)
		.values({
			dayId,
			airline,
			flightNumber: flightNumber ?? null,
			departureAirport,
			arrivalAirport,
			departureTime: departureTime ?? null,
			arrivalTime: arrivalTime ?? null,
			confirmationNumber: confirmationNumber ?? null,
			notes: notes ?? null,
			cost: cost != null ? String(cost) : null
		})
		.returning();

	return { success: true, flight: newFlight };
});

export const editFlight = form(editFlightSchema, async ({ id, airline, flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, confirmationNumber, notes, cost }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const flight = await db.query.flightTable.findFirst({
		where: eq(flightTable.id, id),
		with: {
			day: {
				with: {
					itinerary: {
						with: {
							trip: true
						}
					}
				}
			}
		}
	});

	if (!flight) error(404, 'Flight not found');
	if (flight.day.itinerary.trip.userId !== user.id) error(403, 'Forbidden');

	await db
		.update(flightTable)
		.set({
			airline,
			flightNumber: flightNumber ?? null,
			departureAirport,
			arrivalAirport,
			departureTime: departureTime ?? null,
			arrivalTime: arrivalTime ?? null,
			confirmationNumber: confirmationNumber ?? null,
			notes: notes ?? null,
			cost: cost != null ? String(cost) : null
		})
		.where(eq(flightTable.id, id));

	return { success: true };
});

export const deleteFlight = command(z.object({ flightId: z.string() }), async ({ flightId }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const flight = await db.query.flightTable.findFirst({
		where: eq(flightTable.id, flightId),
		with: {
			day: {
				with: {
					itinerary: {
						with: {
							trip: true
						}
					}
				}
			}
		}
	});

	if (!flight) error(404, 'Flight not found');
	if (flight.day.itinerary.trip.userId !== user.id) error(403, 'Forbidden');

	await db.delete(flightTable).where(eq(flightTable.id, flightId));

	return { success: true };
});
