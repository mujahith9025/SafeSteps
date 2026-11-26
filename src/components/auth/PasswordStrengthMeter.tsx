'use client'

import React from 'react'
import { Check, Dot } from 'lucide-react'
import { calculatePasswordStrength } from '@/lib/validations/auth'

interface PasswordStrengthMeterProps {
  password?: string
  className?: string
}

export function PasswordStrengthMeter({
  password = '',
  className = '',
}: PasswordStrengthMeterProps) {
  if (!password) return null

  const { score, hasMinLength, hasLetterAndNumber, hasSpecialChar, label } =
    calculatePasswordStrength(password)

  // Determine segment colors based on score
  const getSegmentColor = (index: number) => {
    if (index >= score) return 'bg-slate-200'
    if (score === 1) return 'bg-red-500'
    if (score === 2) return 'bg-orange-500'
    if (score === 3) return 'bg-amber-500'
    return 'bg-emerald-600'
  }

  const getLabelColor = () => {
    if (score <= 1) return 'text-red-600'
    if (score === 2) return 'text-orange-600'
    if (score === 3) return 'text-amber-600'
    return 'text-emerald-700'
  }

  return (
    <div className={`w-full flex flex-col gap-2 mt-1.5 ${className}`}>
      {/* 4 Segment Progress Bars */}
      <div className="flex items-center gap-1.5 w-full">
        {[0, 1, 2, 3].map((segIndex) => (
          <div
            key={segIndex}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${getSegmentColor(
              segIndex
            )}`}
          />
        ))}
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Password strength</span>
        <span className={`font-bold transition-colors ${getLabelColor()}`}>
          {label}
        </span>
      </div>

      {/* Requirement Status Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all ${
            hasMinLength
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <Dot className="w-3 h-3" />}
          8+ chars
        </span>

        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all ${
            hasLetterAndNumber
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {hasLetterAndNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Dot className="w-3 h-3" />}
          letters &amp; numbers
        </span>

        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all ${
            hasSpecialChar
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {hasSpecialChar ? <Check className="w-3 h-3 text-emerald-600" /> : <Dot className="w-3 h-3" />}
          special char (e.g. !?#)
        </span>
      </div>
    </div>
  )
}
