import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$db';
import { getRequestEvent } from '$app/server';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { BETTER_AUTH_SECRET } from '$env/static/private';

import { PUBLIC_BASE_URL } from '$env/static/public';

import { sendEmail } from './email';

export const auth = betterAuth({
	plugins: [sveltekitCookies(getRequestEvent)],
	baseURL: PUBLIC_BASE_URL,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			sendEmail({
				to: user.email,
				subject: 'Reset your password',
				html: `Click the link to reset your password: ${url}`
			});
		},
		resetPasswordTokenExpiresIn: 3600 // 1 hour
	},
	user: {
		additionalFields: {
			firstName: {
				type: 'string',
				required: true
			},
			lastName: {
				type: 'string',
				required: true
			}
		}
	}
});
