import React from 'react'
import Link from 'next/link'
import {
  FileText,
  AlertTriangle,
  Scale,
  ShieldAlert,
  HelpCircle,
  ArrowLeft,
  Info,
} from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | SafeSteps Health Guidance',
  description:
    'Plain-language terms explaining the non-diagnostic scope, student engineering nature, and safety rules of SafeSteps.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200/80 px-4 py-4 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to SafeSteps</span>
          </Link>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Version 2026-11-v1
          </span>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-10 text-left">
          {/* Header */}
          <div className="border-b border-slate-100 pb-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  SafeSteps Terms of Service
                </h1>
                <p className="text-xs text-slate-500">
                  Effective Date: November 2026 • Plain-English Patient Terms
                </p>
              </div>
            </div>

            {/* Prominent Project Notice Badge */}
            <div
              role="note"
              className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <strong className="font-semibold block">Academic Engineering Notice:</strong>
                SafeSteps is a college project developed for educational and portfolio demonstration
                purposes. It is <strong>not an accredited medical service or healthcare provider</strong>.
                This document sets clear safety boundaries; it does not constitute formal legal advice.
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
            {/* 1. What SafeSteps Is */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-700" />
                1. Non-Diagnostic Educational Scope
              </h2>
              <p>
                SafeSteps is an artificial intelligence health guidance assistant engineered to ease
                health anxiety through structured triaging and plain-English medical report explanations.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                <li>
                  <strong>Not a Medical Diagnosis:</strong> SafeSteps evaluates care urgency (whether to
                  rest, see a GP, or seek emergency care); it <strong>does not diagnose diseases or conditions</strong>.
                </li>
                <li>
                  <strong>No Prescriptions or Dosages:</strong> SafeSteps will <strong>never recommend specific
                  medicine dosages</strong>, prescribe pharmaceuticals, or suggest modifying medical treatments.
                </li>
                <li>
                  <strong>Always Consult a Professional:</strong> Always discuss your symptoms with a registered
                  medical practitioner or primary care doctor.
                </li>
              </ul>
            </section>

            {/* 2. Emergency Prohibition */}
            <section className="space-y-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
              <h2 className="text-lg sm:text-xl font-bold text-rose-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                2. Strict Prohibition During Medical Emergencies
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong>Do NOT use SafeSteps if you are experiencing a life-threatening crisis</strong> such as
                crushing chest pain, severe shortness of breath, sudden facial drooping or limb paralysis,
                profuse bleeding, or suspected anaphylaxis.
              </p>
              <p className="text-xs sm:text-sm font-semibold text-rose-800">
                Immediately call 112 (All Emergencies) or 108 (Ambulance), or proceed to the nearest hospital casualty department.
              </p>
            </section>

            {/* 3. User Responsibilities */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-700" />
                3. User Responsibilities &amp; Acceptable Use
              </h2>
              <p>
                By using SafeSteps, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                <li>Provide accurate symptom descriptions without intentionally misleading the triage model.</li>
                <li>Never attempt to bypass security controls, automated guardrails, or rate limit barriers.</li>
                <li>Never upload malicious files, corrupted binaries, or documents containing other people&apos;s data without authorization.</li>
                <li>Acknowledge that medical triage relies upon human physical examination and diagnostic testing.</li>
              </ul>
            </section>

            {/* 4. Limitation of Liability */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-700" />
                4. Academic Limitation of Liability
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Because SafeSteps is developed and maintained as a non-commercial student engineering
                demonstration, the creators, university, and hosting contributors provide the service on an
                &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. To the fullest
                extent permitted by law, SafeSteps assumes no liability for health decisions made without
                independent clinical consultation with a licensed physician.
              </p>
            </section>

            {/* 5. Indian Jurisdiction & Grievance Redressal */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700" />
                5. Governing Principles &amp; DPDP Awareness
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                SafeSteps adheres to the principles of the Digital Personal Data Protection Act (DPDP Act, 2023).
                Users maintain the right to inspect, export, or revoke consent and delete their complete personal record
                at any time via the account settings panel.
              </p>
            </section>
          </div>
        </article>
      </main>

      {/* Footer Navigation */}
      <footer className="w-full py-6 px-4 text-center border-t border-slate-200/60 bg-white text-xs text-slate-500">
        <div className="max-w-xl mx-auto flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-teal-700 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/consent" className="hover:text-teal-700 transition-colors">
            Consent Setup
          </Link>
          <span>•</span>
          <Link href="/emergency" className="text-red-600 hover:text-red-700 font-medium">
            Emergency Care
          </Link>
        </div>
      </footer>
    </div>
  )
}
