import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export async function sendEmail({
	to,
	subject,
	html
}: {
	to: string;
	subject: string;
	html: string;
}) {
	await resend.emails.send({
		from: 'onboarding@resend.dev', // free test domain
		to,
		subject,
		html
	});
}