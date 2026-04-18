import type { auth } from '$lib/server/auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			session?: typeof auth.$Infer.Session.session;
			user?: typeof auth.$Infer.Session.user;
		}
	}
}

declare module '$env/static/private' {
	export const RESEND_API_KEY: string;
	export const BETTER_AUTH_SECRET: string;
}

declare module '$env/static/public' {
	export const PUBLIC_BASE_URL: string;
}

export {};
