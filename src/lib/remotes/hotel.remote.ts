import { command, form } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth.remote';
import { db } from '$db';
import { hotelTable, dayTable } from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const addHotelSchema = z.object({
	dayId: z.string(),
	name: z.string().min(1, 'Hotel name is required'),
	address: z.string().optional(),
	checkIn: z.string().optional(),
	checkOut: z.string().optional(),
	confirmationNumber: z.string().optional(),
	notes: z.string().optional(),
	cost: z.number().min(0).optional()
});

const editHotelSchema = z.object({
	id: z.string(),
	name: z.string().min(1, 'Hotel name is required'),
	address: z.string().optional(),
	checkIn: z.string().optional(),
	checkOut: z.string().optional(),
	confirmationNumber: z.string().optional(),
	notes: z.string().optional(),
	cost: z.number().min(0).optional()
});

export const addHotel = form(addHotelSchema, async ({ dayId, name, address, checkIn, checkOut, confirmationNumber, notes, cost }) => {
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
			cost: cost != null ? String(cost) : null
		})
		.returning();

	return { success: true, hotel: newHotel };
});

export const editHotel = form(editHotelSchema, async ({ id, name, address, checkIn, checkOut, confirmationNumber, notes, cost }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const hotel = await db.query.hotelTable.findFirst({
		where: eq(hotelTable.id, id),
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

	if (!hotel) error(404, 'Hotel not found');
	if (hotel.day.itinerary.trip.userId !== user.id) error(403, 'Forbidden');

	await db
		.update(hotelTable)
		.set({
			name,
			address: address ?? null,
			checkIn: checkIn ?? null,
			checkOut: checkOut ?? null,
			confirmationNumber: confirmationNumber ?? null,
			notes: notes ?? null,
			cost: cost != null ? String(cost) : null
		})
		.where(eq(hotelTable.id, id));

	return { success: true };
});

export const deleteHotel = command(z.object({ hotelId: z.string() }), async ({ hotelId }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const hotel = await db.query.hotelTable.findFirst({
		where: eq(hotelTable.id, hotelId),
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

	if (!hotel) error(404, 'Hotel not found');
	if (hotel.day.itinerary.trip.userId !== user.id) error(403, 'Forbidden');

	await db.delete(hotelTable).where(eq(hotelTable.id, hotelId));

	return { success: true };
});
