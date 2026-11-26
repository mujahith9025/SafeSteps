/**
 * SafeSteps Plain-Language Report Explainer Engine
 *
 * Translates deterministic lab test values and clinical statuses into calm,
 * plain-language educational explanations using Gemini.
 *
 * Safety Constraints:
 * 1. Only receives pre-computed, validated data (name, value, unit, status, range).
 * 2. Never diagnoses, prescribes, or alters numbers.
 * 3. Enforces checkOutput() guardrails on every generated field.
 * 4. Retries once on safety violation, then falls back to safe generic templates.
 */

import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { getGeminiClient, getGeminiModel } from "@/lib/gemini";
import { checkOutput } from "@/safety/guardrail";
import { normaliseTestName } from "./normalise";

export interface ExplainerInputItem {
  id?: string;
  test_name: string;
  value_numeric: number | null;
  value_text?: string | null;
  unit: string | null;
  status: string;
  reference_low: number | null;
  reference_high: number | null;
}

export const singleExplanationSchema = z.object({
  testName: z.string().trim().min(1),
  whatItMeasures: z.string().trim().min(5),
  whatItMeans: z.string().trim().min(5),
  suggestedQuestions: z.array(z.string().trim().min(5)).optional(),
});

export const reportExplanationResultSchema = z.object({
  overallSummary: z.string().trim().min(10),
  doctorQuestions: z.array(z.string().trim().min(5)).min(1),
  explanations: z.array(singleExplanationSchema),
});

export type SingleExplanation = z.infer<typeof singleExplanationSchema>;
export type ReportExplanationResult = z.infer<typeof reportExplanationResultSchema>;

/**
 * Builds safe, deterministic fallback explanations when the model output fails guardrail validation.
 */
export function buildSafeFallbackExplanations(
  values: ExplainerInputItem[]
): ReportExplanationResult {
  const explanations: SingleExplanation[] = values.map((item) => {
    const canonical = normaliseTestName(item.test_name);
    const desc = canonical?.description || `Measures circulating levels of ${item.test_name}.`;

    let meansText = `This biomarker is within standard clinical reference benchmarks.`;
    if (item.status === "low") {
      meansText = `This biomarker is below the standard reference benchmark. A doctor can review whether dietary intake, hydration, or other factors are relevant.`;
    } else if (item.status === "high") {
      meansText = `This biomarker is above the standard reference benchmark. A doctor can evaluate this alongside other symptoms and medical history.`;
    } else if (item.status === "critical") {
      meansText = `This measurement crosses a clinical attention threshold. Please contact your doctor or primary care provider promptly.`;
    } else if (item.status === "unknown") {
      meansText = `SafeSteps could not match this measurement against general benchmarks. Please verify this result directly with your doctor.`;
    }

    return {
      testName: item.test_name,
      whatItMeasures: `${desc} This test measures ${canonical?.canonicalName || item.test_name}. Please discuss this result with your doctor.`,
      whatItMeans: meansText,
      suggestedQuestions: [
        `How does this ${item.test_name} result compare to my previous baseline tests?`,
        `Are there any follow-up blood tests or lifestyle adjustments you recommend?`,
      ],
    };
  });

  const hasCritical = values.some((v) => v.status === "critical");
  const outsideCount = values.filter((v) => v.status === "high" || v.status === "low").length;

  const summary = hasCritical
    ? `Your laboratory report includes parameters that may require prompt medical attention. Please contact your healthcare provider or GP today to review these results.`
    : outsideCount > 0
    ? `SafeSteps evaluated ${values.length} test parameters. While several markers fall outside standard reference benchmarks, your GP can interpret these numbers in the context of your complete health history.`
    : `SafeSteps evaluated ${values.length} test parameters. All examined markers fall within standard reference benchmarks. Discuss these findings with your doctor at your next routine appointment.`;

  return {
    overallSummary: summary,
    doctorQuestions: [
      "How do these results compare to my previous health baselines?",
      "Are there any specific symptoms or changes I should watch out for?",
      "When would you recommend scheduling my next routine review or blood test?",
    ],
    explanations,
  };
}

/**
 * Validates all textual fields of an explanation payload using the safety guardrail.
 */
