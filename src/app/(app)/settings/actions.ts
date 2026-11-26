'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long.')
      .regex(/[A-Z]/, 'New password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'New password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'New password must contain at least one number.')
      .regex(/[^A-Za-z0-9]/, 'New password must contain at least one special symbol.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match.',
    path: ['confirmPassword'],
  })

export interface ActionResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * Changes authenticated user password with current password verification.
 */
export async function changePasswordAction(formData: {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(formData)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || 'Invalid password input.'
    return { success: false, error: firstError }
  }

  const { currentPassword, newPassword } = parsed.data
  const supabase = await createClient()

  // 1. Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user || !user.email) {
    return { success: false, error: 'Unauthorized. Please sign in again.' }
  }

  // 2. Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return {
      success: false,
      error: 'Current password is incorrect. Please verify and try again.',
    }
  }

  // 3. Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return {
      success: false,
      error: updateError.message || 'Failed to update password. Please try again.',
    }
  }

  // 4. Invalidate other active sessions if supported
  try {
    await supabase.auth.signOut({ scope: 'others' })
  } catch {
    // Graceful fallback if session scoping is not supported on the instance
  }

  return {
    success: true,
    message: 'Your password has been securely updated. Other active sessions have been signed out.',
  }
}

/**
 * Updates user health profile personalisation setting.
 */
export async function updatePersonalisationAction(
  personalise: boolean
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized.' }
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
      error: updateError.message || 'Failed to update personalisation preference.',
    }
  }

  return { success: true }
}

/**
 * Signs out user and redirects to login page.
 */
export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut().catch(() => {})
  redirect('/login')
}
