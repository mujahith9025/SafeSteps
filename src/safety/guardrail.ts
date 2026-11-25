/**
 * SafeSteps AI Output Guardrail Module
 *
 * Scans AI-generated responses BEFORE they are delivered to the user to guarantee
 * zero clinical safety violations:
 * 1. Dosage patterns (e.g., numbers with mg, ml, tablets, pills, or dosing frequency)
 * 2. Diagnosis assertions (e.g., "you have [condition]", "you are suffering from")
 * 3. Prescription language (e.g., "I prescribe", "you should take [medicine]")
 * 4. Leaked instructions (e.g., "system prompt", "my instructions")
 */

import {
  DOSAGE_PATTERNS,
  DIAGNOSIS_PATTERNS,
  PRESCRIPTION_PATTERNS,
  LEAKED_INSTRUCTION_PATTERNS,
  HARMLESS_YOU_HAVE_FOLLOWING,
  HARMLESS_YOU_HAVE_PRECEDING,
} from "./guardrailPatterns";

export interface GuardrailCheckResult {
  safe: boolean;
  reason?: "dosage" | "diagnosis" | "prescription" | "leaked_instructions";
}

/**
 * Extracts all text values from the structured response payload.
 * Checks message, headline, suggests, actions, and warning_signs.
 */
function extractResponseTexts(response: unknown): string[] {
  if (!response) return [];

  if (typeof response === "string") {
    return [response];
  }

  const texts: string[] = [];
  const obj = response as Record<string, unknown>;

  if (typeof obj.message === "string" && obj.message.trim()) {
    texts.push(obj.message.trim());
  }

  if (typeof obj.headline === "string" && obj.headline.trim()) {
    texts.push(obj.headline.trim());
  }

  if (typeof obj.suggests === "string" && obj.suggests.trim()) {
    texts.push(obj.suggests.trim());
  }

  if (Array.isArray(obj.actions)) {
    for (const action of obj.actions) {
      if (typeof action === "string" && action.trim()) {
        texts.push(action.trim());
      }
    }
  } else if (typeof obj.actions === "string" && obj.actions.trim()) {
    texts.push(obj.actions.trim());
  }

  if (Array.isArray(obj.warning_signs)) {
    for (const sign of obj.warning_signs) {
      if (typeof sign === "string" && sign.trim()) {
        texts.push(sign.trim());
      }
    }
  } else if (typeof obj.warning_signs === "string" && obj.warning_signs.trim()) {
    texts.push(obj.warning_signs.trim());
  }

  if (typeof obj.content === "string" && obj.content.trim()) {
    texts.push(obj.content.trim());
  }

  return texts;
}

/**
 * Checks whether an assertive "you have" occurrence is diagnostic or harmless.
 * Returns true if an assertive diagnosis pattern is detected.
 */
function containsAssertiveYouHave(text: string): boolean {
  const youHaveRegex = /\byou\s+have\b/gi;
  let match: RegExpExecArray | null;

  while ((match = youHaveRegex.exec(text)) !== null) {
    const matchIndex = match.index;

    // Check preceding words (e.g. "if you have", "whether you have", "ensure you have", "hear that you have")
    const precedingText = text.substring(Math.max(0, matchIndex - 50), matchIndex).toLowerCase().trim();
    const isPrecededByHarmless = HARMLESS_YOU_HAVE_PRECEDING.some((word) => {
      const pattern = new RegExp(`(?:^|\\b)${word}\\s*(?:any\\s+|a\\s+)?$`, "i");
      return pattern.test(precedingText);
    });

    if (isPrecededByHarmless) {
      continue;
    }

    // Check following words (e.g. "you have mentioned", "you have been", "you have had")
    const followingText = text.substring(matchIndex + match[0].length).toLowerCase().trim();
    const isFollowedByHarmless = HARMLESS_YOU_HAVE_FOLLOWING.some((word) => {
      const pattern = new RegExp(`^(?:any\\s+)?${word}\\b`, "i");
      return pattern.test(followingText);
    });

    if (isFollowedByHarmless) {
      continue;
    }

    // If neither harmless preceding nor following applies, this is an assertive "you have [condition]"
    return true;
  }

  return false;
}

/**
 * Validates an AI response before transmission to the user.
 *
 * Checks all text fields of the response (message, headline, suggests, actions, warning_signs) for:
 * 1. Prescription language (I prescribe, you should take [drug], start taking antibiotics)
 * 2. Leaked instructions (system prompt, my instructions, role: you are safesteps)
 * 3. Dosage patterns (mg, mcg, ml, tablets, pills, capsules, drops, every 6 hours with medicine)
 * 4. Diagnosis assertions (you have [condition], you are suffering from, this is definitely)
 *
 * @param response QuestionResponse, ResultResponse, or raw response object/string
 * @returns { safe: boolean; reason?: string }
 */
export function checkOutput(response: unknown): GuardrailCheckResult {
  const texts = extractResponseTexts(response);

  if (texts.length === 0) {
    return { safe: true };
  }

  for (const text of texts) {
    // 1. Check Prescription Language
    for (const pattern of PRESCRIPTION_PATTERNS) {
      if (pattern.test(text)) {
        return { safe: false, reason: "prescription" };
      }
    }

    // 2. Check Leaked Instructions
    for (const pattern of LEAKED_INSTRUCTION_PATTERNS) {
      if (pattern.test(text)) {
        return { safe: false, reason: "leaked_instructions" };
      }
    }

    // 3. Check Dosage Patterns
    for (const pattern of DOSAGE_PATTERNS) {
      if (pattern.test(text)) {
        return { safe: false, reason: "dosage" };
      }
    }

    // 4. Check Diagnosis Assertions
    for (const pattern of DIAGNOSIS_PATTERNS) {
      if (pattern.test(text)) {
        return { safe: false, reason: "diagnosis" };
      }
    }

    if (containsAssertiveYouHave(text)) {
      return { safe: false, reason: "diagnosis" };
    }
  }

  return { safe: true };
}
