/**
 * SafeSteps Lab Test Name Normalisation Module
 *
 * Normalises arbitrary test names from clinical lab reports, lowercases,
 * strips punctuation and extraneous spacing, and matches against canonical
 * aliases and abbreviations.
 */

import { CanonicalTest, COMMON_LAB_TESTS } from "./referenceRanges";

/**
 * Strips punctuation, non-alphanumeric characters, and collapses whitespace.
 */
export function cleanString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[()[\]{},:;_\-/\\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strips all spaces and punctuation to form a compact alphanumeric token.
 */
export function compactString(str: string): string {
  return cleanString(str).replace(/\s+/g, "");
}

// Build precomputed lookup indices for fast, deterministic matching
const exactCleanMap = new Map<string, CanonicalTest>();
const compactMap = new Map<string, CanonicalTest>();

// Populate maps from COMMON_LAB_TESTS
for (const test of Object.values(COMMON_LAB_TESTS)) {
  // Map canonical name
  const cleanCanonical = cleanString(test.canonicalName);
  const compactCanonical = compactString(test.canonicalName);
  exactCleanMap.set(cleanCanonical, test);
  compactMap.set(compactCanonical, test);

  // Map test ID
  exactCleanMap.set(cleanString(test.id), test);
  compactMap.set(compactString(test.id), test);

  // Map each alias
  for (const alias of test.aliases) {
    const cleanAlias = cleanString(alias);
    const compactAlias = compactString(alias);
    exactCleanMap.set(cleanAlias, test);
    compactMap.set(compactAlias, test);

    // Also support word-reversed 2-word aliases (e.g. "glucose fasting" <=> "fasting glucose")
    const words = cleanAlias.split(" ");
    if (words.length === 2) {
      const reversed = `${words[1]} ${words[0]}`;
      exactCleanMap.set(reversed, test);
      compactMap.set(reversed.replace(/\s+/g, ""), test);
    }
  }
}

/**
 * Normalises an arbitrary test name string and resolves it to a canonical test.
 *
 * @param name Raw test name from user input or parsed lab report
 * @returns The matching CanonicalTest definition, or null if unrecognised.
 */
export function normaliseTestName(name: string | null | undefined): CanonicalTest | null {
  if (!name || typeof name !== "string") {
    return null;
  }

  const rawTrimmed = name.trim();
  if (rawTrimmed.length === 0) {
    return null;
  }

  // 1. Direct clean match
  const clean = cleanString(rawTrimmed);
  if (exactCleanMap.has(clean)) {
    return exactCleanMap.get(clean)!;
  }

  // 2. Direct compact match (ignores whitespace completely, e.g. "hb a1c" -> "hba1c")
  const compact = compactString(rawTrimmed);
  if (compactMap.has(compact)) {
    return compactMap.get(compact)!;
  }

  // 3. Parenthetical sub-extraction:
  // e.g. "SGPT (ALT)" -> check "SGPT" and "ALT" individually
  // e.g. "Thyroid Stimulating Hormone (TSH)" -> check "TSH"
  const parenMatches = rawTrimmed.match(/(.*?)\((.*?)\)/);
  if (parenMatches) {
    const beforeParen = parenMatches[1].trim();
    const insideParen = parenMatches[2].trim();

    // Check inside parentheses first (often the concise abbreviation, e.g. "(ALT)")
    const insideMatch = normaliseTestName(insideParen);
    if (insideMatch) {
      return insideMatch;
    }

    // Check before parentheses (e.g. "SGPT")
    const beforeMatch = normaliseTestName(beforeParen);
    if (beforeMatch) {
      return beforeMatch;
    }
  }

  // 4. Slash separated test names: e.g. "ALT / SGPT" or "PCV / HCT"
  if (rawTrimmed.includes("/")) {
    const parts = rawTrimmed.split("/");
    for (const part of parts) {
      const match = normaliseTestName(part);
      if (match) {
        return match;
      }
    }
  }

  // 5. Common lab prefix removal: "Serum ...", "Blood ...", "Total ...", "S. ..."
  const commonPrefixes = ["serum ", "blood ", "total ", "s ", "sr "];
  for (const prefix of commonPrefixes) {
    if (clean.startsWith(prefix)) {
      const remainder = clean.substring(prefix.length).trim();
      const match = normaliseTestName(remainder);
      if (match) {
        return match;
      }
    }
  }

  // 6. Word-reversal check for general multi-word combinations (e.g. "cholesterol total")
  const words = clean.split(" ");
  if (words.length === 2) {
    const reversed = `${words[1]} ${words[0]}`;
    if (exactCleanMap.has(reversed)) {
      return exactCleanMap.get(reversed)!;
    }
    const compactReversed = reversed.replace(/\s+/g, "");
    if (compactMap.has(compactReversed)) {
      return compactMap.get(compactReversed)!;
    }
  }

  return null;
}
