import { z } from "zod";

/**
 * Validation schema for user query and chat inputs.
 */
export const userQuerySchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Please provide a symptom description or health question.")
    .max(2000, "Message exceeds maximum allowed length of 2000 characters."),
});

export const chatMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
  timestamp: z.number().optional(),
});

export const chatHistorySchema = z.array(chatMessageSchema).max(20);

export type UserQueryInput = z.infer<typeof userQuerySchema>;
