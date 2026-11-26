'use client'

import React from 'react'
import { AlertCircle, FileQuestion, HardDrive, EyeOff, Clock, ArrowRight } from 'lucide-react'

export type ReportErrorKind =
  | 'unsupported_type'
  | 'file_too_large'
  | 'unreadable'
  | 'rate_limited'
  | 'generic'

interface ErrorCardProps {
  kind: ReportErrorKind
  message?: string
  filename?: string
  onSelectAnother?: () => void
  onSwitchToPaste?: () => void
  onDismiss?: () => void
}

export function ErrorCard({
  kind,
  message,
  filename,
  onSelectAnother,
  onSwitchToPaste,
  onDismiss,
}: ErrorCardProps) {
  // Render specific Stitch-matched design based on kind
  if (kind === 'unsupported_type') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-200 flex flex-col justify-between">
        <div>
          {/* File Badging Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 mb-4 flex items-center justify-between border border-slate-200/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <FileQuestion className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {filename || 'Document'}
                </p>
                <span className="text-[11px] text-rose-600 font-medium">Unrecognized format</span>
              </div>
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close error"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-rose-700 mb-1.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="font-semibold text-slate-900 text-base">
              This file type isn&apos;t supported
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Please upload your report as a <strong className="font-semibold text-slate-800">PDF, JPG, or PNG</strong>{' '}
            document. If you have a different format, you can safely copy and paste the clinical text instead.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          {onSelectAnother && (
            <button
              type="button"
              onClick={onSelectAnother}
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Choose another file</span>
            </button>
          )}
          {onSwitchToPaste && (
            <button
              type="button"
              onClick={onSwitchToPaste}
              className="w-full h-9 text-teal-700 hover:text-teal-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <span>Switch to paste text</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  if (kind === 'file_too_large') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-200 flex flex-col justify-between">
        <div>
          <div className="p-3.5 rounded-xl bg-slate-50 mb-4 space-y-2 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {filename || 'Document'}
                  </p>
                  <span className="text-[11px] text-rose-600 font-medium">Exceeds 5 MB limit</span>
                </div>
              </div>
            </div>
            {/* Progress bar stopped */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-rose-600 rounded-full w-full" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-rose-700 mb-1.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="font-semibold text-slate-900 text-base">File is larger than 5 MB</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            To keep processing fast and safe, individual uploads are limited to 5 MB per document. Try uploading specific
            test pages or an optimized photo.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          {onSelectAnother && (
            <button
              type="button"
              onClick={onSelectAnother}
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Select a smaller file</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (kind === 'unreadable') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <EyeOff className="w-5 h-5 shrink-0" />
            <h3 className="font-semibold text-slate-900 text-base">We couldn&apos;t read this clearly</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {message ||
              'Lighting or camera angle made numbers difficult to extract reliably. To protect your clinical safety, we never guess biomarker values.'}
          </p>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 mb-6 text-xs text-amber-900 space-y-1">
            <div className="font-semibold">Helpful tips:</div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
              <li>Place report flat under bright, even lighting</li>
              <li>Avoid shadows, glare, or oblique camera angles</li>
              <li>Or simply copy and paste the text instead</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {onSelectAnother && (
            <button
              type="button"
              onClick={onSelectAnother}
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Try another photo</span>
            </button>
          )}
          {onSwitchToPaste && (
            <button
              type="button"
              onClick={onSwitchToPaste}
              className="w-full h-9 text-teal-700 hover:text-teal-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <span>Paste report text instead</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  if (kind === 'rate_limited') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <Clock className="w-5 h-5 shrink-0" />
            <h3 className="font-semibold text-slate-900 text-base">Hourly Limit Reached</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {message ||
              'You have reached the upload limit of 5 reports per hour. This protective limit prevents accidental multi-uploads and protects system safety.'}
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    )
  }

  // Generic fallback
  return (
    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-rose-900">Upload Issue</p>
        <p className="mt-0.5 text-rose-700">{message || "We couldn't read this report. Try a clearer photo or paste the text."}</p>
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-rose-500 hover:text-rose-700">
          ✕
        </button>
      )}
    </div>
  )
}
