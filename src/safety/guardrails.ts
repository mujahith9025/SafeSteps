export const STANDARD_DISCLAIMER =
  "SafeSteps provides general health information only. It is not a doctor and does not diagnose or prescribe.";

/**
 * Output guardrail checks to ensure model outputs adhere to safety standards.
 */
export function applyOutputGuardrails(output: string): {
  sanitizedOutput: string;
  flagged: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let sanitized = output;

  // Check for prescriptive diagnostic statements
  const diagnosticPatterns = [
    /\b(you definitely have|you are diagnosed with|my diagnosis is)\b/i,
    /\b(i prescribe you|take \d+\s*(mg|pills|tablets))\b/i,
  ];

  for (const pattern of diagnosticPatterns) {
    if (pattern.test(sanitized)) {
      warnings.push("Output contained potentially prescriptive or definitive diagnostic phrasing.");
      sanitized = sanitized.replace(
        pattern,
        "It is possible you may be experiencing symptoms consistent with"
      );
    }
  }

  // Ensure disclaimer is clearly associated if not already included
  if (!sanitized.includes(STANDARD_DISCLAIMER)) {
    sanitized = `${sanitized}\n\n---\n*Disclaimer: ${STANDARD_DISCLAIMER}*`;
  }

  return {
    sanitizedOutput: sanitized,
    flagged: warnings.length > 0,
    warnings,
  };
}
