'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { KeyRound, MailCheck, ArrowRight, ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import {
  AuthCard,
  AuthInput,
  AuthAlert,
} from '@/components/auth'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { forgotPasswordAction } from '../actions'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State when link has been sent (Check Email view)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault()
    setServerError(null)
    setFieldError(null)

    const validation = forgotPasswordSchema.safeParse({ email })
    if (!validation.success) {
      setFieldError(validation.error.issues[0]?.message || 'Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('email', email)

      const result = await forgotPasswordAction(formData)

      if (!result.success) {
        setServerError(result.error || 'Unable to send reset instructions.')
        setIsRateLimited(Boolean(result.isRateLimited))
        setIsSubmitting(false)
        return
      }

      setIsSubmitted(true)
      setResendCooldown(45) // 45-second countdown timer matching Stitch
      setIsSubmitting(false)
    } catch {
      setServerError('Please check your internet connection and try again.')
      setIsSubmitting(false)
    }
  }

  // View B: Check Email Confirmation (Stitch Screen 15)
  if (isSubmitted) {
    return (
      <AuthCard
        icon={<MailCheck className="w-7 h-7 text-emerald-100" />}
        title="Check your email"
        subtitle="We've sent a password reset link to your email."
        footerPrompt="Finished resetting?"
        footerLinkText="Back to login"
        footerLinkHref="/login"
        trustNote="The link will expire in 60 minutes for your security."
      >
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            We sent a secure password reset link to{' '}
            <strong className="text-slate-900 font-semibold break-all">{email}</strong>.
            Click the link inside the email to set a new password.
          </div>

          <div className="flex flex-col w-full gap-2 pt-2">
            <button
              type="button"
              disabled={resendCooldown > 0 || isSubmitting}
              onClick={() => handleSubmit()}
              className="w-full h-11 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resending...</span>
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 opacity-50" />
                  <span>Resend link in {resendCooldown}s</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend reset email</span>
                </>
              )}
            </button>

            <Link
              href="/login"
              className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to log in</span>
            </Link>
          </div>
        </div>
      </AuthCard>
    )
  }

  // View A: Request Reset Form (Stitch Screen 14)
  return (
    <AuthCard
      icon={<KeyRound className="w-7 h-7" />}
      title="Reset your password"
      subtitle="Enter the email associated with your account, and we’ll send you a secure link to reset your password."
      footerPrompt="Remember your password?"
      footerLinkText="Back to login"
      footerLinkHref="/login"
      trustNote="The link expires after 60 minutes for your security."
    >
      {serverError && (
        <AuthAlert
          type={isRateLimited ? 'rate-limit' : 'error'}
          title={isRateLimited ? 'Taking a quick breather' : 'Error'}
          message={serverError}
          onClose={() => setServerError(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
            if (fieldError) setFieldError(null)
          }}
          error={fieldError || undefined}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 mt-2 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold text-base rounded-xl shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-teal-700/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending reset link...</span>
            </>
          ) : (
            <>
              <span>Send reset link</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to log in</span>
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}
