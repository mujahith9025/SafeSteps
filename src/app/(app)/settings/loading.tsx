import React from 'react'

export default function SettingsLoading() {
  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-pulse"
      role="status"
      aria-label="Loading settings"
    >
      <header className="space-y-2 pb-2">
        <div className="w-36 h-4 bg-slate-100 rounded" />
        <div className="w-56 h-8 bg-slate-200 rounded-xl" />
        <div className="w-80 h-4 bg-slate-100 rounded" />
      </header>

      {/* Tabs bar skeleton */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <div className="w-28 h-9 bg-slate-200 rounded-lg" />
        <div className="w-36 h-9 bg-slate-100 rounded-lg" />
        <div className="w-28 h-9 bg-slate-100 rounded-lg" />
      </div>

      {/* Content panel skeleton */}
      <div className="space-y-4">
        <div className="h-44 bg-white rounded-2xl border border-border/70 p-6 space-y-3 shadow-xs">
          <div className="w-48 h-5 bg-slate-200 rounded" />
          <div className="w-72 h-4 bg-slate-100 rounded" />
          <div className="w-36 h-10 bg-slate-200 rounded-xl mt-4" />
        </div>
        <div className="h-40 bg-white rounded-2xl border border-border/70 p-6 space-y-3 shadow-xs">
          <div className="w-44 h-5 bg-slate-200 rounded" />
          <div className="w-80 h-4 bg-slate-100 rounded" />
        </div>
      </div>

      <span className="sr-only">Loading settings...</span>
    </div>
  )
}