function validateExplanationWithGuardrails(payload: ReportExplanationResult): {
  safe: boolean;
  failedReason?: string;
} {
  // Check overallSummary
  const summaryCheck = checkOutput(payload.overallSummary);
  if (!summaryCheck.safe) {
    return { safe: false, failedReason: summaryCheck.reason };
  }

  // Check doctor questions
  for (const q of payload.doctorQuestions) {
    const qCheck = checkOutput(q);
    if (!qCheck.safe) {
      return { safe: false, failedReason: qCheck.reason };
    }
  }

  // Check each test explanation
  for (const exp of payload.explanations) {
    const mCheck = checkOutput(exp.whatItMeasures);
    if (!mCheck.safe) {
      return { safe: false, failedReason: mCheck.reason };
    }

    const mnCheck = checkOutput(exp.whatItMeans);
    if (!mnCheck.safe) {
      return { safe: false, failedReason: mnCheck.reason };
    }

    if (exp.suggestedQuestions) {
      for (const sq of exp.suggestedQuestions) {
        const sqCheck = checkOutput(sq);
        if (!sqCheck.safe) {
          return { safe: false, failedReason: sqCheck.reason };
        }
      }
    }
  }

  return { safe: true };
}

/**
 * Main server function to explain report values using Gemini with guardrail protection.
 */
export async function explainReport(
  values: ExplainerInputItem[],
  profileContext?: string | null,
  language: string = "en"
): Promise<ReportExplanationResult> {
  if (!values || values.length === 0) {
    return buildSafeFallbackExplanations([]);
  }

  // 1. Prepare strictly validated data (never pass raw untrusted files or unvalidated numbers)
  const inputPayload = {
    tests: values.map((v) => ({
      testName: v.test_name,
      value: v.value_numeric ?? v.value_text,
      unit: v.unit,
      status: v.status, // "normal", "high", "low", "critical", "unknown"
      referenceRange:
        v.reference_low !== null && v.reference_high !== null
          ? `${v.reference_low} - ${v.reference_high}`
          : v.reference_high !== null
          ? `< ${v.reference_high}`
          : v.reference_low !== null
          ? `> ${v.reference_low}`
          : "Standard benchmark",
    })),
    userProfileContext: profileContext || "No additional profile context.",
    language: language || "en",
  };

  try {
    const client = getGeminiClient();
    const model = getGeminiModel();

    // Load system prompt
    const promptPath = path.join(process.cwd(), "src/prompts/reportExplain.txt");
    const systemInstruction = await fs.readFile(promptPath, "utf-8");

    // Helper to call Gemini and parse JSON
    const executeCall = async (extraGuidance?: string): Promise<ReportExplanationResult | null> => {
      const contents = [
        {
          role: "user" as const,
          parts: [
            {
              text: `Explain these validated laboratory test results for the patient following all safety directives strictly. Return JSON only.\n\nDATA:\n${JSON.stringify(
                inputPayload,
                null,
                2
              )}${extraGuidance ? `\n\n${extraGuidance}` : ""}`,
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
          temperature: 0.2, // Low temperature for factual consistency
        },
      });

      const raw = response.text || "{}";
      const parsed = JSON.parse(raw);
      const zodResult = reportExplanationResultSchema.safeParse(parsed);
      return zodResult.success ? zodResult.data : null;
    };

    // 1st Attempt
    let result = await executeCall();

    if (result) {
      // 3. Guardrail check on all generated fields
      const guardrailResult = validateExplanationWithGuardrails(result);
      if (guardrailResult.safe) {
        return result;
      }

      // Retry once if guardrail check fails
      result = await executeCall(
        `CRITICAL SAFETY REPRIMAND: Your previous attempt was blocked by clinical guardrails due to: ${guardrailResult.failedReason}. Remember: NEVER assert a diagnosis (never say 'you have', 'you suffer from'), NEVER mention doses or medicines, and ALWAYS advise discussing results with a doctor.`
      );

      if (result) {
        const retryGuardrail = validateExplanationWithGuardrails(result);
        if (retryGuardrail.safe) {
          return result;
        }
      }
    }

    // If both attempts fail guardrails or JSON validation, fall back to safe templates
    return buildSafeFallbackExplanations(values);
  } catch {
    // On any network, model, or parsing failure, return safe generic fallback
    return buildSafeFallbackExplanations(values);
  }
}
