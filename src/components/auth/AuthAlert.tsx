'use client'

import React from 'react'
import { AlertCircle, Clock, CheckCircle2, X } from 'lucide-react'

interface AuthAlertProps {
  type?: 'error' | 'warning' | 'success' | 'rate-limit'
  title: string
  message?: string
  onClose?: () => void
  className?: string
}

export function AuthAlert({
  type = 'error',
  title,
  message,
  onClose,
  className = '',
}: AuthAlertProps) {
  const isError = type === 'error'
  const isRateLimit = type === 'rate-limit' || type === 'warning'
  const isSuccess = type === 'success'

  const containerClasses = isSuccess
    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
    : isRateLimit
      ? 'bg-amber-50 border-amber-200 text-amber-900'
      : 'bg-red-50 border-red-200 text-red-900'

  const iconClasses = isSuccess
    ? 'text-emerald-600'
    : isRateLimit
      ? 'text-amber-600'
      : 'text-red-600'

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`w-full rounded-xl border p-4 mb-5 flex items-start gap-3 shadow-sm transition-all ${containerClasses} ${className}`}
    >
      <div className={`shrink-0 mt-0.5 ${iconClasses}`}>
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : isRateLimit ? (
          <Clock className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm leading-tight">{title}</h4>
        {message && <p className="text-xs mt-1 opacity-90 leading-relaxed">{message}</p>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="shrink-0 p-1 -mr-1 -mt-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      )}
    </div>
  )
}
