'use client'

import React from 'react'
import { User, Baby, ChevronDown } from 'lucide-react'

export interface BasicsCardProps {
  age: number | null
  sex: 'female' | 'male' | 'undisclosed' | null
  height_cm: number | null
  weight_kg: number | null
  pregnant: boolean
  onAgeChange: (val: number | null) => void
  onSexChange: (val: 'female' | 'male' | 'undisclosed' | null) => void
  onHeightChange: (val: number | null) => void
  onWeightChange: (val: number | null) => void
  onPregnantChange: (val: boolean) => void
  disabled?: boolean
}

export function BasicsCard({
  age,
  sex,
  height_cm,
  weight_kg,
  pregnant,
  onAgeChange,
  onSexChange,
  onHeightChange,
  onWeightChange,
  onPregnantChange,
  disabled = false,
}: BasicsCardProps) {
  // Maternal safety rule: Pregnancy toggle is visible ONLY for females aged 12 to 55
  const isEligibleFemale =
    sex === 'female' && age !== null && age >= 12 && age <= 55

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      {/* Card Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Basics</h2>
            <p className="text-xs text-slate-500">General physiological baseline information</p>
          </div>
        </div>
        <span className="bg-slate-100 text-slate-600 font-semibold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider">
          Baseline
        </span>
      </div>

      {/* Input Grid: 4 columns on desktop, 2 on tablet/mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Age */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-age" className="text-xs font-semibold text-slate-700">
            Age (0 - 120)
          </label>
          <div className="relative flex items-center">
            <input
              id="profile-age"
              type="number"
              min={0}
              max={120}
              disabled={disabled}
              value={age === null ? '' : age}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
                onAgeChange(isNaN(val as number) ? null : val)
              }}
              placeholder="e.g. 28"
              className="w-full h-11 bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 pr-12 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all disabled:opacity-60"
            />
            <span className="absolute right-3.5 text-xs text-slate-400 pointer-events-none select-none">
              years
            </span>
          </div>
        </div>

        {/* Sex at birth */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-sex" className="text-xs font-semibold text-slate-700">
            Sex at birth
          </label>
          <div className="relative flex items-center">
            <select
              id="profile-sex"
              disabled={disabled}
              value={sex || ''}
              onChange={(e) => {
                const val = e.target.value as 'female' | 'male' | 'undisclosed' | ''
                onSexChange(val === '' ? null : val)
              }}
              className="w-full h-11 bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 pr-9 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all appearance-none cursor-pointer disabled:opacity-60"
            >
              <option value="">Select option</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="undisclosed">Prefer not to say</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 pointer-events-none text-slate-400" />
          </div>
        </div>

        {/* Height */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-height" className="text-xs font-semibold text-slate-700">
            Height (30 - 250)
          </label>
          <div className="relative flex items-center">
            <input
              id="profile-height"
              type="number"
              min={30}
              max={250}
              disabled={disabled}
              value={height_cm === null ? '' : height_cm}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value)
                onHeightChange(isNaN(val as number) ? null : val)
              }}
              placeholder="e.g. 165"
              className="w-full h-11 bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 pr-10 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all disabled:opacity-60"
            />
            <span className="absolute right-3.5 text-xs text-slate-400 pointer-events-none select-none">
              cm
            </span>
          </div>
        </div>

        {/* Weight */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-weight" className="text-xs font-semibold text-slate-700">
            Weight (2 - 400)
          </label>
          <div className="relative flex items-center">
            <input
              id="profile-weight"
              type="number"
              min={2}
              max={400}
              disabled={disabled}
              value={weight_kg === null ? '' : weight_kg}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value)
                onWeightChange(isNaN(val as number) ? null : val)
              }}
              placeholder="e.g. 62"
              className="w-full h-11 bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 pr-10 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all disabled:opacity-60"
            />
            <span className="absolute right-3.5 text-xs text-slate-400 pointer-events-none select-none">
              kg
            </span>
          </div>
        </div>
      </div>

      {/* Maternal Safety Switch (Dynamic: Female aged 12-55 only) */}
      {isEligibleFemale && (
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
              <Baby className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900">
                Currently pregnant or breastfeeding
              </span>
              <span className="text-[11px] text-slate-500 leading-relaxed">
                Helps ensure triage instructions account for maternal, perinatal, and fetal drug safety limits.
              </span>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={pregnant}
            disabled={disabled}
            onClick={() => onPregnantChange(!pregnant)}
            aria-label="Toggle pregnancy or breastfeeding status"
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-700/30 ${
              pregnant ? 'bg-teal-700' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                pregnant ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      )}
    </div>
  )
}
