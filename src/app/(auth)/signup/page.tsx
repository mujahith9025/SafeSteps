'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus, ArrowRight, Loader2 } from 'lucide-react'
import {
  AuthCard,
  AuthInput,
  PasswordInput,
  PasswordStrengthMeter,
  AuthAlert,
} from '@/components/auth'
import { signUpSchema } from '@/lib/validations/auth'
import { signUpAction } from '../actions'

export default function SignUpPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [consent, setConsent] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    // Client-side Zod validation
    const validation = signUpSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      consent,
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
      formData.append('fullName', fullName)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('confirmPassword', confirmPassword)
      formData.append('consent', consent ? 'true' : 'false')

      const result = await signUpAction(formData)

      if (!result.success) {
        setServerError(result.error || 'Failed to create account. Please try again.')
        setIsRateLimited(Boolean(result.isRateLimited))
        setIsSubmitting(false)
        return
      }

      // Success: Navigate to consent onboarding
      router.push(result.redirectTo || '/consent')
    } catch {
      setServerError('Please check your internet connection and try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      icon={<UserPlus className="w-7 h-7" />}
      title="Create your SafeSteps account"
      subtitle="Join SafeSteps for calm, guided triage and personalized care tracking."
      footerPrompt="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      {serverError && (
        <AuthAlert
          type={isRateLimited ? 'rate-limit' : 'error'}
          title={isRateLimited ? 'Taking a quick breather' : 'Unable to create account'}
          message={serverError}
          onClose={() => setServerError(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Full Name */}
        <AuthInput
          label="Full name"
          id="fullName"
          name="fullName"
          required
          autoComplete="name"
          placeholder="e.g. Ananya Patel"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: '' }))
          }}
          error={fieldErrors.fullName}
        />

        {/* Email Address */}
        <AuthInput
          label="Email address"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }))
          }}
          error={fieldErrors.email}
        />

        {/* Password */}
        <div>
          <PasswordInput
            label="Password"
            id="password"
            name="password"
            required
            autoComplete="new-password"
            placeholder="Create password (8+ chars)"
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
          label="Confirm password"
          id="confirmPassword"
          name="confirmPassword"
          required
          autoComplete="new-password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }))
          }}
          error={fieldErrors.confirmPassword}
        />

        {/* Medical & Terms Consent Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-left select-none">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked)
                if (fieldErrors.consent) setFieldErrors((prev) => ({ ...prev, consent: '' }))
              }}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              I agree to SafeSteps{' '}
              <Link href="/terms" className="text-teal-700 font-medium hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-teal-700 font-medium hover:underline">
                Privacy Policy
              </Link>
              , including processing my health-related symptoms non-diagnostically.
            </span>
          </label>
          {fieldErrors.consent && (
            <p role="alert" className="text-xs text-red-600 font-medium mt-1.5">
              {fieldErrors.consent}
            </p>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 mt-2 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold text-base rounded-xl shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-teal-700/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  )
}
