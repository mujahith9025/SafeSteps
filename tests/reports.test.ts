import { describe, it, expect } from "vitest";
import {
  COMMON_LAB_TESTS,
  normaliseTestName,
  compareValue,
  convertLabUnit,
  parseReportText,
} from "../src/reports";

describe("SafeSteps Deterministic Lab Report Explainer", () => {
  // -------------------------------------------------------------------------
  // 1. Reference Ranges Table Completeness
  // -------------------------------------------------------------------------
  describe("Reference Ranges Table (referenceRanges.ts)", () => {
    it("contains at least 30 common clinical tests with required metadata", () => {
      const keys = Object.keys(COMMON_LAB_TESTS);
      expect(keys.length).toBeGreaterThanOrEqual(30);

      // Verify all 30 tests requested by prompt are present
      const requestedTests = [
        "haemoglobin",
        "rbc",
        "wbc",
        "platelets",
        "hematocrit",
        "mcv",
        "fasting_glucose",
        "random_glucose",
        "hba1c",
        "total_cholesterol",
        "ldl",
        "hdl",
        "triglycerides",
        "creatinine",
        "urea",
        "uric_acid",
        "alt",
        "ast",
        "alp",
        "total_bilirubin",
        "tsh",
        "t3",
        "t4",
        "sodium",
        "potassium",
        "calcium",
        "vitamin_d",
        "vitamin_b12",
        "ferritin",
        "crp",
      ];

      for (const req of requestedTests) {
        expect(COMMON_LAB_TESTS[req], `Missing expected test: ${req}`).toBeDefined();
        const test = COMMON_LAB_TESTS[req];
        expect(test.canonicalName.length).toBeGreaterThan(0);
        expect(test.defaultUnit.length).toBeGreaterThan(0);
        expect(test.generalRange.low).toBeLessThan(test.generalRange.high);
        expect(test.aliases.length).toBeGreaterThan(0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // 2. Test Name Normalisation (normalise.ts)
  // -------------------------------------------------------------------------
  describe("Test Name Normalisation (normalise.ts)", () => {
    it("normalises exact canonical names", () => {
      expect(normaliseTestName("Haemoglobin")?.id).toBe("haemoglobin");
      expect(normaliseTestName("Serum Creatinine")?.id).toBe("creatinine");
      expect(normaliseTestName("Total Cholesterol")?.id).toBe("total_cholesterol");
    });

    it("normalises common abbreviations and short aliases", () => {
      expect(normaliseTestName("Hb")?.id).toBe("haemoglobin");
      expect(normaliseTestName("HGB")?.id).toBe("haemoglobin");
      expect(normaliseTestName("Hemoglobin")?.id).toBe("haemoglobin");
      expect(normaliseTestName("WBC")?.id).toBe("wbc");
      expect(normaliseTestName("TLC")?.id).toBe("wbc");
      expect(normaliseTestName("PLT")?.id).toBe("platelets");
      expect(normaliseTestName("FBS")?.id).toBe("fasting_glucose");
      expect(normaliseTestName("RBS")?.id).toBe("random_glucose");
      expect(normaliseTestName("SGPT")?.id).toBe("alt");
      expect(normaliseTestName("SGOT")?.id).toBe("ast");
      expect(normaliseTestName("TSH")?.id).toBe("tsh");
      expect(normaliseTestName("B12")?.id).toBe("vitamin_b12");
    });

    it("handles punctuation, colons, dots, and case variation", () => {
      expect(normaliseTestName("Glucose, Fasting:")?.id).toBe("fasting_glucose");
      expect(normaliseTestName("F.B.S.")?.id).toBe("fasting_glucose");
      expect(normaliseTestName("S. Creatinine")?.id).toBe("creatinine");
      expect(normaliseTestName("T.S.H.")?.id).toBe("tsh");
      expect(normaliseTestName("Hb A1c")?.id).toBe("hba1c");
      expect(normaliseTestName("25-OH Vitamin D")?.id).toBe("vitamin_d");
    });

    it("extracts test name from parenthetical expressions", () => {
      expect(normaliseTestName("SGPT (ALT)")?.id).toBe("alt");
      expect(normaliseTestName("Thyroid Stimulating Hormone (TSH)")?.id).toBe("tsh");
      expect(normaliseTestName("Packed Cell Volume (PCV)")?.id).toBe("hematocrit");
    });

    it("handles slash-separated abbreviations", () => {
      expect(normaliseTestName("ALT / SGPT")?.id).toBe("alt");
      expect(normaliseTestName("AST / SGOT")?.id).toBe("ast");
    });

    it("handles inverted word pairs", () => {
      expect(normaliseTestName("Glucose Fasting")?.id).toBe("fasting_glucose");
      expect(normaliseTestName("Cholesterol Total")?.id).toBe("total_cholesterol");
      expect(normaliseTestName("Bilirubin Total")?.id).toBe("total_bilirubin");
    });

    it("normalises extended names and full biochemical titles", () => {
      expect(normaliseTestName("Alanine Aminotransferase")?.id).toBe("alt");
      expect(normaliseTestName("Aspartate Aminotransferase")?.id).toBe("ast");
      expect(normaliseTestName("Alkaline Phosphatase")?.id).toBe("alp");
      expect(normaliseTestName("Total Triiodothyronine")?.id).toBe("t3");
      expect(normaliseTestName("Total Thyroxine")?.id).toBe("t4");
      expect(normaliseTestName("Glycated Hemoglobin")?.id).toBe("hba1c");
      expect(normaliseTestName("Erythrocyte Sedimentation Rate")?.id).toBe("esr");
    });

    it("returns null for unknown or non-clinical test names", () => {
      expect(normaliseTestName("Unknown Enzyme Q")).toBeNull();
      expect(normaliseTestName("X-Ray Left Foot")).toBeNull();
      expect(normaliseTestName("")).toBeNull();
      expect(normaliseTestName("   ")).toBeNull();
      expect(normaliseTestName(null as any)).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // 3. Comparison & Status Evaluation (compare.ts)
  // -------------------------------------------------------------------------
  describe("Comparison Logic (compare.ts)", () => {
    // A. Normal status
    it("identifies normal values within general reference ranges", () => {
      const resHb = compareValue({ test: "haemoglobin", value: 14.5 });
      expect(resHb.status).toBe("normal");
      expect(resHb.rangeSource).toBe("general");

      const resGlucose = compareValue({ test: "fasting_glucose", value: 85 });
      expect(resGlucose.status).toBe("normal");

      const resPlt = compareValue({ test: "platelets", value: 250 });
      expect(resPlt.status).toBe("normal");

      const resPotassium = compareValue({ test: "potassium", value: 4.2 });
      expect(resPotassium.status).toBe("normal");

      const resSodium = compareValue({ test: "sodium", value: 140 });
      expect(resSodium.status).toBe("normal");
    });

    // B. High status
    it("identifies high values above general reference range", () => {
      const resGlucose = compareValue({ test: "fasting_glucose", value: 126 });
      expect(resGlucose.status).toBe("high");
      expect(resGlucose.high).toBe(99);

      const resChol = compareValue({ test: "total_cholesterol", value: 240 });
      expect(resChol.status).toBe("high");

      const resAlt = compareValue({ test: "alt", value: 85 });
      expect(resAlt.status).toBe("high");

      const resTsh = compareValue({ test: "tsh", value: 8.5 });
      expect(resTsh.status).toBe("high");
    });

    // C. Low status
    it("identifies low values below general reference range", () => {
      const resHb = compareValue({ test: "haemoglobin", value: 10.5 });
      expect(resHb.status).toBe("low");
      expect(resHb.low).toBe(12.0);

      const resPlt = compareValue({ test: "platelets", value: 110 });
      expect(resPlt.status).toBe("low");

      const resVitD = compareValue({ test: "vitamin_d", value: 18 });
      expect(resVitD.status).toBe("low");

      const resPotassium = compareValue({ test: "potassium", value: 3.2 });
      expect(resPotassium.status).toBe("low");
    });

    // D. Critical low status
    it("flags critical low values requiring urgent clinical escalation", () => {
      const resHb = compareValue({ test: "haemoglobin", value: 5.8 });
      expect(resHb.status).toBe("critical");
      expect(resHb.note).toContain("Critical low");

      const resPotassium = compareValue({ test: "potassium", value: 2.4 });
      expect(resPotassium.status).toBe("critical");

      const resSodium = compareValue({ test: "sodium", value: 115 });
      expect(resSodium.status).toBe("critical");

      const resPlt = compareValue({ test: "platelets", value: 35 });
      expect(resPlt.status).toBe("critical");

      const resCalcium = compareValue({ test: "calcium", value: 6.0 });
      expect(resCalcium.status).toBe("critical");
    });

    // E. Critical high status
    it("flags critical high values requiring urgent clinical escalation", () => {
      const resGlucose = compareValue({ test: "fasting_glucose", value: 450 });
      expect(resGlucose.status).toBe("critical");
      expect(resGlucose.note).toContain("Critical high");

      const resPotassium = compareValue({ test: "potassium", value: 6.8 });
      expect(resPotassium.status).toBe("critical");

      const resCreatinine = compareValue({ test: "creatinine", value: 5.2 });
      expect(resCreatinine.status).toBe("critical");

      const resTrig = compareValue({ test: "triglycerides", value: 650 });
      expect(resTrig.status).toBe("critical");

      const resAlt = compareValue({ test: "alt", value: 420 });
      expect(resAlt.status).toBe("critical");
    });

    // F. Boundary edge values
    it("treats values exactly on reference boundary edges as normal", () => {
      // Fasting glucose range: 70 - 99
      const resExactLow = compareValue({ test: "fasting_glucose", value: 70 });
      expect(resExactLow.status).toBe("normal");

      const resExactHigh = compareValue({ test: "fasting_glucose", value: 99 });
      expect(resExactHigh.status).toBe("normal");

      // Potassium range: 3.5 - 5.0
      expect(compareValue({ test: "potassium", value: 3.5 }).status).toBe("normal");
      expect(compareValue({ test: "potassium", value: 5.0 }).status).toBe("normal");

      // Sodium range: 135 - 145
      expect(compareValue({ test: "sodium", value: 135 }).status).toBe("normal");
      expect(compareValue({ test: "sodium", value: 145 }).status).toBe("normal");
    });

    it("handles exact boundary edge values for Platelets, Calcium, and MCV", () => {
      // Platelets: 150 - 450
      expect(compareValue({ test: "platelets", value: 150 }).status).toBe("normal");
      expect(compareValue({ test: "platelets", value: 450 }).status).toBe("normal");

      // Calcium: 8.5 - 10.5
      expect(compareValue({ test: "calcium", value: 8.5 }).status).toBe("normal");
      expect(compareValue({ test: "calcium", value: 10.5 }).status).toBe("normal");

      // MCV: 80.0 - 100.0
      expect(compareValue({ test: "mcv", value: 80.0 }).status).toBe("normal");
      expect(compareValue({ test: "mcv", value: 100.0 }).status).toBe("normal");
    });

    it("flags critical thresholds for WBC, TSH, and Uric Acid", () => {
      expect(compareValue({ test: "wbc", value: 1.5 }).status).toBe("critical");
      expect(compareValue({ test: "wbc", value: 35.0 }).status).toBe("critical");
      expect(compareValue({ test: "tsh", value: 0.05 }).status).toBe("critical");
      expect(compareValue({ test: "tsh", value: 18.0 }).status).toBe("critical");
      expect(compareValue({ test: "uric_acid", value: 13.5 }).status).toBe("critical");
    });

    it("flags critical thresholds for Total Bilirubin, Vitamin D, and CRP", () => {
      expect(compareValue({ test: "total_bilirubin", value: 6.5 }).status).toBe("critical");
      expect(compareValue({ test: "vitamin_d", value: 8.0 }).status).toBe("critical");
      expect(compareValue({ test: "vitamin_d", value: 160.0 }).status).toBe("critical");
      expect(compareValue({ test: "crp", value: 65.0 }).status).toBe("critical");
    });

    // G. Printed range takes priority
    it("prefers printed report range over general default range", () => {
      // General range for glucose is 70 - 99. Value 105 is high in general,
      // but if the laboratory report specifies 70 - 110, it must be evaluated as normal!
      const resOverridden = compareValue({
        test: "fasting_glucose",
        value: 105,
        printedLow: 70,
        printedHigh: 110,
      });

      expect(resOverridden.status).toBe("normal");
      expect(resOverridden.rangeSource).toBe("report");
      expect(resOverridden.low).toBe(70);
      expect(resOverridden.high).toBe(110);
    });

    it("handles printed report range with upper threshold only (e.g. < 200)", () => {
      const resCholesterolNormal = compareValue({
        test: "total_cholesterol",
        value: 185,
        printedHigh: 200,
      });
      expect(resCholesterolNormal.status).toBe("normal");
      expect(resCholesterolNormal.rangeSource).toBe("report");

      const resCholesterolHigh = compareValue({
        test: "total_cholesterol",
        value: 215,
        printedHigh: 200,
      });
      expect(resCholesterolHigh.status).toBe("high");
      expect(resCholesterolHigh.rangeSource).toBe("report");
    });

    // H. Sex-specific ranges
    it("evaluates sex-specific ranges when sex is provided", () => {
      // Haemoglobin:
      // Female: 12.0 - 15.5
      // Male: 13.5 - 17.5
      const value = 13.0;

      const resFemale = compareValue({
        test: "haemoglobin",
        value,
        sex: "female",
      });
      expect(resFemale.status).toBe("normal");
      expect(resFemale.low).toBe(12.0);
      expect(resFemale.high).toBe(15.5);

      const resMale = compareValue({
        test: "haemoglobin",
        value,
        sex: "male",
      });
      expect(resMale.status).toBe("low");
      expect(resMale.low).toBe(13.5);
      expect(resMale.high).toBe(17.5);
    });

    it("evaluates sex-specific ranges for creatinine", () => {
      // Creatinine:
      // Male: 0.7 - 1.3
      // Female: 0.5 - 1.1
      const value = 1.2;

      const resMale = compareValue({ test: "creatinine", value, sex: "male" });
      expect(resMale.status).toBe("normal");

      const resFemale = compareValue({ test: "creatinine", value, sex: "female" });
      expect(resFemale.status).toBe("high");
    });

    it("evaluates sex-specific ranges for ferritin", () => {
      // Ferritin:
      // Male: 20 - 300
      // Female: 10 - 200
      const value = 15;

      const resFemale = compareValue({ test: "ferritin", value, sex: "female" });
      expect(resFemale.status).toBe("normal");

      const resMale = compareValue({ test: "ferritin", value, sex: "male" });
      expect(resMale.status).toBe("low");
    });

    it("evaluates sex-specific ranges for uric acid and HDL", () => {
      // Uric Acid: Male 3.5 - 7.2, Female 2.5 - 6.0
      expect(compareValue({ test: "uric_acid", value: 6.5, sex: "male" }).status).toBe("normal");
      expect(compareValue({ test: "uric_acid", value: 6.5, sex: "female" }).status).toBe("high");

      // HDL: Male 40 - 60, Female 50 - 60
      expect(compareValue({ test: "hdl", value: 45, sex: "male" }).status).toBe("normal");
      expect(compareValue({ test: "hdl", value: 45, sex: "female" }).status).toBe("low");

      // ESR: Male 0 - 15, Female 0 - 20
      expect(compareValue({ test: "esr", value: 18, sex: "male" }).status).toBe("high");
      expect(compareValue({ test: "esr", value: 18, sex: "female" }).status).toBe("normal");
    });

    // I. Unit conversion
    it("converts units properly (glucose mmol/L to mg/dL)", () => {
      // 5.0 mmol/L * 18.0182 = 90.09 mg/dL -> normal (70-99)
      const resNormal = compareValue({
        test: "fasting_glucose",
        value: 5.0,
        unit: "mmol/L",
      });
      expect(resNormal.status).toBe("normal");
      expect(resNormal.convertedValue).toBeCloseTo(90.09, 1);
      expect(resNormal.effectiveUnit).toBe("mg/dL");

      // 7.0 mmol/L * 18.0182 = 126.13 mg/dL -> high (>99)
      const resHigh = compareValue({
        test: "fasting_glucose",
        value: 7.0,
        unit: "mmol/L",
      });
      expect(resHigh.status).toBe("high");
      expect(resHigh.convertedValue).toBeCloseTo(126.13, 1);
    });

    it("converts units properly (creatinine umol/L to mg/dL)", () => {
      // 88.4 umol/L = 1.0 mg/dL -> normal (0.5 - 1.3)
      const resNormal = compareValue({
        test: "creatinine",
        value: 88.4,
        unit: "umol/L",
      });
      expect(resNormal.status).toBe("normal");
      expect(resNormal.convertedValue).toBeCloseTo(1.0, 1);

      // 450 umol/L / 88.4 = 5.09 mg/dL -> critical (>4.0)
      const resCritical = compareValue({
        test: "creatinine",
        value: 450,
        unit: "umol/L",
      });
      expect(resCritical.status).toBe("critical");
    });

    it("converts units properly (haemoglobin g/L to g/dL)", () => {
      // 145 g/L = 14.5 g/dL -> normal
      const res = compareValue({
        test: "haemoglobin",
        value: 145,
        unit: "g/L",
      });
      expect(res.status).toBe("normal");
      expect(res.convertedValue).toBe(14.5);
    });

    it("converts units properly (platelets lakh/mcL to x10^3/mcL)", () => {
      // 2.5 lakh/mcL = 250 x10^3/mcL -> normal (150-450)
      const res = compareValue({
        test: "platelets",
        value: 2.5,
        unit: "lakh/mcL",
      });
      expect(res.status).toBe("normal");
      expect(res.convertedValue).toBe(250);
    });

    it("converts units properly (cholesterol mmol/L to mg/dL)", () => {
      // 5.5 mmol/L * 38.67 = 212.68 mg/dL -> high (>200)
      const res = compareValue({
        test: "total_cholesterol",
        value: 5.5,
        unit: "mmol/L",
      });
      expect(res.status).toBe("high");
      expect(res.convertedValue).toBeCloseTo(212.69, 0);
    });

    it("converts units properly (vitamin D nmol/L to ng/mL)", () => {
      // 75 nmol/L / 2.496 = 30.05 ng/mL -> normal (30-100)
      const res = compareValue({
        test: "vitamin_d",
        value: 75,
        unit: "nmol/L",
      });
      expect(res.status).toBe("normal");
      expect(res.convertedValue).toBeCloseTo(30.05, 1);
    });

    it("converts units bidirectionally: mg/dL to mmol/L and vice versa (convertLabUnit)", () => {
      // 1. Glucose: mg/dL -> mmol/L
      const glucoseMmol = convertLabUnit(90, "mg/dL", "mmol/L", "glucose");
      expect(glucoseMmol).toBeCloseTo(4.995, 2);

      // 2. Glucose: mmol/L -> mg/dL
      const glucoseMg = convertLabUnit(5.0, "mmol/L", "mg/dL", "fasting_glucose");
      expect(glucoseMg).toBeCloseTo(90.09, 1);

      // 3. Cholesterol: mg/dL -> mmol/L
      const cholMmol = convertLabUnit(200, "mg/dL", "mmol/L", "total_cholesterol");
      expect(cholMmol).toBeCloseTo(5.17, 2);

      // 4. Cholesterol: mmol/L -> mg/dL
      const cholMg = convertLabUnit(5.2, "mmol/L", "mg/dL", "ldl");
      expect(cholMg).toBeCloseTo(201.08, 1);

      // 5. Triglycerides: mmol/L -> mg/dL
      const trigMg = convertLabUnit(1.7, "mmol/L", "mg/dL", "triglycerides");
      expect(trigMg).toBeCloseTo(150.57, 1);

      // 6. Creatinine: mg/dL -> umol/L and umol/L -> mg/dL
      expect(convertLabUnit(1.0, "mg/dL", "umol/L", "creatinine")).toBe(88.4);
      expect(convertLabUnit(88.4, "umol/L", "mg/dL", "creatinine")).toBe(1.0);

      // 7. Calcium: mg/dL <-> mmol/L
      expect(convertLabUnit(9.5, "mg/dL", "mmol/L", "calcium")).toBeCloseTo(2.37, 2);
      expect(convertLabUnit(2.4, "mmol/L", "mg/dL", "calcium")).toBeCloseTo(9.62, 1);

      // 8. Same units return exact value
      expect(convertLabUnit(100, "mg/dL", "mg/dL", "glucose")).toBe(100);

      // 9. Incompatible or invalid conversion returns null
      expect(convertLabUnit(100, "mg/dL", "kg/m^2", "glucose")).toBeNull();
      expect(convertLabUnit(NaN, "mg/dL", "mmol/L", "glucose")).toBeNull();
    });

    it("converts printed report range when input unit differs from canonical default", () => {
      // Fasting glucose in mmol/L with printed range also in mmol/L (3.9 - 5.5)
      // 5.0 mmol/L should be normal because 3.9 <= 5.0 <= 5.5
      const res = compareValue({
        test: "fasting_glucose",
        value: 5.0,
        unit: "mmol/L",
        printedLow: 3.9,
        printedHigh: 5.5,
      });

      expect(res.status).toBe("normal");
      expect(res.rangeSource).toBe("report");
      // 5.0 mmol/L * 18.0182 = 90.091 mg/dL
      expect(res.convertedValue).toBeCloseTo(90.09, 1);
      // 3.9 * 18.0182 = 70.27 mg/dL
      expect(res.low).toBeCloseTo(70.27, 1);
      // 5.5 * 18.0182 = 99.10 mg/dL
      expect(res.high).toBeCloseTo(99.10, 1);
    });

    // J. Unknown or incompatible unit handling
    it("returns 'unknown' status instead of guessing for incompatible units", () => {
      const res = compareValue({
        test: "fasting_glucose",
        value: 95,
        unit: "kg/m^2", // completely incompatible unit
      });
      expect(res.status).toBe("unknown");
      expect(res.note).toContain("Incompatible or unrecognised unit");
    });

    // K. Non-finite value validation
    it("never returns a status for non-finite values", () => {
      expect(compareValue({ test: "haemoglobin", value: NaN }).status).toBe("unknown");
      expect(compareValue({ test: "haemoglobin", value: Infinity }).status).toBe("unknown");
      expect(compareValue({ test: "haemoglobin", value: -Infinity }).status).toBe("unknown");
      expect(compareValue({ test: "haemoglobin", value: "12.5" as any }).status).toBe("unknown");
    });

    // L. Unknown test handling
    it("returns 'unknown' status for unregistered test names", () => {
      const res = compareValue({ test: "NonExistentLabTest", value: 50 });
      expect(res.status).toBe("unknown");
      expect(res.note).toContain("Unrecognised test");
    });
  });

  // -------------------------------------------------------------------------
  // 4. Report Text Parsing (parseText.ts)
  // -------------------------------------------------------------------------
  describe("Report Text Parser (parseText.ts)", () => {
    it("parses lines with parentheses: 'Hemoglobin 11.2 g/dL (12.0 - 15.5)'", () => {
      const text = "Hemoglobin 11.2 g/dL (12.0 - 15.5)";
      const { results, unparsed } = parseReportText(text);

      expect(results.length).toBe(1);
      expect(unparsed.length).toBe(0);

      const r = results[0];
      expect(r.rawName).toBe("Hemoglobin");
      expect(r.value).toBe(11.2);
      expect(r.unit).toBe("g/dL");
      expect(r.printedLow).toBe(12.0);
      expect(r.printedHigh).toBe(15.5);
    });

    it("parses lines with colon and range: 'Glucose, Fasting: 126 mg/dL  70-99'", () => {
      const text = "Glucose, Fasting: 126 mg/dL  70-99";
      const { results, unparsed } = parseReportText(text);

      expect(results.length).toBe(1);
      expect(unparsed.length).toBe(0);

      const r = results[0];
      expect(r.rawName).toBe("Glucose, Fasting");
      expect(r.value).toBe(126);
      expect(r.unit).toBe("mg/dL");
      expect(r.printedLow).toBe(70);
      expect(r.printedHigh).toBe(99);
    });

    it("parses tab-separated table lines: 'Platelet Count\\t250\\tx10^3/mcL\\t150 - 450'", () => {
      const text = "Platelet Count\t250\tx10^3/mcL\t150 - 450";
      const { results, unparsed } = parseReportText(text);

      expect(results.length).toBe(1);
      expect(unparsed.length).toBe(0);

      const r = results[0];
      expect(r.rawName).toBe("Platelet Count");
      expect(r.value).toBe(250);
      expect(r.unit).toBe("x10^3/mcL");
      expect(r.printedLow).toBe(150);
      expect(r.printedHigh).toBe(450);
    });

    it("parses upper-bound ranges with symbols: 'Total Cholesterol: 215 mg/dL (<200)'", () => {
      const text = "Total Cholesterol: 215 mg/dL (<200)";
      const { results } = parseReportText(text);

      expect(results.length).toBe(1);
      expect(results[0].rawName).toBe("Total Cholesterol");
      expect(results[0].value).toBe(215);
      expect(results[0].printedLow).toBe(0);
      expect(results[0].printedHigh).toBe(200);
    });

    it("parses decimal values and ranges: 'TSH : 2.45 uIU/mL (0.40 - 4.50)'", () => {
      const text = "TSH : 2.45 uIU/mL (0.40 - 4.50)";
      const { results } = parseReportText(text);

      expect(results.length).toBe(1);
      expect(results[0].rawName).toBe("TSH");
      expect(results[0].value).toBe(2.45);
      expect(results[0].unit).toBe("uIU/mL");
      expect(results[0].printedLow).toBe(0.4);
      expect(results[0].printedHigh).toBe(4.5);
    });

    it("parses test line without printed reference range: 'Serum Creatinine: 1.1 mg/dL'", () => {
      const text = "Serum Creatinine: 1.1 mg/dL";
      const { results } = parseReportText(text);

      expect(results.length).toBe(1);
      expect(results[0].rawName).toBe("Serum Creatinine");
      expect(results[0].value).toBe(1.1);
      expect(results[0].unit).toBe("mg/dL");
      expect(results[0].printedLow).toBeNull();
      expect(results[0].printedHigh).toBeNull();
    });

    it("parses lines with square brackets and 'to': 'Fasting Blood Sugar: 95 mg/dL [70 to 99]'", () => {
      const text = "Fasting Blood Sugar: 95 mg/dL [70 to 99]";
      const { results, unparsed } = parseReportText(text);

      expect(results.length).toBe(1);
      expect(unparsed.length).toBe(0);
      expect(results[0].rawName).toBe("Fasting Blood Sugar");
      expect(results[0].value).toBe(95);
      expect(results[0].unit).toBe("mg/dL");
      expect(results[0].printedLow).toBe(70);
      expect(results[0].printedHigh).toBe(99);
    });

    it("parses lines with lower bound inequalities: 'HDL Cholesterol: 52 mg/dL (> 40)'", () => {
      const text = "HDL Cholesterol: 52 mg/dL (> 40)";
      const { results, unparsed } = parseReportText(text);

      expect(results.length).toBe(1);
      expect(unparsed.length).toBe(0);
      expect(results[0].rawName).toBe("HDL Cholesterol");
      expect(results[0].value).toBe(52);
      expect(results[0].unit).toBe("mg/dL");
      expect(results[0].printedLow).toBe(40);
      expect(results[0].printedHigh).toBeNull();
    });

    it("parses lines with compact hyphenated ranges: 'Total Leukocyte Count: 6800 /mcL 4000-11000'", () => {
      const text = "Total Leukocyte Count: 6800 /mcL 4000-11000";
      const { results } = parseReportText(text);

      expect(results.length).toBe(1);
      expect(results[0].rawName).toBe("Total Leukocyte Count");
      expect(results[0].value).toBe(6800);
      expect(results[0].unit).toBe("/mcL");
      expect(results[0].printedLow).toBe(4000);
      expect(results[0].printedHigh).toBe(11000);
    });

    it("places non-test headers and disclaimers into unparsed list", () => {
      const multiLine = `
        METROPOLIS CLINICAL LABORATORIES
        Patient Name: Ananya Patel
        Age/Sex: 34 Y / Female
        Collection Date: 25-Nov-2026
        Hemoglobin 11.2 g/dL (12.0 - 15.5)
        Fasting Glucose: 126 mg/dL 70-99
        Serum Creatinine 0.9 mg/dL 0.5 - 1.1
        Methodology: Hexokinase enzymatic assay
        *** End of Report ***
      `;

      const { results, unparsed } = parseReportText(multiLine);

      // Should extract 3 valid lab tests
      expect(results.length).toBe(3);
      expect(results[0].rawName).toBe("Hemoglobin");
      expect(results[1].rawName).toBe("Fasting Glucose");
      expect(results[2].rawName).toBe("Serum Creatinine");

      // Non-result lines should be preserved in unparsed
      expect(unparsed.length).toBeGreaterThanOrEqual(4);
      expect(unparsed.some((u) => u.includes("Patient Name"))).toBe(true);
      expect(unparsed.some((u) => u.includes("End of Report"))).toBe(true);
      expect(unparsed.some((u) => u.includes("Methodology"))).toBe(true);
    });

    it("handles empty or whitespace-only inputs gracefully", () => {
      expect(parseReportText("").results).toEqual([]);
      expect(parseReportText("   \n\n  ").results).toEqual([]);
      expect(parseReportText(null as any).results).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // 5. End-to-End Deterministic Pipeline (parse -> normalise -> compare)
  // -------------------------------------------------------------------------
  describe("End-to-End Parsing & Comparison Pipeline", () => {
    it("parses lines and deterministically classifies them end-to-end", () => {
      const reportText = `
        Hemoglobin 11.2 g/dL (12.0 - 15.5)
        Glucose, Fasting: 126 mg/dL 70-99
        Platelet Count 42 x10^3/mcL 150 - 450
        Potassium: 4.2 mEq/L 3.5 - 5.0
      `;

      const { results, unparsed } = parseReportText(reportText);
      expect(results.length).toBe(4);
      expect(unparsed.length).toBe(0);

      // 1. Hemoglobin: 11.2 (low)
      const res0 = compareValue({
        test: results[0].rawName,
        value: results[0].value,
        unit: results[0].unit,
        printedLow: results[0].printedLow,
        printedHigh: results[0].printedHigh,
      });
      expect(res0.status).toBe("low");
      expect(res0.rangeSource).toBe("report");

      // 2. Fasting Glucose: 126 (high)
      const res1 = compareValue({
        test: results[1].rawName,
        value: results[1].value,
        unit: results[1].unit,
        printedLow: results[1].printedLow,
        printedHigh: results[1].printedHigh,
      });
      expect(res1.status).toBe("high");

      // 3. Platelet Count: 42 (< 50 critical low)
      const res2 = compareValue({
        test: results[2].rawName,
        value: results[2].value,
        unit: results[2].unit,
        printedLow: results[2].printedLow,
        printedHigh: results[2].printedHigh,
      });
      expect(res2.status).toBe("critical");

      // 4. Potassium: 4.2 (normal)
      const res3 = compareValue({
        test: results[3].rawName,
        value: results[3].value,
        unit: results[3].unit,
        printedLow: results[3].printedLow,
        printedHigh: results[3].printedHigh,
      });
      expect(res3.status).toBe("normal");
    });
  });
});
