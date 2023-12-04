import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { redis } from '$lib/upstash.server';
import { server } from '$lib/ably.server';
import { UpstashState } from '$lib/zod';

export const PUT: RequestHandler = async ({ params }) => {
	const upstashState = UpstashState.parse(await redis.json.get(params.id));
	if (upstashState.state !== 'answer') throw error(500);

	const receiveChannel = server.channels.get(`game:${params.id}:receive`);
	const sendChannel = server.channels.get(`game:${params.id}:send`);

	const { items } = await sendChannel.history({ start: upstashState.start });
	const answerMessages = items.filter(({ name }) => name === 'answer');
	const answers = new Map<string, string>([]);
	for (const { clientId, data } of answerMessages) {
		answers.set(clientId, data);
	}

	const answersAggregate = new Map<string, number>([]);
	answers.forEach((player) => {
		answersAggregate.set(player, (answersAggregate.get(player) ?? 0) + 1);
	});

	await receiveChannel.publish('update', {
		state: 'results',
		questionNumber: upstashState.question,
		question: upstashState.questions[upstashState.question][1],
		players: upstashState.players,
		results: Array.from(answersAggregate.entries())
	});

	return json({});
};
