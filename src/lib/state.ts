import type z from 'zod';
import { ServerMessage, type GameState } from './zod';
import { writable } from 'svelte/store';
import { subscribe } from '$lib/ably';

export const joinChannel = async (id: string) => {
	const channel = subscribe.channels.get(`game:${id}:receive`);
	await channel.setOptions({
		params: { rewind: '1' }
	});

	channel.subscribe((message) => {
		if (message.clientId === 'server') {
			const serverMessage = ServerMessage.parse(message);

			if (serverMessage.name === 'update') {
				state.set(serverMessage.data.state);

				if (serverMessage.data.state === 'answer') {
					answerState.set({
						question: serverMessage.data.question,
						players: serverMessage.data.players
					});

					players.set(new Map(serverMessage.data.players));
				}

				if (serverMessage.data.state === 'results') {
					resultsState.set({
						questionNumber: serverMessage.data.questionNumber,
						question: serverMessage.data.question,
						results: serverMessage.data.results
					});

					players.set(new Map(serverMessage.data.players));
				}
			}
		}
	});
};

export const state = writable<z.infer<typeof GameState>>('join');
export const answerState = writable<{ question: string; players: [string, string][] }>();
export const resultsState = writable<{
	questionNumber: number;
	question: string;
	results: [string, number][];
}>();
export const players = writable<Map<string, string>>(new Map());
