'use client'

import React from 'react'
import { Activity, Plus, Check } from 'lucide-react'
import { TagInput } from './TagInput'

export interface ConditionsCardProps {
  conditions: string[]
  onChange: (conditions: string[]) => void
  disabled?: boolean
  error?: string
}

const COMMON_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Thyroid',
  'Heart disease',
  'Kidney disease',
  'Asthma',
]

export function ConditionsCard({
  conditions,
  onChange,
  disabled = false,
  error,
}: ConditionsCardProps) {
  const handleQuickAdd = (condition: string) => {
    if (disabled || conditions.length >= 20) return
    if (!conditions.some((c) => c.toLowerCase() === condition.toLowerCase())) {
      onChange([...conditions, condition])
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Health conditions</h2>
            <p className="text-xs text-slate-500">
              Ongoing or chronic health conditions diagnosed by a healthcare professional.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100/70 text-blue-800 rounded-lg">
          {conditions.length} / 20
        </span>
      </div>

      {/* Tag Input */}
      <TagInput
        id="profile-conditions"
        tags={conditions}
        onChange={onChange}
        placeholder="Add condition (e.g. Migraine, GERD, Osteoarthritis)..."
        addButtonText="Add condition"
        itemIcon={<Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
        maxTags={20}
        disabled={disabled}
        error={error}
      />

      {/* Quick Suggestions Strip */}
      <div className="bg-slate-50 rounded-xl p-3.5 flex flex-col gap-2 border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Common recommendations</span>
          <span className="text-[11px] text-slate-400">Click to quickly add</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {COMMON_CONDITIONS.map((cond) => {
            const isAdded = conditions.some(
              (c) => c.toLowerCase() === cond.toLowerCase()
            )
            return (
              <button
                key={cond}
                type="button"
                onClick={() => handleQuickAdd(cond)}
                disabled={disabled || isAdded || conditions.length >= 20}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  isAdded
                    ? 'bg-slate-200/60 text-slate-400 cursor-default'
                    : 'bg-white hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200 shadow-2xs active:bg-teal-100'
                }`}
              >
                {isAdded ? (
                  <Check className="w-3 h-3 text-teal-700" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-400" />
                )}
                <span>{cond}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
