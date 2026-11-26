import { z } from 'zod'

/**
 * Validation schema for patient registration (/signup)
 */
export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'Full name is required')
      .max(80, 'Full name cannot exceed 80 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address (e.g. name@example.com)'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    consent: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service, Privacy Policy, and medical disclaimer.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpInput = z.infer<typeof signUpSchema>

/**
 * Validation schema for patient login (/login)
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address (e.g. name@example.com)'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Validation schema for requesting password reset (/forgot-password)
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address (e.g. name@example.com)'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

/**
 * Validation schema for setting a new password (/reset-password)
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

/**
 * Helper to compute password strength (0-4 score)
 */
export function calculatePasswordStrength(password: string): {
  score: number // 0 to 4
  hasMinLength: boolean
  hasLetterAndNumber: boolean
  hasSpecialChar: boolean
  label: 'Weak' | 'Fair' | 'Good' | 'Strong'
} {
  const hasMinLength = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password)
  const hasLetterAndNumber = hasLetter && hasNumber

  let score = 0
  if (password.length >= 1) score = 1
  if (hasMinLength && (hasLetter || hasNumber)) score = 2
  if (hasMinLength && hasLetterAndNumber) score = 3
  if (hasMinLength && hasLetterAndNumber && hasSpecialChar && password.length >= 10) score = 4

  const labels: ('Weak' | 'Fair' | 'Good' | 'Strong')[] = ['Weak', 'Weak', 'Fair', 'Good', 'Strong']

  return {
    score,
    hasMinLength,
    hasLetterAndNumber,
    hasSpecialChar,
    label: labels[score] || 'Weak',
  }
}
