'use client'

import React, { useEffect, useState } from 'react'
import { Lock, Check, ShieldCheck, RefreshCw } from 'lucide-react'

interface ProcessingViewProps {
  filename?: string
  fileSizeText?: string
  sourceType?: 'file' | 'text'
  onCancel?: () => void
}

export function ProcessingView({
  filename = 'Lab_Report.pdf',
  fileSizeText = 'Document intake',
  sourceType = 'file',
  onCancel,
}: ProcessingViewProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [progressPercent, setProgressPercent] = useState<number>(25)

  useEffect(() => {
    // Step 1 -> Step 2 after 1.8s
    const t1 = setTimeout(() => {
      setCurrentStep(2)
      setProgressPercent(65)
    }, 1800)

    // Step 2 -> Step 3 after 4.2s
    const t2 = setTimeout(() => {
      setCurrentStep(3)
      setProgressPercent(90)
    }, 4200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="max-w-2xl mx-auto w-full pt-6 sm:pt-10 pb-16 flex flex-col items-center">
      {/* Document Meta Badge */}
      <div className="inline-flex items-center gap-2 bg-[#eff4ff] px-4 py-1.5 rounded-full shadow-xs mb-6 border border-teal-100">
        <Lock className="w-4 h-4 text-teal-700" />
        <span className="text-xs font-medium text-slate-800">
          Processing:{' '}
          <span className="font-semibold text-teal-800">
            {sourceType === 'file' ? filename : 'Pasted Clinical Text'}
          </span>
        </span>
        <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
        <span className="text-xs text-slate-500">{fileSizeText}</span>
      </div>

      {/* Central Processing Card */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-10 flex flex-col items-center text-center">
        {/* Animated Circular Progress Ring matching Stitch */}
        <div className="relative w-24 h-24 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-teal-100/60 blur-md animate-pulse" />
          <svg className="w-24 h-24 -rotate-90 transform relative" viewBox="0 0 96 96">
            {/* Background track */}
            <circle
              className="text-slate-100"
              cx="48"
              cy="48"
              fill="transparent"
              r="40"
              stroke="currentColor"
              strokeWidth="7"
            />
            {/* Animated progress stroke */}
            <circle
              className="text-teal-700 transition-all duration-1000 ease-out"
              cx="48"
              cy="48"
              fill="transparent"
              r="40"
              stroke="currentColor"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
              strokeLinecap="round"
              strokeWidth="7"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-teal-700">
            <RefreshCw className="w-7 h-7 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Main Status Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
          Explaining your report...
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mb-6 leading-relaxed">
          SafeSteps is translating medical shorthand into clear, plain-language guidance. This usually takes under 15 seconds.
        </p>

        {/* Overall Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-8 overflow-hidden">
          <div
            className="bg-teal-700 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Vertical Stepper matching Stitch */}
        <div className="w-full max-w-md flex flex-col text-left space-y-0">
          {/* Step 1: Reading your report */}
          <div className="flex items-start gap-3.5 relative pb-6">
            <div
              className={`absolute left-4 top-8 -bottom-1 w-0.5 ${
                currentStep >= 2 ? 'bg-teal-700' : 'bg-slate-200'
              }`}
            />
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                currentStep >= 2
                  ? 'bg-teal-700 text-white'
                  : currentStep === 1
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {currentStep >= 2 ? (
                <Check className="w-4 h-4" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-teal-700 animate-ping" />
              )}
            </div>
            <div className="flex flex-col min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  Reading your report
                </span>
                {currentStep >= 2 ? (
                  <span className="text-[11px] font-semibold text-teal-700 px-2 py-0.5 bg-teal-50 rounded-full">
                    Completed
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-teal-700 px-2 py-0.5 bg-teal-50 rounded-full animate-pulse">
                    In Progress
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {sourceType === 'file'
                  ? 'Extracting printed biomarkers and reference intervals.'
                  : 'Parsing tabular rows and reference ranges from pasted text.'}
              </p>
            </div>
          </div>

          {/* Step 2: Checking values */}
          <div className="flex items-start gap-3.5 relative pb-6">
            <div
              className={`absolute left-4 top-8 -bottom-1 w-0.5 ${
                currentStep >= 3 ? 'bg-teal-700' : 'bg-slate-200'
              }`}
            />
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                currentStep >= 3
                  ? 'bg-teal-700 text-white'
                  : currentStep === 2
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {currentStep >= 3 ? (
                <Check className="w-4 h-4" />
              ) : currentStep === 2 ? (
                <div className="w-2.5 h-2.5 rounded-full bg-teal-700 animate-ping" />
              ) : (
                <span className="text-xs font-semibold">2</span>
              )}
            </div>
            <div className="flex flex-col min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  Checking values
                </span>
                {currentStep >= 3 ? (
                  <span className="text-[11px] font-semibold text-teal-700 px-2 py-0.5 bg-teal-50 rounded-full">
                    Completed
                  </span>
                ) : currentStep === 2 ? (
                  <span className="text-[11px] font-semibold text-teal-700 px-2 py-0.5 bg-teal-50 rounded-full animate-pulse">
                    In Progress
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 bg-slate-50 rounded-full">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparing against NHS &amp; clinical reference benchmarks.
              </p>
            </div>
          </div>

          {/* Step 3: Writing the explanation */}
          <div className="flex items-start gap-3.5 relative">
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                currentStep === 3
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {currentStep === 3 ? (
                <div className="w-2.5 h-2.5 rounded-full bg-teal-700 animate-ping" />
              ) : (
                <span className="text-xs font-semibold">3</span>
              )}
            </div>
            <div className="flex flex-col min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-teal-800">
                  Writing the explanation
                </span>
                {currentStep === 3 ? (
                  <span className="text-[11px] font-semibold text-teal-800 px-2 py-0.5 bg-teal-100 rounded-full animate-pulse">
                    In Progress
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 bg-slate-50 rounded-full">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Formatting plain-language takeaways and doctor questions.
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Action Link */}
        {onCancel && (
          <div className="mt-8 pt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <span>Need to stop?</span>
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-600 hover:text-slate-900 underline transition-colors font-medium cursor-pointer"
            >
              Cancel and discard file
            </button>
          </div>
        )}
      </div>

      {/* Reassurance Privacy Callout Card matching Stitch */}
      <div className="w-full bg-[#eff4ff] rounded-xl p-4 flex items-start gap-3 mt-4 shadow-xs border border-teal-100">
        <div className="w-8 h-8 rounded-lg bg-white text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0 text-left">
          <h2 className="text-xs font-semibold text-slate-900">
            Strict privacy safeguards active
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Your uploaded document is processed in an encrypted temporary environment and deleted permanently once your
            results are ready. SafeSteps does not store raw medical files.
          </p>
        </div>
      </div>

      {/* Clinical Protocol & Compliance Stamp */}
      <div className="mt-4 flex items-center gap-3 text-slate-400 text-xs">
        <span>NHS Clinical Safety Aligned</span>
        <span>•</span>
        <span>256-bit TLS Processing</span>
      </div>
    </div>
  )
}
