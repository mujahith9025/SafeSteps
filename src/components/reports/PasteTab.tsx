'use client'

import React from 'react'
import { Lightbulb } from 'lucide-react'

interface PasteTabProps {
  text: string
  onChange: (text: string) => void
  disabled?: boolean
}

export const MAX_PASTE_CHARS = 8000

export function PasteTab({ text, onChange, disabled = false }: PasteTabProps) {
  const charCount = text.length
  const isOverLimit = charCount > MAX_PASTE_CHARS

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="paste-input-area" className="text-sm font-medium text-slate-800">
            Paste lab report values or text below
          </label>
          <span
            id="paste-char-count"
            className={`text-xs font-medium ${
              isOverLimit ? 'text-rose-600 font-bold' : 'text-slate-400'
            }`}
          >
            {charCount.toLocaleString()} / {MAX_PASTE_CHARS.toLocaleString()} characters
          </span>
        </div>

        <textarea
          id="paste-input-area"
          rows={7}
          value={text}
          disabled={disabled}
          aria-invalid={isOverLimit}
          aria-describedby="paste-char-count"
          onChange={(e) => onChange(e.target.value)}
          placeholder={`e.g. 
Hemoglobin: 11.2 g/dL (Ref: 12.0 - 15.5)
Platelets: 135 x10^9/L (Ref: 150 - 400)
Serum Ferritin: 18 ug/L (Ref: 30 - 300)
Mean Corpuscular Volume (MCV): 76 fL (Ref: 80 - 100)`}
          className="w-full p-4 rounded-xl bg-[#eff4ff] text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-teal-600/30 border border-slate-200 outline-none shadow-xs placeholder:text-slate-400 resize-y disabled:opacity-50 font-mono transition-colors"
        />
      </div>

      {/* Helper Box matching Stitch */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-teal-700 shrink-0" />
          <span className="text-xs">
            Include test names, units (g/dL, mmol/L), and reference intervals for the most accurate explanation.
          </span>
        </div>
      </div>
    </div>
  )
}
