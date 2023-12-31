import { websocket } from '$lib/websocket';
import { writable } from 'svelte/store';

export const secret = writable<string | undefined>();
export const name = writable<string>('');
export const nameState = writable<{ joined: boolean }>({ joined: false });

export const players = writable<[id: string, name: string][]>([]);
export const stage = writable<'lobby' | 'write' | 'respond' | 'results'>('lobby');
export const writeState = writable<{ promptCount: number }>({ promptCount: 0 });
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
			secret.set(message.secret);
			nameState.set({ joined: true });
			break;
		case 'reconnect':
			if (message.success) {
				name.set(message.name);
				nameState.set({ joined: true });
			}
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
			writeState.set({ promptCount: message.promptCount });
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
