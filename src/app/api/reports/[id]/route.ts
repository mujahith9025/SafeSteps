/**
 * SafeSteps Individual Report API Route (GET, PATCH, DELETE /api/reports/[id])
 *
 * Capabilities:
 * 1. GET: Retrieves report metadata and individual biomarker rows from report_values.
 *    Caches explanations in reports.summary so reopening never re-calls Gemini.
 * 2. PATCH: "Edit values" mode - Allows patient to correct misread OCR/camera values.
 *    Re-evaluates values with compareValue on the server, updates status and ranges,
 *    marks corrected_by_user = true, re-computes summary statistics and re-generates
 *    plain-language explanations with guardrails.
 * 3. DELETE: Removes report and cascades deletion to report_values, with compliance audit log.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { normaliseTestName } from "@/reports/normalise";
import { compareValue } from "@/reports/compare";
import { explainReport, buildSafeFallbackExplanations } from "@/reports/explain";
import { buildProfileContext } from "@/lib/profileContext";

const valueUpdateItemSchema = z.object({
  id: z.string().uuid("Invalid value ID format."),
  value_numeric: z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return Number.isFinite(parsed) ? parsed : val;
    }
    return val;
  }, z.number({ message: "Updated value must be a valid number." })),
  unit: z.string().nullable().optional(),
  test_name: z.string().trim().min(1).optional(),
});

const patchReportSchema = z.object({
  updates: z
    .array(valueUpdateItemSchema)
    .min(1, "At least one value update must be provided."),
});

// -----------------------------------------------------------------------------
// GET /api/reports/[id]
// -----------------------------------------------------------------------------
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to view this report." },
        { status: 401 }
      );
    }

    // Fetch report
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, user_id, title, source_type, raw_text_deleted_at, summary, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: "Report not found or access denied." },
        { status: 404 }
      );
    }

    // Fetch report values
    const { data: values, error: valuesError } = await supabase
      .from("report_values")
      .select("*")
      .eq("report_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (valuesError) {
      return NextResponse.json(
        { error: "Failed to load report parameters." },
        { status: 500 }
      );
    }

    const rows = values || [];

    // Ensure cached explanations exist in summary
    let reportSummary = report.summary as Record<string, unknown> | null;
    if (!reportSummary || !reportSummary.cachedExplanations) {
      const fallback = buildSafeFallbackExplanations(rows);
      reportSummary = {
        ...(reportSummary || {}),
        totalCount: rows.length,
        normalCount: rows.filter((r) => r.status === "normal").length,
        outsideCount: rows.filter((r) => r.status === "high" || r.status === "low").length,
        criticalCount: rows.filter((r) => r.status === "critical").length,
        unknownCount: rows.filter((r) => r.status === "unknown").length,
        overallSummary: fallback.overallSummary,
        doctorQuestions: fallback.doctorQuestions,
        cachedExplanations: fallback.explanations,
      };

      // Update cache in reports table so future visits reuse it
      await supabase
        .from("reports")
        .update({ summary: reportSummary })
        .eq("id", id)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      report: {
        ...report,
        summary: reportSummary,
      },
      values: rows,
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred while loading this report." },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// PATCH /api/reports/[id] (Correction UI / Edit values mode)
// -----------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to update report values." },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const parseResult = patchReportSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid update data." },
        { status: 400 }
      );
    }

    // Verify report ownership
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, user_id, title")
      .eq("id", reportId)
      .eq("user_id", user.id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: "Report not found or access denied." },
        { status: 404 }
      );
    }

    // Fetch existing values for reference
    const { data: existingValues, error: fetchValsError } = await supabase
      .from("report_values")
      .select("*")
      .eq("report_id", reportId)
      .eq("user_id", user.id);

    if (fetchValsError || !existingValues) {
      return NextResponse.json(
        { error: "Unable to retrieve existing values for update." },
        { status: 500 }
      );
    }

    const existingMap = new Map(existingValues.map((v) => [v.id, v]));

    // Update each specified value with deterministic compareValue
    for (const update of parseResult.data.updates) {
      const existing = existingMap.get(update.id);
      if (!existing) continue;

      const testName = update.test_name || existing.test_name;
      const effectiveUnit =
        update.unit !== undefined ? update.unit : existing.unit;
      const canonical = normaliseTestName(testName);

      // Re-run compareValue strictly in code on the server
      const comparison = compareValue({
        test: canonical || testName,
        value: update.value_numeric,
        unit: effectiveUnit,
        printedLow: existing.reference_low,
        printedHigh: existing.reference_high,
      });

      // Update in database with corrected_by_user = true
      await supabase
        .from("report_values")
        .update({
          value_numeric: update.value_numeric,
          value_text: String(update.value_numeric),
          unit: effectiveUnit,
          reference_low: comparison.low,
          reference_high: comparison.high,
          status: comparison.status, // Code-computed status
          corrected_by_user: true,
        })
        .eq("id", update.id)
        .eq("report_id", reportId)
        .eq("user_id", user.id);
    }

    // Re-fetch all updated values
    const { data: refreshedValues } = await supabase
      .from("report_values")
      .select("*")
      .eq("report_id", reportId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    const rows = refreshedValues || [];

    // Fetch user health profile context for personalized caution
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
      // Profile context optional
    }

    // Re-run explainReport with guardrail protection
    const explanationResult = await explainReport(
      rows,
      profileContext,
      userLanguage
    );

    // Update explanations in report_values
    const explanationMap = new Map(
      explanationResult.explanations.map((e) => [e.testName.toLowerCase(), e])
    );

    for (const row of rows) {
      const exp = explanationMap.get(row.test_name.toLowerCase());
      if (exp) {
        const fullExplanation = `${exp.whatItMeasures} ${exp.whatItMeans}`;
        row.explanation = fullExplanation;
        await supabase
          .from("report_values")
          .update({ explanation: fullExplanation })
          .eq("id", row.id)
          .eq("report_id", reportId);
      }
    }

    // Compute summary stats in code
    const totalCount = rows.length;
    const normalCount = rows.filter((r) => r.status === "normal").length;
    const outsideCount = rows.filter(
      (r) => r.status === "high" || r.status === "low"
    ).length;
    const criticalCount = rows.filter((r) => r.status === "critical").length;
    const unknownCount = rows.filter((r) => r.status === "unknown").length;

    const updatedSummary = {
      totalCount,
      normalCount,
      outsideCount,
      criticalCount,
      unknownCount,
      overallSummary: explanationResult.overallSummary,
      doctorQuestions: explanationResult.doctorQuestions,
      cachedExplanations: explanationResult.explanations,
      updatedAt: new Date().toISOString(),
    };

    // Update summary in reports table
    await supabase
      .from("reports")
      .update({ summary: updatedSummary })
      .eq("id", reportId)
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      summary: updatedSummary,
      values: rows,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save updated report values." },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// DELETE /api/reports/[id]
// -----------------------------------------------------------------------------
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to delete this report." },
        { status: 401 }
      );
    }

    // Cascading delete on report
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete report." },
        { status: 500 }
      );
    }

    // Write audit log entry (strictly no clinical contents)
    try {
      await supabase.from("audit_log").insert({
        user_id: user.id,
        action: "report_deleted",
        entity: "reports",
      });
    } catch {
      // Audit log non-blocking
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting the report." },
      { status: 500 }
    );
  }
}
