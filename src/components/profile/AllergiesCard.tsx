'use client'

import React from 'react'
import { ShieldAlert, AlertTriangle } from 'lucide-react'
import { TagInput } from './TagInput'

export interface AllergiesCardProps {
  allergies: string[]
  onChange: (allergies: string[]) => void
  disabled?: boolean
  error?: string
}

export function AllergiesCard({
  allergies,
  onChange,
  disabled = false,
  error,
}: AllergiesCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Allergies</h2>
            <p className="text-xs text-slate-500">
              Substances or medications that cause adverse immune or acute reactions.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100/70 text-amber-800 rounded-lg">
          {allergies.length} / 20
        </span>
      </div>

      {/* Tag Input */}
      <TagInput
        id="profile-allergies"
        tags={allergies}
        onChange={onChange}
        placeholder="Type allergy name (e.g. Penicillin, Peanuts, Sulfa, Latex)..."
        addButtonText="Add allergy"
        itemIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
        maxTags={20}
        disabled={disabled}
        error={error}
      />
    </div>
  )
}
