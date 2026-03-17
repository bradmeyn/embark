import { db } from '$db';
import { tripCollaboratorTable, tripInviteTable } from '$db/schemas/itinerary';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const invite = await db.query.tripInviteTable.findFirst({
		where: eq(tripInviteTable.inviteToken, params.token),
		with: { trip: true }
	});

	if (!invite) {
		error(404, 'This invitation link is invalid or has already been used.');
	}

	if (invite.expiresAt < new Date()) {
		error(410, 'This invitation link has expired.');
	}

	// If already logged in, accept immediately
	if (locals.user) {
		await db
			.insert(tripCollaboratorTable)
			.values({ tripId: invite.tripId, userId: locals.user.id })
			.onConflictDoNothing();

		await db.delete(tripInviteTable).where(eq(tripInviteTable.id, invite.id));

		redirect(303, `/trips/${invite.tripId}`);
	}

	return {
		tripName: invite.trip.name,
		tripId: invite.tripId,
		inviteToken: params.token,
		email: invite.invitedEmail
	};
};
