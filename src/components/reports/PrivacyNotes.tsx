'use client'

import React from 'react'
import { ShieldCheck, AlertTriangle, HeartHandshake } from 'lucide-react'

export function PrivacyNotes() {
  return (
    <div className="space-y-4">
      {/* Clinical Reminder Panel */}
      <div className="rounded-xl bg-[#eff4ff] p-4 flex items-start gap-3 shadow-xs border border-teal-100">
        <HeartHandshake className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="flex flex-col min-w-0">
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900 font-semibold">Important clinical reminder:</strong>{' '}
            SafeSteps converts clinical reference ranges and lab jargon into structured educational explanations.
            It does not provide medical diagnoses, treatment changes, or prescription advice. Always discuss results with
            your primary care provider or specialist.
          </p>
        </div>
      </div>

      {/* Third-Party Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-slate-800">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-amber-900">
            Third-party privacy notice
          </span>
          <span className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Do not upload reports that contain other people&apos;s information or identifying records you do not have
            explicit authorization to interpret.
          </span>
        </div>
      </div>
    </div>
  )
}

export function SecurityGuaranteeBadge() {
  return (
    <div className="inline-flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl shadow-xs border border-slate-200/80">
      <div className="w-8 h-8 rounded-lg bg-[#bdece2] text-teal-800 flex items-center justify-center shrink-0">
        <ShieldCheck className="w-4 h-4 text-teal-800" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-slate-900 leading-tight">
          256-bit TLS Processing
        </span>
        <span className="text-[11px] text-slate-500 leading-tight">
          Zero data retention guarantee
        </span>
      </div>
    </div>
  )
}
