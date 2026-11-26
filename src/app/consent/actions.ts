'use server'

import { createClient } from '@/lib/supabase/server'
import { CURRENT_CONSENT_VERSION } from '@/lib/consent'

export interface SubmitConsentResult {
  success: boolean
  error?: string
  redirectTo?: string
}

export async function submitConsentAction(
  termsAccepted: boolean,
  medicalAccepted: boolean,
  personalise: boolean
): Promise<SubmitConsentResult> {
  // Validate that both required checkboxes are true
  if (!termsAccepted || !medicalAccepted) {
    return {
      success: false,
      error: 'Please accept both required items to continue to SafeSteps.',
    }
  }

  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Your session has expired. Please log in again to save your consent preferences.',
        redirectTo: '/login?returnUrl=/consent',
      }
    }

    const timestamp = new Date().toISOString()

    // 1. Update or upsert user profile with consent and personalization
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          consent_version: CURRENT_CONSENT_VERSION,
          consent_accepted_at: timestamp,
          personalise: Boolean(personalise),
          updated_at: timestamp,
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      console.error('[Consent Action Error] Profile update failed:', profileError)
      return {
        success: false,
        error: 'Unable to save your consent record. Please check your connection and try again.',
      }
    }

    // 2. Append compliance record to audit_log (No health or personal content stored)
    const { error: auditError } = await supabase
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'consent_accepted',
        entity: 'profiles',
        created_at: timestamp,
      })

    if (auditError) {
      console.warn('[Consent Action Warning] Audit logging notice:', auditError)
      // Non-blocking: profile is already updated
    }

    return {
      success: true,
      redirectTo: '/chat',
    }
  } catch (err) {
    console.error('[Consent Action Exception]:', err)
    return {
      success: false,
      error: 'An unexpected connection error occurred. Please try again.',
    }
  }
}
