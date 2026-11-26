import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConsentClient } from './ConsentClient'

export const metadata = {
  title: 'Privacy & Consent Onboarding | SafeSteps',
  description: 'Review and confirm how SafeSteps protects your clinical data and privacy.',
}

async function ConsentContent() {
  const supabase = await createClient()

  // 1. Show page only to signed-in users
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/consent')
  }

  // 2. If consent already exists, redirect to /chat
  const { data: profile } = await supabase
    .from('profiles')
    .select('consent_version')
    .eq('id', user.id)
    .single()

  if (profile?.consent_version) {
    redirect('/chat')
  }

  return <ConsentClient />
}

export default function ConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 animate-pulse" />
        </div>
      }
    >
      <ConsentContent />
    </Suspense>
  )
}
