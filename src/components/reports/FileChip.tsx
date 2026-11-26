'use client'

import React from 'react'
import { FileText, Image as ImageIcon, CheckCircle2, X } from 'lucide-react'

interface FileChipProps {
  file: File
  onRemove: () => void
  disabled?: boolean
}

export function FileChip({ file, onRemove, disabled = false }: FileChipProps) {
  const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
  const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
  const sizeText = file.size < 1024 * 1024 
    ? `${Math.round(file.size / 1024)} KB` 
    : `${sizeMb} MB`

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#eff4ff] border border-teal-100 shadow-xs transition-all">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
          {isPdf ? (
            <FileText className="w-5 h-5" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-900 truncate">
              {file.name}
            </span>
            <span title="File ready">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {sizeText} • {isPdf ? 'PDF Document' : 'Document Image'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="w-9 h-9 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-500 hover:text-rose-600 transition-colors disabled:opacity-50"
        title="Remove attached report"
        aria-label="Remove attached report"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
