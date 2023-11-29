import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import z from 'zod';
import { redis } from '$lib/upstash.server';
import { server } from '$lib/ably.server';
import { UpstashState } from '$lib/zod';

export const PUT: RequestHandler = async ({ params, request }) => {
	const upstashState = UpstashState.parse(await redis.json.get(params.id));
	if (upstashState.state !== 'answer') throw error(500);

	const body = await request.json();
	const { newQuestion } = z
		.object({
			newQuestion: z.number()
		})
		.parse(body);

	const receiveChannel = server.channels.get(`game:${params.id}:receive`);

	if (newQuestion !== upstashState.question + 1) throw error(500);
	if (newQuestion >= upstashState.questions.length) throw error(500);

	await receiveChannel.publish('update', {
		state: 'answer',
		question: upstashState.questions[newQuestion][1],
		players: upstashState.players
	});
	const newUpstashState: z.infer<typeof UpstashState> = {
		...upstashState,
		...{
			question: newQuestion,
			start: new Date().valueOf()
		}
	};
	await redis.json.set(params.id, '$', newUpstashState);

	return json({});
};
