import { PUBLIC_WEBSOCKET_URL_WS } from '$env/static/public';
import type { WebSocketMessageClientToServer, WebSocketMessageServerToClient } from 'types';
import type z from 'zod';
import pRetry from 'p-retry';
import { persist, createLocalStorage, type PersistentStore } from '@macfja/svelte-persistent-store';
import { get, writable } from 'svelte/store';

export const websocket = (listener: (message: WebSocketMessageServerToClient) => void) => {
	let webSocket: WebSocket | undefined;
	let connected = false;
	let reconnecting = false;
	let savedId: string | undefined;
	const controller = new AbortController();

	let playerData: PersistentStore<{ id: string; secret: string } | undefined> | undefined;

	const close = () => {
		webSocket === undefined;
		webSocket?.close();
	};

	const connect = (id: string) => {
		savedId = id;

		playerData = persist(
			writable<{ id: string; secret: string } | undefined>(),
			createLocalStorage(),
			'player-data-' + id
		);

		webSocket = new WebSocket(new URL(id + '/ws', PUBLIC_WEBSOCKET_URL_WS));

		webSocket.onopen = () => {
			connected = true;
			reconnecting = false;
			controller.abort(new Error('connected'));

			if (playerData) {
				const playerDataValue = get(playerData);
				if (playerDataValue) {
					const { id, secret } = playerDataValue;
					send('reconnect', {
						id,
						secret
					});
				}
			}
		};

		webSocket.onmessage = (event) => {
			const message: WebSocketMessageServerToClient = JSON.parse(event.data);

			if (message.type === 'hello') {
				playerData?.set({
					id: message.id,
					secret: message.secret
				});
			}

			listener(message);
		};

		webSocket.onclose = () => {
			connected = false;

			if (reconnecting === false) {
				reconnecting = true;
				pRetry(
					async () => {
						close();
						if (!savedId) throw controller.abort(new Error('no id'));
						connect(savedId);
						await new Promise((resolve) => setTimeout(resolve, 500));
						if (connected) {
							return true;
						} else {
							throw Error();
						}
					},
					{
						signal: controller.signal
					}
				);
			}
		};
	};

	type WebSocketMessageClientToServer = z.infer<typeof WebSocketMessageClientToServer>;
	const send = <T extends WebSocketMessageClientToServer['type']>(
		type: T,
		value: Omit<Extract<WebSocketMessageClientToServer, { type: T }>, 'type'>
	) => {
		webSocket?.send(JSON.stringify({ ...value, type }));
	};

	return {
		connect,
		send,
		close
	};
};
