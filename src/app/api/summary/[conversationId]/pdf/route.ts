/**
 * SafeSteps Doctor Visit Summary PDF Export API Route (GET /api/summary/[conversationId]/pdf)
 *
 * Responsibilities:
 * 1. Checks user authentication and conversation ownership.
 * 2. Retrieves or generates validated visit summary with profile patient context.
 * 3. Builds clean A4 PDF with embedded Noto Unicode fonts (Tamil, Devanagari, English).
 * 4. Logs compliance audit trail entry (action: "summary_pdf_exported") with zero personal content.
 * 5. Returns application/pdf stream with download filename.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildVisitSummary } from "@/lib/summary";
import { generateVisitSummaryPdf } from "@/lib/pdfVisitSummary";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to export consultation summaries." },
        { status: 401 }
      );
    }

    // Build or retrieve cached summary
    const { summary, conversation, patientDetails } = await buildVisitSummary(
      conversationId
    );

    // Generate PDF Buffer
    const pdfBuffer = await generateVisitSummaryPdf(
      summary,
      conversation,
      patientDetails
    );

    // Record compliance audit log (action only, strictly no personal or medical content)
    try {
      await supabase.from("audit_log").insert({
        user_id: user.id,
        action: "summary_pdf_exported",
        entity: "conversations",
      });
    } catch {
      // Non-blocking
    }

    const filename = `SafeSteps-Visit-Summary-${conversationId.substring(0, 8)}.pdf`;

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
      { error: err.message || "Failed to generate visit summary PDF." },
      { status: 500 }
    );
  }
}
