import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkExportRateLimit } from '@/lib/rateLimit'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Verify authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to export your health data.' },
        { status: 401 }
      )
    }

    // 2. Check rate limit (3 exports per hour per user)
    const rateLimit = checkExportRateLimit(user.id)
    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (60 * 1000))
      return NextResponse.json(
        {
          error: `Export rate limit exceeded. You can export personal data at most 3 times per hour. Please try again in ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'}.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    // 3. Fetch user's data (RLS enforced with authenticated user's client)
    const [profileRes, convsRes, msgsRes, reportsRes, valuesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('conversations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('report_values').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])

    const profileData = profileRes.data
    const conversations = convsRes.data || []
    const messages = msgsRes.data || []
    const reports = reportsRes.data || []
    const reportValues = valuesRes.data || []

    // 4. Record compliance audit entry (strictly action and entity, NO clinical content)
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'export_personal_data',
      entity: 'user_archive',
    })

    // 5. Structure complete portable JSON archive
    const exportBundle = {
      exported_at: new Date().toISOString(),
      format_version: '1.0',
      data_controller: 'SafeSteps Health Guidance System',
      regulatory_notice: 'Digital Personal Data Protection (DPDP) Act & GDPR Data Portability Record',
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profileData || null,
      consent_record: {
        consent_version: profileData?.consent_version || '2026-11-v1',
        consent_accepted_at: profileData?.consent_accepted_at || null,
        personalise_enabled: Boolean(profileData?.personalise),
      },
      conversations,
      messages,
      reports,
      report_values: reportValues,
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `safesteps-data-export-${timestamp}.json`

    return new NextResponse(JSON.stringify(exportBundle, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      },
    })
  } catch (error) {
    console.error('[API /api/user/export] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to generate personal data export archive. Please try again.' },
      { status: 500 }
    )
  }
}
