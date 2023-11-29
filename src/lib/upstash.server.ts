import { UPSTASH_URL, UPSTASH_KEY } from '$env/static/private';
import { Redis } from '@upstash/redis';

export const redis = new Redis({
	url: UPSTASH_URL,
	token: UPSTASH_KEY
});
