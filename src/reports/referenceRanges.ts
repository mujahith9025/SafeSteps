/**
 * SafeSteps Deterministic Lab Report Reference Ranges
 *
 * IMPORTANT CLINICAL & EDUCATIONAL NOTICE:
 * The reference ranges defined in this table are general adult reference values intended
 * strictly for educational and supportive guidance. Reference intervals vary across clinical
 * laboratories based on testing instrumentation, reagents, analytical methodologies, altitude,
 * and specific patient populations.
 *
 * THE REFERENCE RANGE PRINTED ON THE USER'S OWN CLINICAL LABORATORY REPORT ALWAYS TAKES PRIORITY
 * over general default intervals. Every clinical value and threshold must be verified against
 * a trusted clinical reference before final submission.
 */

export interface ReferenceRange {
  low: number;
  high: number;
}

export interface SexSpecificRanges {
  male?: ReferenceRange;
  female?: ReferenceRange;
}

export interface CriticalRange {
  low?: number;
  high?: number;
}

export interface CanonicalTest {
  id: string;
  canonicalName: string;
  category:
    | "Hematology"
    | "Biochemistry"
    | "Lipid Profile"
    | "Renal Function"
    | "Liver Function"
    | "Thyroid"
    | "Electrolytes"
    | "Vitamins & Minerals"
    | "Inflammatory Markers";
  aliases: string[];
  defaultUnit: string;
  acceptedUnits: string[];
  unitConversions?: Record<string, (val: number) => number>;
  generalRange: ReferenceRange;
  sexRanges?: SexSpecificRanges;
  criticalRange?: CriticalRange;
  description: string;
}

