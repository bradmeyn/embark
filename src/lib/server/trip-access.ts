import { db } from '$db';
import { tripTable, tripCollaboratorTable } from '$db/schemas/itinerary';
import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function assertTripOwner(tripId: string, userId: string) {
	const trip = await db.query.tripTable.findFirst({
		where: eq(tripTable.id, tripId)
	});
	if (!trip) error(404, 'Trip not found');
	if (trip.userId !== userId) error(403, 'Forbidden');
	return trip;
}

export async function assertTripAccess(tripId: string, userId: string) {
	const trip = await db.query.tripTable.findFirst({
		where: eq(tripTable.id, tripId)
	});
	if (!trip) error(404, 'Trip not found');
	if (trip.userId === userId) return trip;

	const collaborator = await db.query.tripCollaboratorTable.findFirst({
		where: and(
			eq(tripCollaboratorTable.tripId, tripId),
			eq(tripCollaboratorTable.userId, userId)
		)
	});
	if (!collaborator) error(403, 'Forbidden');
	return trip;
}
