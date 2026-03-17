import { env } from '$env/dynamic/private';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4.1-mini';

const stripCodeFences = (text: string) => {
	const trimmed = text.trim();
	if (!trimmed.startsWith('```')) return trimmed;
	return trimmed.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
};

export async function generateStructuredJson<T>({
	system,
	user,
	timeoutMs = 25_000
}: {
	system: string;
	user: string;
	timeoutMs?: number;
}): Promise<T> {
	if (!env.OPENAI_API_KEY) {
		throw new Error('Missing OPENAI_API_KEY');
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(OPENAI_URL, {
			method: 'POST',
				headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${env.OPENAI_API_KEY}`
			},
			body: JSON.stringify({
				model: DEFAULT_MODEL,
				temperature: 0.5,
				response_format: { type: 'json_object' },
				messages: [
					{ role: 'system', content: system },
					{ role: 'user', content: user }
				]
			}),
			signal: controller.signal
		});

		if (!response.ok) {
			const details = await response.text();
			throw new Error(`OpenAI request failed: ${response.status} ${details}`);
		}

		const payload = (await response.json()) as {
			choices?: Array<{ message?: { content?: string | null } }>;
		};

		const content = payload.choices?.[0]?.message?.content;
		if (!content) {
			throw new Error('OpenAI response was empty');
		}

		return JSON.parse(stripCodeFences(content)) as T;
	} finally {
		clearTimeout(timer);
	}
}
