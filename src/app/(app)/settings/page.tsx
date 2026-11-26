import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Settings,
  ShieldCheck,
  Globe,
  Download,
  Trash2,
  FileText,
  Lock,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Settings | SafeSteps',
  description: 'Manage account preferences, interface language, privacy consent, and data export.',
}

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Account & Privacy Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Control your privacy settings, consent documentation, language, and data retention rights under India DPDP Act.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="space-y-5">
        {/* Consent & Regulatory Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">Privacy & Consent Status</h2>
              <p className="text-xs text-slate-500">Active consent documentation and legal policies</p>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="font-semibold text-slate-900 block">Consent Version</span>
                <span className="text-slate-500">2026-11-v1 (Active & Accepted)</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/privacy"
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Terms of Use
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Data Ownership & Export */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">Data Portability & Export</h2>
              <p className="text-xs text-slate-500">Export your consultations and health profile as JSON</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In accordance with the Digital Personal Data Protection (DPDP) Act, you have the right to request a full copy of your health records, conversations, and clinical summaries at any time.
          </p>
          <button
            type="button"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download All Personal Data (.JSON)</span>
          </button>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="bg-red-50/50 rounded-2xl border border-red-200/70 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b border-red-100">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-red-900 text-sm">Right to Erasure (Delete Account)</h2>
              <p className="text-xs text-red-600/80">Permanently purge all data, messages, and profile records</p>
            </div>
          </div>
          <p className="text-xs text-red-700/90 leading-relaxed">
            Once deleted, all health profiles, conversations, and report analysis are permanently removed from our Supabase database with cascade deletion. This action cannot be reversed.
          </p>
          <button
            type="button"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete SafeSteps Account & Health Records</span>
          </button>
        </div>
      </div>
    </div>
  )
}
