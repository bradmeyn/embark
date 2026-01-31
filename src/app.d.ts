import type { Session, User } from 'better-auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			session?: Session;
			user?: User;
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
