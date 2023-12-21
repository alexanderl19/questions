import { dev } from '$app/environment';
import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';
import type { WebSocketMessageClientToServer, WebSocketMessageServerToClient } from 'types';
import type z from 'zod';
import pRetry from 'p-retry';

export const websocket = (listener: (message: WebSocketMessageServerToClient) => void) => {
	let webSocket: WebSocket | undefined;
	let connected = false;
	let reconnecting = false;
	const controller = new AbortController();

	const close = () => {
		webSocket === undefined;
		webSocket?.close();
	};

	const connect = () => {
		webSocket = new WebSocket(dev ? 'ws://localhost:3000/ws' : PUBLIC_WEBSOCKET_URL);

		webSocket.onopen = () => {
			connected = true;
			reconnecting = false;
			controller.abort(new Error('connected'));
		};

		webSocket.onmessage = (event) => {
			const message: WebSocketMessageServerToClient = JSON.parse(event.data);
			listener(message);
		};

		webSocket.onclose = () => {
			connected = false;

			if (reconnecting === false) {
				reconnecting = true;
				pRetry(
					async () => {
						close();
						connect();
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
