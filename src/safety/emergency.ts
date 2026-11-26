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

const PRE_NEGATION_WORDS = new Set([
  "no",
  "not",
  "without",
  "never",
  "denies",
  "koi",
  "koyi",
  "bilkul",
  "nahi",
  "nahin",
  "nhi",
  "na",
  "bina",
  "कोई",
  "बिल्कुल",
  "बिना",
  "नहीं",
  "नही",
  "இல்லை",
  "இல்ல",
  "இல்லாமல்",
  "எதுவும்",
  "illa",
  "illai",
  "edhuvum",
  "ethuvum",
]);

const POST_NEGATION_WORDS = new Set([
  "இல்லை",
  "இல்ல",
  "இல்லாமல்",
  "illa",
  "illai",
  "nahi",
  "nahin",
  "nhi",
  "नहीं",
  "नही",
  "ना",
  "no",
]);

const NEGATION_PHRASES = [
  "dont have",
  "don't have",
  "do not have",
  "nahi hai",
  "nahin hai",
  "nhi hai",
  "nahi h",
  "koi dikkat nahi",
  "koyi dikkat nahi",
  "kuch nahi",
  "edhuvum illai",
  "edhuvum illa",
  "ethuvum illai",
  "ethuvum illa",
  "பிரச்சனை இல்லை",
  "இல்லை என்று",
  "எதுவும் இல்லை",
  "नहीं है",
  "नही है",
  "कोई दर्द नहीं",
  "कोई समस्या नहीं",
  "कोई दिक्कत नहीं",
  "कुछ नहीं",
];

// Inability / aggravation phrases that contain "nahi" / "illai" but signify severe distress rather than symptom negation
const INABILITY_PHRASES = [
  "hawa nahi",
  "हवा नहीं",
  "bol nahi",
  "बोल नहीं",
  "band nahi",
  "बंद नहीं",
  "ruk nahi",
  "रुक नहीं",
  "uth nahi",
  "उठ नहीं",
  "saha nahi",
  "नहीं सहा",
  "nahi saha",
  "nahi mil rahi",
  "नहीं मिल रही",
  "nahi mil raha",
  "नहीं मिल रहा",
  "nahi pa rahe",
  "नहीं पा रहे",
  "nahi pa raha",
  "नहीं पा रहा",
  "nahi ho raha",
  "नहीं हो रहा",
  "nahi ho rahi",
  "नहीं हो रही",
  "nikkala",
  "nikka matenguthu",
  "mudiyala",
  "mudiyavillai",
];

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
 * Checks whether a match at `matchIndex` (length `matchLength`) in `text` is negated.
 * Evaluates both preceding words (English, Hindi pre-negation) and following words (Tamil, Hindi post-negation).
 */
function isMatchNegated(text: string, matchIndex: number, matchLength: number): boolean {
  const preceding = text.substring(0, matchIndex);
  const following = text.substring(matchIndex + matchLength);

  // 1. Check Preceding Negation (English: "no chest pain", Hindi: "koi dikkat nahi")
  const currentPreClause =
    preceding
      .split(
        /[.;!?]|\s+(?:but|aanaal|lekin|magar|aur|and|ஆனால்|ஆனால்|ஆனால்|ஆனால்|ஆனால்|ஆனால்|ஆனால்|ஆனால்|ஆனால்|लेकिन|और)\s+/iu
      )
      .pop() || "";
  const preWords = currentPreClause
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s']/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (preWords.length > 0) {
    const last3Words = preWords.slice(-3);
    const last3Phrase = last3Words.join(" ");

    for (const phrase of NEGATION_PHRASES) {
      if (last3Phrase.includes(phrase)) return true;
    }

    for (const word of last3Words) {
      if (PRE_NEGATION_WORDS.has(word)) return true;
    }

    if (preWords.length >= 4) {
      const last4Words = preWords.slice(-4);
      if (
        (last4Words[0] === "not" && last4Words[1] === "having") ||
        (last4Words[0] === "no" && last4Words[1] === "history")
      ) {
        return true;
      }
    }
  }

  // 2. Check Following Negation (Tamil/Hindi post-negation: "nenju vali illa", "seene me dard nahi hai")
  // First verify this is not an inability/aggravation phrase like "band nahi ho raha" (bleeding not stopping) or "uth nahi raha" (not waking)
  for (const inability of INABILITY_PHRASES) {
    if (following.includes(inability)) {
      return false; // Crucial: Inability phrases indicate active severe symptoms, NEVER symptom negation
    }
  }

  // Stop at punctuation or conjunctions (e.g. "and", "aur", "matrum") so we don't misinterpret subsequent clauses
  const currentPostClause =
    following.split(
      /[.;!?]|\s+(?:but|aur|and|matrum|aanaal|lekin|magar|மற்றும்|ஆனால்|और|लेकिन)\s+/iu
    )[0] || "";
  const postWords = currentPostClause
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s']/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (postWords.length > 0) {
    const first2Words = postWords.slice(0, 2);
    const first3Words = postWords.slice(0, 3);
    const first3Phrase = first3Words.join(" ");

    for (const phrase of NEGATION_PHRASES) {
      if (first3Phrase.includes(phrase)) return true;
    }

    // In true post-negation, the negation particle ("nahi", "illa", "illai", "नहीं") is attached directly (1st or 2nd word)
    for (const word of first2Words) {
      if (POST_NEGATION_WORDS.has(word)) return true;
    }
  }

  return false;
}

/**
 * Evaluates whether the provided user query describes an acute medical emergency.
 */
export function checkEmergency(text: string): EmergencyCheckResult {
  if (!text || !text.trim()) {
    return { isEmergency: false };
  }

  const normalized = normalizeEmergencyText(text);

  for (const group of EMERGENCY_PATTERN_GROUPS) {
    for (const pattern of group.patterns) {
      const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
      const regex = new RegExp(pattern.source, flags);

      let match: RegExpExecArray | null;
      while ((match = regex.exec(normalized)) !== null) {
        const matchIndex = match.index;
        const matchLength = match[0].length;

        if (!isMatchNegated(normalized, matchIndex, matchLength)) {
          return {
            isEmergency: true,
            category: group.category,
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
