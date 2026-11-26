/**
 * SafeSteps Deterministic Lab Report Text Parser
 *
 * Rule-based parsing of pasted clinical laboratory reports.
 * Extracts test name, measured numeric value, unit, and printed reference range boundaries.
 * Lines that cannot be reliably parsed are preserved in an unparsed list without guessing.
 */

export interface ParsedReportLine {
  rawName: string;
  value: number;
  unit: string | null;
  printedLow: number | null;
  printedHigh: number | null;
  rawLine: string;
}

export interface ParseReportResult {
  results: ParsedReportLine[];
  unparsed: string[];
}

/**
 * Common non-clinical text keywords found on lab reports to ignore as unparsed
 */
const NON_RESULT_KEYWORDS = [
  "patient name",
  "patient id",
  "uhid",
  "sample date",
  "collection date",
  "reporting date",
  "referred by",
  "doctor",
  "age / sex",
  "age/sex",
  "age :",
  "age:",
  "sex :",
  "sex:",
  "gender",
  "sample type",
  "bar code",
  "barcode",
  "methodology",
  "instrument",
  "end of report",
  "interpretation",
  "comments",
  "notes:",
  "clinical notes",
  "specimen",
  "test name",
  "investigation",
  "observed value",
  "reference interval",
  "biological ref",
  "clinical laboratories",
  "diagnostic",
  "pathology",
  "laboratory",
];

/**
 * Normalises numbers from string tokens, stripping trailing flags like 'H', 'L', '*'
 */
