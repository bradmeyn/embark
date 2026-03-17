import { db } from '$db';
import { tripTable } from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';

export async function getTripByShareToken(token: string) {
	const trip = await db.query.tripTable.findFirst({
		where: eq(tripTable.shareToken, token),
		with: {
			days: {
				with: {
					activities: true,
					hotels: true,
					flights: true
				},
				orderBy: (day, { asc }) => [asc(day.dayNumber)]
			}
		}
	});
	return trip ?? null;
}
