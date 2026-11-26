'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  Database,
  Ban,
  Sliders,
  Activity,
  Check,
  ArrowRight,
  Loader2,
  Lock,
  ChevronDown,
  Info,
  PhoneCall,
  ExternalLink,
} from 'lucide-react'
import { submitConsentAction } from './actions'

export function ConsentClient() {
  const router = useRouter()

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [medicalAccepted, setMedicalAccepted] = useState(false)
  const [personalise, setPersonalise] = useState(false)

  const [showMobilePolicy, setShowMobilePolicy] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canContinue = termsAccepted && medicalAccepted

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canContinue || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitConsentAction(termsAccepted, medicalAccepted, personalise)

      if (!result.success) {
        setError(result.error || 'Failed to record consent. Please try again.')
        setIsSubmitting(false)
        if (result.redirectTo) {
          router.push(result.redirectTo)
        }
        return
      }

      // Hard redirect to initialize signed-in session state cleanly
      window.location.href = result.redirectTo || '/chat'
    } catch {
      setError('A connection error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      {/* Top Clinical Disclaimer Strip */}
      <aside
        aria-label="Clinical Disclaimer"
        className="w-full bg-sky-50 border-b border-sky-100 px-4 py-2 text-xs sm:text-sm text-sky-900 sticky top-0 z-50 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-700 shrink-0" />
            <p className="font-medium">
              General health guidance only. Not a medical diagnosis.
            </p>
          </div>

          <Link
            href="/emergency"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-full shadow-sm transition-colors shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 112</span>
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
        {/* Step Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold tracking-wide uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
          Step 1 of 2 • Quick Setup
        </div>

        {/* Page Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-center">
          Your privacy matters
        </h1>
        <p className="text-sm sm:text-base text-slate-600 text-center mt-2 max-w-xl leading-relaxed">
          Here is how SafeSteps handles your health information with care. No confusing legalese.
        </p>

        {/* End-to-End Encryption Security Banner */}
        <div className="w-full max-w-2xl mt-6 bg-teal-50/80 border border-teal-200/70 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-left text-xs sm:text-sm text-teal-950 leading-relaxed">
            <strong className="font-semibold block sm:inline mr-1">
              Your health data is encrypted end-to-end.
            </strong>
            We maintain clinical-grade safeguards that prioritize your safety, privacy, and personal autonomy.
          </div>
        </div>

        {/* 4 Pillars of Privacy Grid (Stitch Desktop Grid) */}
        <div className="w-full max-w-2xl mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-left">
          {/* Card 1: What we store */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col gap-2 transition-all hover:border-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                What we store
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your profile, symptom check history, and saved reports so you can revisit them whenever needed.
            </p>
          </div>

          {/* Card 2: What we never do */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col gap-2 transition-all hover:border-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Ban className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                What we never do
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We never sell your personal data, share records with insurers or employers, or use them for advertising.
            </p>
          </div>

          {/* Card 3: Your control */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col gap-2 transition-all hover:border-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                Your control
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You can inspect, export as JSON, or permanently delete your complete consultation history in Settings.
            </p>
          </div>

          {/* Card 4: What SafeSteps is */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col gap-2 transition-all hover:border-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                What SafeSteps is
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Informational guidance designed to de-escalate anxiety. Not a medical diagnosis or emergency substitute.
            </p>
          </div>
        </div>

        {/* Mobile Expandable Policy Dropdown */}
        <div className="w-full max-w-2xl mt-4 sm:hidden">
          <button
            type="button"
            onClick={() => setShowMobilePolicy((prev) => !prev)}
            aria-expanded={showMobilePolicy}
            className="w-full py-2.5 px-4 bg-white rounded-xl border border-slate-200/80 text-xs font-semibold text-teal-800 flex items-center justify-between shadow-2xs"
          >
            <span>Read policy overview</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showMobilePolicy ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showMobilePolicy && (
            <div className="mt-2 p-4 bg-slate-100/80 rounded-xl text-xs text-slate-600 leading-relaxed flex flex-col gap-2 text-left">
              <p>
                <strong>How we protect your data:</strong> Your symptom notes are encrypted in transit and at rest.
                Uploaded lab reports are processed in ephemeral memory and raw files are deleted.
              </p>
              <p>
                SafeSteps complies with India DPDP Act principles. You retain the right to erase your account and data anytime.
              </p>
            </div>
          )}
        </div>

        {/* Form: Agreements & Preferences */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl mt-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 flex flex-col gap-4 text-left"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base sm:text-lg text-slate-900">
              Agreements &amp; Preferences
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Please review and select the required clinical consents to initialize your account.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium"
            >
              {error}
            </div>
          )}

          {/* Checkbox 1: Terms & Privacy (Required) */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/60 cursor-pointer transition-colors select-none">
            <input
              type="checkbox"
              id="consent-terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 cursor-pointer"
            />
            <div className="flex-1 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <span>
                I agree to the{' '}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-teal-700 font-semibold underline hover:text-teal-800 inline-flex items-center gap-0.5"
                >
                  Privacy Policy
                  <ExternalLink className="w-3 h-3" />
                </Link>{' '}
                and{' '}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-teal-700 font-semibold underline hover:text-teal-800 inline-flex items-center gap-0.5"
                >
                  Terms of Service
                  <ExternalLink className="w-3 h-3" />
                </Link>
                .
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              Required
            </span>
          </label>

          {/* Checkbox 2: Non-diagnostic Medical Acknowledgement (Required) */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/60 cursor-pointer transition-colors select-none">
            <input
              type="checkbox"
              id="consent-medical"
              checked={medicalAccepted}
              onChange={(e) => setMedicalAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 cursor-pointer"
            />
            <div className="flex-1 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <span>
                I understand SafeSteps is clinical triage guidance, not a medical diagnosis or substitute for a registered doctor.
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-rose-700 bg-rose-50 border-rose-200 border px-2 py-0.5 rounded-full">
              Required
            </span>
          </label>

          {/* Checkbox 3: Personalisation (Optional) */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/60 cursor-pointer transition-colors select-none">
            <input
              type="checkbox"
              id="consent-personalise"
              checked={personalise}
              onChange={(e) => setPersonalise(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 cursor-pointer"
            />
            <div className="flex-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <span>
                Allow SafeSteps to reference my saved health profile (allergies, health conditions) to personalize future consultations.
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              Optional
            </span>
          </label>

          {/* Submit Action Dock */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={!canContinue || isSubmitting}
              className={`w-full h-12 rounded-xl font-semibold text-base transition-all duration-150 flex items-center justify-center gap-2 shadow-sm
                ${
                  canContinue && !isSubmitting
                    ? 'bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white cursor-pointer hover:shadow focus:ring-4 focus:ring-teal-700/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Securing Profile...</span>
                </>
              ) : (
                <>
                  <span>Continue to SafeSteps</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {!canContinue && (
              <p
                id="validation-hint"
                className="text-xs text-center text-slate-500 font-medium"
              >
                Please accept both required items above to continue.
              </p>
            )}
          </div>
        </form>

        {/* Trust Framework Link & Security Note */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500">
          <Link
            href="/privacy"
            className="text-teal-700 hover:text-teal-800 font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>Read the complete SafeSteps Privacy Framework</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit encrypted • India DPDP Act &amp; GDPR aligned</span>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full py-5 px-4 text-center border-t border-slate-200/60 bg-white/40 text-xs text-slate-400">
        SafeSteps is an academic engineering project and not a medical service.
      </footer>
    </div>
  )
}
