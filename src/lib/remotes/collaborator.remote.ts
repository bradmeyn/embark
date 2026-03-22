import { command, form, query } from '$app/server';
import { z } from 'zod';
import { getCurrentUser } from '$lib/remotes/auth/auth.remote';
import { db } from '$db';
import { tripCollaboratorTable, tripInviteTable } from '$db/schemas/itinerary';
import { user as userTable } from '$db/schemas/auth';
import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { assertTripOwner } from '$lib/server/trip-access';
import { randomBytes } from 'crypto';
import { sendEmail } from '$lib/server/email';
import { env } from '$env/dynamic/public';

export const getCollaborators = query(z.string(), async (tripId: string) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	await assertTripOwner(tripId, user.id);

	const collaborators = await db.query.tripCollaboratorTable.findMany({
		where: eq(tripCollaboratorTable.tripId, tripId),
		with: { user: true }
	});

	const pendingInvites = await db.query.tripInviteTable.findMany({
		where: eq(tripInviteTable.tripId, tripId)
	});

	return { collaborators, pendingInvites };
});

export const inviteCollaborator = form(
	z.object({ tripId: z.string(), email: z.string().email() }),
	async ({ tripId, email }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const trip = await assertTripOwner(tripId, user.id);

		// Check if user already exists
		const existingUser = await db.query.user.findFirst({
			where: eq(userTable.email, email)
		});

		if (existingUser) {
			await db
				.insert(tripCollaboratorTable)
				.values({ tripId, userId: existingUser.id })
				.onConflictDoNothing();
		} else {
			const inviteToken = randomBytes(32).toString('base64url');
			const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

			await db
				.insert(tripInviteTable)
				.values({ tripId, invitedEmail: email, inviteToken, expiresAt })
				.onConflictDoNothing();

			const baseUrl = env.PUBLIC_BASE_URL ?? '';
			const acceptUrl = `${baseUrl}/invite/accept/${inviteToken}`;

			await sendEmail({
				to: email,
				subject: `You're invited to join "${trip.name}" on Embark`,
				html: `<p>You've been invited to collaborate on <strong>${trip.name}</strong>.</p>
				       <p><a href="${acceptUrl}">Click here to accept the invitation</a> (expires in 7 days)</p>`
			});
		}

		await getCollaborators(tripId).refresh();

		return { success: true };
	}
);

export const removeCollaborator = command(
	z.object({ tripId: z.string(), userId: z.string() }),
	async ({ tripId, userId }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		await assertTripOwner(tripId, user.id);

		await db
			.delete(tripCollaboratorTable)
			.where(
				and(
					eq(tripCollaboratorTable.tripId, tripId),
					eq(tripCollaboratorTable.userId, userId)
				)
			);

		await getCollaborators(tripId).refresh();

		return { success: true };
	}
);

export const cancelInvite = command(
	z.object({ inviteId: z.string() }),
	async ({ inviteId }) => {
		const user = await getCurrentUser();
		if (!user) error(401, 'Unauthorized');

		const invite = await db.query.tripInviteTable.findFirst({
			where: eq(tripInviteTable.id, inviteId)
		});

		if (!invite) error(404, 'Invite not found');

		await assertTripOwner(invite.tripId, user.id);

		await db.delete(tripInviteTable).where(eq(tripInviteTable.id, inviteId));

		await getCollaborators(invite.tripId).refresh();

		return { success: true };
	}
);

export const getInviteDetails = query(z.string(), async (token: string) => {
	const invite = await db.query.tripInviteTable.findFirst({
		where: eq(tripInviteTable.inviteToken, token),
		with: { trip: true }
	});

	if (!invite) error(404, 'This invitation link is invalid or has already been used.');
	if (invite.expiresAt < new Date()) error(410, 'This invitation link has expired.');

	return { tripName: invite.trip.name, tripId: invite.tripId, email: invite.invitedEmail };
});

export const acceptInvite = command(z.object({ token: z.string() }), async ({ token }) => {
	const user = await getCurrentUser();
	if (!user) error(401, 'Unauthorized');

	const invite = await db.query.tripInviteTable.findFirst({
		where: eq(tripInviteTable.inviteToken, token)
	});

	if (!invite) error(404, 'Invite not found or already used.');

	await db
		.insert(tripCollaboratorTable)
		.values({ tripId: invite.tripId, userId: user.id })
		.onConflictDoNothing();

	await db.delete(tripInviteTable).where(eq(tripInviteTable.id, invite.id));

	return { tripId: invite.tripId };
});
