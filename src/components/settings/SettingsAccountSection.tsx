'use client'

import React, { useState } from 'react'
import {
  User,
  ShieldCheck,
  Lock,
  KeyRound,
  LogOut,
  Check,
  Calendar,
} from 'lucide-react'
import { ChangePasswordModal } from './ChangePasswordModal'
import { logoutAction } from '@/app/(app)/settings/actions'

export interface SettingsAccountSectionProps {
  user: {
    id: string
    email?: string | null
    fullName?: string | null
    createdAt?: string | null
  }
}

export function SettingsAccountSection({ user }: SettingsAccountSectionProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const displayName = user.fullName || user.email?.split('@')[0] || 'Patient Account'
  const email = user.email || 'No email registered'

  // Generate initials from display name
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'SP'

  const formattedJoinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Active'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logoutAction()
  }

  return (
    <section
      id="panel-account"
      role="tabpanel"
      aria-labelledby="tab-btn-account"
      className="space-y-6 animate-in fade-in duration-200"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Account details
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review authenticated patient profile and security credentials.
          </p>
        </div>
        <span className="self-start sm:self-auto bg-teal-50 text-teal-800 font-semibold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-teal-200">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Patient Portal • Verified Account</span>
        </span>
      </div>

      {/* Main Account Card matching Stitch */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
        {/* User Profile Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
          <div className="relative">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-700 text-white font-bold text-lg sm:text-xl flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-600 text-white flex items-center justify-center border-2 border-white shadow-xs">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-base sm:text-lg">
                {displayName}
              </span>
              <span className="bg-teal-50 text-teal-800 font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-teal-200">
                Patient Account
              </span>
            </div>
            <span className="text-xs text-slate-500 truncate">
              SafeSteps ID: {user.id.slice(0, 8)} • Member since {formattedJoinDate}
            </span>
          </div>
        </div>

        {/* Read-Only Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Full legal name</label>
              <span className="text-slate-500 text-[11px]">From account registration</span>
            </div>
            <div className="h-12 px-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-800 font-medium flex items-center justify-between">
              <span className="truncate">{displayName}</span>
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            </div>
          </div>

          {/* Email Address Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Email address</label>
              <span className="bg-teal-50 text-teal-800 font-medium text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 border border-teal-200">
                <Lock className="w-3 h-3 text-teal-700" />
                <span>Verified login</span>
              </span>
            </div>
            <div className="h-12 px-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-800 font-medium flex items-center justify-between">
              <span className="truncate">{email}</span>
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* Account Security & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Account registered on {formattedJoinDate}</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="h-11 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-slate-600" />
              <span>Change password</span>
            </button>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="h-11 px-4 bg-slate-200/80 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 text-slate-600" />
              <span>{isLoggingOut ? 'Signing out...' : 'Log out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </section>
  )
}
