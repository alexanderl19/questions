import { dev } from '$app/environment';
import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';
import type { WebSocketMessageClientToServer, WebSocketMessageServerToClient } from 'types';
import type z from 'zod';
import { backOff } from 'exponential-backoff';

export const websocket = (listener: (message: WebSocketMessageServerToClient) => void) => {
	let webSocket: WebSocket | undefined;
	let connected = false;

	const close = () => {
		webSocket === undefined;
		webSocket?.close();
	};

	const connect = () => {
		webSocket = new WebSocket(dev ? 'ws://localhost:3000/ws' : PUBLIC_WEBSOCKET_URL);

		webSocket.onopen = () => {
			connected = true;
		};

		webSocket.onmessage = (event) => {
			const message: WebSocketMessageServerToClient = JSON.parse(event.data);
			listener(message);
		};

		webSocket.onclose = () => {
			backOff(
				async () => {
					close();
					connect();
					if (connected) {
						return true;
					} else {
						throw Error();
					}
				},
				{
					retry: () => true,
					startingDelay: 500
				}
			);
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
