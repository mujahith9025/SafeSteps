'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, type ProfileFormValues } from '@/lib/validations/profile'

export interface ProfileActionResult {
  success: boolean
  error?: string
}

/**
 * Server Action: Save Health Profile
 */
export async function saveProfileAction(
  payload: ProfileFormValues
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be signed in to update your health profile.',
      }
    }

    // Server-side Zod validation & normalization
    const parseResult = profileSchema.safeParse(payload)
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]?.message || 'Please check the required fields.'
      return {
        success: false,
        error: firstIssue,
      }
    }

    const validData = parseResult.data

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        age: validData.age,
        sex: validData.sex,
        height_cm: validData.height_cm,
        weight_kg: validData.weight_kg,
        pregnant: validData.pregnant,
        allergies: validData.allergies,
        conditions: validData.conditions,
        medicines: validData.medicines,
        preferred_language: validData.preferred_language,
        personalise: validData.personalise,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      return {
        success: false,
        error: updateError.message || 'Unable to update health profile. Please try again.',
      }
    }

    revalidatePath('/profile')
    return { success: true }
  } catch {
    return {
      success: false,
      error: 'Please check your connection and try again.',
    }
  }
}

/**
 * Server Action: Delete Health Profile
 * Resets clinical fields while keeping account active, and records an action-only audit_log entry.
 */
export async function deleteHealthProfileAction(): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be signed in to perform this action.',
      }
    }

    // 1. Reset health fields in profiles table
    const { error: resetError } = await supabase
      .from('profiles')
      .update({
        age: null,
        sex: null,
        height_cm: null,
        weight_kg: null,
        pregnant: false,
        allergies: [],
        conditions: [],
        medicines: [],
        personalise: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (resetError) {
      return {
        success: false,
        error: resetError.message || 'Unable to reset health profile.',
      }
    }

    // 2. Add an audit_log entry (action and entity only, no personal content)
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'health_profile_deleted',
      entity: 'profiles',
    })

    revalidatePath('/profile')
    return { success: true }
  } catch {
    return {
      success: false,
      error: 'Please check your connection and try again.',
    }
  }
}

/**
 * Server Action: Toggle Personalisation Context
 * Enables or disables using health profile context in clinical AI chat.
 */
export async function togglePersonaliseAction(
  personalise: boolean
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be signed in to change this setting.',
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        personalise,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      return {
        success: false,
        error: updateError.message || 'Unable to update personalization setting.',
      }
    }

    revalidatePath('/chat')
    revalidatePath('/profile')
    return { success: true }
  } catch {
    return {
      success: false,
      error: 'Please check your connection and try again.',
    }
  }
}
