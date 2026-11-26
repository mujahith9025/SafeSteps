import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  AlertTriangle,
  Database,
  Trash2,
  Lock,
  Download,
  ArrowLeft,
  FileText,
  Info,
} from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | SafeSteps Health Guidance',
  description:
    'Plain-language explanation of how SafeSteps collects, protects, stores, and erases health information.',
}

export default function PrivacyPolicyPage() {
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
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  SafeSteps Privacy Policy
                </h1>
                <p className="text-xs text-slate-500">
                  Effective Date: November 2026 • Plain-English Patient Edition
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
                This document explains our actual data handling practices in plain language; it does
                not constitute formal legal advice.
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
            {/* 1. What We Store */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-700" />
                1. What Information We Store
              </h2>
              <p>
                When you create a SafeSteps account and use our health guidance tools, we store only
                the data necessary to provide personalized triage and continuity of care:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                <li>
                  <strong>Health Profile Baseline:</strong> Self-reported age, sex at birth, height,
                  weight, known allergies (e.g. Penicillin), chronic conditions (e.g. Asthma), and
                  current regular medications.
                </li>
                <li>
                  <strong>Symptom Triage History:</strong> Symptom chat turns, clinical follow-up
                  answers, and calculated urgency tiers (Level 1, Level 2, or Level 3).
                </li>
                <li>
                  <strong>Extracted Lab Report Values:</strong> Extracted biomarker numbers, test names,
                  reference ranges, and generated plain-English GP discussion notes.
                </li>
                <li>
                  <strong>Consent Records &amp; Audit Logs:</strong> Consent version accepted and audit
                  timestamps. We strictly record actions without storing conversation contents in audit logs.
                </li>
              </ul>
            </section>

            {/* 2. What We Do NOT Store */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                2. What We NEVER Store (Ephemeral Document Handling)
              </h2>
              <p>
                We minimize health information storage using strict ephemeral processing:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                <li>
                  <strong>Uploaded Files &amp; Photos:</strong> Original PDF files, photos, or lab documents
                  uploaded to the Medical Report Explainer are held in temporary memory enclaves during OCR
                  extraction. <strong>The raw uploaded files are immediately and permanently deleted</strong> once
                  the lab metrics are extracted.
                </li>
                <li>
                  <strong>Zero Biometrics:</strong> We do not collect, process, or retain voice recordings,
                  fingerprints, facial scans, or government national identity credentials.
                </li>
              </ul>
            </section>

            {/* 3. Zero Selling & No Commercial Exploitation */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-700" />
                3. Zero Selling or Sharing of Health Data
              </h2>
              <p>
                Your privacy and medical confidentiality are absolute:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                <li>We <strong>never sell</strong> your personal or health data to data brokers.</li>
                <li>We <strong>never share</strong> health records with insurance companies, employers, or lenders.</li>
                <li>We <strong>never display targeted advertisements</strong> based on your symptoms.</li>
                <li>
                  Your private symptom dialogues are <strong>never used to train public LLM models</strong>.
                </li>
              </ul>
            </section>

            {/* 4. Export & Deletion Rights */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-sky-700" />
                4. Patient Autonomy: Export and Permanent Deletion
              </h2>
              <p>
                You retain complete ownership over your health record at all times:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                <li>
                  <strong>Data Export:</strong> You can download a complete machine-readable JSON archive
                  of all your consultations, extracted lab values, and profile data in <code>/settings</code>.
                </li>
                <li>
                  <strong>Conversation Purging:</strong> You can wipe your entire triage consultation history
                  with one click while preserving your profile.
                </li>
                <li>
                  <strong>Account Deletion:</strong> You can permanently delete your account at any time in
                  Settings. This triggers an immediate cryptographic cascade deletion across all tables.
                </li>
              </ul>
            </section>

            {/* 5. India DPDP Act Awareness */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-700" />
                5. India Digital Personal Data Protection (DPDP) Act, 2023 Principles
              </h2>
              <p>
                SafeSteps is engineered in awareness of the principles set forth in India&apos;s Digital
                Personal Data Protection Act (DPDP Act, 2023):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                <li><strong>Lawful Consent:</strong> Processing occurs solely upon affirmative, explicit user consent.</li>
                <li><strong>Purpose Limitation:</strong> Health data is processed exclusively for clinical triage assistance.</li>
                <li><strong>Data Minimisation:</strong> We collect only the minimum attributes necessary.</li>
                <li><strong>Right to Correction &amp; Erasure:</strong> Patients can edit misread lab numbers or delete records.</li>
                <li><strong>Right to Withdraw Consent:</strong> You can revoke consent in Settings at any time.</li>
              </ul>
            </section>

            {/* 6. Medical Emergency Boundaries */}
            <section className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-950 space-y-2">
              <h3 className="font-bold text-sm text-red-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-red-700" />
                Emergency Medical Disclaimer
              </h3>
              <p className="text-xs leading-relaxed">
                SafeSteps cannot diagnose heart attacks, strokes, respiratory failure, or acute trauma.
                If you experience severe pain, difficulty breathing, or sudden weakness, immediately dial{' '}
                <strong>112</strong> (National Emergency) or <strong>108</strong> (Ambulance).
              </p>
            </section>
          </div>
        </article>
      </main>

      {/* Footer Navigation */}
      <footer className="w-full py-6 px-4 text-center border-t border-slate-200/60 bg-white text-xs text-slate-500">
        <div className="max-w-xl mx-auto flex items-center justify-center gap-4">
          <Link href="/terms" className="hover:text-teal-700 transition-colors">
            Terms of Service
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
