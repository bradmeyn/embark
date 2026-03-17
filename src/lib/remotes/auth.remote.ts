import { form, getRequestEvent, query } from '$app/server';
import { registerSchema, loginSchema, passwordResetSchema } from '$lib/schemas/auth';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$db';
import { tripCollaboratorTable, tripInviteTable } from '$db/schemas/itinerary';
import { and, eq, gt } from 'drizzle-orm';

export const registerUser = form(
	registerSchema,
	async ({ firstName, lastName, email, password }) => {
		const event = getRequestEvent();

		const result = await auth.api.signUpEmail({
			headers: event.request.headers,
			body: { email, password, firstName, lastName, name: `${firstName} ${lastName}` }
		});

		if (!result.user) {
			return {
				success: false,
				message: 'Registration failed'
			};
		}

		// Consume any pending invites for this email
		const now = new Date();
		const pendingInvites = await db.query.tripInviteTable.findMany({
			where: and(eq(tripInviteTable.invitedEmail, email), gt(tripInviteTable.expiresAt, now))
		});

		if (pendingInvites.length > 0) {
			await db.insert(tripCollaboratorTable).values(
				pendingInvites.map((invite) => ({
					tripId: invite.tripId,
					userId: result.user.id
				}))
			).onConflictDoNothing();

			await db.delete(tripInviteTable).where(
				eq(tripInviteTable.invitedEmail, email)
			);
		}

		const redirectTo = event.url.searchParams.get('redirect') ?? '/trips';
		redirect(302, redirectTo);
	}
);

export const loginUser = form(loginSchema, async ({ email, password }) => {
	const event = getRequestEvent();

	const result = await auth.api.signInEmail({
		headers: event.request.headers,
		body: { email, password }
	});

	if (!result.user) {
		return {
			success: false,
			message: 'Login failed'
		};
	}

	const redirectTo = event.url.searchParams.get('redirect') ?? '/trips';
	redirect(302, redirectTo);
});

export const logoutUser = form(async () => {
	const event = getRequestEvent();

	await auth.api.signOut({
		headers: event.request.headers
	});

	redirect(302, '/');
});

export const getCurrentUser = query(async () => {
	const { locals } = getRequestEvent();
	return locals.user;
});

export const sendPasswordReset = form(loginSchema.pick({ email: true }), async ({ email }) => {
	await auth.api.forgetPassword({
		body: {
			email,
			redirectTo: '/reset-password' // BetterAuth appends this to your app URL
		}
	});

	return {
		success: true,
		message: 'If an account with that email exists, a password reset link has been sent.'
	};
});

export const resetPassword = form(passwordResetSchema, async ({ password, token }) => {
	await auth.api.resetPassword({
		body: { newPassword: password, token }
	});

	return { success: true as const };
});
