/**
 * SafeSteps Lab Value Comparison Module
 *
 * Deterministically evaluates lab test values against reference ranges and
 * critical boundaries without guessing or using generative AI.
 *
 * Precedence Rule:
 * The reference range printed on the patient's own lab report ALWAYS takes
 * precedence over general default population ranges.
 */

import { CanonicalTest } from "./referenceRanges";
import { normaliseTestName } from "./normalise";

export type LabValueStatus = "normal" | "high" | "low" | "critical" | "unknown";
export type RangeSource = "report" | "general";

export interface CompareValueParams {
  test: CanonicalTest | string;
  value: number;
  unit?: string | null;
  sex?: "male" | "female" | "other" | null;
  printedLow?: number | null;
  printedHigh?: number | null;
}

export interface CompareValueResult {
  status: LabValueStatus;
  low: number | null;
  high: number | null;
  rangeSource: RangeSource;
  convertedValue?: number;
  effectiveUnit?: string;
  note?: string;
}

/**
 * Normalises unit strings for robust matching against accepted units and conversion tables.
 */
export function cleanUnitString(unit: string): string {
  return unit
    .toLowerCase()
    .replace(/[µμ]/g, "u")
    .replace(/x10\^/g, "10^")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * Bidirectional unit conversion utility for clinical lab values.
 * Converts between common measurement units (e.g. mg/dL <-> mmol/L for glucose/cholesterol,
 * mg/dL <-> umol/L for creatinine, g/dL <-> g/L for haemoglobin, etc.).
 */
export function convertLabUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  testNameOrId: string = "fasting_glucose"
): number | null {
  if (!Number.isFinite(value)) return null;
  const cleanFrom = cleanUnitString(fromUnit);
  const cleanTo = cleanUnitString(toUnit);
  if (cleanFrom === cleanTo) return value;

  const test = normaliseTestName(testNameOrId);
  const testId = test?.id || testNameOrId.toLowerCase();

  // Glucose (mg/dL <-> mmol/L)
  if (testId.includes("glucose")) {
    if (cleanFrom === "mg/dl" && cleanTo === "mmol/l") {
      return Math.round((value / 18.0182) * 10000) / 10000;
    }
    if (cleanFrom === "mmol/l" && cleanTo === "mg/dl") {
      return Math.round((value * 18.0182) * 10000) / 10000;
    }
  }

  // Cholesterol / Lipid panel (mg/dL <-> mmol/L)
  if (testId.includes("cholesterol") || testId === "ldl" || testId === "hdl") {
    if (cleanFrom === "mg/dl" && cleanTo === "mmol/l") {
      return Math.round((value / 38.67) * 10000) / 10000;
    }
    if (cleanFrom === "mmol/l" && cleanTo === "mg/dl") {
      return Math.round((value * 38.67) * 10000) / 10000;
    }
  }

  // Triglycerides (mg/dL <-> mmol/L)
  if (testId === "triglycerides") {
    if (cleanFrom === "mg/dl" && cleanTo === "mmol/l") {
      return Math.round((value / 88.57) * 10000) / 10000;
    }
    if (cleanFrom === "mmol/l" && cleanTo === "mg/dl") {
      return Math.round((value * 88.57) * 10000) / 10000;
    }
  }

  // Creatinine (mg/dL <-> umol/L)
  if (testId === "creatinine") {
    if (cleanFrom === "mg/dl" && cleanTo === "umol/l") {
      return Math.round((value * 88.4) * 10000) / 10000;
    }
    if (cleanFrom === "umol/l" && cleanTo === "mg/dl") {
      return Math.round((value / 88.4) * 10000) / 10000;
    }
  }

  // Calcium (mg/dL <-> mmol/L)
  if (testId === "calcium") {
    if (cleanFrom === "mg/dl" && cleanTo === "mmol/l") {
      return Math.round((value / 4.008) * 10000) / 10000;
    }
    if (cleanFrom === "mmol/l" && cleanTo === "mg/dl") {
      return Math.round((value * 4.008) * 10000) / 10000;
    }
  }

  // Urea (mg/dL <-> mmol/L)
  if (testId === "urea" || testId === "bun") {
    if (cleanFrom === "mg/dl" && cleanTo === "mmol/l") {
      return Math.round((value / 6.006) * 10000) / 10000;
    }
    if (cleanFrom === "mmol/l" && cleanTo === "mg/dl") {
      return Math.round((value * 6.006) * 10000) / 10000;
    }
  }

  // Haemoglobin (g/dL <-> g/L)
  if (testId === "haemoglobin") {
    if (cleanFrom === "g/dl" && cleanTo === "g/l") {
      return Math.round((value * 10) * 10000) / 10000;
    }
    if (cleanFrom === "g/l" && cleanTo === "g/dl") {
      return Math.round((value / 10) * 10000) / 10000;
    }
  }

  // Vitamin D (ng/mL <-> nmol/L)
  if (testId === "vitamin_d") {
    if (cleanFrom === "ng/ml" && cleanTo === "nmol/l") {
      return Math.round((value * 2.496) * 10000) / 10000;
    }
    if (cleanFrom === "nmol/l" && cleanTo === "ng/ml") {
      return Math.round((value / 2.496) * 10000) / 10000;
    }
  }

  return null;
}

/**
 * Deterministically compares a laboratory measurement against printed or standard reference ranges.
 */
