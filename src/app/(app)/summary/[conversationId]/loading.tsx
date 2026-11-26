import React from 'react'

export default function SummaryLoading() {
  return (
    <div
      className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in"
      role="status"
      aria-label="Loading doctor visit summary"
    >
      {/* Top action bar skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-36 h-9 bg-slate-200 rounded-xl animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-28 h-10 bg-slate-200 rounded-xl animate-pulse" />
          <div className="w-24 h-10 bg-slate-200 rounded-xl animate-pulse" />
          <div className="w-36 h-10 bg-teal-100 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Main Document Card Skeleton */}
      <div className="bg-white rounded-2xl border border-border/80 shadow-sm p-6 sm:p-10 space-y-6 animate-pulse">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="space-y-2">
            <div className="w-32 h-6 bg-teal-100 rounded-md" />
            <div className="w-64 h-8 bg-slate-200 rounded" />
            <div className="w-48 h-4 bg-slate-100 rounded" />
          </div>
          <div className="w-28 h-8 bg-slate-200 rounded-lg" />
        </div>

        {/* Patient Details strip */}
        <div className="p-4 bg-slate-50 rounded-xl flex flex-wrap gap-6">
          <div className="w-32 h-4 bg-slate-200 rounded" />
          <div className="w-24 h-4 bg-slate-200 rounded" />
          <div className="w-36 h-4 bg-slate-200 rounded" />
        </div>

        {/* Urgency Box */}
        <div className="p-5 bg-amber-50/60 border border-amber-200/60 rounded-xl space-y-2">
          <div className="w-40 h-5 bg-amber-200 rounded" />
          <div className="w-full h-4 bg-amber-100 rounded" />
        </div>

        {/* Symptoms Section */}
        <div className="space-y-3">
          <div className="w-36 h-5 bg-slate-200 rounded" />
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 rounded" />
            <div className="w-4/5 h-4 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="w-56 h-5 bg-slate-200 rounded" />
          <div className="space-y-2">
            <div className="w-full h-10 bg-slate-50 rounded-xl" />
            <div className="w-full h-10 bg-slate-50 rounded-xl" />
            <div className="w-full h-10 bg-slate-50 rounded-xl" />
          </div>
        </div>
      </div>

      <span className="sr-only">Loading doctor visit summary...</span>
    </div>
  )
}
