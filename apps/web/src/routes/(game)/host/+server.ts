import type { RequestHandler } from './$types';
import { PUBLIC_WEBSOCKET_URL_HTTP } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const newResponse = await fetch(new URL('/new', PUBLIC_WEBSOCKET_URL_HTTP));
	const { id } = (await newResponse.json()) as { id: string };

	throw redirect(302, `/host/${id}`);
};
