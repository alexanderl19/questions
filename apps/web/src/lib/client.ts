import { websocket } from '$lib/websocket';
import { writable } from 'svelte/store';

export const players = writable<[id: string, name: string][]>([]);
export const stage = writable<'lobby' | 'write' | 'respond' | 'results'>('lobby');
export const respond = writable<
	| {
			promptId: string;
			promptNumber: number;
			promptText: string;
			promptsRemaining: number;
			typingCount?: number;
			promptCount: number;
	  }
	| undefined
>(undefined);
export const result = writable<
	| {
			promptId: string;
			promptNumber: number;
			promptText: string;
			promptsRemaining: number;
			results: [id: string, count: number][];
	  }
	| undefined
>(undefined);

export const { connect, send, close } = websocket((message) => {
	switch (message.type) {
		case 'error':
			break;
		case 'hello':
			break;
		case 'reconnect':
			break;
		case 'prompts':
			break;
		case 'respond':
			break;
		case 'state-players':
			players.set(message.players);
			break;
		case 'state-write':
			stage.set('write');
			break;
		case 'state-respond':
			stage.set('respond');
			respond.set({
				promptId: message.promptId,
				promptNumber: message.promptNumber,
				promptText: message.promptText,
				promptsRemaining: message.promptsRemaining,
				typingCount: message.typingCount,
				promptCount: message.promptCount
			});
			break;
		case 'state-results':
			stage.set('results');
			result.set({
				promptId: message.promptId,
				promptNumber: message.promptNumber,
				promptText: message.promptText,
				promptsRemaining: message.promptsRemaining,
				results: message.results
			});
			break;
		case 'state-lobby':
			stage.set('lobby');
			break;
	}
});
