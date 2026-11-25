/**
 * SafeSteps Chat API Route (POST /api/chat)
 *
 * Execution Order:
 * 1. Validate: Parse & validate request payload with Zod (max 20 messages, trimmed content 1-1000 chars).
 * 2. Emergency Check: Scan latest user message using checkEmergency(); if emergency, bypass LLM.
 * 3. Model Call: Load system prompt, invoke Gemini with responseMimeType="application/json",
 *    temperature 0.3, 800 token limit, 20s timeout.
 * 4. Schema Validation & Single Retry: Parse model output with Zod response schema. If invalid,
 *    retry Gemini once. Never send unvalidated model output to the browser.
 * 5. Response: Return strictly validated JSON response.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { checkEmergency } from "@/safety/emergency";
import { checkOutput } from "@/safety/guardrail";
import { getGeminiClient, getGeminiModel } from "@/lib/gemini";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  questionResponseSchema,
  resultResponseSchema,
  emergencyResponseSchema,
  QuestionResponse,
  ResultResponse,
} from "@/types/response";
import { GoogleGenAI } from "@google/genai";

// Step 1 Schema: Max 20 messages, content 1-1000 chars after trimming
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"], {
    message: "Role must be either 'user' or 'assistant'.",
  }),
  content: z
    .string({ message: "Message content must be text." })
    .trim()
    .min(1, "Message content cannot be empty.")
    .max(1000, "Message content cannot exceed 1000 characters."),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema, {
      message: "Messages must be an array of chat turns.",
    })
    .min(1, "Please provide at least one message.")
    .max(20, "Conversation history cannot exceed 20 messages."),
});

/**
 * Invokes Gemini with JSON response MIME type and configured constraints.
 */
async function callGemini(
  client: GoogleGenAI,
  model: string,
  contents: { role: string; parts: { text: string }[] }[],
  systemInstruction: string
): Promise<string> {
  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 800,
      httpOptions: {
        timeout: 20000,
      },
      abortSignal: AbortSignal.timeout(20000),
    },
  });

  return response.text || "";
}

/**
 * Validates raw model output text against the question or result schemas.
 */
