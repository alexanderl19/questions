import type { RequestHandler } from './$types';
import type z from 'zod';
import type { UpstashState } from '$lib/zod';
import { redirect } from '@sveltejs/kit';
import { nanoid } from '$lib/nanoid.server';
import { redis } from '$lib/upstash.server';

export const GET: RequestHandler = async () => {
	let id = nanoid();

	while ((await redis.get(id)) !== null) {
		id = nanoid();
	}

	const newUpstashState: z.infer<typeof UpstashState> = {
		state: 'join'
	};
	await redis.json.set(id, '$', newUpstashState);

	throw redirect(302, `/host/${id}`);
};
