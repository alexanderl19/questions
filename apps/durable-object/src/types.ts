import z from "zod";

export type InternalGameState = {
  stage: "lobby" | "write" | "respond" | "results";
  players: Map<string, { name: string; secret: string }>;
  // Map<userId, prompt>
  prompts: Map<string, string>;
  // Map<promptUserId, Map<respondentUserId, selectedUserId>>
  respones: Map<string, Map<string, string>>;
};

export type MutateGameStateFunction<K extends keyof InternalGameState> = (
  old: InternalGameState[K]
) => InternalGameState[K] | Promise<InternalGameState[K]>;

export const WebSocketMessageClientToServer = z.union([
  z.object({
    type: z.literal("hello"),
    name: z.string(),
  }),
  z.object({
    type: z.literal(""),
  }),
]);

export type WebSocketMessageServerToClient =
  | {
      type: "error";
      message?: unknown;
    }
  | {
      type: "hello";
      id: string;
      secret: string;
    }
  | {
      type: "state-players";
      players: [id: string, name: string][];
    }
  | {
      type: "state-write";
      typingCount: number;
      promptCount: number;
    }
  | {
      type: "state-respond";
      promptId: string;
      promptNumber: number;
      promptText: string;
      promptsRemaining: number;
      typingCount: number;
      promptCount: number;
    }
  | {
      type: "state-results";
      promptId: string;
      promptNumber: number;
      promptText: string;
      promptsRemaining: number;
      results: [id: string, count: number][];
    };
