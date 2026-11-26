import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile'

export const metadata: Metadata = {
  title: 'Health Profile | SafeSteps',
  description:
    'Manage clinical background, known allergies, chronic conditions, and personal health metrics.',
}

async function ProfileContent() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnUrl=/profile')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <ProfileForm initialData={profile} />
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-40 bg-slate-200 rounded-xl" />
          <div className="h-8 w-64 bg-slate-200 rounded-xl" />
          <div className="h-4 w-96 bg-slate-100 rounded-lg" />
          <div className="h-56 bg-slate-100 rounded-2xl" />
          <div className="h-48 bg-slate-100 rounded-2xl" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  )
}
