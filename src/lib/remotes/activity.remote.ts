import { query, form, command } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth.remote';
import { db } from '$db';
import { activityTable, dayTable } from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { assertTripAccess } from '$lib/server/trip-access';

const activitySchema = z.object({
	name: z.string().min(1, 'Activity name is required'),
	description: z.string().optional(),
	cost: z.number().min(0, 'Cost must be at least 0').optional(),
	startTime: z.string().optional(),
	endTime: z.string().optional(),
	location: z.string().optional(),
	dayId: z.string()
});

const normalizeTimeInput = (value?: string | null) => {
	if (!value) return null;
	const input = value.includes('T')
		? value
		: `1970-01-01T${value.length === 5 ? `${value}:00` : value}`;
	const date = new Date(input);
	return Number.isNaN(date.getTime()) ? null : date;
};

export const addActivity = form(
	activitySchema,
	async ({ name, description, cost, startTime, location, dayId }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const day = await db.query.dayTable.findFirst({
			where: eq(dayTable.id, dayId)
		});

		if (!day) error(404, 'Day not found');

		await assertTripAccess(day.tripId, user.id);

		const [newActivity] = await db
			.insert(activityTable)
			.values({
				name,
				description: description ?? null,
				location: location ?? null,
				cost: cost != null ? String(cost) : null,
				time: normalizeTimeInput(startTime),
				dayId
			})
			.returning();

		return { success: true, activity: newActivity };
	}
);

export const getActivities = query(z.string(), async (dayId: string) => {
	const user = await getCurrentUser();
	if (!user) {
		error(401, 'Unauthorized');
	}

	const day = await db.query.dayTable.findFirst({
		where: eq(dayTable.id, dayId)
	});

	if (!day) error(404, 'Day not found');

	await assertTripAccess(day.tripId, user.id);

	const activities = await db.query.activityTable.findMany({
		where: eq(activityTable.dayId, dayId),
		orderBy: (activity, { asc }) => [asc(activity.time), asc(activity.createdAt)]
	});

	return activities;
});

export const deleteActivity = command(
	z.object({ activityId: z.string() }),
	async ({ activityId }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const activity = await db.query.activityTable.findFirst({
			where: eq(activityTable.id, activityId),
			with: {
				day: true
			}
		});

		if (!activity) error(404, 'Activity not found');

		await assertTripAccess(activity.day.tripId, user.id);

		await db.delete(activityTable).where(eq(activityTable.id, activityId));

		return { success: true };
	}
);
