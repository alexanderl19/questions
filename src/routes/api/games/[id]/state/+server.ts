import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import z from 'zod';
import { redis } from '$lib/upstash.server';
import { GameState, UpstashState } from '$lib/zod';
import { ABLY_SERVER_KEY } from '$env/static/private';
import * as Ably from 'ably';

export const PUT: RequestHandler = async ({ params, request }) => {
	const server = new Ably.Realtime.Promise({
		key: ABLY_SERVER_KEY,
		clientId: 'server'
	});

	const body = await request.json();
	const { newState } = z
		.object({
			newState: GameState
		})
		.parse(body);

	const upstashState = UpstashState.parse(await redis.json.get(params.id));

	const receiveChannel = server.channels.get(`game:${params.id}:receive`);
	const sendChannel = server.channels.get(`game:${params.id}:send`);

	if (newState === 'questions' && upstashState.state === 'join') {
		await receiveChannel.publish('update', { state: 'questions' });

		const presences = await receiveChannel.presence.get();
		const players = new Map<string, string>([]);
		for (const { clientId, data } of presences) {
			players.set(clientId, data);
		}

		const newUpstashState: z.infer<typeof UpstashState> = {
			...upstashState,
			...{
				state: 'questions',
				players: Array.from(players.entries()),
				start: new Date().valueOf()
			}
		};
		await redis.json.set(params.id, '$', newUpstashState);

		return json({ state: 'questions' });
	}

	if (newState === 'answer' && upstashState.state === 'questions') {
		const { items } = await sendChannel.history({ start: upstashState.start });
		const questionMessages = items.filter(({ name }) => name === 'question');
		const questions = new Map<string, string>([]);
		for (const item of questionMessages) {
			questions.set(item.clientId, item.data);
		}

		const newUpstashState: z.infer<typeof UpstashState> = {
			...upstashState,
			...{
				state: 'answer',
				questions: Array.from(questions.entries()),
				question: -1,
				start: new Date().valueOf()
			}
		};
		await redis.json.set(params.id, '$', newUpstashState);

		return json({ state: 'answer' });
	}

	return json({});
};
