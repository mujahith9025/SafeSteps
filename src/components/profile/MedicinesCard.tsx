'use client'

import React from 'react'
import { Pill, Lock, ShieldCheck } from 'lucide-react'
import { TagInput } from './TagInput'

export interface MedicinesCardProps {
  medicines: string[]
  onChange: (medicines: string[]) => void
  disabled?: boolean
  error?: string
}

export function MedicinesCard({
  medicines,
  onChange,
  disabled = false,
  error,
}: MedicinesCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Current medicines</h2>
            <p className="text-xs text-slate-500">
              Prescriptions, regular supplements, or daily over-the-counter remedies.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[11px] font-semibold">
          <Lock className="w-3 h-3 text-slate-500" />
          <span>Dosage private</span>
        </div>
      </div>

      {/* Mandatory Clinical Notice Helper Text */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/70 text-slate-600 px-3.5 py-2.5 rounded-xl text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
        <span>Names only. SafeSteps never recommends doses.</span>
      </div>

      {/* Tag Input */}
      <TagInput
        id="profile-medicines"
        tags={medicines}
        onChange={onChange}
        placeholder="Add medication name (e.g. Salbutamol, Paracetamol, Metformin)..."
        addButtonText="Add medicine"
        itemIcon={<Pill className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
        maxTags={20}
        disabled={disabled}
        error={error}
      />
    </div>
  )
}