export function compareValue({
  test,
  value,
  unit,
  sex,
  printedLow,
  printedHigh,
}: CompareValueParams): CompareValueResult {
  // 1. Strict finite number validation: Never evaluate non-finite numbers
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return {
      status: "unknown",
      low: null,
      high: null,
      rangeSource: "general",
      note: "Measurement value must be a valid, finite number.",
    };
  }

  // 2. Resolve canonical test
  const canonicalTest =
    typeof test === "string" ? normaliseTestName(test) : test;

  if (!canonicalTest) {
    return {
      status: "unknown",
      low: null,
      high: null,
      rangeSource: "general",
      note: typeof test === "string" ? `Unrecognised test: "${test}".` : "Test definition missing.",
    };
  }

  // 3. Unit validation & conversion
  let convertedValue = value;
  const targetUnit = canonicalTest.defaultUnit;
  const cleanTarget = cleanUnitString(targetUnit);
  let matchedConversion: ((val: number) => number) | null = null;

  if (unit && typeof unit === "string" && unit.trim().length > 0) {
    const rawUnit = unit.trim();
    const cleanUnit = cleanUnitString(rawUnit);

    // If unit matches default unit (case-insensitive / normalised)
    if (cleanUnit === cleanTarget) {
      convertedValue = value;
    } else {
      // Check unit conversions table
      if (canonicalTest.unitConversions) {
        for (const [convUnit, convFn] of Object.entries(canonicalTest.unitConversions)) {
          if (cleanUnitString(convUnit) === cleanUnit) {
            matchedConversion = convFn;
            break;
          }
        }
      }

      if (matchedConversion) {
        convertedValue = matchedConversion(value);
        // Round to 4 decimal places to avoid floating point math anomalies
        convertedValue = Math.round(convertedValue * 10000) / 10000;
      } else {
        // Check if unit is in acceptedUnits without explicit conversion (1:1 equivalence)
        const isEquivalent = canonicalTest.acceptedUnits.some(
          (acc) => cleanUnitString(acc) === cleanUnit
        );

        if (isEquivalent) {
          convertedValue = value;
        } else {
          // Incompatible or unknown unit: Return "unknown" instead of guessing
          return {
            status: "unknown",
            low: null,
            high: null,
            rangeSource: "general",
            note: `Incompatible or unrecognised unit "${rawUnit}" for ${canonicalTest.canonicalName}. Expected ${targetUnit} or accepted equivalents.`,
          };
        }
      }
    }
  }

  // 4. Determine reference boundaries (printed report range takes priority)
  let low: number;
  let high: number;
  let rangeSource: RangeSource;

  const hasValidPrintedLow =
    typeof printedLow === "number" && Number.isFinite(printedLow);
  const hasValidPrintedHigh =
    typeof printedHigh === "number" && Number.isFinite(printedHigh);

  if (hasValidPrintedLow && hasValidPrintedHigh) {
    low = matchedConversion ? Math.round(matchedConversion(printedLow) * 10000) / 10000 : printedLow;
    high = matchedConversion ? Math.round(matchedConversion(printedHigh) * 10000) / 10000 : printedHigh;
    rangeSource = "report";
  } else if (hasValidPrintedHigh && !hasValidPrintedLow) {
    // Handling reports with only upper limit, e.g. "< 200"
    low = 0;
    high = matchedConversion ? Math.round(matchedConversion(printedHigh) * 10000) / 10000 : printedHigh;
    rangeSource = "report";
  } else {
    // Fall back to general or sex-specific ranges from canonical test
    rangeSource = "general";
    const sexKey = sex?.toLowerCase();

    if (sexKey === "female" && canonicalTest.sexRanges?.female) {
      low = canonicalTest.sexRanges.female.low;
      high = canonicalTest.sexRanges.female.high;
    } else if (sexKey === "male" && canonicalTest.sexRanges?.male) {
      low = canonicalTest.sexRanges.male.low;
      high = canonicalTest.sexRanges.male.high;
    } else {
      low = canonicalTest.generalRange.low;
      high = canonicalTest.generalRange.high;
    }
  }

  // 5. Evaluate Critical thresholds first
  if (canonicalTest.criticalRange) {
    if (
      canonicalTest.criticalRange.low !== undefined &&
      convertedValue < canonicalTest.criticalRange.low
    ) {
      return {
        status: "critical",
        low,
        high,
        rangeSource,
        convertedValue,
        effectiveUnit: targetUnit,
        note: `Critical low alert: Measurement ${convertedValue} ${targetUnit} is below the critical threshold of ${canonicalTest.criticalRange.low} ${targetUnit}.`,
      };
    }

    if (
      canonicalTest.criticalRange.high !== undefined &&
      convertedValue > canonicalTest.criticalRange.high
    ) {
      return {
        status: "critical",
        low,
        high,
        rangeSource,
        convertedValue,
        effectiveUnit: targetUnit,
        note: `Critical high alert: Measurement ${convertedValue} ${targetUnit} exceeds the critical threshold of ${canonicalTest.criticalRange.high} ${targetUnit}.`,
      };
    }
  }

  // 6. Evaluate High / Low / Normal boundaries
  if (convertedValue < low) {
    return {
      status: "low",
      low,
      high,
      rangeSource,
      convertedValue,
      effectiveUnit: targetUnit,
    };
  }

  if (convertedValue > high) {
    return {
      status: "high",
      low,
      high,
      rangeSource,
      convertedValue,
      effectiveUnit: targetUnit,
    };
  }

  // Values exactly on or inside boundary are normal
  return {
    status: "normal",
    low,
    high,
    rangeSource,
    convertedValue,
    effectiveUnit: targetUnit,
  };
}
