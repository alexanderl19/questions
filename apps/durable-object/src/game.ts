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
      await this.putGameState(
        "stage",
        (await this.getGameState("stage")) ?? "lobby"
      );
      await this.putGameState(
        "players",
        (await this.getGameState("players")) ?? new Map()
      );
      await this.putGameState(
        "prompts",
        (await this.getGameState("prompts")) ?? new Map()
      );
      await this.putGameState(
        "respones",
        (await this.getGameState("respones")) ?? new Map()
      );
      const currentPromptId = await this.getGameState("currentPromptId");
      if (currentPromptId)
        await this.putGameState("currentPromptId", currentPromptId);
      const currentPromptIndex = await this.getGameState("currentPromptIndex");
      if (currentPromptIndex)
        await this.putGameState("currentPromptIndex", currentPromptIndex);
    });

    this.app.get("/:id/ws", async (c) => {
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

  async handleSession(ws: WebSocket) {
    this.state.acceptWebSocket(ws);

    ws.send(serverToClient(await this.getStatePlayers()));
    const stage = await this.getGameState("stage");

    try {
      switch (stage) {
        case "lobby": {
          break;
        }
        case "write": {
          ws.send(
            serverToClient({
              type: "state-write",
              promptCount: (await this.getGameState("prompts")).size,
            })
          );
          break;
        }
        case "respond": {
          const promptIndex = await this.getGameState("currentPromptIndex");
          if (promptIndex === undefined) {
            throw new Error(
              "Stage set to respond, but currentPromptIndex is not set."
            );
          }
          ws.send(
            serverToClient(await this.getStateRespondMessage(promptIndex))
          );
          break;
        }
        case "results": {
          ws.send(serverToClient(await this.getStateResultsMessage()));
          break;
        }
      }
    } catch (error) {}
  }

  announce(message: WebSocketMessageServerToClient) {
    this.state
      .getWebSockets()
      .forEach((ws) => ws.send(serverToClient(message)));
  }
  async announcePlayers() {
    this.announce(await this.getStatePlayers());
  }

  getStatePlayers = async (): Promise<
    Extract<WebSocketMessageServerToClient, { type: "state-players" }>
  > => ({
    type: "state-players",
    players: Array.from((await this.getGameState("players")).entries())
      .filter(([_id, { connected }]) => connected)
      .map(([id, { name }]) => [id, name]),
  });

  async getPromptByIndex(i: number) {
    const prompts = await this.getGameState("prompts");
    const promptsArray = Array.from(prompts.entries());

    return promptsArray[i];
  }

  async getStateRespondMessage(
    i: number
  ): Promise<
    Extract<WebSocketMessageServerToClient, { type: "state-respond" }>
  > {
    const prompts = await this.getGameState("prompts");
    const promptsArray = Array.from(prompts.entries());

    return {
      type: "state-respond",
      promptId: promptsArray[i][0],
      promptNumber: i,
      promptText: promptsArray[i][1],
      promptsRemaining: promptsArray.length - 1 - i,
      promptCount: promptsArray.length,
    };
  }

  async getStateResultsMessage(): Promise<
    Extract<WebSocketMessageServerToClient, { type: "state-results" }>
  > {
    const currentPromptIndex = await this.getGameState("currentPromptIndex");
    if (currentPromptIndex === undefined) {
      throw new Error("currentPromptIndex is not set.");
    }
    const prompts = await this.getGameState("prompts");
    const promptsArray = Array.from(prompts.entries());

    const respones = await this.getGameState("respones");
    const promptId = promptsArray[currentPromptIndex][0];

    const resultsCounts = new Map();
    respones.get(promptId)?.forEach((value) => {
      resultsCounts.set(value, (resultsCounts.get(value) ?? 0) + 1);
    });

    return {
      type: "state-results",
      promptId,
      promptNumber: currentPromptIndex,
      promptText: promptsArray[currentPromptIndex][1],
      promptsRemaining: promptsArray.length - 1 - currentPromptIndex,
      results: Array.from(resultsCounts.entries()),
    };
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
        const id: string | undefined = ws.deserializeAttachment();
        const { name, secret } = parsedMessage;

        if (id) {
          const player = (await this.getGameState("players")).get(id);

          if (!player) {
            ws.send(
              serverToClient({
                type: "error",
                message: "Could not fetch player from id.",
              })
            );
            return;
          }

          if (secret === player.secret) {
            await this.mutateGameState("players", async (old) =>
              old.set(id, {
                ...player,
                name,
              })
            );
            this.announcePlayers();
          } else {
            ws.send(
              serverToClient({
                type: "error",
                message: "Incorrect secret.",
              })
            );
          }
        } else {
          const playerId = createId();
          const playerSecret = createId();

          await this.mutateGameState("players", async (old) =>
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
          this.announcePlayers();
        }
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
          this.announcePlayers();
        }
        break;
      }
      case "prompt": {
        const { prompt } = parsedMessage;
        const id: string | undefined = ws.deserializeAttachment();

        if (id) {
          await this.mutateGameState("prompts", async (old) =>
            old.set(id, prompt)
          );

          ws.send(
            serverToClient({
              type: "prompts",
              success: true,
            })
          );

          this.announce({
            type: "state-write",
            promptCount: (await this.getGameState("prompts")).size,
          });
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
        const { promptId, response } = parsedMessage;

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
        if (!players.has(response)) {
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
          old.set(promptId, (old.get(promptId) ?? new Map()).set(id, response))
        );
        break;
      }
      case "stage-write": {
        if ((await this.getGameState("stage")) === "lobby") {
          await this.putGameState("stage", "write");
          this.announce({
            type: "state-write",
            promptCount: 0,
          });
        } else {
          ws.send(
            serverToClient({
              type: "error",
              message: "Can only change stage to write from lobby.",
            })
          );
        }
        break;
      }
      case "stage-respond": {
        const currentStage = await this.getGameState("stage");
        if (!(currentStage === "write" || currentStage === "results")) {
          ws.send(
            serverToClient({
              type: "error",
              message:
                "Can only change stage to respond from write or results.",
            })
          );
          return;
        }
        const currentPromptIndex =
          await this.getGameState("currentPromptIndex");

        if (!currentPromptIndex && currentStage === "results") {
          console.error(
            "Attempted to change state from results to respond, but currentPromptIndex isn't set."
          );
          ws.send(
            serverToClient({
              type: "error",
              message:
                "Attempted to change state from results to respond, but currentPromptIndex isn't set.",
            })
          );
          return;
        }

        const promptIndex = currentPromptIndex ? currentPromptIndex + 1 : 0;
        await this.putGameState("currentPromptIndex", promptIndex);
        await this.putGameState(
          "currentPromptId",
          (await this.getPromptByIndex(promptIndex))[1]
        );
        await this.putGameState("stage", "respond");

        this.announce(await this.getStateRespondMessage(promptIndex));
        break;
      }
      case "stage-results": {
        const currentStage = await this.getGameState("stage");
        if (currentStage !== "respond") {
          ws.send(
            serverToClient({
              type: "error",
              message: "Can only change stage to results from respond.",
            })
          );
          return;
        }

        await this.putGameState("stage", "results");
        this.announce(await this.getStateResultsMessage());
        break;
      }
      case "stage-lobby": {
        const currentStage = await this.getGameState("stage");
        if (currentStage !== "results") {
          ws.send(
            serverToClient({
              type: "error",
              message: "Can only change stage to lobby from results.",
            })
          );
          return;
        }

        await this.putGameState("stage", "lobby");
        await this.putGameState("players", new Map());
        await this.putGameState("prompts", new Map());
        await this.putGameState("respones", new Map());
        await this.putGameState("currentPromptId", undefined);
        await this.putGameState("currentPromptIndex", undefined);

        this.announce({
          type: "state-lobby",
        });
        break;
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
      this.announcePlayers();
    }
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    console.error("WebSocket errored with message: " + error);
  }
}
