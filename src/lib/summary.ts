/**
 * SafeSteps Doctor Visit Summary Engine
 *
 * Requirements:
 * 1. Loads conversation with ownership check and user's profile.
 * 2. Asks Gemini (prompt in src/prompts/summary.txt) to produce validated JSON:
 *    - symptoms (short list with duration)
 *    - key answers
 *    - guidance urgency
 *    - plain summary
 *    - 3 questions to ask the doctor
 * 3. The model must only restate what the user said and what the assistant advised;
 *    it must not add diagnoses, doses or new medical claims.
 * 4. Run the output guardrail (checkOutput) on it.
 * 5. Cache the result on the conversation (conversations.summary).
 * 6. Patient details taken from profile only if personalise is true;
 *    otherwise leave fields blank with an informative note.
 */

import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getGeminiClient, getGeminiModel } from "@/lib/gemini";
import { checkOutput } from "@/safety/guardrail";
import { checkSummaryRateLimit } from "@/lib/rateLimit";

export const symptomItemSchema = z.object({
  name: z.string().trim().min(1),
  duration: z.string().trim().default("Not specified"),
  details: z.string().trim().optional().default(""),
});

export const keyAnswerItemSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

export const visitSummarySchema = z.object({
  symptoms: z.array(symptomItemSchema).min(1, "At least one symptom must be identified."),
  keyAnswers: z.array(keyAnswerItemSchema).default([]),
  guidanceUrgency: z.enum(["self_care", "see_doctor_soon", "emergency"]),
  urgencyLabel: z.string().trim().min(1),
  plainSummary: z.string().trim().min(10),
  doctorQuestions: z.array(z.string().trim().min(5)).min(3).max(5),
  generatedAt: z.string().optional(),
});

export type SymptomItem = z.infer<typeof symptomItemSchema>;
export type KeyAnswerItem = z.infer<typeof keyAnswerItemSchema>;
export type VisitSummary = z.infer<typeof visitSummarySchema>;

export interface PatientDetails {
  personaliseEnabled: boolean;
  fullName: string | null;
  age: number | null;
  sex: string | null;
  allergies: string[];
  conditions: string[];
  medicines: string[];
  disclaimerNote: string;
}

export interface ConversationRecord {
  id: string;
  user_id: string;
  title: string;
  urgency: "self_care" | "see_doctor_soon" | "emergency" | null;
  language: string;
  summary?: VisitSummary | null;
  created_at: string;
  updated_at: string;
}

export interface BuildVisitSummaryResult {
  summary: VisitSummary;
  conversation: ConversationRecord;
  patientDetails: PatientDetails;
  cached: boolean;
}

/**
 * Builds safe deterministic fallback summary when model fails or is unavailable.
 */
