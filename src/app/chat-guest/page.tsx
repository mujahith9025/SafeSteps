import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { LogIn, Sparkles } from 'lucide-react'
import { ChatWindow } from '@/components/chat'

export const metadata: Metadata = {
  title: 'Guest Symptom Chat | SafeSteps',
  description:
    'Confidential, anonymous symptom evaluation assistant. Free triage without an account.',
}

export default function ChatGuestPage() {
  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Gentle guest notice banner matching requirement */}
      <aside
        aria-label="Guest session notice"
        className="w-full bg-teal-50 border-b border-teal-100 px-4 py-2.5 text-xs sm:text-sm text-teal-900"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              You are using SafeSteps as a guest.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login?returnUrl=/chat"
              className="inline-flex items-center gap-1.5 font-semibold text-teal-800 hover:text-teal-900 hover:underline"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log in to save your chats</span>
            </Link>
          </div>
        </div>
      </aside>

      <Suspense fallback={<div className="flex-1 w-full min-h-[calc(100dvh-120px)] bg-background" />}>
        <ChatWindow isGuest={true} />
      </Suspense>
    </div>
  )
}
