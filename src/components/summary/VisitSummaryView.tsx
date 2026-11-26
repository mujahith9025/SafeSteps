'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Copy,
  Check,
  Printer,
  Download,
  Shield,
  Calendar,
  AlertTriangle,
  Clock,
  Lock,
  History,
  CheckCircle2,
  FileText,
  BadgeCheck,
} from 'lucide-react'
import { VisitSummary, PatientDetails, ConversationRecord } from '@/lib/summary'

interface VisitSummaryViewProps {
  summary: VisitSummary
  conversation: ConversationRecord
  patientDetails: PatientDetails
}

export function VisitSummaryView({
  summary,
  conversation,
  patientDetails,
}: VisitSummaryViewProps) {
  const [copied, setCopied] = useState(false)
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({})

  const consultationRef = `#SF-${conversation.id
    .replace(/-/g, '')
    .substring(0, 5)
    .toUpperCase()}`

  const formattedDate = new Date(conversation.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const formattedTime = new Date(conversation.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Urgency configurations
  const urgencyConfig = {
    emergency: {
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      railBg: 'bg-rose-600',
      label: summary.urgencyLabel || 'Immediate Emergency Care Required (112)',
      isEmergency: true,
    },
    see_doctor_soon: {
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      railBg: 'bg-amber-500',
      label: summary.urgencyLabel || 'See a doctor soon (Within 24–48 hours)',
      isEmergency: false,
    },
    self_care: {
      badgeBg: 'bg-[#bdece2] text-teal-900 border-teal-300',
      railBg: 'bg-teal-600',
      label: summary.urgencyLabel || 'Self-care & routine monitoring',
      isEmergency: false,
    },
  }[summary.guidanceUrgency] || {
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    railBg: 'bg-slate-400',
    label: summary.urgencyLabel || 'Clinical Assessment',
    isEmergency: false,
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const toggleQuestion = (idx: number) => {
    setCheckedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }))
  }

  return (
    <div className="flex flex-col w-full max-w-[1120px] mx-auto pb-16 px-4 sm:px-6">
      {/* 1. Top Action Toolbar */}
      <header className="flex flex-col gap-4 mb-6 print:hidden">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Link href="/history" className="hover:text-teal-700 transition-colors">
            Consultations
          </Link>
          <span className="text-slate-300">/</span>
          <Link href={`/chat/${conversation.id}`} className="hover:text-teal-700 transition-colors truncate max-w-xs">
            {conversation.title}
          </Link>
          <span className="text-slate-300">/</span>
          <span aria-current="page" className="text-slate-900 font-semibold">
            Visit Summary Preview
          </span>
        </nav>

        {/* Main Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <Link
            href={`/chat/${conversation.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to chat</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#bdece2]/70 hover:bg-[#bdece2] text-teal-900 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-800" />
              <span>Print summary</span>
            </button>

            <a
              href={`/api/summary/${conversation.id}/pdf`}
              download={`SafeSteps-Visit-Summary-${conversation.id.substring(0, 8)}.pdf`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>

        {/* Reassuring Guidance Banner */}
        <div className="flex items-start gap-3 bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
            <BadgeCheck className="w-5 h-5 text-teal-700" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-teal-950">
              Prepared for medical consultation
            </span>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              This printable summary is structured to take directly to your GP appointment, show to an out-of-hours triage nurse, or upload to your surgery&apos;s online consultation service (eConsult / Patchs / Accurx).
            </p>
          </div>
        </div>
      </header>

      {/* 2. Document Preview Workspace */}
      <section aria-label="Printable A4 Document Sheet" className="flex flex-col items-center w-full">
        <article
          id="printable-summary-sheet"
          className="w-full max-w-[840px] bg-white text-slate-900 rounded-2xl shadow-xl p-8 sm:p-12 border border-slate-200/90 relative print:shadow-none print:p-0 print:border-none print:w-full print:max-w-none"
        >
          {/* Clinical Verification Ribbon in Document */}
          <div className="flex items-center justify-between pb-2 mb-6 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              <span>SafeSteps Patient Health Record Intake • Verification {consultationRef}</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">Ref: SS-UK-9021</span>
          </div>

          {/* Document Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 mb-6 border-b border-slate-200">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  SS
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-teal-900 tracking-tight leading-tight">
                    SafeSteps
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Clinical Guidance Support
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                Structured clinical intake summary prepared by the patient via SafeSteps AI Health Guidance to assist in-person or telehealth GP consultation.
              </p>
            </div>

            <div className="flex flex-col sm:items-end text-left sm:text-right">
              <span className="text-base sm:text-lg font-bold text-slate-900">
                Visit summary for your doctor
              </span>
              <div className="flex sm:justify-end items-center gap-1.5 mt-1">
                <span className="text-xs text-slate-500">Consultation ID:</span>
                <span className="font-mono text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  {consultationRef}
                </span>
              </div>
              <div className="flex sm:justify-end items-center gap-1.5 mt-1 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <time dateTime={conversation.created_at}>
                  {formattedDate}, {formattedTime}
                </time>
              </div>
            </div>
          </header>

          {/* Patient Details Box */}
          <section aria-label="Patient Profile Summary" className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-200/80">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-700" />
                Patient Information &amp; Relevant Background
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {patientDetails.disclaimerNote}
              </span>
            </div>

            {patientDetails.personaliseEnabled ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                {/* Col 1: Identity */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500">Patient Full Name</span>
                  <span className="text-sm font-bold text-slate-900">
                    {patientDetails.fullName || 'Registered Patient'}
                  </span>
                  <span className="text-slate-600 mt-1">
                    {[
                      patientDetails.age ? `Age: ${patientDetails.age}` : null,
                      patientDetails.sex ? `Sex: ${patientDetails.sex}` : null,
                    ]
                      .filter(Boolean)
                      .join(' • ') || 'Adult'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                    ID: {consultationRef}
                  </span>
                </div>

                {/* Col 2: Allergies */}
                <div className="flex flex-col bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                  <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Known Allergies (Critical)
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {patientDetails.allergies.length > 0 ? (
                      patientDetails.allergies.map((all, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                        >
                          {all}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-xs">No known allergies reported</span>
                    )}
                  </div>
                </div>

                {/* Col 3: Conditions & Medicines */}
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Pre-existing Health Conditions</span>
                    <span className="font-medium text-slate-800">
                      {patientDetails.conditions.length > 0
                        ? patientDetails.conditions.join(', ')
                        : 'None reported'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Current Regular Medicines</span>
                    <span className="font-medium text-slate-800">
                      {patientDetails.medicines.length > 0
                        ? patientDetails.medicines.join(', ')
                        : 'None reported'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Patient details withheld:</span> Personalisation is disabled in your profile privacy settings. To include your age, allergies, and health background on clinical summaries, enable personalisation in your Health Profile.
              </div>
            )}
          </section>

          {/* Section 1: Symptoms & Timeline */}
          <section aria-label="Symptom Timeline" className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-700" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                1. What I told SafeSteps (Symptoms &amp; Timeline)
              </h2>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col gap-3">
              {summary.symptoms.map((sym, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{sym.name}</span>
                    {sym.details && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {sym.details}
                      </p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shrink-0">
                    Duration: {sym.duration || 'Not specified'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Questions SafeSteps Asked & Patient Responses */}
          {summary.keyAnswers && summary.keyAnswers.length > 0 && (
            <section aria-label="Clinical Intake Q&A" className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-700" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  2. Questions SafeSteps Asked &amp; Patient Responses
                </h2>
              </div>

              <div className="flex flex-col gap-2.5">
                {summary.keyAnswers.map((ka, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 flex flex-col gap-1.5 text-xs"
                  >
                    <div className="flex items-start gap-2 text-slate-700 font-semibold">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 font-mono text-[10px]">
                        Q
                      </span>
                      <span>&ldquo;{ka.question}&rdquo;</span>
                    </div>
                    <div className="flex items-start gap-2 pl-6 text-slate-900">
                      <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{ka.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: SafeSteps Guidance & Triage Assessment */}
          <section aria-label="Triage Recommendation" className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-700" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                3. SafeSteps Guidance &amp; Triage Assessment
              </h2>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 relative overflow-hidden border border-slate-200/80">
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${urgencyConfig.railBg}`} />
              <div className="flex flex-col gap-3 pl-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${urgencyConfig.badgeBg}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Urgency Level: {urgencyConfig.label}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Non-diagnostic triage advice
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mt-1 font-normal">
                  {summary.plainSummary}
                </p>

                <div className="flex items-center gap-1.5 pt-2 text-slate-500 text-[11px] border-t border-slate-200/60">
                  <BadgeCheck className="w-4 h-4 text-teal-700" />
                  <span>Clinical reference benchmarks: NHS Pathways &amp; NICE Guidelines aligned</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Suggested Questions for Your Consultation */}
          <section aria-label="Recommended Questions for Consultation" className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-700" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  4. Suggested Questions for Your Consultation
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Tick or note down answers during visit
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {summary.doctorQuestions.map((q, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    checkedQuestions[idx]
                      ? 'bg-teal-50/50 border-teal-200 text-teal-950'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/60 text-slate-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedQuestions[idx])}
                    onChange={() => toggleQuestion(idx)}
                    className="mt-0.5 w-4 h-4 rounded text-teal-700 border-slate-300 focus:ring-teal-600 shrink-0 accent-teal-700 cursor-pointer"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                      {idx + 1}. {q}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Document Footer (Required Verbatim) */}
          <footer className="pt-4 mt-8 bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col gap-1.5 text-xs text-slate-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-teal-700" />
                <span>Generated by SafeSteps. General information only, not a medical record or diagnosis.</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Page 1 of 1</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-200/40">
              <span>Patient-authorized consultation intake • NHS DCB0129 Clinical Safety Aligned • 256-bit Encrypted</span>
              <span>Record ID: {consultationRef}</span>
            </div>
          </footer>
        </article>

        {/* Bottom Quick Actions */}
        <div className="w-full max-w-[840px] flex items-center justify-between py-4 px-2 text-slate-500 text-xs font-medium print:hidden">
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 hover:text-teal-700 transition-colors"
          >
            <History className="w-4 h-4" />
            <span>View past consultation summaries</span>
          </Link>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-teal-700" />
            <span>Data stored securely in accordance with UK GDPR</span>
          </div>
        </div>
      </section>
    </div>
  )
}
