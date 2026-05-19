import { z } from "zod";

export const parsedItemSchema = z.object({
  kind: z.enum(["event", "task"]),
  title: z.string().min(1),
  description: z.string().default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  allDay: z.boolean(),
  timeZone: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.5),
  clarification: z.string().nullable().default(null),
  recurrence: z.string().nullable().default(null),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "ai"]),
  text: z.string(),
  item: parsedItemSchema.optional(),
});

export const parseRequestSchema = z.object({
  text: z.string().min(1),
  timezone: z.string().min(1).default("UTC"),
  preferredKind: z.enum(["event", "task"]).optional(),
  history: z.array(chatMessageSchema).optional(),
});

export const scheduleRequestSchema = z.object({
  item: parsedItemSchema,
  accessToken: z.string().optional(),
});

export type ParsedItem = z.infer<typeof parsedItemSchema>;
