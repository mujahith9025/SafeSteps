/**
 * SafeSteps Reports API Route (POST /api/reports and GET /api/reports)
 *
 * Execution Order:
 * 1. Require a signed-in user and apply rate limiter (5 reports per hour per user).
 * 2. Accept either pasted text (max 8000 characters) or one file: PDF, JPG or PNG only, max 5 MB.
 *    Inspect binary magic numbers to guarantee file integrity.
 * 3. Extract tests:
 *    - For text: parseReportText() (rule-based deterministic parser).
 *    - For files: Gemini multimodal vision call with prompt from src/prompts/reportExtract.txt.
 *      Validate extracted JSON with Zod. Prompt injection defended with strict passive data rule.
 * 4. In-memory processing: Discard raw file/text immediately without storing.
 * 5. Run normaliseTestName and compareValue for every test.
 * 6. Store structured records in reports and report_values tables.
 * 7. Return new report ID. Wrap in try/catch with friendly errors; never log report contents.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { checkReportRateLimit } from "@/lib/rateLimit";
import {
  validateReportFileBytes,
  MAX_FILE_SIZE_BYTES,
} from "@/reports/fileValidation";
import { parseReportText } from "@/reports/parseText";
import { normaliseTestName } from "@/reports/normalise";
import { compareValue } from "@/reports/compare";
import { explainReport } from "@/reports/explain";
import { buildProfileContext } from "@/lib/profileContext";
import { getGeminiClient, getGeminiModel } from "@/lib/gemini";

// Schema for raw text input
const pastedTextSchema = z.object({
  text: z
    .string({ message: "Pasted text must be a valid string." })
    .trim()
    .min(5, "Pasted text is too short to contain clinical tests.")
    .max(8000, "Pasted text exceeds the 8,000 character limit."),
});

// Schema for extracted lab tests from Gemini vision / parser
export const extractedItemSchema = z.object({
  rawName: z.string().trim().min(1),
  value: z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return Number.isFinite(parsed) ? parsed : val;
    }
    return val;
  }, z.number({ message: "Test value must be a valid number." })),
  unit: z.string().nullable().optional(),
  printedLow: z
    .preprocess((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return val;
    }, z.number().nullable().optional())
    .default(null),
  printedHigh: z
    .preprocess((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return val;
    }, z.number().nullable().optional())
    .default(null),
});

export const extractedReportSchema = z.object({
  tests: z.array(extractedItemSchema),
});

export type ExtractedItem = z.infer<typeof extractedItemSchema>;

/**
 * Derives a descriptive title for the report based on extracted biomarkers.
 */
function deriveReportTitle(tests: ExtractedItem[]): string {
  const names = tests.map((t) => t.rawName.toLowerCase()).join(" ");

  if (
    names.includes("hemoglobin") ||
    names.includes("haemoglobin") ||
    names.includes("wbc") ||
    names.includes("platelet")
  ) {
    return "Complete Blood Count (CBC) Panel";
  }
  if (
    names.includes("glucose") ||
    names.includes("creatinine") ||
    names.includes("urea") ||
    names.includes("alt") ||
    names.includes("ast")
  ) {
    return "Comprehensive Metabolic Panel (CMP)";
  }
  if (
    names.includes("cholesterol") ||
    names.includes("ldl") ||
    names.includes("hdl") ||
    names.includes("triglyceride")
  ) {
    return "Lipid & Cholesterol Profile";
  }
  if (names.includes("tsh") || names.includes("t3") || names.includes("t4")) {
    return "Thyroid Function Panel";
  }

  // Fallback to first test name or generic title
  if (tests.length > 0 && tests[0]?.rawName) {
    return `${tests[0].rawName} & Biomarker Panel`;
  }

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `Pathology Lab Report (${today})`;
}

/**
 * Builds patient-facing educational explanation text for an individual test result.
 */
function buildExplanation(
  rawName: string,
  canonical: ReturnType<typeof normaliseTestName>,
  status: string
): string {
  const desc = canonical?.description || `Measures circulating levels of ${rawName}.`;
  switch (status) {
    case "normal":
      return `${desc} Your result falls within the standard clinical benchmark range.`;
    case "low":
      return `${desc} Your level is below the standard reference benchmark. Your GP may discuss whether dietary factors or supplementation are helpful.`;
    case "high":
      return `${desc} Your level exceeds the standard reference benchmark. Your GP will review this alongside other clinical symptoms.`;
    case "critical":
      return `Critical attention threshold reached. Please consult a doctor promptly or seek medical advice to review this measurement.`;
    case "unknown":
    default:
      return `SafeSteps could not automatically calibrate this measurement against standard ranges. Please review directly with your physician.`;
  }
}

