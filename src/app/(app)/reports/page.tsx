'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UploadCloud,
  FileText,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import {
  Dropzone,
  FileChip,
  PasteTab,
  ProcessingView,
  ErrorCard,
  ReportErrorKind,
  PrivacyNotes,
  SecurityGuaranteeBadge,
} from '@/components/reports'

interface PreviousReportItem {
  id: string
  title: string
  source_type: string
  summary: {
    totalCount?: number
    normalCount?: number
    outsideCount?: number
    criticalCount?: number
    unknownCount?: number
  } | null
  created_at: string
}

export default function ReportsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorState, setErrorState] = useState<{
    kind: ReportErrorKind
    message?: string
    filename?: string
  } | null>(null)

  // Previous reports list
  const [previousReports, setPreviousReports] = useState<PreviousReportItem[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(true)

  // Load previous reports on mount
  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports')
        if (res.ok) {
          const data = await res.json()
          if (data.reports) {
            setPreviousReports(data.reports)
          }
        }
      } catch {
        // Silently handle network errors on previous reports loading
      } finally {
        setIsLoadingReports(false)
      }
    }
    loadReports()
  }, [])

  // Handle file selection from dropzone
  const handleFileSelect = (file: File) => {
    setErrorState(null)

    // Pre-check file size
    if (file.size > 5 * 1024 * 1024) {
      setErrorState({
        kind: 'file_too_large',
        filename: file.name,
      })
      setSelectedFile(null)
      return
    }

    // Pre-check file extension
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'png', 'jpg', 'jpeg'].includes(ext || '')) {
      setErrorState({
        kind: 'unsupported_type',
        filename: file.name,
      })
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  // Handle submit (file upload or pasted text)
  const handleSubmit = async () => {
    setErrorState(null)

    if (activeTab === 'upload' && !selectedFile) {
      setErrorState({
        kind: 'generic',
        message: 'Please choose or drag-and-drop a report file first.',
      })
      return
    }

    if (activeTab === 'paste' && (!pastedText.trim() || pastedText.trim().length < 5)) {
      setErrorState({
        kind: 'generic',
        message: 'Please paste your lab report text before continuing.',
      })
      return
    }

    setIsProcessing(true)

    try {
      let res: Response

      if (activeTab === 'upload' && selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)

        res = await fetch('/api/reports', {
          method: 'POST',
          body: formData,
        })
      } else {
        res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: pastedText }),
        })
      }

      const data = await res.json()

      if (!res.ok) {
        setIsProcessing(false)
        const errMsg = data.error || "We couldn't read this report. Try a clearer photo or paste the text."

        if (res.status === 429) {
          setErrorState({ kind: 'rate_limited', message: errMsg })
        } else if (errMsg.includes('type') || errMsg.includes('format')) {
          setErrorState({
            kind: 'unsupported_type',
            filename: selectedFile?.name,
            message: errMsg,
          })
        } else if (errMsg.includes('5 MB') || errMsg.includes('larger than')) {
          setErrorState({
            kind: 'file_too_large',
            filename: selectedFile?.name,
            message: errMsg,
          })
        } else if (errMsg.includes('clearly') || errMsg.includes('lighting') || errMsg.includes('camera')) {
          setErrorState({
            kind: 'unreadable',
            message: errMsg,
          })
        } else {
          setErrorState({ kind: 'generic', message: errMsg })
        }
        return
      }

      if (data.id) {
        // Navigate to result view
        router.push(`/reports/${data.id}`)
      } else {
        setIsProcessing(false)
        setErrorState({
          kind: 'generic',
          message: "We couldn't read this report. Try a clearer photo or paste the text.",
        })
      }
    } catch {
      setIsProcessing(false)
      setErrorState({
        kind: 'generic',
        message: 'Network issue encountered. Please check your connection and try again.',
      })
    }
  }

  // If in processing mode, display full screen processing view matching Stitch
  if (isProcessing) {
    const fileSizeText = selectedFile
      ? selectedFile.size < 1024 * 1024
        ? `${Math.round(selectedFile.size / 1024)} KB`
        : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : 'Clinical Text'

    return (
      <ProcessingView
        filename={selectedFile?.name || 'Report_Text.txt'}
        fileSizeText={fileSizeText}
        sourceType={activeTab === 'upload' ? 'file' : 'text'}
        onCancel={() => setIsProcessing(false)}
      />
    )
  }

  return (
    <div className="flex flex-col w-full max-w-[1120px] mx-auto pb-16 px-4 sm:px-6">
      {/* Section 1: Header matching Stitch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex flex-col max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-teal-700 font-medium text-xs mb-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Clinical Safety Aligned Guidance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Understand your lab report
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Upload a report or paste the text. SafeSteps explains each value in plain language. It does not diagnose.
          </p>
        </div>

        {/* Security & Privacy Metric Badge matching Stitch */}
        <div className="self-start md:self-auto">
          <SecurityGuaranteeBadge />
        </div>
      </div>

      {/* Section 2: Clinical Notice Panel matching Stitch */}
      <div className="mb-6">
        <PrivacyNotes />
      </div>

      {/* Error Card Display (if any error encountered) */}
      {errorState && (
        <div className="mb-6">
          <ErrorCard
            kind={errorState.kind}
            filename={errorState.filename}
            message={errorState.message}
            onSelectAnother={() => {
              setErrorState(null)
              setSelectedFile(null)
            }}
            onSwitchToPaste={() => {
              setErrorState(null)
              setActiveTab('paste')
            }}
            onDismiss={() => setErrorState(null)}
          />
        </div>
      )}

      {/* Section 3: Central Input Mechanism Container (16px radius matching Stitch) */}
      <div className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/80 mb-8">
        {/* Tab Controls */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload')
                setErrorState(null)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload file</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('paste')
                setErrorState(null)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'paste'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste text</span>
            </button>
          </div>

          {/* Quick Tips Indicator */}
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Lightbulb className="w-4 h-4 text-teal-700" />
            <span>Transient memory processing</span>
          </div>
        </div>

        {/* TAB 1: Upload File Pipeline */}
        {activeTab === 'upload' && (
          <div className="flex flex-col gap-4">
            {!selectedFile ? (
              <Dropzone onFileSelect={handleFileSelect} />
            ) : (
              <FileChip
                file={selectedFile}
                onRemove={() => {
                  setSelectedFile(null)
                  setErrorState(null)
                }}
              />
            )}

            {/* Primary CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedFile}
                className="w-full h-12 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Explain my report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Paste Text Pipeline */}
        {activeTab === 'paste' && (
          <div className="flex flex-col gap-4">
            <PasteTab text={pastedText} onChange={setPastedText} />

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!pastedText.trim()}
                className="w-full h-12 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Explain pasted text</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: What SafeSteps Explains (Anatomy Feature Cards matching Stitch) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#bdece2] text-teal-800 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-1">Plain-English Translations</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Decodes complex abbreviations like MCV, eGFR, and TLC without alarming medical jargon.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#bdece2] text-teal-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-1">Reference Range Context</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compares each value against laboratory benchmarks and flags low, high, or optimal markers.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#bdece2] text-teal-800 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-1">Doctor Discussion Questions</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prepares 3 to 4 tailored, focused questions to take directly into your next GP consultation.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Previous Reports History Section matching Stitch */}
      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-1 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Previous reports</h2>
            <p className="text-xs text-slate-500">
              Access earlier explanations, biomarker trends, and physician discussion sheets
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {isLoadingReports
              ? 'Loading archived reports...'
              : `${previousReports.length} archived explanation${previousReports.length === 1 ? '' : 's'}`}
          </div>
        </div>

        {/* Reports List Container */}
        {isLoadingReports ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200/80 text-xs text-slate-400">
            Loading your clinical reports...
          </div>
        ) : previousReports.length > 0 ? (
          <div className="flex flex-col gap-3">
            {previousReports.map((rep) => {
              const outside = (rep.summary?.outsideCount || 0) + (rep.summary?.criticalCount || 0)
              const isAllOptimal = outside === 0

              const dateText = new Date(rep.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })

              return (
                <div
                  key={rep.id}
                  className="bg-white rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs border border-slate-200/80 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#eff4ff] text-teal-800 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {rep.title}
                        </h3>
                        {isAllOptimal ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#bdece2] text-teal-900 font-semibold text-[11px]">
                            All optimal
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold text-[11px]">
                            {outside} flagged
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {dateText}
                        </span>
                        <span>•</span>
                        <span>
                          {isAllOptimal
                            ? `All ${rep.summary?.totalCount || 0} clinical markers within standard limits`
                            : `${rep.summary?.outsideCount || 0} out of range, ${rep.summary?.criticalCount || 0} needs attention`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <Link
                      href={`/reports/${rep.id}`}
                      className="h-9 px-3.5 rounded-xl bg-[#eff4ff] hover:bg-teal-50 text-teal-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>View explanation</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200/80 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">No previous reports yet</p>
            <p>Upload a lab report or paste the text above to see your first plain-language explanation.</p>
          </div>
        )}
      </div>

      {/* Section 6: Educational Helper Card matching Stitch */}
      <div className="mt-8 p-5 rounded-2xl bg-[#eff4ff] border border-teal-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white text-teal-700 flex items-center justify-center shadow-xs shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">
              Have questions about interpreting reference intervals?
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Learn why labs have slightly differing normal ranges based on age, gender, and test calibration equipment.
            </p>
          </div>
        </div>
        <Link
          href="/chat"
          className="h-9 px-4 rounded-xl bg-white hover:bg-slate-50 text-teal-800 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs transition-colors shrink-0"
        >
          <span>Ask SafeSteps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
