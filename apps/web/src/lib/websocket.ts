import { dev } from '$app/environment';
import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';
import type { WebSocketMessageClientToServer, WebSocketMessageServerToClient } from 'types';
import type z from 'zod';

export const websocket = (listener: (message: WebSocketMessageServerToClient) => void) => {
	let webSocket: WebSocket | undefined;

	const connect = () => {
		webSocket = new WebSocket(dev ? 'ws://localhost:3001/ws' : PUBLIC_WEBSOCKET_URL);

		webSocket.onmessage = (event) => {
			const message: WebSocketMessageServerToClient = JSON.parse(event.data);
			listener(message);
		};
	};

	type WebSocketMessageClientToServer = z.infer<typeof WebSocketMessageClientToServer>;
	const send = <T extends WebSocketMessageClientToServer['type']>(
		type: T,
		value: Omit<Extract<WebSocketMessageClientToServer, { type: T }>, 'type'>
	) => {
		webSocket?.send(JSON.stringify({ ...value, type }));
	};

	return { connect, send, close: () => webSocket?.close() };
};
