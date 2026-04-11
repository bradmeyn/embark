import { command, form } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth/auth.remote';
import { db } from '$db';
import { dayTable, travelSegmentTable } from '$db/schemas/itinerary';
import { and, asc, eq, gt } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { assertTripAccess } from '$lib/server/trip-access';

const TRAVEL_MODES = ['car', 'train', 'bus', 'ferry', 'walk', 'bike', 'other'] as const;
export type TravelMode = (typeof TRAVEL_MODES)[number];

async function fetchOsrmRoute(
	fromLng: number,
	fromLat: number,
	toLng: number,
	toLat: number
): Promise<string | null> {
	try {
		const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
		const res = await fetch(url, {
			headers: { 'User-Agent': 'Embark/1.0' }
		});
		if (!res.ok) return null;
		const data = await res.json();
		const coords = data?.routes?.[0]?.geometry?.coordinates;
		if (!Array.isArray(coords) || coords.length === 0) return null;
		return JSON.stringify(coords);
	} catch {
		return null;
	}
}

const addTravelSegmentSchema = z.object({
	fromDayId: z.string().min(1),
	mode: z.enum(TRAVEL_MODES),
	departureTime: z.string().optional(),
	arrivalTime: z.string().optional(),
	notes: z.string().optional(),
	cost: z.string().optional()
});

export const addTravelSegment = form(
	addTravelSegmentSchema,
	async ({ fromDayId, mode, departureTime, arrivalTime, notes, cost }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const fromDay = await db.query.dayTable.findFirst({
			where: eq(dayTable.id, fromDayId)
		});
		if (!fromDay) error(404, 'Day not found');

		await assertTripAccess(fromDay.tripId, user.id);

		// Find the immediately following day for car route geometry
		let routeGeometry: string | null = null;
		if (mode === 'car' && fromDay.latitude != null && fromDay.longitude != null) {
			const nextDay = await db.query.dayTable.findFirst({
				where: and(eq(dayTable.tripId, fromDay.tripId), gt(dayTable.dayNumber, fromDay.dayNumber)),
				orderBy: [asc(dayTable.dayNumber)]
			});
			if (nextDay?.latitude != null && nextDay.longitude != null) {
				routeGeometry = await fetchOsrmRoute(
					fromDay.longitude,
					fromDay.latitude,
					nextDay.longitude,
					nextDay.latitude
				);
			}
		}

		await db.insert(travelSegmentTable).values({
			fromDayId,
			tripId: fromDay.tripId,
			mode,
			departureTime: departureTime ?? null,
			arrivalTime: arrivalTime ?? null,
			notes: notes ?? null,
			cost: cost ?? null,
			routeGeometry
		});

		return { success: true };
	}
);

const editTravelSegmentSchema = z.object({
	id: z.string().min(1),
	mode: z.enum(TRAVEL_MODES),
	departureTime: z.string().optional(),
	arrivalTime: z.string().optional(),
	notes: z.string().optional(),
	cost: z.string().optional()
});

export const editTravelSegment = form(
	editTravelSegmentSchema,
	async ({ id, mode, departureTime, arrivalTime, notes, cost }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const segment = await db.query.travelSegmentTable.findFirst({
			where: eq(travelSegmentTable.id, id)
		});
		if (!segment) error(404, 'Travel segment not found');

		await assertTripAccess(segment.tripId, user.id);

		// Recompute route geometry when mode changes to/from car
		let routeGeometry = segment.routeGeometry;
		const modeChanged = mode !== segment.mode;

		if (modeChanged) {
			if (mode === 'car') {
				const fromDay = await db.query.dayTable.findFirst({
					where: eq(dayTable.id, segment.fromDayId)
				});
				if (fromDay?.latitude != null && fromDay.longitude != null) {
					const nextDay = await db.query.dayTable.findFirst({
						where: and(
							eq(dayTable.tripId, fromDay.tripId),
							gt(dayTable.dayNumber, fromDay.dayNumber)
						),
						orderBy: [asc(dayTable.dayNumber)]
					});
					if (nextDay?.latitude != null && nextDay.longitude != null) {
						routeGeometry = await fetchOsrmRoute(
							fromDay.longitude,
							fromDay.latitude,
							nextDay.longitude,
							nextDay.latitude
						);
					} else {
						routeGeometry = null;
					}
				} else {
					routeGeometry = null;
				}
			} else {
				// Mode changed away from car — clear stored geometry
				routeGeometry = null;
			}
		}

		await db
			.update(travelSegmentTable)
			.set({
				mode,
				departureTime: departureTime ?? null,
				arrivalTime: arrivalTime ?? null,
				notes: notes ?? null,
				cost: cost ?? null,
				routeGeometry
			})
			.where(eq(travelSegmentTable.id, id));

		return { success: true };
	}
);

export const deleteTravelSegment = command(z.object({ id: z.string().min(1) }), async ({ id }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const segment = await db.query.travelSegmentTable.findFirst({
		where: eq(travelSegmentTable.id, id)
	});
	if (!segment) error(404, 'Travel segment not found');

	await assertTripAccess(segment.tripId, user.id);

	await db.delete(travelSegmentTable).where(eq(travelSegmentTable.id, id));

	return { success: true };
});

export const refreshCarRoute = command(
	z.object({ segmentId: z.string().min(1) }),
	async ({ segmentId }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const segment = await db.query.travelSegmentTable.findFirst({
			where: eq(travelSegmentTable.id, segmentId)
		});
		if (!segment) error(404, 'Travel segment not found');
		if (segment.mode !== 'car') error(400, 'Route refresh only available for car segments');

		await assertTripAccess(segment.tripId, user.id);

		const fromDay = await db.query.dayTable.findFirst({
			where: eq(dayTable.id, segment.fromDayId)
		});
		if (!fromDay?.latitude || !fromDay.longitude) {
			error(400, 'Departure day has no coordinates');
		}

		const nextDay = await db.query.dayTable.findFirst({
			where: and(eq(dayTable.tripId, fromDay.tripId), gt(dayTable.dayNumber, fromDay.dayNumber)),
			orderBy: [asc(dayTable.dayNumber)]
		});
		if (!nextDay?.latitude || !nextDay.longitude) {
			error(400, 'Destination day has no coordinates');
		}

		const routeGeometry = await fetchOsrmRoute(
			fromDay.longitude,
			fromDay.latitude,
			nextDay.longitude,
			nextDay.latitude
		);

		await db
			.update(travelSegmentTable)
			.set({ routeGeometry })
			.where(eq(travelSegmentTable.id, segmentId));

		return { success: true };
	}
);