// -----------------------------------------------------------------------------
// POST /api/reports
// -----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // 1. Require a signed-in user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to upload or explain laboratory reports." },
        { status: 401 }
      );
    }

    // Apply rate limiter: 5 reports per hour per user
    const rateLimit = checkReportRateLimit(user.id);
    if (!rateLimit.allowed) {
      const waitMinutes = Math.max(
        1,
        Math.ceil((rateLimit.resetTime - Date.now()) / (60 * 1000))
      );
      return NextResponse.json(
        {
          error: `Rate limit reached. You can upload up to 5 reports per hour. Please try again in about ${waitMinutes} minute${waitMinutes > 1 ? "s" : ""}.`,
        },
        { status: 429 }
      );
    }

    // 2. Determine input type: multipart/form-data (file or text) or application/json (text)
    const contentType = req.headers.get("content-type") || "";
    let extractedTests: ExtractedItem[] = [];
    let sourceType: "file" | "text" = "file";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const fileEntry = formData.get("file");
      const textEntry = formData.get("text");

      if (fileEntry && typeof fileEntry === "object" && "arrayBuffer" in fileEntry) {
        sourceType = "file";
        const file = fileEntry as File;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Check file type by reading actual bytes (magic numbers) & enforce 5 MB limit
        const validation = validateReportFileBytes(buffer, file.name);
        if (!validation.valid || !validation.mimeType) {
          return NextResponse.json(
            { error: validation.error || "Unsupported file format." },
            { status: 400 }
          );
        }

        // 3. Multimodal extraction with Gemini
        try {
          const client = getGeminiClient();
          const model = getGeminiModel();

          // Load strict extraction prompt
          const promptPath = path.join(process.cwd(), "src/prompts/reportExtract.txt");
          const systemInstruction = await fs.readFile(promptPath, "utf-8");

          const base64Data = buffer.toString("base64");

          const response = await client.models.generateContent({
            model,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: validation.mimeType,
                      data: base64Data,
                    },
                  },
                  {
                    text: "Extract all printed laboratory test parameters from this document. Return strictly valid JSON matching the requested schema.",
                  },
                ],
              },
            ],
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          });

          // Discard in-memory buffer immediately
          buffer.fill(0);

          const rawJson = response.text || "{}";
          let parsedPayload: unknown;
          try {
            parsedPayload = JSON.parse(rawJson);
          } catch {
            return NextResponse.json(
              {
                error:
                  "We couldn't read this report clearly. Try a clearer photo or paste the text instead.",
              },
              { status: 422 }
            );
          }

          // Validate with Zod
          const zodResult = extractedReportSchema.safeParse(parsedPayload);
          if (!zodResult.success || zodResult.data.tests.length === 0) {
            return NextResponse.json(
              {
                error:
                  "No clearly readable laboratory tests were identified in this document. Please check lighting or camera angle, or paste the text instead.",
              },
              { status: 422 }
            );
          }

          extractedTests = zodResult.data.tests;
        } catch {
          // Never log report contents
          return NextResponse.json(
            {
              error:
                "We couldn't read this report. Try a clearer photo or paste the text.",
            },
            { status: 500 }
          );
        }
      } else if (textEntry && typeof textEntry === "string" && textEntry.trim().length > 0) {
        sourceType = "text";
        const val = pastedTextSchema.safeParse({ text: textEntry });
        if (!val.success) {
          return NextResponse.json(
            { error: val.error.issues[0]?.message || "Invalid pasted text." },
            { status: 400 }
          );
        }

        // Run rule-based text parser
        const { results } = parseReportText(val.data.text);
        if (results.length === 0) {
          return NextResponse.json(
            {
              error:
                "No recognizable test measurements could be extracted from the text. Make sure to include test names, numbers, and units.",
            },
            { status: 422 }
          );
        }

        extractedTests = results.map((r) => ({
          rawName: r.rawName,
          value: r.value,
          unit: r.unit,
          printedLow: r.printedLow,
          printedHigh: r.printedHigh,
        }));
      } else {
        return NextResponse.json(
          { error: "Please attach a report file (PDF, JPG, PNG) or paste report text." },
          { status: 400 }
        );
      }
    } else if (contentType.includes("application/json")) {
      sourceType = "text";
      const body = await req.json();
      const val = pastedTextSchema.safeParse(body);
      if (!val.success) {
        return NextResponse.json(
          { error: val.error.issues[0]?.message || "Invalid pasted text." },
          { status: 400 }
        );
      }

      const { results } = parseReportText(val.data.text);
      if (results.length === 0) {
        return NextResponse.json(
          {
            error:
              "No recognizable test measurements could be extracted from the text. Make sure to include test names, numbers, and units.",
          },
          { status: 422 }
        );
      }

      extractedTests = results.map((r) => ({
        rawName: r.rawName,
        value: r.value,
        unit: r.unit,
        printedLow: r.printedLow,
        printedHigh: r.printedHigh,
      }));
    } else {
      return NextResponse.json(
        { error: "Unsupported Content-Type header. Expected multipart/form-data or application/json." },
        { status: 400 }
      );
    }

    if (extractedTests.length === 0) {
      return NextResponse.json(
        {
          error:
            "We couldn't read any test values from this report. Try a clearer photo or paste the text.",
        },
        { status: 422 }
      );
    }

    // 4 & 5. Deterministic Evaluation of Every Test
    const evaluatedRows = extractedTests.map((t) => {
      const canonical = normaliseTestName(t.rawName);
      const comparison = compareValue({
        test: canonical || t.rawName,
        value: t.value,
        unit: t.unit,
        printedLow: t.printedLow,
        printedHigh: t.printedHigh,
      });

      const explanation = buildExplanation(t.rawName, canonical, comparison.status);

      return {
        test_name: t.rawName,
        value_numeric: t.value,
        value_text: String(t.value),
        unit: t.unit || comparison.effectiveUnit || null,
        reference_low: comparison.low,
        reference_high: comparison.high,
        status: comparison.status, // "normal" | "high" | "low" | "critical" | "unknown"
        explanation,
        corrected_by_user: false,
      };
    });

    // Fetch user health profile context if available
    let profileContext: string | null = null;
    let userLanguage = "en";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) {
        profileContext = buildProfileContext(profile);
        userLanguage = profile.preferred_language || "en";
      }
    } catch {
      // Profile context optional; proceed safely without it
    }

    // Generate plain-language explanations using Gemini with guardrail protection
    const explanationResult = await explainReport(
      evaluatedRows,
      profileContext,
      userLanguage
    );

    // Map rich explanations to each row
    const explanationMap = new Map(
      explanationResult.explanations.map((e) => [e.testName.toLowerCase(), e])
    );

    for (const row of evaluatedRows) {
      const exp = explanationMap.get(row.test_name.toLowerCase());
      if (exp) {
        row.explanation = `${exp.whatItMeasures} ${exp.whatItMeans}`;
      }
    }

    // Compute summary stats in code
    const totalCount = evaluatedRows.length;
    const normalCount = evaluatedRows.filter((r) => r.status === "normal").length;
    const outsideCount = evaluatedRows.filter(
      (r) => r.status === "high" || r.status === "low"
    ).length;
    const criticalCount = evaluatedRows.filter((r) => r.status === "critical").length;
    const unknownCount = evaluatedRows.filter((r) => r.status === "unknown").length;

    const reportTitle = deriveReportTitle(extractedTests);
    const summary = {
      totalCount,
      normalCount,
      outsideCount,
      criticalCount,
      unknownCount,
      overallSummary: explanationResult.overallSummary,
      doctorQuestions: explanationResult.doctorQuestions,
      cachedExplanations: explanationResult.explanations,
      derivedAt: new Date().toISOString(),
    };

    // Store in `reports` table (with raw_text_deleted_at set to guarantee zero retention)
    const { data: newReport, error: insertReportError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        title: reportTitle,
        source_type: sourceType,
        raw_text_deleted_at: new Date().toISOString(),
        summary,
      })
      .select("id")
      .single();

    if (insertReportError || !newReport) {
      return NextResponse.json(
        { error: "Unable to save report summary to database. Please try again." },
        { status: 500 }
      );
    }

    // Insert extracted rows into `report_values`
    const valuesToInsert = evaluatedRows.map((r) => ({
      report_id: newReport.id,
      user_id: user.id,
      ...r,
    }));

    const { error: insertValuesError } = await supabase
      .from("report_values")
      .insert(valuesToInsert);

    if (insertValuesError) {
      return NextResponse.json(
        { error: "Failed to persist individual test values. Please try again." },
        { status: 500 }
      );
    }

    // 6. Return new report id
    return NextResponse.json({ id: newReport.id }, { status: 201 });
  } catch {
    // Never log report contents
    return NextResponse.json(
      { error: "We couldn't read this report. Try a clearer photo or paste the text." },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// GET /api/reports - Fetch previous reports list for signed-in user
// -----------------------------------------------------------------------------
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to view your reports." },
        { status: 401 }
      );
    }

    const { data: reports, error: fetchError } = await supabase
      .from("reports")
      .select("id, title, source_type, summary, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch saved reports." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reports: reports || [] });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching reports." },
      { status: 500 }
    );
  }
}
