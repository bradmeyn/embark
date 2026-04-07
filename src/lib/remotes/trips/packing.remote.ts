import { command, form, query } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth/auth.remote';
import { db } from '$db';
import { packingItemTable } from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { assertTripAccess } from '$lib/server/trip-access';

export const getPackingItems = query(z.string(), async (tripId: string) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	await assertTripAccess(tripId, user.id);

	return db.query.packingItemTable.findMany({
		where: eq(packingItemTable.tripId, tripId),
		orderBy: (item, { asc }) => [asc(item.category), asc(item.createdAt)]
	});
});

export const addPackingItem = form(
	z.object({
		tripId: z.string(),
		name: z.string().min(1, 'Item name is required'),
		category: z.string().optional()
	}),
	async ({ tripId, name, category }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		await assertTripAccess(tripId, user.id);

		await db.insert(packingItemTable).values({
			tripId,
			name,
			category: category || null,
			packed: false
		});

		await getPackingItems(tripId).refresh();

		return { success: true };
	}
);

export const togglePackingItem = command(
	z.object({ itemId: z.string(), packed: z.boolean() }),
	async ({ itemId, packed }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const item = await db.query.packingItemTable.findFirst({
			where: eq(packingItemTable.id, itemId)
		});

		if (!item) error(404, 'Item not found');

		await assertTripAccess(item.tripId, user.id);

		await db.update(packingItemTable).set({ packed }).where(eq(packingItemTable.id, itemId));

		await getPackingItems(item.tripId).refresh();

		return { success: true };
	}
);

export const deletePackingItem = command(
	z.object({ itemId: z.string() }),
	async ({ itemId }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const item = await db.query.packingItemTable.findFirst({
			where: eq(packingItemTable.id, itemId)
		});

		if (!item) error(404, 'Item not found');

		await assertTripAccess(item.tripId, user.id);

		await db.delete(packingItemTable).where(eq(packingItemTable.id, itemId));

		await getPackingItems(item.tripId).refresh();

		return { success: true };
	}
);

export const clearPackedItems = command(
	z.object({ tripId: z.string() }),
	async ({ tripId }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		await assertTripAccess(tripId, user.id);

		await db
			.delete(packingItemTable)
			.where(eq(packingItemTable.tripId, tripId));

		await getPackingItems(tripId).refresh();

		return { success: true };
	}
);
