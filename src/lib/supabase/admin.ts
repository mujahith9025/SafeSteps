import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client using the service role key.
 *
 * CRITICAL SECURITY NOTICE:
 * - This client bypasses Row Level Security (RLS) entirely.
 * - Guarded by 'server-only' to ensure it can NEVER be bundled or imported in client components.
 * - Restricted use only: data ingestion scripts, administrative maintenance, and account deletion.
 * - Never expose SUPABASE_SERVICE_ROLE_KEY to the browser or prefix with NEXT_PUBLIC_.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