export function buildSafeFallbackVisitSummary(
  conversation: ConversationRecord,
  messages: Array<{ role: string; content: string }>
): VisitSummary {
  const userMessages = messages.filter((m) => m.role === "user");
  const firstUserMsg = userMessages[0]?.content || "Health symptoms described.";
  const lastUserMsg = userMessages[userMessages.length - 1]?.content || "";

  const urgency = conversation.urgency || "see_doctor_soon";
  const urgencyLabel =
    urgency === "emergency"
      ? "Emergency — Seek Immediate Care (112)"
      : urgency === "see_doctor_soon"
      ? "See a doctor soon (Within 24–48 hours)"
      : "Self-care & routine monitoring";

  return {
    symptoms: [
      {
        name: conversation.title || "Reported symptoms",
        duration: "As reported during consultation",
        details: firstUserMsg.substring(0, 150),
      },
    ],
    keyAnswers: userMessages.slice(1, 4).map((m, idx) => ({
      question: `Consultation enquiry #${idx + 1}`,
      answer: m.content.substring(0, 150),
    })),
    guidanceUrgency: urgency,
    urgencyLabel,
    plainSummary: `The patient discussed ${conversation.title.toLowerCase()}. SafeSteps advised ${urgencyLabel.toLowerCase()}. Discuss this assessment and any ongoing symptoms with your doctor.`,
    doctorQuestions: [
      "Could these symptoms indicate an underlying issue that warrants physical examination?",
      "Are there any specific warning signs or symptom changes I should monitor closely?",
      "When would you recommend a follow-up review or repeat evaluation?",
    ],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Validates all text fields in a visit summary with SafeSteps clinical output guardrails.
 */
function validateSummaryWithGuardrails(summary: VisitSummary): {
  safe: boolean;
  failedReason?: string;
} {
  const plainCheck = checkOutput(summary.plainSummary);
  if (!plainCheck.safe) return { safe: false, failedReason: plainCheck.reason };

  for (const q of summary.doctorQuestions) {
    const qCheck = checkOutput(q);
    if (!qCheck.safe) return { safe: false, failedReason: qCheck.reason };
  }

  for (const s of summary.symptoms) {
    if (s.details) {
      const sCheck = checkOutput(s.details);
      if (!sCheck.safe) return { safe: false, failedReason: sCheck.reason };
    }
  }

  for (const ka of summary.keyAnswers) {
    const ansCheck = checkOutput(ka.answer);
    if (!ansCheck.safe) return { safe: false, failedReason: ansCheck.reason };
  }

  return { safe: true };
}

/**
 * Builds or retrieves the cached Doctor Visit Summary for a conversation.
 */
export async function buildVisitSummary(
  conversationId: string
): Promise<BuildVisitSummaryResult> {
  // 1. Verify authentication
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Please sign in to access consultation summaries.");
  }

  // 2. Load conversation with strict ownership check
  const { data: conversationData, error: convError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (convError || !conversationData) {
    throw new Error("Consultation not found or access denied.");
  }

  const conversation = conversationData as ConversationRecord;

  // 3. Load user profile to construct PatientDetails
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const personaliseEnabled = Boolean(profile?.personalise);
  let patientDetails: PatientDetails;

  if (personaliseEnabled && profile) {
    patientDetails = {
      personaliseEnabled: true,
      fullName: profile.full_name || user.user_metadata?.full_name || null,
      age: profile.age ?? null,
      sex: profile.sex ?? null,
      allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
      conditions: Array.isArray(profile.conditions) ? profile.conditions : [],
      medicines: Array.isArray(profile.medicines) ? profile.medicines : [],
      disclaimerNote: "Self-reported & Profile Verified",
    };
  } else {
    // Leave fields blank with informative note as required
    patientDetails = {
      personaliseEnabled: false,
      fullName: null,
      age: null,
      sex: null,
      allergies: [],
      conditions: [],
      medicines: [],
      disclaimerNote:
        "Patient details withheld (Personalisation is disabled in your profile privacy settings).",
    };
  }

  // 4. Return cached summary if already present on conversation
  if (conversation.summary) {
    const parsedCache = visitSummarySchema.safeParse(conversation.summary);
    if (parsedCache.success) {
      return {
        summary: parsedCache.data,
        conversation,
        patientDetails,
        cached: true,
      };
    }
  }

  // 5. Rate limit newly generated summaries (5 per hour per user)
  const rateLimit = checkSummaryRateLimit(user.id);
  if (!rateLimit.allowed) {
    const waitMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (60 * 1000));
    throw new Error(
      `Summary generation rate limit reached. You can generate up to 5 consultation summaries per hour. Please try again in about ${waitMinutes} minute${waitMinutes > 1 ? "s" : ""}.`
    );
  }

  // 6. Load messages ordered chronologically
  const { data: messagesData, error: msgError } = await supabase
    .from("messages")
    .select("role, content, structured, created_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (msgError || !messagesData || messagesData.length === 0) {
    throw new Error("No consultation messages recorded for this assessment.");
  }

  const messages = messagesData as Array<{ role: string; content: string }>;

  // 6. Invoke Gemini with strict restate-only prompt
  try {
    const client = getGeminiClient();
    const model = getGeminiModel();

    const promptPath = path.join(process.cwd(), "src/prompts/summary.txt");
    const systemInstruction = await fs.readFile(promptPath, "utf-8");

    const transcriptText = messages
      .map(
        (m) =>
          `${m.role === "user" ? "Patient" : "SafeSteps Assistant"}: ${m.content}`
      )
      .join("\n\n");

    const inputBlock = `CONSULTATION RECORD:
ID: ${conversation.id}
Title: ${conversation.title}
Assessed Urgency: ${conversation.urgency || "see_doctor_soon"}
Language: ${conversation.language || "en"}

TRANSCRIPT:
${transcriptText}

Generate the structured Doctor Visit Summary. Remember: Only restate facts provided by the patient and guidance given by the assistant. Never diagnose or recommend drug doses. Return JSON only.`;

    const executeCall = async (extraReprimand?: string): Promise<VisitSummary | null> => {
      const contents = [
        {
          role: "user" as const,
          parts: [
            {
              text: `${inputBlock}${extraReprimand ? `\n\n${extraReprimand}` : ""}`,
            },
          ],
        },
      ];

      const response = await client.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const raw = response.text || "{}";
      const parsed = JSON.parse(raw);
      const zodResult = visitSummarySchema.safeParse(parsed);
      return zodResult.success ? zodResult.data : null;
    };

    // 1st Attempt
    let summaryResult = await executeCall();

    if (summaryResult) {
      // Run Guardrails
      const guardrailResult = validateSummaryWithGuardrails(summaryResult);
      if (guardrailResult.safe) {
        summaryResult.generatedAt = new Date().toISOString();
        // Cache on the conversation
        await supabase
          .from("conversations")
          .update({ summary: summaryResult })
          .eq("id", conversationId)
          .eq("user_id", user.id);

        return {
          summary: summaryResult,
          conversation,
          patientDetails,
          cached: false,
        };
      }

      // Retry once if guardrail fails
      summaryResult = await executeCall(
        `SAFETY VIOLATION ALERT: Your previous draft was blocked because of: ${guardrailResult.failedReason}. DO NOT diagnose (no 'you have' or condition claims), DO NOT mention drug doses, and ONLY restate what the patient said.`
      );

      if (summaryResult) {
        const retryGuardrail = validateSummaryWithGuardrails(summaryResult);
        if (retryGuardrail.safe) {
          summaryResult.generatedAt = new Date().toISOString();
          await supabase
            .from("conversations")
            .update({ summary: summaryResult })
            .eq("id", conversationId)
            .eq("user_id", user.id);

          return {
            summary: summaryResult,
            conversation,
            patientDetails,
            cached: false,
          };
        }
      }
    }

    // Fallback if model failed or repeatedly violated guardrails
    const safeFallback = buildSafeFallbackVisitSummary(conversation, messages);
    await supabase
      .from("conversations")
      .update({ summary: safeFallback })
      .eq("id", conversationId)
      .eq("user_id", user.id);

    return {
      summary: safeFallback,
      conversation,
      patientDetails,
      cached: false,
    };
  } catch {
    // If Gemini fails, return safe fallback
    const safeFallback = buildSafeFallbackVisitSummary(conversation, messages);
    await supabase
      .from("conversations")
      .update({ summary: safeFallback })
      .eq("id", conversationId)
      .eq("user_id", user.id);

    return {
      summary: safeFallback,
      conversation,
      patientDetails,
      cached: false,
    };
  }
}
