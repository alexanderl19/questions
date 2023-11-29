import { ABLY_SERVER_KEY } from '$env/static/private';
import Ably from 'ably';

export const server = new Ably.Realtime.Promise({
	key: ABLY_SERVER_KEY,
	clientId: 'server'
});
