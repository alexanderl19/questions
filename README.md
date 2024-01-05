# Who's Most Likely?

Who's most likely is a party game where players vote on who in their group a prompt pertains to most. In this rendition, players first enter a prompt on their device, then vote one by one on each prompt displayed. Results are displayed between prompts after voting has concluded.

> [!WARNING]
> This project is still very much a work in progress. Expect bugs, especially with the game state.

## Apps

### `web`

A SvelteKit app that connects to the Durable Object via websocket. Players use this site to start and interact with the game.

- [SvelteKit](https://kit.svelte.dev/)

### `durable-object`

A Cloudflare Workers project that contains a Durable Object class. This Durable Object uses the [Hibernatable WebSockets API](https://developers.cloudflare.com/durable-objects/learning/websockets/#websocket-hibernation) to maintain websocket connections with clients, while only incuring billing during events.

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)

## Scripts

### Build

To build the web app, run the following command:

```sh
pnpm run build
```

There is no build step for the durable-object app. To deploy to Cloudflare, run the following command:

```sh
pnpm run deploy
```

> [!IMPORTANT]  
> Cloudflare Durable Objects require a [Workers Paid plan](https://developers.cloudflare.com/durable-objects/get-started/#1-enable-durable-objects-in-the-dashboard).

### Develop

To develop all apps and packages, run the following command:

```sh
npm run dev
yarn run dev
pnpm run dev
```

### Lint

To lint all apps and packages, run the following command:

```sh
npm run lint
yarn run lint
pnpm run lint
```

## License

Copyright © 2023 Alexander Liu

[AGPL-3.0 License](./LICENSE)
