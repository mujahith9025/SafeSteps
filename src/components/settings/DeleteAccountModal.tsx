'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react'
import { useModalA11y } from '@/hooks/useModalA11y'

export interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClose = () => {
    if (isDeleting) return
    setConfirmText('')
    setError(null)
    onClose()
  }

  const modalRef = useModalA11y<HTMLDivElement>({
    isOpen,
    onClose: handleClose,
    disabled: isDeleting,
  })

  if (!isOpen) return null

  const isDeleteConfirmed = confirmText.trim() === 'DELETE'

  const handleDelete = async () => {
    if (!isDeleteConfirmed || isDeleting) return

    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: confirmText.trim() }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Failed to delete account. Please try again.')
        setIsDeleting(false)
        return
      }

      // Successful deletion -> redirect to /account-deleted
      const targetUrl = data.redirectUrl || '/account-deleted'
      router.push(targetUrl)
    } catch (err) {
      console.error('Delete account request error:', err)
      setError('A network or server error occurred. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <div
      ref={modalRef}
      id="delete-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-red-200/90 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 id="delete-modal-title" className="font-bold text-slate-900 text-base sm:text-lg">
                Delete account and all data?
              </h3>
              <p className="text-xs text-slate-500">
                {userEmail ? `Target Account: ${userEmail}` : 'SafeSteps Patient Profile'}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            disabled={isDeleting}
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Alert Banner matching Stitch */}
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            This action is <strong>permanent and irreversible</strong>. All your health history, triage logs, lab notes, and visit summaries will be wiped from local and cloud storage.
          </p>
        </div>

        {/* Error notification if any */}
        {error && (
          <div id="delete-error" role="alert" className="p-3 bg-red-100/80 border border-red-300 rounded-xl text-xs text-red-900 font-medium">
            {error}
          </div>
        )}

        {/* Confirmation Input Box */}
        <div className="space-y-2">
          <label htmlFor="delete-input-confirm" className="text-xs font-semibold text-slate-800 block">
            To confirm deletion, please type <strong className="text-red-700 tracking-wider">DELETE</strong> below:
          </label>
          <input
            id="delete-input-confirm"
            type="text"
            disabled={isDeleting}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'delete-error' : undefined}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all disabled:opacity-60"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isDeleteConfirmed || isDeleting}
            onClick={handleDelete}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isDeleting ? 'Deleting data...' : 'Permanently delete account'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
