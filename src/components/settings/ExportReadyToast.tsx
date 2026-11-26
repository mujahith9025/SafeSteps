'use client'

import React from 'react'
import { CheckCircle2, Download, X, Lock } from 'lucide-react'

export interface ExportReadyToastProps {
  fileSize?: string
  downloadUrl?: string
  filename?: string
  onDownloadAgain?: () => void
  onDismiss: () => void
}

export function ExportReadyToast({
  fileSize = 'JSON archive',
  onDownloadAgain,
  onDismiss,
}: ExportReadyToastProps) {
  return (
    <div
      id="export-toast"
      role="status"
      aria-live="polite"
      className="w-full mb-6 bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-teal-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm sm:text-base">
              Your data export is ready
            </span>
            <span className="bg-teal-50 text-teal-800 font-semibold text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-teal-200">
              <Lock className="w-3 h-3 text-teal-700" />
              <span>Encrypted</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 truncate mt-0.5">
            JSON bundle ({fileSize}) has been generated and securely downloaded to your device.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {onDownloadAgain && (
          <button
            type="button"
            onClick={onDownloadAgain}
            className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-teal-800 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>Download again</span>
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss toast"
          onClick={onDismiss}
          className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
