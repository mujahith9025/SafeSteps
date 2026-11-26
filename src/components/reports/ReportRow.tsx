'use client'

import React, { useState } from 'react'
import {
  ChevronDown,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  HelpCircle,
  Edit2,
  Check,
  X,
  Stethoscope,
  Info,
  HelpCircle as QuestionIcon,
} from 'lucide-react'

export interface ReportValueItem {
  id: string
  test_name: string
  value_numeric: number | null
  value_text: string | null
  unit: string | null
  reference_low: number | null
  reference_high: number | null
  status: 'normal' | 'high' | 'low' | 'critical' | 'unknown'
  explanation: string | null
  corrected_by_user?: boolean
  explanationDetail?: {
    whatItMeasures?: string
    whatItMeans?: string
    suggestedQuestions?: string[]
  }
}

interface ReportRowProps {
  item: ReportValueItem
  isGlobalEditMode: boolean
  onQuickSave: (id: string, value: number, unit: string) => Promise<void>
  explanationDetail?: {
    whatItMeasures?: string
    whatItMeans?: string
    suggestedQuestions?: string[]
  }
}

export function ReportRow({
  item,
  isGlobalEditMode,
  onQuickSave,
  explanationDetail,
}: ReportRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLocalEditing, setIsLocalEditing] = useState(false)
  const [localVal, setLocalVal] = useState(String(item.value_numeric ?? ''))
  const [localUnit, setLocalUnit] = useState(item.unit ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = isGlobalEditMode || isLocalEditing

  const detail = explanationDetail || item.explanationDetail
  const measuresText =
    detail?.whatItMeasures ||
    (item.explanation ? item.explanation.split('.')[0] + '.' : null) ||
    `Measures clinical levels of ${item.test_name}.`
  const meansText =
    detail?.whatItMeans ||
    item.explanation ||
    `Your measurement of ${item.value_numeric ?? item.value_text ?? '—'} ${
      item.unit || ''
    } is evaluated against standard clinical benchmarks.`
  const questionsList =
    detail?.suggestedQuestions && detail.suggestedQuestions.length > 0
      ? detail.suggestedQuestions
      : [
          `How does this ${item.test_name} result compare to my previous baseline tests?`,
          ...(item.status !== 'normal'
            ? [
                `Could any recent lifestyle, hydration, or diet changes influence this result?`,
              ]
            : []),
          `When should I schedule repeat blood work to monitor this biomarker?`,
        ]

  const handleSaveLocal = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const num = parseFloat(localVal)
    if (!Number.isFinite(num)) return

    setIsSaving(true)
    try {
      await onQuickSave(item.id, num, localUnit)
      setIsLocalEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelLocal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalVal(String(item.value_numeric ?? ''))
    setLocalUnit(item.unit ?? '')
    setIsLocalEditing(false)
  }

  // Visual Gauge Calculation: percentage of range
  const low = item.reference_low
  const high = item.reference_high
  const val = item.value_numeric

  let gaugePercent = 50
  if (low !== null && high !== null && val !== null && high > low) {
    gaugePercent = Math.min(100, Math.max(0, ((val - low) / (high - low)) * 100))
  }

  // Status Chip Rendering - strictly bound to deterministic code-computed item.status
  const renderStatusChip = () => {
    const slug = item.test_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    switch (item.status) {
      case 'normal':
        return (
          <span
            data-testid={`status-chip-${slug}`}
            data-status="normal"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#bdece2]/60 text-teal-800 border border-teal-200/80 font-medium text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Normal</span>
          </span>
        )
      case 'low':
        return (
          <span
            data-testid={`status-chip-${slug}`}
            data-status="low"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium text-xs"
          >
            <ArrowDown className="w-3.5 h-3.5 text-amber-700" />
            <span>Low</span>
          </span>
        )
      case 'high':
        return (
          <span
            data-testid={`status-chip-${slug}`}
            data-status="high"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium text-xs"
          >
            <ArrowUp className="w-3.5 h-3.5 text-amber-700" />
            <span>High</span>
          </span>
        )
      case 'critical':
        return (
          <span
            data-testid={`status-chip-${slug}`}
            data-status="critical"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Needs attention</span>
          </span>
        )
      case 'unknown':
      default:
        return (
          <span
            data-testid={`status-chip-${slug}`}
            data-status="unknown"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs"
            title="Could not calibrate against standard range"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Couldn&apos;t check this one</span>
          </span>
        )
    }
  }

  // Range Display String
  const rangeDisplay = () => {
    if (low !== null && high !== null) {
      if (low === 0) return `< ${high}`
      return `${low} – ${high}`
    }
    if (high !== null) return `< ${high}`
    if (low !== null) return `> ${low}`
    return 'General benchmark'
  }

  return (
    <>
      <tr
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${item.test_name}: ${item.value_numeric ?? item.value_text ?? '—'} ${item.unit || ''}, Status ${item.status}. Click or press Enter to expand explanation.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!isEditing) setIsExpanded(!isExpanded)
          }
        }}
        onClick={() => {
          if (!isEditing) setIsExpanded(!isExpanded)
        }}
        className={`lab-row cursor-pointer transition-colors border-b border-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-inset ${
          isExpanded ? 'bg-teal-50/20' : 'hover:bg-slate-50/80 bg-white'
        }`}
      >
        {/* Column 1: Test Name (Row Header) */}
        <th scope="row" className="font-normal py-4 px-4 sm:px-5 text-left">
          <div className="flex items-center gap-2.5">
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-medium text-sm">
                  {item.test_name}
                </span>
                {item.corrected_by_user && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-800 font-semibold border border-teal-200" title="Manually verified or edited">
                    Edited
                  </span>
                )}
              </div>
              <span className="block text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {item.explanation?.split('.')[0] || 'Biomarker analysis'}
              </span>
            </div>
          </div>
        </th>

        {/* Column 2: Value */}
        <td className="py-4 px-3 sm:px-4 font-mono font-medium text-sm">
          {isEditing ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={localVal}
                onChange={(e) => setLocalVal(e.target.value)}
                className="w-16 h-8 px-2 text-center text-xs font-semibold border border-teal-600 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono shadow-xs"
              />
              {!isGlobalEditMode && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveLocal}
                    disabled={isSaving}
                    className="p-1 text-teal-700 hover:text-teal-800"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelLocal}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <span
                className={`text-sm ${
                  item.status === 'critical'
                    ? 'font-bold text-rose-700'
                    : item.status === 'high' || item.status === 'low'
                    ? 'font-semibold text-amber-800'
                    : 'font-semibold text-slate-900'
                }`}
              >
                {item.value_numeric ?? item.value_text ?? '—'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLocalEditing(true)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-teal-700 transition-opacity"
                title="Quick edit value"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </td>

        {/* Column 3: Unit */}
        <td className="py-4 px-3 sm:px-4 text-xs text-slate-500 font-mono">
          {isEditing && isGlobalEditMode ? (
            <input
              type="text"
              value={localUnit}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setLocalUnit(e.target.value)}
              className="w-20 h-8 px-2 text-center text-xs border border-teal-600 rounded-lg bg-white focus:outline-none font-mono shadow-xs"
            />
          ) : (
            item.unit || '—'
          )}
        </td>

        {/* Column 4: Usual Range (Benchmark) */}
        <td className="py-4 px-3 sm:px-4 text-xs text-slate-600">
          <div className="flex flex-col">
            <span className="font-medium text-slate-800">{rangeDisplay()}</span>
            {low !== null && high !== null && (
              <div className="w-20 sm:w-24 h-1.5 bg-slate-200/80 rounded-full mt-1 relative overflow-hidden">
                <div
                  className={`absolute h-full rounded-full ${
                    item.status === 'normal'
                      ? 'bg-teal-700'
                      : item.status === 'critical'
                      ? 'bg-rose-600'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: '40%', left: `${Math.max(0, Math.min(60, gaugePercent - 20))}%` }}
                />
              </div>
            )}
          </div>
        </td>

        {/* Column 5: Status */}
        <td className="py-4 px-4 sm:px-5 text-right whitespace-nowrap">
          {renderStatusChip()}
        </td>
      </tr>

      {/* Expanded Accordion Row matching Stitch */}
      {isExpanded && (
        <tr className="bg-[#f8f9ff]">
          <td colSpan={5} className="p-4 sm:p-6 border-b border-slate-200">
            <div
              className={`rounded-xl border-l-4 bg-white p-5 shadow-xs flex flex-col gap-4 ${
                item.status === 'critical'
                  ? 'border-l-rose-500'
                  : item.status === 'high' || item.status === 'low'
                  ? 'border-l-amber-500'
                  : item.status === 'normal'
                  ? 'border-l-teal-600'
                  : 'border-l-slate-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Clinical Explainer: {item.test_name}</span>
                </div>
                {item.status === 'critical' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-100 text-rose-800 font-medium">
                    Requires prompt doctor review
                  </span>
                ) : item.status === 'high' || item.status === 'low' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-900 font-medium">
                    Discuss at next routine checkup
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-teal-100 text-teal-900 font-medium">
                    Reassuring baseline
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-teal-700" />
                    What this test measures:
                  </h4>
                  <p className="text-slate-600" data-testid="what-it-measures">
                    {measuresText}
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                    What your result means in plain English:
                  </h4>
                  <p className="text-slate-600" data-testid="what-it-means">
                    {meansText}
                  </p>
                </div>
              </div>

              {/* Questions for Doctor */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <h4 className="font-semibold text-slate-900 text-xs mb-1.5 flex items-center gap-1.5">
                  <QuestionIcon className="w-3.5 h-3.5 text-teal-700" />
                  Suggested questions for your doctor:
                </h4>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {questionsList.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