export const COMMON_LAB_TESTS: Record<string, CanonicalTest> = {
  haemoglobin: {
    id: "haemoglobin",
    canonicalName: "Haemoglobin",
    category: "Hematology",
    aliases: [
      "hb",
      "haemoglobin",
      "hemoglobin",
      "hgb",
      "hb concentration",
      "total hemoglobin",
    ],
    defaultUnit: "g/dL",
    acceptedUnits: ["g/dL", "g/L", "mmol/L"],
    unitConversions: {
      "g/L": (val: number) => val / 10,
      "mmol/L": (val: number) => val * 1.6114,
    },
    generalRange: { low: 12.0, high: 17.5 },
    sexRanges: {
      male: { low: 13.5, high: 17.5 },
      female: { low: 12.0, high: 15.5 },
    },
    criticalRange: { low: 7.0, high: 20.0 },
    description: "Oxygen-carrying protein in red blood cells.",
  },

  rbc: {
    id: "rbc",
    canonicalName: "Red Blood Cell Count (RBC)",
    category: "Hematology",
    aliases: [
      "rbc",
      "red blood cells",
      "red blood cell count",
      "erythrocyte count",
      "total rbc",
    ],
    defaultUnit: "million/mcL",
    acceptedUnits: ["million/mcL", "x10^12/L", "x10^6/uL", "10^6/uL", "/mcL"],
    unitConversions: {
      "x10^12/L": (val: number) => val,
      "x10^6/uL": (val: number) => val,
      "10^6/uL": (val: number) => val,
      "/mcL": (val: number) => val / 1_000_000,
    },
    generalRange: { low: 4.0, high: 5.9 },
    sexRanges: {
      male: { low: 4.5, high: 5.9 },
      female: { low: 4.0, high: 5.2 },
    },
    criticalRange: { low: 2.0, high: 7.0 },
    description: "Total number of red blood cells in a microlitre of blood.",
  },

  wbc: {
    id: "wbc",
    canonicalName: "White Blood Cell Count (WBC)",
    category: "Hematology",
    aliases: [
      "wbc",
      "white blood cells",
      "white blood cell count",
      "total leukocyte count",
      "total leucocyte count",
      "tlc",
      "leukocytes",
    ],
    defaultUnit: "x10^3/mcL",
    acceptedUnits: [
      "x10^3/mcL",
      "10^3/uL",
      "x10^9/L",
      "10^9/L",
      "/mcL",
      "/uL",
      "cells/mcL",
      "cells/uL",
    ],
    unitConversions: {
      "/mcL": (val: number) => val / 1000,
      "/uL": (val: number) => val / 1000,
      "cells/mcL": (val: number) => val / 1000,
      "cells/uL": (val: number) => val / 1000,
      "x10^9/L": (val: number) => val,
      "10^9/L": (val: number) => val,
      "10^3/uL": (val: number) => val,
    },
    generalRange: { low: 4.0, high: 11.0 },
    criticalRange: { low: 2.0, high: 30.0 },
    description: "Infection-fighting immune cells in circulating blood.",
  },

  platelets: {
    id: "platelets",
    canonicalName: "Platelet Count",
    category: "Hematology",
    aliases: [
      "platelets",
      "platelet count",
      "plt",
      "thrombocytes",
      "total platelets",
    ],
    defaultUnit: "x10^3/mcL",
    acceptedUnits: [
      "x10^3/mcL",
      "10^3/uL",
      "x10^9/L",
      "10^9/L",
      "/mcL",
      "/uL",
      "lakh/mcL",
      "lakhs/mcL",
    ],
    unitConversions: {
      "/mcL": (val: number) => val / 1000,
      "/uL": (val: number) => val / 1000,
      "x10^9/L": (val: number) => val,
      "10^9/L": (val: number) => val,
      "10^3/uL": (val: number) => val,
      "lakh/mcL": (val: number) => val * 100,
      "lakhs/mcL": (val: number) => val * 100,
    },
    generalRange: { low: 150, high: 450 },
    criticalRange: { low: 50, high: 1000 },
    description: "Cell fragments essential for normal blood clotting.",
  },

  hematocrit: {
    id: "hematocrit",
    canonicalName: "Hematocrit (PCV)",
    category: "Hematology",
    aliases: [
      "hematocrit",
      "haematocrit",
      "hct",
      "pcv",
      "packed cell volume",
    ],
    defaultUnit: "%",
    acceptedUnits: ["%", "L/L", "fraction"],
    unitConversions: {
      "L/L": (val: number) => val * 100,
      fraction: (val: number) => val * 100,
    },
    generalRange: { low: 36.0, high: 52.0 },
    sexRanges: {
      male: { low: 40.0, high: 52.0 },
      female: { low: 36.0, high: 48.0 },
    },
    criticalRange: { low: 20.0, high: 60.0 },
    description: "Proportion of whole blood volume occupied by red blood cells.",
  },

  mcv: {
    id: "mcv",
    canonicalName: "Mean Corpuscular Volume (MCV)",
    category: "Hematology",
    aliases: ["mcv", "mean corpuscular volume", "mean cell volume"],
    defaultUnit: "fL",
    acceptedUnits: ["fL", "um^3"],
    generalRange: { low: 80.0, high: 100.0 },
    criticalRange: { low: 65.0, high: 120.0 },
    description: "Average physical size and volume of single red blood cells.",
  },

  fasting_glucose: {
    id: "fasting_glucose",
    canonicalName: "Fasting Blood Glucose",
    category: "Biochemistry",
    aliases: [
      "fasting glucose",
      "fasting blood sugar",
      "fbs",
      "fasting blood glucose",
      "fpg",
      "glucose fasting",
      "sugar fasting",
    ],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "mmol/L"],
    unitConversions: {
      "mmol/L": (val: number) => val * 18.0182,
    },
    generalRange: { low: 70, high: 99 },
    criticalRange: { low: 50, high: 400 },
    description: "Blood sugar concentration after an overnight 8-12 hour fast.",
  },

  random_glucose: {
    id: "random_glucose",
    canonicalName: "Random Blood Glucose",
    category: "Biochemistry",
    aliases: [
      "random glucose",
      "random blood sugar",
      "rbs",
      "random plasma glucose",
      "glucose random",
      "sugar random",
      "post prandial blood sugar",
      "ppbs",
      "postprandial glucose",
    ],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "mmol/L"],
    unitConversions: {
      "mmol/L": (val: number) => val * 18.0182,
    },
    generalRange: { low: 70, high: 140 },
    criticalRange: { low: 50, high: 400 },
    description: "Blood glucose measured regardless of the timing of the last meal.",
  },

  hba1c: {
    id: "hba1c",
    canonicalName: "HbA1c (Glycated Hemoglobin)",
    category: "Biochemistry",
    aliases: [
      "hba1c",
      "hb a1c",
      "glycated hemoglobin",
      "glycosylated hemoglobin",
      "a1c",
      "glycohemoglobin",
    ],
    defaultUnit: "%",
    acceptedUnits: ["%", "mmol/mol"],
    unitConversions: {
      "mmol/mol": (val: number) => val / 10.929 + 2.15,
    },
    generalRange: { low: 4.0, high: 5.6 },
    criticalRange: { high: 10.0 },
    description: "Average blood sugar control over the preceding 2 to 3 months.",
  },

  total_cholesterol: {
    id: "total_cholesterol",
    canonicalName: "Total Cholesterol",
    category: "Lipid Profile",
    aliases: [
      "total cholesterol",
      "cholesterol total",
      "serum cholesterol",
      "cholesterol",
      "tc",
    ],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "mmol/L"],
    unitConversions: {
      "mmol/L": (val: number) => val * 38.67,
    },
    generalRange: { low: 125, high: 200 },
    description: "Overall measurement of circulating cholesterol lipids.",
  },

  ldl: {
    id: "ldl",
    canonicalName: "LDL Cholesterol",
    category: "Lipid Profile",
    aliases: [
      "ldl",
      "ldl cholesterol",
      "ldl-c",
      "low density lipoprotein",
      "bad cholesterol",
    ],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "mmol/L"],
    unitConversions: {
      "mmol/L": (val: number) => val * 38.67,
    },
    generalRange: { low: 0, high: 100 },
    description: "Low-density lipoprotein cholesterol (optimal level < 100 mg/dL).",
  },

  hdl: {
    id: "hdl",
    canonicalName: "HDL Cholesterol",
    category: "Lipid Profile",
    aliases: [
      "hdl",
      "hdl cholesterol",
      "hdl-c",
      "high density lipoprotein",
      "good cholesterol",
    ],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "mmol/L"],
    unitConversions: {
      "mmol/L": (val: number) => val * 38.67,
    },
    generalRange: { low: 40, high: 60 },
    sexRanges: {
      male: { low: 40, high: 60 },
      female: { low: 50, high: 60 },
    },
    description: "Cardioprotective high-density lipoprotein cholesterol.",
  },

  triglycerides: {
    id: "triglycerides",
    canonicalName: "Triglycerides",
    category: "Lipid Profile",
    aliases: ["triglycerides", "triglyceride", "tg", "serum triglycerides"],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "mmol/L"],
    unitConversions: {
      "mmol/L": (val: number) => val * 88.57,
    },
    generalRange: { low: 0, high: 150 },
    criticalRange: { high: 500 },
    description: "Common circulating fat; levels > 500 mg/dL increase pancreatitis risk.",
  },

  creatinine: {
    id: "creatinine",
    canonicalName: "Serum Creatinine",
    category: "Renal Function",
    aliases: [
      "creatinine",
      "serum creatinine",
      "sr creatinine",
      "creat",
      "s creatinine",
    ],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "umol/L", "µmol/L"],
    unitConversions: {
      "umol/L": (val: number) => val / 88.4,
      "µmol/L": (val: number) => val / 88.4,
    },
    generalRange: { low: 0.5, high: 1.3 },
    sexRanges: {
      male: { low: 0.7, high: 1.3 },
      female: { low: 0.5, high: 1.1 },
    },
    criticalRange: { low: 0.3, high: 4.0 },
    description: "Key metabolic waste marker filtered by the kidneys.",
  },

  urea: {
    id: "urea",
    canonicalName: "Blood Urea",
    category: "Renal Function",
    aliases: [
      "urea",
      "blood urea",
      "serum urea",
      "bun",
      "blood urea nitrogen",
    ],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "mmol/L"],
    unitConversions: {
      "mmol/L": (val: number) => val * 6.006,
    },
    generalRange: { low: 15, high: 45 },
    criticalRange: { high: 100 },
    description: "Nitrogenous waste product from dietary protein metabolism.",
  },

  uric_acid: {
    id: "uric_acid",
    canonicalName: "Serum Uric Acid",
    category: "Renal Function",
    aliases: [
      "uric acid",
      "serum uric acid",
      "urate",
      "sr uric acid",
    ],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "umol/L", "µmol/L"],
    unitConversions: {
      "umol/L": (val: number) => val / 59.48,
      "µmol/L": (val: number) => val / 59.48,
    },
    generalRange: { low: 2.5, high: 7.2 },
    sexRanges: {
      male: { low: 3.5, high: 7.2 },
      female: { low: 2.5, high: 6.0 },
    },
    criticalRange: { high: 12.0 },
    description: "Purine breakdown product associated with gout and kidney stones.",
  },

  alt: {
    id: "alt",
    canonicalName: "ALT (SGPT)",
    category: "Liver Function",
    aliases: [
      "alt",
      "sgpt",
      "alanine aminotransferase",
      "alanine transaminase",
      "s alt",
    ],
    defaultUnit: "U/L",
    acceptedUnits: ["U/L", "IU/L", "u/l"],
    generalRange: { low: 7, high: 56 },
    sexRanges: {
      male: { low: 10, high: 50 },
      female: { low: 7, high: 35 },
    },
    criticalRange: { high: 300 },
    description: "Intracellular enzyme indicative of hepatocellular liver injury.",
  },

  ast: {
    id: "ast",
    canonicalName: "AST (SGOT)",
    category: "Liver Function",
    aliases: [
      "ast",
      "sgot",
      "aspartate aminotransferase",
      "aspartate transaminase",
      "s ast",
    ],
    defaultUnit: "U/L",
    acceptedUnits: ["U/L", "IU/L", "u/l"],
    generalRange: { low: 10, high: 40 },
    sexRanges: {
      male: { low: 10, high: 40 },
      female: { low: 9, high: 32 },
    },
    criticalRange: { high: 300 },
    description: "Enzyme found in liver, heart, and muscle tissue.",
  },

  alp: {
    id: "alp",
    canonicalName: "Alkaline Phosphatase (ALP)",
    category: "Liver Function",
    aliases: [
      "alp",
      "alkaline phosphatase",
      "alk phos",
      "alkaline phos",
      "s alp",
    ],
    defaultUnit: "U/L",
    acceptedUnits: ["U/L", "IU/L", "u/l"],
    generalRange: { low: 44, high: 147 },
    criticalRange: { high: 500 },
    description: "Enzyme linked to biliary tract function and bone turnover.",
  },

  total_bilirubin: {
    id: "total_bilirubin",
    canonicalName: "Total Bilirubin",
    category: "Liver Function",
    aliases: [
      "total bilirubin",
      "bilirubin total",
      "t bili",
      "t-bili",
      "tbil",
      "serum bilirubin total",
    ],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "umol/L", "µmol/L"],
    unitConversions: {
      "umol/L": (val: number) => val / 17.1,
      "µmol/L": (val: number) => val / 17.1,
    },
    generalRange: { low: 0.1, high: 1.2 },
    criticalRange: { high: 5.0 },
    description: "Yellow pigment from red cell breakdown; elevated in jaundice.",
  },

  tsh: {
    id: "tsh",
    canonicalName: "Thyroid Stimulating Hormone (TSH)",
    category: "Thyroid",
    aliases: [
      "tsh",
      "thyroid stimulating hormone",
      "thyrotropin",
      "s tsh",
      "serum tsh",
    ],
    defaultUnit: "uIU/mL",
    acceptedUnits: ["uIU/mL", "mIU/L", "uIU/L", "mU/L", "uU/mL"],
    unitConversions: {
      "mIU/L": (val: number) => val,
      "uIU/L": (val: number) => val / 1000,
      "mU/L": (val: number) => val,
      "uU/mL": (val: number) => val,
    },
    generalRange: { low: 0.4, high: 4.5 },
    criticalRange: { low: 0.1, high: 15.0 },
    description: "Pituitary hormone regulating thyroid gland endocrine function.",
  },

  t3: {
    id: "t3",
    canonicalName: "Total T3 (Triiodothyronine)",
    category: "Thyroid",
    aliases: [
      "t3",
      "total t3",
      "triiodothyronine",
      "total triiodothyronine",
      "s t3",
    ],
    defaultUnit: "ng/dL",
    acceptedUnits: ["ng/dL", "nmol/L"],
    unitConversions: {
      "nmol/L": (val: number) => val * 65.1,
    },
    generalRange: { low: 80, high: 200 },
    description: "Active thyroid hormone regulating metabolic rate.",
  },

  t4: {
    id: "t4",
    canonicalName: "Total T4 (Thyroxine)",
    category: "Thyroid",
    aliases: [
      "t4",
      "total t4",
      "thyroxine",
      "total thyroxine",
      "s t4",
    ],
    defaultUnit: "mcg/dL",
    acceptedUnits: ["mcg/dL", "ug/dL", "nmol/L"],
    unitConversions: {
      "ug/dL": (val: number) => val,
      "nmol/L": (val: number) => val / 12.87,
    },
    generalRange: { low: 4.5, high: 12.0 },
    description: "Primary circulating prohormone secreted by the thyroid.",
  },

  sodium: {
    id: "sodium",
    canonicalName: "Serum Sodium",
    category: "Electrolytes",
    aliases: ["sodium", "serum sodium", "na", "na+", "s sodium"],
    defaultUnit: "mEq/L",
    acceptedUnits: ["mEq/L", "mmol/L"],
    unitConversions: {
      "mmol/L": (val: number) => val,
    },
    generalRange: { low: 135, high: 145 },
    criticalRange: { low: 120, high: 160 },
    description: "Primary extracellular cation governing fluid homeostasis.",
  },

  potassium: {
    id: "potassium",
    canonicalName: "Serum Potassium",
    category: "Electrolytes",
    aliases: ["potassium", "serum potassium", "k", "k+", "s potassium"],
    defaultUnit: "mEq/L",
    acceptedUnits: ["mEq/L", "mmol/L"],
    unitConversions: {
      "mmol/L": (val: number) => val,
    },
    generalRange: { low: 3.5, high: 5.0 },
    criticalRange: { low: 2.8, high: 6.2 },
    description: "Primary intracellular cation crucial for cardiac rhythm and muscles.",
  },

  calcium: {
    id: "calcium",
    canonicalName: "Serum Calcium",
    category: "Electrolytes",
    aliases: [
      "calcium",
      "serum calcium",
      "total calcium",
      "ca",
      "ca++",
      "s calcium",
    ],
    defaultUnit: "mg/dL",
    acceptedUnits: ["mg/dL", "mmol/L"],
    unitConversions: {
      "mmol/L": (val: number) => val * 4.008,
    },
    generalRange: { low: 8.5, high: 10.5 },
    criticalRange: { low: 6.5, high: 13.0 },
    description: "Mineral essential for neuromuscular transmission, bones, and clotting.",
  },

  vitamin_d: {
    id: "vitamin_d",
    canonicalName: "Vitamin D (25-OH)",
    category: "Vitamins & Minerals",
    aliases: [
      "vitamin d",
      "25-hydroxy vitamin d",
      "25-oh vitamin d",
      "25 oh vitamin d",
      "vit d",
      "calcidiol",
      "vitamin d3",
    ],
    defaultUnit: "ng/mL",
    acceptedUnits: ["ng/mL", "nmol/L", "ug/L"],
    unitConversions: {
      "nmol/L": (val: number) => val / 2.496,
      "ug/L": (val: number) => val,
    },
    generalRange: { low: 30.0, high: 100.0 },
    criticalRange: { low: 10.0, high: 150.0 },
    description: "Steroid vitamin essential for bone density and immune defense.",
  },

  vitamin_b12: {
    id: "vitamin_b12",
    canonicalName: "Vitamin B12",
    category: "Vitamins & Minerals",
    aliases: [
      "vitamin b12",
      "vit b12",
      "b12",
      "cobalamin",
      "cyanocobalamin",
      "serum b12",
    ],
    defaultUnit: "pg/mL",
    acceptedUnits: ["pg/mL", "pmol/L"],
    unitConversions: {
      "pmol/L": (val: number) => val * 1.355,
    },
    generalRange: { low: 200, high: 900 },
    criticalRange: { low: 100 },
    description: "Essential cofactor for neurocognitive health and RBC formation.",
  },

  ferritin: {
    id: "ferritin",
    canonicalName: "Serum Ferritin",
    category: "Vitamins & Minerals",
    aliases: [
      "ferritin",
      "serum ferritin",
      "s ferritin",
    ],
    defaultUnit: "ng/mL",
    acceptedUnits: ["ng/mL", "mcg/L", "ug/L"],
    unitConversions: {
      "mcg/L": (val: number) => val,
      "ug/L": (val: number) => val,
    },
    generalRange: { low: 15, high: 300 },
    sexRanges: {
      male: { low: 20, high: 300 },
      female: { low: 10, high: 200 },
    },
    criticalRange: { low: 5, high: 1000 },
    description: "Primary cellular storage protein indicating iron reserves.",
  },

  crp: {
    id: "crp",
    canonicalName: "C-Reactive Protein (CRP)",
    category: "Inflammatory Markers",
    aliases: [
      "crp",
      "c-reactive protein",
      "c reactive protein",
      "serum crp",
      "hs-crp",
      "high sensitivity crp",
    ],
    defaultUnit: "mg/L",
    acceptedUnits: ["mg/L", "mg/dL"],
    unitConversions: {
      "mg/dL": (val: number) => val * 10,
    },
    generalRange: { low: 0.0, high: 5.0 },
    criticalRange: { high: 50.0 },
    description: "Acute-phase inflammatory protein synthesized by hepatocytes.",
  },

  // Additional 2 tests for clinical completeness
  esr: {
    id: "esr",
    canonicalName: "ESR (Erythrocyte Sedimentation Rate)",
    category: "Inflammatory Markers",
    aliases: [
      "esr",
      "erythrocyte sedimentation rate",
      "sed rate",
      "westergren esr",
    ],
    defaultUnit: "mm/hr",
    acceptedUnits: ["mm/hr", "mm/1st hr", "mm/h"],
    generalRange: { low: 0, high: 20 },
    sexRanges: {
      male: { low: 0, high: 15 },
      female: { low: 0, high: 20 },
    },
    criticalRange: { high: 100 },
    description: "Non-specific hematologic indicator of systemic inflammation.",
  },

  albumin: {
    id: "albumin",
    canonicalName: "Serum Albumin",
    category: "Liver Function",
    aliases: [
      "albumin",
      "serum albumin",
      "s albumin",
    ],
    defaultUnit: "g/dL",
    acceptedUnits: ["g/dL", "g/L"],
    unitConversions: {
      "g/L": (val: number) => val / 10,
    },
    generalRange: { low: 3.5, high: 5.0 },
    criticalRange: { low: 2.0 },
    description: "Abundant plasma protein maintaining oncotic vascular pressure.",
  },
};
