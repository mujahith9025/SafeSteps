import React from 'react'

export default function ReportsLoading() {
  return (
    <div
      className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse"
      role="status"
      aria-label="Loading reports page"
    >
      <header className="space-y-2">
        <div className="w-40 h-5 bg-teal-100 rounded-full" />
        <div className="w-64 h-8 bg-slate-200 rounded-xl" />
        <div className="w-96 h-4 bg-slate-100 rounded" />
      </header>

      {/* Tabs */}
      <div className="flex gap-2">
        <div className="w-32 h-10 bg-slate-200 rounded-xl" />
        <div className="w-32 h-10 bg-slate-100 rounded-xl" />
      </div>

      {/* Upload Dropzone Skeleton */}
      <div className="h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-200" />
        <div className="w-48 h-5 bg-slate-200 rounded" />
        <div className="w-72 h-4 bg-slate-100 rounded" />
      </div>

      {/* Previous reports section skeleton */}
      <div className="space-y-3 pt-6">
        <div className="w-48 h-6 bg-slate-200 rounded" />
        <div className="h-20 bg-white rounded-xl border border-border/70 p-4" />
        <div className="h-20 bg-white rounded-xl border border-border/70 p-4" />
      </div>

      <span className="sr-only">Loading reports...</span>
    </div>
  )
}
