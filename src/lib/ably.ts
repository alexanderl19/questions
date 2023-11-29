import { ABLY_CLIENT_PUBLISH_KEY, ABLY_CLIENT_SUBSCRIBE_KEY } from '$env/static/private';
import * as Ably from 'ably';
import { nanoid } from 'nanoid';

const id = nanoid();

export const publish = new Ably.Realtime.Promise({
	key: ABLY_CLIENT_PUBLISH_KEY,
	clientId: id
});

export const subscribe = new Ably.Realtime.Promise({
	key: ABLY_CLIENT_SUBSCRIBE_KEY,
	clientId: id
});
