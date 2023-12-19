import { Hono } from "hono";
import z from "zod";
import {
  type InternalGameState,
  type MutateGameStateFunction,
  type WebSocketMessageServerToClient,
  WebSocketMessageClientToServer,
} from "types";
import { createId } from "@paralleldrive/cuid2";

const serverToClient = (message: WebSocketMessageServerToClient) =>
  JSON.stringify(message);

export class Game {
  state: DurableObjectState;
  app: Hono = new Hono();
  getGameState: <K extends keyof InternalGameState>(
    key: K
  ) => Promise<InternalGameState[K]>;
  putGameState: <K extends keyof InternalGameState>(
    key: K,
    value: InternalGameState[K]
  ) => Promise<InternalGameState[K]>;
  mutateGameState: <K extends keyof InternalGameState>(
    key: K,
    fn: MutateGameStateFunction<K>
  ) => ReturnType<typeof this.putGameState<K>>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.getGameState = async <K extends keyof InternalGameState>(key: K) =>
      (await this.state.storage.get<InternalGameState[K]>(
        "game-state-" + key
      ))!;
    this.putGameState = async <K extends keyof InternalGameState>(
      key: K,
      value: InternalGameState[K]
    ) =>
      (await this.state.storage.put<InternalGameState[K]>(
        "game-state-" + key,
        value
      ))!;
    this.mutateGameState = async <K extends keyof InternalGameState>(
      key: K,
      fn: MutateGameStateFunction<K>
    ) => {
      return this.putGameState(key, await fn(await this.getGameState(key)));
    };

    this.state.blockConcurrencyWhile(async () => {
      await this.putGameState("stage", "lobby");
      await this.putGameState("players", new Map());
      await this.putGameState("prompts", new Map());
      await this.putGameState("respones", new Map());
    });

    this.app.get("/ws", async (c) => {
      const upgradeHeader = c.req.header("Upgrade");
      if (upgradeHeader !== "websocket") {
        return c.text("Expected websocket", 400);
      }

      const [client, server] = Object.values(new WebSocketPair());
      await this.handleSession(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    });
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }

  async handleSession(webSocket: WebSocket) {
    this.state.acceptWebSocket(webSocket);
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    let parsedMessage: z.infer<typeof WebSocketMessageClientToServer>;

    try {
      if (typeof message !== "string")
        throw new Error("Message types other than string are not supported.");

      const safeParsedMessage = WebSocketMessageClientToServer.safeParse(
        JSON.parse(message)
      );
      if (safeParsedMessage.success === false)
        throw new Error("Failed to parse message.");
      parsedMessage = safeParsedMessage.data;
    } catch (e) {
      ws.send(
        serverToClient({
          type: "error",
          message: e,
        })
      );
      return;
    }

    switch (parsedMessage.type) {
      case "hello": {
        const playerId = createId();
        const playerSecret = createId();
        const name = parsedMessage.name;

        this.mutateGameState("players", async (old) =>
          old.set(playerId, {
            name,
            secret: playerSecret,
            connected: true,
          })
        );

        ws.serializeAttachment(playerId);
        ws.send(
          serverToClient({
            type: "hello",
            id: playerId,
            secret: playerSecret,
          })
        );
        break;
      }
      case "reconnect": {
        const { id, secret } = parsedMessage;

        const player = (await this.getGameState("players")).get(id);
        if (!player) {
          ws.send(
            serverToClient({
              type: "reconnect",
              success: false,
              reason: "id",
            })
          );
        } else if (player.secret !== secret) {
          ws.send(
            serverToClient({
              type: "reconnect",
              success: false,
              reason: "secret",
            })
          );
        } else {
          ws.serializeAttachment(id);
          ws.send(
            serverToClient({
              type: "reconnect",
              success: true,
              name: player.name,
            })
          );
          this.mutateGameState("players", async (old) =>
            old.set(id, {
              name: player.name,
              secret: player.secret,
              connected: true,
            })
          );
        }
        break;
      }
      case "prompt": {
        const { prompt } = parsedMessage;
        const id: string | undefined = ws.deserializeAttachment();

        if (id) {
          this.mutateGameState("prompts", async (old) => old.set(id, prompt));

          ws.send(
            serverToClient({
              type: "prompts",
              success: true,
            })
          );
        } else {
          ws.send(
            serverToClient({
              type: "prompts",
              success: false,
              reason: "Could not identify WebSocket.",
            })
          );
        }

        break;
      }
      case "respond": {
        const { promptId, respone } = parsedMessage;

        const id: string | undefined = ws.deserializeAttachment();
        if (!id) {
          ws.send(
            serverToClient({
              type: "respond",
              success: false,
              reason: "Could not identify WebSocket.",
            })
          );
          return;
        }

        const prompts = await this.getGameState("prompts");
        if (!prompts.has(promptId)) {
          ws.send(
            serverToClient({
              type: "respond",
              success: false,
              reason: "Invalid prompt id.",
            })
          );
          return;
        }

        const players = await this.getGameState("players");
        if (!players.has(respone)) {
          ws.send(
            serverToClient({
              type: "respond",
              success: false,
              reason: "Invalid respone player id.",
            })
          );
          return;
        }

        await this.mutateGameState("respones", (old) =>
          old.set(promptId, (old.get(promptId) ?? new Map()).set(id, respone))
        );
      }
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ) {
    const id: string | undefined = ws.deserializeAttachment();

    if (id) {
      const players = await this.getGameState("players");
      const player = players.get(id);
      if (!player) {
        console.warn(
          "WebSocket closed with id, but player with that id does not exist."
        );
        return;
      }
      this.putGameState(
        "players",
        players.set(id, {
          name: player.name,
          secret: player.secret,
          connected: false,
        })
      );
    }
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    console.error("WebSocket errored with message: " + error);
  }
}
