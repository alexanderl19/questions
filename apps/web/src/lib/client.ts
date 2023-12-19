import { websocket } from '$lib/websocket';
import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';
import { writable } from 'svelte/store';

export const playerData = persist(
	writable<{ id: string; secret: string } | undefined>(),
	createLocalStorage(),
	'player-data'
);
export const players = writable<[id: string, name: string][]>([]);

export const { connect, send, close } = websocket((message) => {
	switch (message.type) {
		case 'error':
			break;
		case 'hello':
			playerData.set({
				id: message.id,
				secret: message.secret
			});
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
			break;
		case 'state-respond':
			break;
		case 'state-results':
			break;
	}
});
