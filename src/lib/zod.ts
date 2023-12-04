import z from 'zod';

export const GameState = z.enum(['join', 'questions', 'answer', 'results']);
export const ServerMessage = z.object({
	name: z.literal('update'),
	data: z.union([
		z.object({
			state: z.literal('join')
		}),
		z.object({
			state: z.literal('questions')
		}),
		z.object({
			state: z.literal('answer'),
			question: z.string(),
			players: z.array(z.tuple([z.string(), z.string()]))
		}),
		z.object({
			state: z.literal('results'),
			questionNumber: z.number(),
			question: z.string(),
			players: z.array(z.tuple([z.string(), z.string()])),
			results: z.array(z.tuple([z.string(), z.number()]))
		})
	])
});

export const UpstashState = z.union([
	z.object({
		state: z.literal('join')
	}),
	z.object({
		state: z.literal('questions'),
		players: z.array(z.tuple([z.string(), z.string()])),
		start: z.number()
	}),
	z.object({
		state: z.literal('answer'),
		players: z.array(z.tuple([z.string(), z.string()])),
		questions: z.array(z.tuple([z.string(), z.string()])),
		question: z.number(),
		start: z.number()
	})
]);
