'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { LogIn, ArrowRight, Loader2 } from 'lucide-react'
import {
  AuthCard,
  AuthInput,
  PasswordInput,
  AuthAlert,
} from '@/components/auth'
import { loginSchema } from '@/lib/validations/auth'
import { loginAction } from '../actions'

function LoginForm() {
  const searchParams = useSearchParams()

  const returnUrl = searchParams.get('returnUrl')
  const isResetSuccess = searchParams.get('reset') === 'success'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    const validation = loginSchema.safeParse({ email, password, remember })
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
      formData.append('email', email)
      formData.append('password', password)
      formData.append('remember', remember ? 'on' : 'off')

      const result = await loginAction(formData, returnUrl)

      if (!result.success) {
        setServerError(result.error || 'Email or password is incorrect. Please try again.')
        setIsRateLimited(Boolean(result.isRateLimited))
        setIsSubmitting(false)
        return
      }

      // Hard navigation / router push to refresh auth context
      const target = result.redirectTo || '/chat'
      window.location.href = target
    } catch {
      setServerError('Please check your internet connection and try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      icon={<LogIn className="w-7 h-7" />}
      title="Welcome back"
      subtitle="Sign in to access your previous symptom assessments and care summaries."
      footerPrompt="Don't have an account?"
      footerLinkText="Create one"
      footerLinkHref="/signup"
    >
      {isResetSuccess && !serverError && (
        <AuthAlert
          type="success"
          title="Password updated"
          message="Your password was reset successfully. Please log in with your new credentials."
        />
      )}

      {serverError && (
        <AuthAlert
          type={isRateLimited ? 'rate-limit' : 'error'}
          title={isRateLimited ? 'Taking a quick breather' : 'Email or password is incorrect'}
          message={serverError}
          onClose={() => setServerError(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }))
            }}
            error={fieldErrors.password}
          />
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 focus:ring-offset-0 cursor-pointer"
            />
            <span>Keep me signed in</span>
          </label>

          <Link
            href="/forgot-password"
            className="font-semibold text-teal-700 hover:text-teal-800 hover:underline transition-colors"
          >
            Forgot password?
          </Link>
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
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Log in</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[440px] h-[480px] bg-white rounded-2xl animate-pulse" />
      }
    >
      <LoginForm />
    </Suspense>
  )
}
