/**
 * SafeSteps Emergency Detection Module
 *
 * Runs on the server BEFORE any AI call, ensuring critical red-flag symptoms
 * are caught even if external AI services or network connections are down.
 *
 * CLINICAL SAFETY PRINCIPLE:
 * Prefer false alarms over missed emergencies.
 * High sensitivity is strictly prioritized to protect patient safety.
 */

import { EMERGENCY_PATTERN_GROUPS } from "./emergencyPatterns";

export interface EmergencyCheckResult {
  isEmergency: boolean;
  category?: string;
  reason?: string;
}

const NEGATION_WORDS = new Set(["no", "not", "without", "never", "denies"]);
const NEGATION_PHRASES = ["dont have", "don't have", "do not have"];

/**
 * Normalizes input text: lowercase, trim, collapse repeated spaces,
 * remove disruptive punctuation, and normalize common contractions and variations.
 */
export function normalizeEmergencyText(text: string): string {
  if (!text) return "";

  let normalized = text.toLowerCase().trim();

  // Normalize contractions and common compound words
  normalized = normalized
    .replace(/\bcan['’]t\b/g, "cannot")
    .replace(/\bwon['’]t\b/g, "wont")
    .replace(/\bdon['’]t\b/g, "dont")
    .replace(/\bheartattack\b/g, "heart attack")
    .replace(/\bchestpain\b/g, "chest pain")
    .replace(/\bselfharm\b/g, "self harm");

  // Collapse repeated punctuation to single punctuation mark
  normalized = normalized.replace(/([.?!,;])\1+/g, "$1");

  // Collapse multiple whitespaces
  normalized = normalized.replace(/\s+/g, " ");

  return normalized;
}

/**
 * Checks whether a match at `matchIndex` in `text` is negated by one of:
 * "no", "not", "without", "never", "don't have", "denies" appearing within
 * 3 words before the matched phrase.
 *
 * Sentence boundaries (., ;, !, ?, or 'but') reset negation scope.
 */
function isMatchNegated(text: string, matchIndex: number): boolean {
  const preceding = text.substring(0, matchIndex);

  // Extract only the current clause (negation does not cross clause boundaries or 'but')
  const currentClause = preceding.split(/[.;!?]|\bbut\b/i).pop() || "";

  // Extract individual words
  const words = currentClause
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return false;

  // Check the last 3 words before the match
  const last3Words = words.slice(-3);
  const last3Phrase = last3Words.join(" ");

  // Check multi-word negation phrases
  for (const phrase of NEGATION_PHRASES) {
    if (last3Phrase.includes(phrase)) {
      return true;
    }
  }

  // Check single negation words within 3 words
  for (const word of last3Words) {
    if (NEGATION_WORDS.has(word)) {
      return true;
    }
  }

  // Extended negation for compound phrases like "not having thoughts of"
  if (words.length >= 4) {
    const last4Words = words.slice(-4);
    if (
      (last4Words[0] === "not" && last4Words[1] === "having") ||
      (last4Words[0] === "no" && last4Words[1] === "history")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluates whether the provided user query describes an acute medical emergency.
 * Runs on the server BEFORE any AI call.
 *
 * @param text The latest user message content
 * @returns EmergencyCheckResult with isEmergency, category, and clinical reason
 */
export function checkEmergency(text: string): EmergencyCheckResult {
  if (!text || !text.trim()) {
    return { isEmergency: false };
  }

  const normalized = normalizeEmergencyText(text);

  // Evaluate all pattern groups
  for (const group of EMERGENCY_PATTERN_GROUPS) {
    for (const pattern of group.patterns) {
      // Ensure regex has global flag to evaluate every occurrence in the text
      const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
      const regex = new RegExp(pattern.source, flags);

      let match: RegExpExecArray | null;
      while ((match = regex.exec(normalized)) !== null) {
        const matchIndex = match.index;

        // Check if this specific match is negated
        if (!isMatchNegated(normalized, matchIndex)) {
          // Found non-negated emergency match!
          // When category is selfharm, category is strictly "selfharm"
          const category = group.category;
          return {
            isEmergency: true,
            category,
            reason: group.reason,
          };
        }
      }
    }
  }

  return {
    isEmergency: false,
  };
}
