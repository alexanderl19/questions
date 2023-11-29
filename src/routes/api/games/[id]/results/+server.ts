import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { redis } from '$lib/upstash.server';
import { UpstashState } from '$lib/zod';
import { ABLY_SERVER_KEY } from '$env/static/private';
import * as Ably from 'ably';

export const PUT: RequestHandler = async ({ params }) => {
	const server = new Ably.Realtime.Promise({
		key: ABLY_SERVER_KEY,
		clientId: 'server'
	});

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

	await receiveChannel.publish('update', {
		state: 'results',
		questionNumber: upstashState.question,
		question: upstashState.questions[upstashState.question][1],
		results: Array.from(answers.entries())
	});

	return json({});
};
