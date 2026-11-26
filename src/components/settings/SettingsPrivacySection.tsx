'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Download,
  Shield,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  FileText,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { updatePersonalisationAction } from '@/app/(app)/settings/actions'
import { DeleteAccountModal } from './DeleteAccountModal'

export interface SettingsPrivacySectionProps {
  userEmail?: string
  initialPersonalise: boolean
  profileContextSummary?: {
    age?: number | null
    conditions?: string[]
    allergies?: string[]
  }
  consentVersion?: string | null
  consentDate?: string | null
  onExportSuccess: (info: { fileSize: string; filename: string }) => void
}

export function SettingsPrivacySection({
  userEmail,
  initialPersonalise,
  profileContextSummary,
  consentVersion = '2026-11-v1',
  consentDate,
  onExportSuccess,
}: SettingsPrivacySectionProps) {
  const [personalise, setPersonalise] = useState(initialPersonalise)
  const [isUpdatingPersonalise, setIsUpdatingPersonalise] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const formattedConsentDate = consentDate
    ? new Date(consentDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Active since registration'

  // Handle Export as JSON
  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)

    try {
      const res = await fetch('/api/user/export')

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        setExportError(
          errorData.error || 'Failed to export your health records. Please try again.'
        )
        setIsExporting(false)
        return
      }

      // Download file to client
      const blob = await res.blob()
      const contentDisposition = res.headers.get('Content-Disposition')
      let filename = 'safesteps-data-export.json'
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) filename = match[1]
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      const sizeInKb = (blob.size / 1024).toFixed(1) + ' KB'
      onExportSuccess({ fileSize: sizeInKb, filename })
    } catch (err) {
      console.error('Export error:', err)
      setExportError('A network error occurred while generating the archive.')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle Personalisation Toggle
  const handleTogglePersonalise = async () => {
    const nextVal = !personalise
    setPersonalise(nextVal)
    setIsUpdatingPersonalise(true)

    const res = await updatePersonalisationAction(nextVal)
    if (!res.success) {
      setPersonalise(!nextVal) // Revert on failure
    }
    setIsUpdatingPersonalise(false)
  }

  // Format conditions & allergies preview
  const conditionsText =
    profileContextSummary?.conditions && profileContextSummary.conditions.length > 0
      ? profileContextSummary.conditions.join(', ')
      : 'None reported'

  const allergiesText =
    profileContextSummary?.allergies && profileContextSummary.allergies.length > 0
      ? profileContextSummary.allergies.join(', ')
      : 'None reported'

  return (
    <section
      id="panel-privacy"
      role="tabpanel"
      aria-labelledby="tab-btn-privacy"
      className="space-y-6 animate-in fade-in duration-200"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Privacy and data management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure automated AI triage context, audit active medical consents, or download your data records.
          </p>
        </div>
        <span className="self-start sm:self-auto bg-teal-50 text-teal-800 font-semibold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-teal-200">
          <Shield className="w-3.5 h-3.5 text-teal-700" />
          <span>DPDP Act & GDPR Compliant</span>
        </span>
      </div>

      {exportError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{exportError}</span>
        </div>
      )}

      {/* Card 1: Download My Data Archive matching Stitch */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Download my data archive
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Download a complete archive of your stored health assessments, symptom history, triage records, and clinical logs in open JSON format for your personal records or transfer to your GP.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap pt-1">
            <span className="flex items-center gap-1 text-teal-800">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              Generated on demand
            </span>
            <span>•</span>
            <span>AES-256 Encrypted archive</span>
            <span>•</span>
            <span>Structured JSON format</span>
          </div>
        </div>
        <div className="shrink-0 self-start md:self-center">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="h-12 px-5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? 'Generating bundle...' : 'Export as JSON'}</span>
          </button>
        </div>
      </div>

      {/* Card 2: Health Profile Personalisation matching Stitch */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Health profile personalisation
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Allow SafeSteps AI to reference your age{' '}
            {profileContextSummary?.age ? `(${profileContextSummary.age})` : ''}, pre-existing conditions (
            <span className="font-medium text-slate-900">{conditionsText}</span>), and recorded allergies (
            <span className="font-medium text-slate-900">{allergiesText}</span>) to offer tailored triage questions and contraindication screening.
          </p>
          <span className="text-xs text-teal-800 flex items-center gap-1.5 pt-0.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-teal-700" />
            Never used for advertising or shared with third parties.
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-3 self-start md:self-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={personalise}
              disabled={isUpdatingPersonalise}
              onChange={handleTogglePersonalise}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-700"></div>
          </label>
          <span className="font-semibold text-xs text-slate-800">
            {personalise ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Card 3: Consent Record matching Stitch */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Consent record
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditable log of privacy and clinical processing consents granted during account lifetime.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/privacy"
              className="h-9 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <span>Privacy Policy</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/terms"
              className="h-9 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <span>Terms</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Consent entries */}
        <div className="space-y-3">
          {/* Record 1 */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 text-xs sm:text-sm block">
                  Clinical Triage & Symptom Processing Consent
                </span>
                <span className="text-[11px] text-slate-500">
                  Agreed on {formattedConsentDate} • Version {consentVersion || '2026-11-v1'}
                </span>
              </div>
            </div>
            <span className="self-start sm:self-center inline-flex items-center gap-1 bg-white text-teal-800 font-semibold text-xs px-2.5 py-1 rounded-full border border-teal-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Active</span>
            </span>
          </div>

          {/* Record 2 */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 text-xs sm:text-sm block">
                  DPDP Act Health Data Processing Alignment
                </span>
                <span className="text-[11px] text-slate-500">
                  Agreed on {formattedConsentDate} • Version 2.0
                </span>
              </div>
            </div>
            <span className="self-start sm:self-center inline-flex items-center gap-1 bg-white text-teal-800 font-semibold text-xs px-2.5 py-1 rounded-full border border-teal-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Active</span>
            </span>
          </div>

          {/* Record 3 */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 text-xs sm:text-sm block">
                  Emergency Escalation & 112 Protocol Notice
                </span>
                <span className="text-[11px] text-slate-500">
                  Agreed on {formattedConsentDate} • Version 1.5
                </span>
              </div>
            </div>
            <span className="self-start sm:self-center inline-flex items-center gap-1 bg-white text-teal-800 font-semibold text-xs px-2.5 py-1 rounded-full border border-teal-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Danger Zone - Delete Account matching Stitch */}
      <div className="bg-red-50/60 rounded-2xl border border-red-200 p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-red-700">
            <Trash2 className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-red-900 text-base sm:text-lg">
              Delete my account and all data
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Permanently purge your account, profile, symptom logs, consultation history, and encrypted lab reports. This action cannot be undone and will immediately revoke access to all saved visit summaries.
          </p>
          <span className="font-semibold text-xs text-red-700 block pt-1">
            Note: All identifying personal health data will be completely erased in compliance with India DPDP Act.
          </span>
        </div>
        <div className="shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="h-12 px-5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete account</span>
          </button>
        </div>
      </div>

      {/* High-Fidelity Delete Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userEmail={userEmail}
      />
    </section>
  )
}
