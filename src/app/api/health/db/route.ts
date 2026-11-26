import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Database health check endpoint (GET /api/health/db)
 *
 * Verifies live database connectivity via Supabase PostgREST with a trivial query.
 * Returns { status: "ok" } on successful connection, or a friendly generic failure
 * message without exposing internal database details, errors, or stack traces.
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Perform a trivial probe to verify active database connectivity.
    // Using head: true verifies database/PostgREST responsiveness with minimal overhead.
    const { error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    // If PostgREST responds, DB connectivity is verified.
    // 42P01 (relation does not exist) means the database is reachable even before migrations run.
    if (error && error.code !== '42P01') {
      const isConnectionError =
        error.code === 'PGRST301' ||
        error.message?.toLowerCase().includes('fetch failed') ||
        error.message?.toLowerCase().includes('connect')

      if (isConnectionError) {
        return NextResponse.json(
          { status: 'error', message: 'Database connection failed' },
          {
            status: 503,
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          }
        )
      }
    }

    return NextResponse.json(
      { status: 'ok' },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch {
    // Return friendly generic failure without exposing sensitive system details
    return NextResponse.json(
      { status: 'error', message: 'Database connection unavailable' },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  }
}
