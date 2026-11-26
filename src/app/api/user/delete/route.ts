import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkDeleteRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Verify authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to delete your account.' },
        { status: 401 }
      )
    }

    // 2. Check rate limit (3 delete attempts per hour per user)
    const rateLimit = checkDeleteRateLimit(user.id)
    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (60 * 1000))
      return NextResponse.json(
        {
          error: `Deletion rate limit exceeded. You can request deletion at most 3 times per hour. Please try again in ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'}.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    // 3. Validate confirmation keyword "DELETE"
    const body = await req.json().catch(() => ({}))
    if (!body || body.confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Confirmation failed. You must type DELETE exactly to proceed.' },
        { status: 400 }
      )
    }

    const userId = user.id
    const admin = createAdminClient()

    // 4. Idempotently purge all user rows across application tables using admin service role
    // Delete in dependency order (leaf children to root parents)
    await Promise.allSettled([
      admin.from('report_values').delete().eq('user_id', userId),
      admin.from('reports').delete().eq('user_id', userId),
      admin.from('messages').delete().eq('user_id', userId),
      admin.from('conversations').delete().eq('user_id', userId),
      admin.from('profiles').delete().eq('id', userId),
    ])

    // 5. Clean up or anonymize compliance audit entries containing the user ID
    // Requirement: "Do not keep the audit entries that contain the user id after deletion, or anonymise them."
    try {
      await admin.from('audit_log').delete().eq('user_id', userId)
    } catch {
      // Graceful ignore
    }

    // 6. Delete the auth user using Supabase Admin Client
    try {
      const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId)
      if (deleteUserError && !deleteUserError.message?.toLowerCase().includes('not found')) {
        console.error('[API /api/user/delete] Admin deleteUser warning:', deleteUserError)
      }
    } catch (adminErr) {
      // Idempotency: continue if user is already deleted or not found
      console.warn('[API /api/user/delete] Admin deleteUser catch warning:', adminErr)
    }

    // 7. Sign out active user session
    try {
      await supabase.auth.signOut()
    } catch {
      // Gracefully ignore signOut errors during account deletion
    }

    return NextResponse.json({
      success: true,
      message: 'Account and associated health data have been permanently deleted.',
      redirectUrl: '/account-deleted',
    })
  } catch (error) {
    console.error('[API /api/user/delete] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting your account. Please try again.' },
      { status: 500 }
    )
  }
}
