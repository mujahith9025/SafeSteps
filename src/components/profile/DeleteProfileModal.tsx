'use client'

import React from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { useModalA11y } from '@/hooks/useModalA11y'

export interface DeleteProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteProfileModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteProfileModalProps) {
  const dialogRef = useModalA11y<HTMLDivElement>({
    isOpen,
    onClose,
    disabled: isDeleting,
  })

  if (!isOpen) return null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-profile-title"
      aria-describedby="delete-profile-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 sm:p-6 z-50 animate-in zoom-in-95 fade-in duration-200"
      >
        <div className="flex items-start justify-between pb-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-red-600/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mt-2">
          <h3 id="delete-profile-title" className="text-base font-bold text-slate-900 tracking-tight">
            Delete health profile?
          </h3>
          <p id="delete-profile-description" className="text-xs text-slate-600 leading-relaxed">
            This will permanently remove your recorded age, biometrics, allergies, chronic conditions, and active medicines from SafeSteps.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600">
            <span className="font-semibold text-slate-900 block mb-0.5">Note:</span>
            Your SafeSteps account, login credentials, and past consultations will remain active. Only your clinical profile fields are cleared.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            data-cancel="true"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-red-600/30 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, delete profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
