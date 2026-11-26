'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Building2,
  BadgeCheck,
  Edit3,
  Download,
  Share2,
  FileCheck2,
  CheckCircle2,
  ArrowUpDown,
  AlertTriangle,
  Clock,
  CalendarCheck,
  ListChecks,
  PhoneCall,
  FileText,
  AlertCircle,
  Save,
  Trash2,
  Sparkles,
  Printer,
} from 'lucide-react'
import { ReportTable } from './ReportTable'
import { ReportValueItem } from './ReportRow'

export interface CachedExplanation {
  testName: string
  whatItMeasures: string
  whatItMeans: string
  suggestedQuestions?: string[]
}

export interface ReportSummary {
  totalCount?: number
  normalCount?: number
  outsideCount?: number
  criticalCount?: number
  unknownCount?: number
  overallSummary?: string
  doctorQuestions?: string[]
  cachedExplanations?: CachedExplanation[]
  labName?: string
  derivedAt?: string
  updatedAt?: string
}

export interface ReportData {
  id: string
  title: string
  source_type: string
  summary: ReportSummary | null
  created_at: string
}

interface ResultsViewProps {
  report: ReportData
  initialValues: ReportValueItem[]
}

export function ResultsView({ report, initialValues }: ResultsViewProps) {
  const router = useRouter()
  const [values, setValues] = useState<ReportValueItem[]>(initialValues)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSavingAll, setIsSavingAll] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [summaryData, setSummaryData] = useState<ReportSummary | null>(report.summary)

  // Show transient toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Calculate live metric counts from values strictly in code
  const totalCount = values.length
  const normalCount = values.filter((v) => v.status === 'normal').length
  const outsideCount = values.filter((v) => v.status === 'high' || v.status === 'low').length
  const criticalCount = values.filter((v) => v.status === 'critical').length

  // Amber-to-red banner condition: strictly evaluated by code
  const hasCritical = values.some((v) => v.status === 'critical')

  const formattedDate = new Date(report.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  // Quick single row save
  const handleQuickSave = async (id: string, value: number, unit: string) => {
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ id, value_numeric: value, unit }],
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update value')
      }

      const data = await res.json()
      if (data.values) {
        setValues(data.values)
        if (data.summary) setSummaryData(data.summary)
        triggerToast('Value updated and re-evaluated successfully.')
      }
    } catch {
      triggerToast('Unable to save changes. Please try again.')
    }
  }

  // Global save for all edited rows
  const handleSaveAllEdits = async () => {
    setIsSavingAll(true)
    try {
      // Collect current table inputs
      const updates = values.map((v) => ({
        id: v.id,
        value_numeric: v.value_numeric ?? 0,
        unit: v.unit,
        test_name: v.test_name,
      }))

      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!res.ok) throw new Error('Failed to update values')

      const data = await res.json()
      if (data.values) {
        setValues(data.values)
        if (data.summary) setSummaryData(data.summary)
        setIsEditMode(false)
        triggerToast('All values updated and re-evaluated against reference intervals.')
      }
    } catch {
      triggerToast('Unable to update values. Please try again.')
    } finally {
      setIsSavingAll(false)
    }
  }

  // Delete report handler
  const handleDeleteReport = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete report')
      }

      triggerToast('Report deleted successfully.')
      router.push('/reports')
    } catch {
      triggerToast('Unable to delete report. Please try again.')
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // Print / Download summary sheet
  const handleDownloadPdf = () => {
    window.print()
  }

  // Share with GP
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: `SafeSteps Clinical Report Explanation: ${report.title}`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      triggerToast('Report link copied to clipboard.')
    }
  }

  return (
    <div className="flex flex-col w-full max-w-[1140px] mx-auto pb-16 px-4 sm:px-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-teal-800 text-white shadow-xl flex items-center gap-3 transition-all animate-bounce print:hidden"
        >
          <CheckCircle2 className="w-5 h-5 text-teal-200" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Amber-to-red banner for critical values (Produced strictly by code, not by model) */}
      {hasCritical && (
        <div
          role="alert"
          data-testid="critical-alert-banner"
          className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/15 to-red-500/20 border-2 border-rose-300 text-rose-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5 text-rose-700 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                One or more values may need prompt medical attention. Please contact a doctor today.
              </h3>
              <p className="text-xs text-rose-900/90 mt-1 leading-relaxed">
                Some biomarkers in this report cross clinical safety thresholds. If you are experiencing chest pain, severe shortness of breath, sudden weakness, or other severe symptoms, visit our{' '}
                <Link
                  href="/chat?emergency=true"
                  className="underline font-bold text-rose-700 hover:text-rose-900"
                >
                  emergency page
                </Link>{' '}
                or call{' '}
                <a href="tel:112" className="underline font-bold text-rose-700 hover:text-rose-900">
                  112
                </a>{' '}
                immediately.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center print:hidden">
            <Link
              href="/chat?emergency=true"
              className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Emergency help (112)</span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Navigation / Breadcrumbs */}
      <div className="flex flex-col gap-4 mb-6 print:hidden">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/reports" className="hover:text-teal-700 transition-colors">
            My reports
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold truncate">{report.title}</span>
        </div>

        {/* Main Title & Action Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {report.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                Report date: {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                <Building2 className="w-3.5 h-3.5 text-teal-700" />
                Source: {report.source_type === 'file' ? 'Uploaded document' : 'Pasted text'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#bdece2] text-teal-900 text-xs font-semibold">
                <BadgeCheck className="w-3.5 h-3.5 text-teal-800" />
                Verified digital intake
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (isEditMode) {
                  handleSaveAllEdits()
                } else {
                  setIsEditMode(true)
                }
              }}
              disabled={isSavingAll}
              className={`h-10 px-3.5 border rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all ${
                isEditMode
                  ? 'bg-teal-700 text-white border-teal-700 hover:bg-teal-800'
                  : 'bg-white hover:bg-slate-50 text-teal-800 border-teal-200'
              }`}
              title="Correct misread numbers or units"
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSavingAll ? 'Saving...' : 'Done Editing (Save numbers)'}</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Edit values (Correct misread numbers)</span>
                </>
              )}
            </button>

            <a
              href={`/api/reports/${report.id}/pdf`}
              download={`SafeSteps-Report-${report.id.substring(0, 8)}.pdf`}
              className="h-10 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              title="Download clinical lab report A4 PDF"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download PDF</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="h-10 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Print report"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="h-10 px-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share with GP</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="h-10 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
              title="Delete report"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Verification Notice Required by Prompt */}
      <div className="mb-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-2xs print:hidden">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="font-bold text-amber-950 text-sm">
            Please check that these values match your report. Photos can be misread.
          </span>
          <span className="text-amber-800 mt-0.5">
            Document scans and camera captures may occasionally misread faint numbers or decimal points.
            Use the <strong>&ldquo;Edit values&rdquo;</strong> button above to adjust any misread figures before taking this sheet to your doctor.
          </span>
        </div>
      </div>

      {/* Summary Card: "At a glance" matching Stitch */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">At a glance</h2>
            <p className="text-xs text-slate-500">
              Overview of {totalCount} test parameters identified in your laboratory report.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
            <BadgeCheck className="w-4 h-4" />
            <span>Clinically structured preview</span>
          </div>
        </div>

        {/* 4 Metric Highlight Cards (Built strictly in code) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Total Values Read */}
          <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-medium">Total values read</span>
              <FileCheck2 className="w-5 h-5 text-slate-400" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-slate-900" data-testid="count-total">
                {totalCount}
              </span>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" /> All evaluated
              </p>
            </div>
          </div>

          {/* Within Usual Range */}
          <div className="bg-teal-50/50 rounded-xl p-4 flex flex-col justify-between border border-teal-100">
            <div className="flex items-center justify-between text-teal-800">
              <span className="text-xs font-medium">Within usual range</span>
              <CheckCircle2 className="w-5 h-5 text-teal-700" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-teal-800" data-testid="count-normal">
                {normalCount}
              </span>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-teal-700 font-semibold">Normal &amp; optimal</span>
              </p>
            </div>
          </div>

          {/* Outside Usual Range */}
          <div className="bg-amber-50/60 rounded-xl p-4 flex flex-col justify-between border border-amber-200/70">
            <div className="flex items-center justify-between text-amber-900">
              <span className="text-xs font-medium">Outside usual range</span>
              <ArrowUpDown className="w-5 h-5 text-amber-600" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-amber-900" data-testid="count-outside">
                {outsideCount}
              </span>
              <p className="text-xs text-amber-800 mt-1 flex items-center gap-1">
                Slightly low / high
              </p>
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-rose-50/60 rounded-xl p-4 flex flex-col justify-between border border-rose-200/80">
            <div className="flex items-center justify-between text-rose-900">
              <span className="text-xs font-medium">Needs attention</span>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-rose-700" data-testid="count-critical">
                {criticalCount}
              </span>
              <p className="text-xs text-rose-800 mt-1 flex items-center gap-1 font-medium">
                Prompt GP review
              </p>
            </div>
          </div>
        </div>

        {/* Plain-Language Overall Clinical Summary (Cached from Gemini/guardrails) */}
        {summaryData?.overallSummary && (
          <div className="mt-5 p-4 rounded-xl bg-teal-50/40 border border-teal-100 text-xs">
            <div className="flex items-center gap-2 text-teal-900 font-semibold mb-1.5">
              <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Overall Clinical Summary</span>
            </div>
            <p className="text-slate-700 leading-relaxed font-normal">
              {summaryData.overallSummary}
            </p>
          </div>
        )}
      </section>

      {/* Interactive Data Table with Search & Filter Tabs */}
      <ReportTable
        items={values}
        isGlobalEditMode={isEditMode}
        onQuickSave={handleQuickSave}
        cachedExplanations={summaryData?.cachedExplanations}
      />

      {/* Guidance Card: "What you can do next" matching Stitch */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 mb-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">What you can do next</h2>
            <p className="text-xs text-slate-500">
              Practical next steps based on your {report.title} summary:
            </p>
          </div>
        </div>

        {/* 3 Actionable Step Bullets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-teal-700 shadow-2xs shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900">1. Book GP Review</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Schedule a routine GP consultation to discuss any values identified outside standard ranges.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 mt-3 inline-flex items-center gap-1">
              Routine non-urgent
            </span>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-teal-700 shadow-2xs shrink-0 mt-0.5">
                <ListChecks className="w-4 h-4" />
              </div>
              <div className="w-full">
                <h3 className="text-xs font-semibold text-slate-900">2. Questions for your Doctor</h3>
                <div className="mt-2 space-y-1">
                  {(summaryData?.doctorQuestions && summaryData.doctorQuestions.length > 0
                    ? summaryData.doctorQuestions
                    : [
                        'How do these results compare to my previous baselines?',
                        'Could any recent medications, hydration, or diet influence these levels?',
                        'When should I schedule repeat blood work to monitor these markers?',
                      ]
                  ).map((q, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-teal-700 font-semibold">•</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 mt-3 inline-flex items-center gap-1">
              Prep sheet ready
            </span>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200/70 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 shadow-2xs shrink-0 mt-0.5">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900">3. Watch for Red Flags</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  If you develop severe acute chest pain, sudden breathlessness, or fainting, call 112 immediately.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-rose-700 mt-3 inline-flex items-center gap-1">
              Emergency 112 protocol
            </span>
          </div>
        </div>

        {/* Doctor Discussion Box */}
        <div className="mt-5 p-4 rounded-xl bg-[#eff4ff] border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-teal-700 shrink-0" />
            <p className="text-xs text-slate-700">
              Your doctor can interpret these numbers in the context of your complete medical history and symptoms.
            </p>
          </div>
          <a
            href={`/api/reports/${report.id}/pdf`}
            download={`SafeSteps-GP-Discussion-Sheet-${report.id.substring(0, 8)}.pdf`}
            className="h-10 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export GP Discussion Sheet (PDF)</span>
          </a>
        </div>

        {/* Verbatim Required Footer */}
        <div className="text-center text-slate-400 text-xs font-medium mt-6 pt-4 border-t border-slate-100">
          This explains your results. It is not a diagnosis.
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => {
            if (!isDeleting) setShowDeleteModal(false)
          }}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
                  Delete this report?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This will permanently delete &ldquo;{report.title}&rdquo; and all associated test values. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReport}
                disabled={isDeleting}
                className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
