import { z } from "zod";

/**
 * Zod schemas for validated structured responses from SafeSteps assistant.
 * Enforces strict validation so that unvalidated model output is NEVER sent to the client.
 */

export const questionResponseSchema = z.object({
  type: z.literal("question"),
  message: z.string().min(1, "Question message cannot be empty."),
});

export const resultResponseSchema = z.object({
  type: z.literal("result"),
  urgency: z.enum(["self_care", "see_doctor_soon", "emergency"], {
    message: "Urgency must be one of: self_care, see_doctor_soon, or emergency.",
  }),
  headline: z.string().min(1, "Headline is required."),
  suggests: z.string().min(1, "Suggestion summary is required."),
  actions: z.array(z.string().min(1)).min(1, "At least one action is required."),
  warning_signs: z
    .array(z.string().min(1))
    .min(1, "At least one warning sign is required."),
});

export const emergencyResponseSchema = z.object({
  type: z.literal("emergency"),
  category: z.string().optional(),
  reason: z.string().min(1, "Emergency reason is required."),
});

export const assistantResponseSchema = z.discriminatedUnion("type", [
  questionResponseSchema,
  resultResponseSchema,
  emergencyResponseSchema,
]);

export type QuestionResponse = z.infer<typeof questionResponseSchema>;
export type ResultResponse = z.infer<typeof resultResponseSchema>;
export type EmergencyResponse = z.infer<typeof emergencyResponseSchema>;
export type AssistantResponse = z.infer<typeof assistantResponseSchema>;