function validateModelOutput(
  rawText: string
): QuestionResponse | ResultResponse | null {
  if (!rawText || !rawText.trim()) return null;

  try {
    const cleanJson = rawText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanJson);

    // Validate result shape first
    const resultCheck = resultResponseSchema.safeParse(parsed);
    if (resultCheck.success) {
      return resultCheck.data;
    }

    // Validate question shape
    const questionCheck = questionResponseSchema.safeParse(parsed);
    if (questionCheck.success) {
      return questionCheck.data;
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // -----------------------------------------------------------------------
    // Step 0: Rate Limiting Check (15 requests / minute per client IP)
    // -----------------------------------------------------------------------
    const clientIp = getClientIp(req.headers);
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      );
      return NextResponse.json(
        {
          error: "You're sending messages very quickly. Please wait a moment.",
          type: "rate_limit",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds.toString(),
            "X-RateLimit-Limit": "15",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(rateLimit.resetTime / 1000).toString(),
          },
        }
      );
    }
    // -----------------------------------------------------------------------
    // Step 1: Parse and validate request body with Zod
    // -----------------------------------------------------------------------
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body. Please check your submission." },
        { status: 400 }
      );
    }

    const parseResult = chatRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const friendlyMessage =
        parseResult.error.issues[0]?.message ||
        "Invalid message format. Each message must be between 1 and 1000 characters.";
      return NextResponse.json({ error: friendlyMessage }, { status: 400 });
    }

    const { messages } = parseResult.data;

    // -----------------------------------------------------------------------
    // Step 2: Emergency check on the latest user message BEFORE calling Gemini
    // -----------------------------------------------------------------------
    const latestUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (latestUserMessage) {
      const emergencyCheck = checkEmergency(latestUserMessage.content);
      if (emergencyCheck.isEmergency) {
        const emergencyPayload = {
          type: "emergency" as const,
          category: emergencyCheck.category || "emergency",
          reason:
            emergencyCheck.reason ||
            "Your symptoms indicate an acute situation requiring immediate emergency attention. Please call 112 immediately.",
        };
        const validEmergency = emergencyResponseSchema.parse(emergencyPayload);
        return NextResponse.json(validEmergency, { status: 200 });
      }
    }

    // -----------------------------------------------------------------------
    // Step 3: Load system prompt from src/prompts/system.txt
    // -----------------------------------------------------------------------
    let systemPrompt = "";
    try {
      const promptPath = path.join(process.cwd(), "src", "prompts", "system.txt");
      systemPrompt = await fs.readFile(promptPath, "utf-8");
    } catch {
      systemPrompt =
        "You are SafeSteps, a calm and trustworthy health guidance assistant. Provide clear, non-diagnostic guidance in valid JSON format.";
    }

    // -----------------------------------------------------------------------
    // Step 4: Create / retrieve Gemini client and model configuration
    // -----------------------------------------------------------------------
    const client = getGeminiClient();
    const model = getGeminiModel();

    // -----------------------------------------------------------------------
    // Step 5: Send system prompt & conversation contents to Gemini
    // -----------------------------------------------------------------------
    const contents = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // -----------------------------------------------------------------------
    // Step 6: Validate output schema & output guardrail with single retry
    // -----------------------------------------------------------------------
    const SAFETY_RETRY_INSTRUCTION =
      "Your previous reply broke a safety rule. Reply again without diagnoses, doses or prescriptions.";
    const SAFE_FALLBACK_MESSAGE =
      "I can share general guidance, but I can't diagnose or recommend medicines or doses. A doctor or pharmacist can advise you properly. Could you tell me more about your symptoms so I can suggest how urgent they are?";

    let validatedData: QuestionResponse | ResultResponse | null = null;

    try {
      // First attempt
      const textAttempt1 = await callGemini(client, model, contents, systemPrompt);
      const parsed1 = validateModelOutput(textAttempt1);

      if (parsed1) {
        const guardrail1 = checkOutput(parsed1);
        if (guardrail1.safe) {
          validatedData = parsed1;
        } else {
          // Log reason category ONLY - NEVER log user or unsafe content
          console.warn(`[SafeSteps Guardrail Flagged] Category: ${guardrail1.reason}`);
        }
      } else {
        console.warn("[SafeSteps API] Model output failed schema validation. Retrying once...");
      }

      // Single retry if first attempt did not pass schema or guardrail check
      if (!validatedData) {
        const retrySystemPrompt = `${systemPrompt}\n\nIMPORTANT INSTRUCTION: ${SAFETY_RETRY_INSTRUCTION}`;
        const textAttempt2 = await callGemini(client, model, contents, retrySystemPrompt);
        const parsed2 = validateModelOutput(textAttempt2);

        if (parsed2) {
          const guardrail2 = checkOutput(parsed2);
          if (guardrail2.safe) {
            validatedData = parsed2;
          } else {
            // Log reason category ONLY - NEVER log user or unsafe content
            console.warn(`[SafeSteps Guardrail Flagged on Retry] Category: ${guardrail2.reason}`);
          }
        }
      }
    } catch (apiError: unknown) {
      const err = apiError instanceof Error ? apiError : new Error(String(apiError));
      console.error(`[SafeSteps API Call Error] Type: ${err.name || "Error"}`);
      throw apiError;
    }

    // If still unsafe or unvalidated after single retry, return safe fallback response
    if (!validatedData) {
      return NextResponse.json(
        {
          type: "question",
          message: SAFE_FALLBACK_MESSAGE,
          content: SAFE_FALLBACK_MESSAGE,
        },
        { status: 200 }
      );
    }

    // Format validated response
    if (validatedData.type === "question") {
      return NextResponse.json(
        {
          type: "question",
          message: validatedData.message,
          content: validatedData.message,
        },
        { status: 200 }
      );
    }

    // Result response
    return NextResponse.json(
      {
        type: "result",
        urgency: validatedData.urgency,
        headline: validatedData.headline,
        suggests: validatedData.suggests,
        actions: validatedData.actions,
        warning_signs: validatedData.warning_signs,
        content: `${validatedData.headline}\n\n${validatedData.suggests}`,
        result: {
          urgency: validatedData.urgency,
          headline: validatedData.headline,
          suggests: validatedData.suggests,
          actions: validatedData.actions,
          warning_signs: validatedData.warning_signs,
          tier: validatedData.urgency,
          summary: validatedData.suggests,
          warningSigns: validatedData.warning_signs,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    // -----------------------------------------------------------------------
    // Error Handling: Log error type only, NEVER log user content or API key
    // -----------------------------------------------------------------------
    const errorObj = err instanceof Error ? err : new Error(String(err));
    const errorName = errorObj.name || "UnknownError";
    const errorMessage = errorObj.message || "";

    console.error(`[SafeSteps API Error] Type: ${errorName}`);

    // Rate limit or quota exceeded (HTTP 429)
    const isRateLimit =
      errorName === "RateLimitError" ||
      errorMessage.includes("429") ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.toLowerCase().includes("quota");

    if (isRateLimit) {
      return NextResponse.json(
        { error: "Service is temporarily busy. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    // Request timeout
    const isTimeout =
      errorName === "TimeoutError" ||
      errorName === "AbortError" ||
      errorMessage.toLowerCase().includes("timeout") ||
      errorMessage.toLowerCase().includes("abort");

    if (isTimeout) {
      return NextResponse.json(
        { error: "The request took too long to complete. Please try again." },
        { status: 504 }
      );
    }

    // Default error response
    return NextResponse.json(
      { error: "Sorry, something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
