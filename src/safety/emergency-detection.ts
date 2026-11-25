import { SafetyCheckResult } from "@/types";

/**
 * High-risk red-flag keywords and emergency indicators.
 * ALL emergency detection logic is kept strictly isolated in the safety module.
 */
const EMERGENCY_PATTERNS: { regex: RegExp; reason: string }[] = [
  {
    regex: /\b(chest pain|heart attack|crushing pressure in chest|tightness in chest)\b/i,
    reason: "Possible cardiac event or severe acute chest condition.",
  },
  {
    regex: /\b(can't breathe|cannot breathe|difficulty breathing|severe shortness of breath|gasping for air|suffocating)\b/i,
    reason: "Severe acute respiratory distress.",
  },
  {
    regex: /\b(stroke|face drooping|arm weakness|slurred speech|sudden numbness|facial droop)\b/i,
    reason: "Acute neurological deficit (possible stroke).",
  },
  {
    regex: /\b(coughing up blood|vomiting blood|uncontrolled bleeding|bleeding heavily)\b/i,
    reason: "Severe acute hemorrhage.",
  },
  {
    regex: /\b(suicide|suicidal|want to end my life|kill myself|harm myself)\b/i,
    reason: "Acute mental health emergency or crisis.",
  },
  {
    regex: /\b(anaphylaxis|swollen throat|tongue swelling|closing throat|allergic reaction can't breathe)\b/i,
    reason: "Severe allergic reaction / anaphylaxis.",
  },
];

export function detectEmergency(input: string): SafetyCheckResult {
  const normalized = input.trim();

  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.regex.test(normalized)) {
      return {
        isEmergency: true,
        reason: pattern.reason,
        recommendedAction:
          "Call emergency services (such as 911) or proceed immediately to the nearest Emergency Room. Do not wait.",
        matchedKeywords: [pattern.reason],
      };
    }
  }

  return {
    isEmergency: false,
  };
}
