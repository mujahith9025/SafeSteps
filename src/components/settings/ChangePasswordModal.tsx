'use client'

import React, { useState, useTransition } from 'react'
import { KeyRound, X, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react'
import { changePasswordAction } from '@/app/(app)/settings/actions'

export interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword)
  const isFormValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSymbol &&
    newPassword === confirmPassword

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const res = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (!res.success) {
        setError(res.error || 'Failed to update password.')
      } else {
        setSuccess(res.message || 'Password updated successfully.')
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    })
  }

  const handleClose = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(null)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200/90 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 id="change-password-title" className="font-bold text-slate-900 text-base">
                Change password
              </h3>
              <p className="text-xs text-slate-500">Update your account credentials</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-2.5 text-xs text-teal-800">
            <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Current password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-11 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              New password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full h-11 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-11 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700 block mb-1">
              Security requirements:
            </span>
            <div className="grid grid-cols-2 gap-1">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-teal-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-teal-600' : 'text-slate-300'}`} />
                <span>8+ characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-teal-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-teal-600' : 'text-slate-300'}`} />
                <span>Uppercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-teal-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasLowercase ? 'text-teal-600' : 'text-slate-300'}`} />
                <span>Lowercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-teal-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-teal-600' : 'text-slate-300'}`} />
                <span>Number (0-9)</span>
              </div>
              <div className={`flex items-center gap-1.5 col-span-2 ${hasSymbol ? 'text-teal-700 font-medium' : 'text-slate-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasSymbol ? 'text-teal-600' : 'text-slate-300'}`} />
                <span>Special symbol (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isPending}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isPending ? 'Updating...' : 'Save new password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
