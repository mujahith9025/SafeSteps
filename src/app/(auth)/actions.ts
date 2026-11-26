'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, checkAuthRateLimit } from '@/lib/rateLimit'
import {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth'

export interface AuthActionResult {
  success: boolean
  error?: string
  isRateLimited?: boolean
  redirectTo?: string
}

const ALLOWED_REDIRECT_PATHS = [
  '/chat',
  '/consent',
  '/profile',
  '/history',
  '/reports',
  '/settings',
  '/summary',
]

/**
 * Validates a return target URL to protect against Open Redirect vulnerabilities.
 */
function sanitizeRedirectUrl(target?: string | null): string {
  if (!target) return '/chat'

  // Target must be a relative path and not a protocol-relative '//' URL
  if (target.startsWith('/') && !target.startsWith('//')) {
    const rootSegment = '/' + target.split('/')[1]
    if (ALLOWED_REDIRECT_PATHS.includes(rootSegment)) {
      return target
    }
  }

  return '/chat'
}

/**
 * Server Action: Patient Registration
 */
export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  // 1. IP Rate Limiting (5 attempts / minute)
  const headerList = await headers()
  const clientIp = getClientIp(headerList)
  const rateLimit = checkAuthRateLimit(clientIp, 5, 60 * 1000)

  if (!rateLimit.allowed) {
    return {
      success: false,
      isRateLimited: true,
      error:
        'Taking a quick breather: Too many registration attempts from this network. For security, please wait 60 seconds before trying again.',
    }
  }

  // 2. Validate payload with Zod
  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
  }

  const parseResult = signUpSchema.safeParse(rawData)
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'Please check the required fields.'
    return {
      success: false,
      error: firstError,
    }
  }

  const { fullName, email, password } = parseResult.data

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          preferred_language: 'en',
        },
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('user already exists')) {
        return {
          success: false,
          error: 'That email is already registered. Please log in instead.',
        }
      }

      if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('connection')) {
        return {
          success: false,
          error: 'Please check your connection and try again.',
        }
      }

      return {
        success: false,
        error: error.message || 'Unable to create account. Please try again.',
      }
    }

    // Success -> redirect to /consent for onboarding
    return {
      success: true,
      redirectTo: '/consent',
    }
  } catch {
    return {
      success: false,
      error: 'Please check your connection and try again.',
    }
  }
}

/**
 * Server Action: Patient Login
 */
export async function loginAction(
  formData: FormData,
  returnUrl?: string | null
): Promise<AuthActionResult> {
  // 1. IP Rate Limiting (5 attempts / minute)
  const headerList = await headers()
  const clientIp = getClientIp(headerList)
  const rateLimit = checkAuthRateLimit(clientIp, 5, 60 * 1000)

  if (!rateLimit.allowed) {
    return {
      success: false,
      isRateLimited: true,
      error:
        'Taking a quick breather: Too many unsuccessful login attempts. For security, please wait 60 seconds before trying again.',
    }
  }

  // 2. Validate payload with Zod
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    remember: formData.get('remember') === 'on',
  }

  const parseResult = loginSchema.safeParse(rawData)
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'Please enter your email and password.'
    return {
      success: false,
      error: firstError,
    }
  }

  const { email, password } = parseResult.data

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('connection')) {
        return {
          success: false,
          error: 'Please check your connection and try again.',
        }
      }

      // Strict Security Requirement: Never reveal whether an email exists on login
      return {
        success: false,
        error: 'Email or password is incorrect. Please double-check your credentials and try again.',
      }
    }

    const safeTarget = sanitizeRedirectUrl(returnUrl)
    return {
      success: true,
      redirectTo: safeTarget,
    }
  } catch {
    return {
      success: false,
      error: 'Please check your connection and try again.',
    }
  }
}

/**
 * Server Action: Request Password Reset
 */
export async function forgotPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const headerList = await headers()
  const clientIp = getClientIp(headerList)
  const rateLimit = checkAuthRateLimit(clientIp, 5, 60 * 1000)

  if (!rateLimit.allowed) {
    return {
      success: false,
      isRateLimited: true,
      error:
        'Taking a quick breather: Too many password reset requests. Please wait 60 seconds before trying again.',
    }
  }

  const rawData = {
    email: formData.get('email'),
  }

  const parseResult = forgotPasswordSchema.safeParse(rawData)
  if (!parseResult.success) {
    return {
      success: false,
      error: 'Please enter a valid email address.',
    }
  }

  const { email } = parseResult.data

  try {
    const supabase = await createClient()
    const origin = headerList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // We dispatch the reset link
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    })

    // Strict Security Requirement: Always return success to prevent email enumeration
    return {
      success: true,
    }
  } catch {
    // Fail gracefully with identical confirmation to avoid leaking state
    return {
      success: true,
    }
  }
}

/**
 * Server Action: Update Password
 */
export async function resetPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const headerList = await headers()
  const clientIp = getClientIp(headerList)
  const rateLimit = checkAuthRateLimit(clientIp, 5, 60 * 1000)

  if (!rateLimit.allowed) {
    return {
      success: false,
      isRateLimited: true,
      error:
        'Taking a quick breather: Too many attempts. Please wait 60 seconds before trying again.',
    }
  }

  const rawData = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const parseResult = resetPasswordSchema.safeParse(rawData)
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'Please check your password entries.'
    return {
      success: false,
      error: firstError,
    }
  }

  const { password } = parseResult.data

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      if (error.message.toLowerCase().includes('same password')) {
        return {
          success: false,
          error: 'Your new password must be different from previously used passwords.',
        }
      }

      return {
        success: false,
        error: error.message || 'Unable to update password. Please request a new reset link.',
      }
    }

    return {
      success: true,
      redirectTo: '/login?reset=success',
    }
  } catch {
    return {
      success: false,
      error: 'Please check your connection and try again.',
    }
  }
}

/**
 * Server Action: Patient Logout
 */
export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Session cleanup fallback
  }

  redirect('/login')
}
