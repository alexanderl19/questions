import z from "zod";

export type InternalGameState = {
  stage: "lobby" | "write" | "respond" | "results";
  players: Map<string, { name: string; secret: string; connected: boolean }>;
  // Map<userId, prompt>
  currentPromptId: string;
  currentPromptIndex: number;
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
    secret: z.string().optional(),
  }),
  z.object({
    type: z.literal("reconnect"),
    id: z.string(),
    secret: z.string(),
  }),
  z.object({
    type: z.literal("prompt"),
    prompt: z.string(),
  }),
  z.object({
    type: z.literal("respond"),
    promptId: z.string(),
    response: z.string(),
  }),
  z.object({
    type: z.literal("stage-write"),
  }),
  z.object({
    type: z.literal("stage-respond"),
  }),
  z.object({
    type: z.literal("stage-results"),
  }),
  z.object({
    type: z.literal("stage-lobby"),
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
      type: "reconnect";
      success: true;
      name: string;
    }
  | {
      type: "reconnect";
      success: false;
      reason: "id" | "secret";
    }
  | {
      type: "prompts";
      success: false;
      reason: string;
    }
  | {
      type: "prompts";
      success: true;
    }
  | {
      type: "respond";
      success: false;
      reason: string;
    }
  | {
      type: "respond";
      success: true;
    }
  | {
      type: "state-players";
      players: [id: string, name: string][];
    }
  | {
      type: "state-write";
      promptCount: number;
      typingCount?: number;
    }
  | {
      type: "state-respond";
      promptId: string;
      promptNumber: number;
      promptText: string;
      promptsRemaining: number;
      typingCount?: number;
      promptCount: number;
    }
  | {
      type: "state-results";
      promptId: string;
      promptNumber: number;
      promptText: string;
      promptsRemaining: number;
      results: [id: string, count: number][];
    }
  | {
      type: "state-lobby";
    };
