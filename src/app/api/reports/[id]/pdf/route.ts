/**
 * SafeSteps Laboratory Report PDF Export API Route (GET /api/reports/[id]/pdf)
 *
 * Capabilities:
 * 1. Checks user authentication and report ownership.
 * 2. Retrieves report metadata and individual biomarker parameters from report_values.
 * 3. Builds clean A4 PDF with embedded Noto Unicode fonts and required clinical footer.
 * 4. Logs compliance audit trail entry (action: "report_pdf_exported") with zero personal content.
 * 5. Returns application/pdf stream with download filename.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateLabReportPdf } from "@/lib/pdfLabReport";

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
        { error: "Please sign in to export laboratory reports." },
        { status: 401 }
      );
    }

    // Fetch report
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, user_id, title, source_type, created_at, summary")
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

    if (valuesError || !values) {
      return NextResponse.json(
        { error: "Failed to load report parameters." },
        { status: 500 }
      );
    }

    // Generate PDF Buffer
    const pdfBuffer = await generateLabReportPdf(report, values);

    // Record compliance audit log (action only, strictly no personal content)
    try {
      await supabase.from("audit_log").insert({
        user_id: user.id,
        action: "report_pdf_exported",
        entity: "reports",
      });
    } catch {
      // Non-blocking
    }

    const filename = `SafeSteps-Report-${id.substring(0, 8)}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate report PDF." },
      { status: 500 }
    );
  }
}
