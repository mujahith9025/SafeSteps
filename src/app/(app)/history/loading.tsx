import React from 'react'
import { HistorySkeleton } from '@/components/history/HistorySkeleton'

export default function HistoryLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="w-48 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-64 h-8 bg-slate-200 rounded animate-pulse" />
          <div className="w-96 h-4 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="w-36 h-11 bg-slate-200 rounded-xl animate-pulse" />
      </div>

      {/* History cards skeleton */}
      <HistorySkeleton />
    </div>
  )
}
