'use client'

import React, { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export interface ProfileToastProps {
  show: boolean
  onDismiss: () => void
  title?: string
  message?: string
}

export function ProfileToast({
  show,
  onDismiss,
  title = 'Profile saved',
  message = 'Your clinical context has been securely updated.',
}: ProfileToastProps) {
  useEffect(() => {
    if (!show) return
    const timer = setTimeout(() => {
      onDismiss()
    }, 4000)
    return () => clearTimeout(timer)
  }, [show, onDismiss])

  if (!show) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-24 right-4 sm:right-8 z-50 bg-white text-slate-800 p-4 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-3.5 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-teal-700" />
      </div>
      <div className="flex-1 min-w-0 pr-1">
        <div className="font-bold text-xs text-slate-900 leading-tight">{title}</div>
        <div className="text-[11px] text-slate-500 mt-0.5 leading-normal">{message}</div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
