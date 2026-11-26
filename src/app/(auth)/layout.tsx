import React from 'react'
import Link from 'next/link'
import { Info, PhoneCall } from 'lucide-react'

export const metadata = {
  title: 'Authentication | SafeSteps Health Guidance',
  description: 'Sign in or create an account for personalized clinical guidance and care tracking.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      {/* Top Clinical Disclaimer Strip matching Stitch */}
      <aside
        aria-label="Clinical Disclaimer"
        className="w-full bg-sky-50 border-b border-sky-100 px-4 py-2 text-xs sm:text-sm text-sky-900 sticky top-0 z-50 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-700 shrink-0" />
            <p className="font-medium">
              General health guidance only. Not a medical diagnosis.
            </p>
          </div>

          <Link
            href="/emergency"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-full shadow-sm transition-colors shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 112</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center w-full px-4 py-8 sm:py-12">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
          {/* Brand Wordmark Anchor */}
          <Link
            href="/"
            className="flex items-center gap-2.5 mb-6 group transition-transform hover:scale-105"
            aria-label="Return to SafeSteps home"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <span className="font-bold text-sm tracking-tighter">SS</span>
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                SafeSteps
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-500 ml-2 font-medium">
                Health Guidance Assistant
              </span>
            </div>
          </Link>

          {children}
        </div>
      </main>

      {/* Subtle Accessible Footer */}
      <footer className="w-full py-6 px-4 text-center border-t border-slate-200/60 bg-white/50 text-xs text-slate-500">
        <div className="max-w-xl mx-auto flex flex-col gap-2">
          <p>
            SafeSteps AI is non-diagnostic. In an acute emergency, dial{' '}
            <strong className="text-slate-700 font-semibold">112</strong> (All Services) or{' '}
            <strong className="text-slate-700 font-semibold">108</strong> (Ambulance).
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-400 pt-1">
            <Link href="/" className="hover:text-teal-700 transition-colors">
              Home
            </Link>
            <span>•</span>
            <Link href="/emergency" className="hover:text-red-600 transition-colors">
              Emergency Care
            </Link>
            <span>•</span>
            <Link href="/chat-guest" className="hover:text-teal-700 transition-colors">
              Guest Chat
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