function cleanNumber(str: string): number | null {
  const cleaned = str
    .replace(/[*#+]/g, "")
    .replace(/\s+[HLhl]$/, "")
    .replace(/^[HLhl]\s+/, "")
    .trim();
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * Parses printed reference range from a substring (e.g. "12.0 - 15.5", "(70-99)", "< 200", "> 40")
 */
function parsePrintedRange(rangeStr: string): { low: number | null; high: number | null } {
  const clean = rangeStr.replace(/[()[\]]/g, " ").trim();

  // Pattern 1: Range "12.0 - 15.5" or "12.0 to 15.5" or "70-99"
  const rangeMatch = clean.match(/^(\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?)/i);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    if (Number.isFinite(low) && Number.isFinite(high)) {
      return { low, high };
    }
  }

  // Pattern 2: Upper bound only "< 200", "<= 200", "less than 200", "upto 200"
  const upperMatch = clean.match(/^(?:<|<=|upto|up to|less than)\s*(\d+(?:\.\d+)?)/i);
  if (upperMatch) {
    const high = parseFloat(upperMatch[1]);
    if (Number.isFinite(high)) {
      return { low: 0, high };
    }
  }

  // Pattern 3: Lower bound only "> 40", ">= 40", "greater than 40"
  const lowerMatch = clean.match(/^(?:>|>=|greater than|more than)\s*(\d+(?:\.\d+)?)/i);
  if (lowerMatch) {
    const low = parseFloat(lowerMatch[1]);
    if (Number.isFinite(low)) {
      return { low, high: null };
    }
  }

  return { low: null, high: null };
}

/**
 * Parses tab-separated table rows (common when copying from tables or Excel)
 */
function parseTabDelimitedLine(line: string): ParsedReportLine | null {
  const cols = line.split("\t").map((c) => c.trim()).filter((c) => c.length > 0);
  if (cols.length < 2) return null;

  // Header row detection
  if (cols.some((c) => NON_RESULT_KEYWORDS.some((kw) => c.toLowerCase().includes(kw)))) {
    return null;
  }

  // First column is usually test name
  const rawName = cols[0];

  // Look for which column contains the numeric value
  let valueIdx = -1;
  let parsedValue: number | null = null;

  for (let i = 1; i < cols.length; i++) {
    const val = cleanNumber(cols[i]);
    if (val !== null) {
      valueIdx = i;
      parsedValue = val;
      break;
    }
  }

  if (valueIdx === -1 || parsedValue === null) {
    return null;
  }

  // Remaining columns may have unit and range
  let unit: string | null = null;
  let printedLow: number | null = null;
  let printedHigh: number | null = null;

  for (let i = valueIdx + 1; i < cols.length; i++) {
    const colText = cols[i];
    const range = parsePrintedRange(colText);
    if (range.low !== null || range.high !== null) {
      printedLow = range.low;
      printedHigh = range.high;
    } else if (!unit && /[a-zA-Z/%^]/.test(colText)) {
      unit = colText;
    }
  }

  return {
    rawName: rawName.replace(/[:]+$/, "").trim(),
    value: parsedValue,
    unit: unit || null,
    printedLow,
    printedHigh,
    rawLine: line,
  };
}

/**
 * Rule-based parser for pasted text lines containing test results.
 */
export function parseReportText(rawText: string): ParseReportResult {
  const results: ParsedReportLine[] = [];
  const unparsed: string[] = [];

  if (!rawText || typeof rawText !== "string") {
    return { results, unparsed };
  }

  const lines = rawText.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) continue;

    const lower = line.toLowerCase();

    // Check if line is purely non-clinical metadata or headers
    if (
      NON_RESULT_KEYWORDS.some((kw) => lower.startsWith(kw) || lower === kw) &&
      !line.includes(":") &&
      !/\d/.test(line)
    ) {
      unparsed.push(line);
      continue;
    }

    // Attempt tab-separated parsing first
    if (line.includes("\t")) {
      const tabParsed = parseTabDelimitedLine(line);
      if (tabParsed) {
        results.push(tabParsed);
        continue;
      }
    }

    // Pattern matching for standard text lines:
    // Handles:
    // 1. "Hemoglobin 11.2 g/dL (12.0 - 15.5)"
    // 2. "Glucose, Fasting: 126 mg/dL 70-99"
    // 3. "Platelet Count : 250 x10^3/mcL [150 - 450]"
    // 4. "Total Cholesterol : 215 mg/dL (<200)"
    // 5. "Serum Creatinine: 1.1 mg/dL"

    let workingLine = line;
    let printedLow: number | null = null;
    let printedHigh: number | null = null;

    // A. Check for trailing parenthetical or bracketed range, e.g. "(12.0 - 15.5)" or "[70 - 100]" or "(<200)"
    const parenRangeMatch = workingLine.match(/(\((?:<|>)?\s*[\d.]+\s*(?:-|–|—|to)\s*[\d.]+\s*[a-zA-Z/%^]*\)|\((?:<|<=|>|>=)\s*[\d.]+\s*\)|\[(?:<|>)?\s*[\d.]+\s*(?:-|–|—|to)\s*[\d.]+\s*[a-zA-Z/%^]*\])$/);
    if (parenRangeMatch) {
      const range = parsePrintedRange(parenRangeMatch[1]);
      printedLow = range.low;
      printedHigh = range.high;
      workingLine = workingLine.substring(0, parenRangeMatch.index).trim();
    } else {
      // B. Check for unbracketed trailing range at the end of the line: e.g. " 70-99" or " 70 - 99" or " < 200"
      const endRangeMatch = workingLine.match(/\s+((?:<|<=|>|>=)?\s*\d+(?:\.\d+)?\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?|(?:<|<=|>|>=)\s*\d+(?:\.\d+)?)$/);
      if (endRangeMatch) {
        const range = parsePrintedRange(endRangeMatch[1]);
        if (range.low !== null || range.high !== null) {
          printedLow = range.low;
          printedHigh = range.high;
          workingLine = workingLine.substring(0, endRangeMatch.index).trim();
        }
      }
    }

    // C. Extract Test Name, Value, and Unit from workingLine
    // Match test name up to a colon or up to the first standalone numeric value
    // Regex explanation:
    // ^(.*?)(?::|\s{2,}|\s+(?=\d+(?:\.\d+)?\s*([a-zA-Z/%]|$)))\s*(\d+(?:\.\d+)?(?:\s*[HLhl*#])?)\s*(.*)$
    let parsed: { name: string; valStr: string; unitStr: string } | null = null;

    // Attempt with explicit colon first: e.g. "Glucose, Fasting: 126 mg/dL"
    const colonMatch = workingLine.match(/^([^:]+):\s*([*#]?[0-9]+(?:\.[0-9]+)?\s*[HLhl*#]?)(?:\s+(.*))?$/);
    if (colonMatch) {
      parsed = {
        name: colonMatch[1].trim(),
        valStr: colonMatch[2].trim(),
        unitStr: colonMatch[3]?.trim() || "",
      };
    } else {
      // Attempt whitespace separated: e.g. "Hemoglobin 11.2 g/dL" or "Hb 14.5"
      // Find the first numeric measurement token that isn't part of the test name (like 'vitamin d3' or 't3')
      // To avoid capturing '3' in 'T3' or 'D3', we match numbers with decimals OR preceded by space/tab
      const numberMatch = workingLine.match(/^(.*?\D)\s+([*#]?[0-9]+(?:\.[0-9]+)?\s*[HLhl*#]?)(?:\s+(.*))?$/);
      if (numberMatch) {
        const candidateName = numberMatch[1].trim();
        // Guard against matching "Vitamin D3" as Name="Vitamin D", Value="3"
        const cleanCandName = candidateName.toLowerCase();
        if (cleanCandName === "vitamin d" && numberMatch[2] === "3") {
          // If followed by another number, continue
          const rest = numberMatch[3] || "";
          const secondMatch = rest.match(/^([*#]?[0-9]+(?:\.[0-9]+)?\s*[HLhl*#]?)(?:\s+(.*))?$/);
          if (secondMatch) {
            parsed = {
              name: "Vitamin D3",
              valStr: secondMatch[1].trim(),
              unitStr: secondMatch[2]?.trim() || "",
            };
          }
        } else {
          parsed = {
            name: candidateName,
            valStr: numberMatch[2].trim(),
            unitStr: numberMatch[3]?.trim() || "",
          };
        }
      }
    }

    if (parsed) {
      const lowerName = parsed.name.toLowerCase();
      if (NON_RESULT_KEYWORDS.some((kw) => lowerName.startsWith(kw) || lowerName === kw)) {
        unparsed.push(line);
        continue;
      }

      const val = cleanNumber(parsed.valStr);
      if (val !== null && parsed.name.length > 0) {
        // Clean unit string of any leftover range parts or status flags (e.g. " (H)" or " H", but NOT "g/dL")
        let unit = parsed.unitStr
          .replace(/\s*\([HLhl*#]+\)$/, "")
          .replace(/\s+[*#]+$/, "")
          .replace(/\s+[HLhl]$/, "")
          .trim() || null;
        if (unit) {
          // If unit contains numbers and hyphens (like "mg/dL 70-99" that didn't match earlier), split
          const extraRangeMatch = unit.match(/^(.*?)\s+(\d+(?:\.\d+)?\s*(?:-|–|to)\s*\d+(?:\.\d+)?)$/);
          if (extraRangeMatch) {
            unit = extraRangeMatch[1].trim() || null;
            if (printedLow === null && printedHigh === null) {
              const r = parsePrintedRange(extraRangeMatch[2]);
              printedLow = r.low;
              printedHigh = r.high;
            }
          }
        }

        results.push({
          rawName: parsed.name.replace(/[:]+$/, "").trim(),
          value: val,
          unit,
          printedLow,
          printedHigh,
          rawLine: line,
        });
        continue;
      }
    }

    // Line could not be parsed as a structured measurement
    unparsed.push(line);
  }

  return { results, unparsed };
}
