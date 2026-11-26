'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import {
  AuthCard,
  PasswordInput,
  PasswordStrengthMeter,
  AuthAlert,
} from '@/components/auth'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { resetPasswordAction } from '../actions'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    const validation = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    })

    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const pathKey = String(issue.path[0] || 'general')
        if (!errors[pathKey]) {
          errors[pathKey] = issue.message
        }
      })
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('password', password)
      formData.append('confirmPassword', confirmPassword)

      const result = await resetPasswordAction(formData)

      if (!result.success) {
        setServerError(result.error || 'Unable to update password. Please try again.')
        setIsRateLimited(Boolean(result.isRateLimited))
        setIsSubmitting(false)
        return
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 1500)
    } catch {
      setServerError('Please check your internet connection and try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      icon={<KeyRound className="w-7 h-7" />}
      title="Set new password"
      subtitle="Your new password must be different from previously used passwords for security."
      footerPrompt="Finished?"
      footerLinkText="Back to login"
      footerLinkHref="/login"
    >
      {isSuccess && (
        <AuthAlert
          type="success"
          title="Password updated"
          message="Your password was updated successfully. Redirecting to login..."
        />
      )}

      {serverError && (
        <AuthAlert
          type={isRateLimited ? 'rate-limit' : 'error'}
          title={isRateLimited ? 'Taking a quick breather' : 'Unable to update password'}
          message={serverError}
          onClose={() => setServerError(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* New Password */}
        <div>
          <PasswordInput
            label="New password"
            id="password"
            name="password"
            required
            autoComplete="new-password"
            placeholder="Enter new password (8+ chars)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }))
            }}
            error={fieldErrors.password}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm new password"
          id="confirmPassword"
          name="confirmPassword"
          required
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }))
          }}
          error={fieldErrors.confirmPassword}
        />

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="w-full h-12 mt-2 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold text-base rounded-xl shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-teal-700/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Updating password...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>Password updated!</span>
            </>
          ) : (
            <>
              <span>Update password and log in</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  )
}
