import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, CheckCircle2, Home, UserPlus } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'

export const metadata: Metadata = {
  title: 'Account Deleted | SafeSteps',
  description: 'Your SafeSteps account and personal health data have been completely deleted.',
}

export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between">
        <Logo />
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          DPDP Act Compliant
        </span>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-center space-y-6">
          {/* Success Check Icon */}
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center border border-teal-100/80 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Your account was deleted
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              All your symptom consultation history, laboratory report interpretations, and personal profile records have been permanently erased from our databases.
            </p>
          </div>

          {/* Privacy & Compliance Assurance Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-left space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Right to Erasure Complete</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-slate-600">
              <li>All chat conversations and clinical messages deleted.</li>
              <li>Uploaded lab reports and extracted parameters destroyed.</li>
              <li>Authentication credentials and session tokens invalidated.</li>
              <li>Identifying audit logs cleared or anonymised.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Home className="w-4 h-4" />
              <span>Return to Homepage</span>
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Account</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/60">
        SafeSteps Health Guidance System • Educational triaging only
      </footer>
    </div>
  )
}
