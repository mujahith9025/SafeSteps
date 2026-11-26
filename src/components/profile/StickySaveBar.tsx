'use client'

import React from 'react'
import { Check, Lock, AlertCircle, RotateCcw } from 'lucide-react'

export interface StickySaveBarProps {
  isDirty: boolean
  isSaving: boolean
  onSave: () => void
  onReset: () => void
}

export function StickySaveBar({
  isDirty,
  isSaving,
  onSave,
  onReset,
}: StickySaveBarProps) {
  return (
    <aside
      aria-label="Profile changes action bar"
      className="fixed bottom-0 left-0 md:left-[76px] lg:left-[260px] right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 px-4 sm:px-8 flex items-center justify-between gap-4 shadow-lg transition-all"
    >
      {/* Left: Status info */}
      <div className="flex items-center gap-2 text-xs">
        {isDirty ? (
          <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You have unsaved changes</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className="hidden sm:inline">256-bit encrypted • Supabase RLS Protected</span>
            <span className="sm:hidden">Protected</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onReset}
          disabled={!isDirty || isSaving}
          className="h-10 px-3 sm:px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden xs:inline">Reset</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className="h-10 px-4 sm:px-6 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-700/30"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save changes</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
