'use client'

import React, { useState, useMemo } from 'react'
import { Search, Touchpad } from 'lucide-react'
import { ReportRow, ReportValueItem } from './ReportRow'

interface ReportTableProps {
  items: ReportValueItem[]
  isGlobalEditMode: boolean
  onQuickSave: (id: string, value: number, unit: string) => Promise<void>
  cachedExplanations?: Array<{
    testName: string
    whatItMeasures: string
    whatItMeans: string
    suggestedQuestions?: string[]
  }>
}

export function ReportTable({
  items,
  isGlobalEditMode,
  onQuickSave,
  cachedExplanations,
}: ReportTableProps) {
  const [filter, setFilter] = useState<'all' | 'attention' | 'normal'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Map of cached explanations by lowercased test name
  const explanationMap = useMemo(() => {
    const map = new Map<string, { whatItMeasures: string; whatItMeans: string; suggestedQuestions?: string[] }>()
    if (cachedExplanations) {
      for (const exp of cachedExplanations) {
        map.set(exp.testName.toLowerCase(), exp)
      }
    }
    return map
  }, [cachedExplanations])

  // Count metrics for filter tabs
  const counts = useMemo(() => {
    const total = items.length
    const normal = items.filter((i) => i.status === 'normal').length
    const attention = items.filter(
      (i) => i.status === 'high' || i.status === 'low' || i.status === 'critical'
    ).length
    return { total, normal, attention }
  }, [items])

  // Filtered rows
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Tab filter
      if (filter === 'attention') {
        if (item.status !== 'high' && item.status !== 'low' && item.status !== 'critical') {
          return false
        }
      } else if (filter === 'normal') {
        if (item.status !== 'normal') return false
      }

      // 2. Search query filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim()
        const nameMatch = item.test_name.toLowerCase().includes(query)
        const unitMatch = item.unit?.toLowerCase().includes(query) ?? false
        return nameMatch || unitMatch
      }

      return true
    })
  }, [items, filter, searchQuery])

  return (
    <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden mb-8">
      {/* Table Toolbar matching Stitch */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#eff4ff]/30">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => setFilter('attention')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'attention'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Outside range &amp; Attention ({counts.attention})
          </button>
          <button
            type="button"
            onClick={() => setFilter('normal')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'normal'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Normal ({counts.normal})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test (e.g. Hemoglobin)..."
            className="w-full h-10 pl-10 pr-4 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Active State Guidance Ribbon matching Stitch */}
      <div className="px-5 py-2.5 bg-[#eff4ff]/60 flex items-center justify-between text-slate-600 text-xs border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <Touchpad className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            <strong className="text-slate-800 font-semibold">Click any test row</strong> to view plain-language clinical
            explanations and doctor questions.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[11px] text-slate-400">
          Units: SI standard
        </span>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider bg-slate-50/60">
              <th className="py-3 px-4 sm:px-5">Test Name &amp; Abbreviation</th>
              <th className="py-3 px-3 sm:px-4">Your Value</th>
              <th className="py-3 px-3 sm:px-4">Unit</th>
              <th className="py-3 px-3 sm:px-4">Usual Range (Benchmark)</th>
              <th className="py-3 px-4 sm:px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ReportRow
                  key={item.id}
                  item={item}
                  isGlobalEditMode={isGlobalEditMode}
                  onQuickSave={onQuickSave}
                  explanationDetail={explanationMap.get(item.test_name.toLowerCase())}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                  No matching test parameters found for &ldquo;{searchQuery || filter}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
