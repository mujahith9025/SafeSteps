import React from 'react'

export default function ReportResultLoading() {
  return (
    <div
      className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in"
      role="status"
      aria-label="Loading lab report results"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="w-32 h-5 bg-teal-100 rounded-full animate-pulse" />
          <div className="w-72 h-8 bg-slate-200 rounded animate-pulse" />
          <div className="w-48 h-4 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-10 bg-slate-200 rounded-xl animate-pulse" />
          <div className="w-36 h-10 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Metrics Quick View Cards (4 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-white rounded-2xl border border-border/70 space-y-2 animate-pulse shadow-xs">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-7 w-12 bg-slate-300 rounded" />
            <div className="h-2.5 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* "At a glance" card skeleton */}
      <div className="p-6 bg-white rounded-2xl border border-border/70 space-y-3 animate-pulse shadow-xs">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="h-3.5 w-full bg-slate-100 rounded" />
        <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
      </div>

      {/* Biomarker Table Skeleton */}
      <div className="bg-white rounded-2xl border border-border/70 p-6 space-y-4 shadow-xs animate-pulse">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>

        {/* Rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="grid grid-cols-12 gap-3 items-center py-3 border-b border-slate-50 last:border-none">
            <div className="col-span-4 flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-slate-300 shrink-0" />
              <div className="h-4 w-28 bg-slate-200 rounded" />
            </div>
            <div className="col-span-3 h-4 w-16 bg-slate-200 rounded" />
            <div className="col-span-3 h-4 w-20 bg-slate-200 rounded" />
            <div className="col-span-2 h-6 w-16 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading lab report results...</span>
    </div>
  )
}
