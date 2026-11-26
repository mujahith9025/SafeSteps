import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ChatWindow } from '@/components/chat'
import { getProfileSummaryPill } from '@/lib/profileContext'

export const metadata: Metadata = {
  title: 'Clinical AI Chat | SafeSteps',
  description:
    'Confidential, safety-guided symptom evaluation assistant. Structured triage based on clinical protocols with emergency escalation.',
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let initialPersonalise = false
  let profileSummary = ''

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('age, sex, height_cm, weight_kg, pregnant, allergies, conditions, medicines, personalise')
      .eq('id', user.id)
      .single()

    if (profile) {
      initialPersonalise = Boolean(profile.personalise)
      profileSummary = getProfileSummaryPill(profile)
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col h-full min-h-[calc(100dvh-160px)]">
      <Suspense fallback={<div className="flex-1 w-full min-h-[calc(100dvh-160px)] bg-slate-50 animate-pulse" />}>
        <ChatWindow
          initialPersonalise={initialPersonalise}
          profileSummary={profileSummary}
        />
      </Suspense>
    </div>
  )
}
