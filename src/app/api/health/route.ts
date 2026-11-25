import { NextResponse } from "next/server";

/**
 * Health check endpoint (GET /api/health)
 *
 * Returns operational status without touching the Gemini API or exhausting quota.
 * Used for uptime monitoring, deployment smoke tests, and container health probes.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
