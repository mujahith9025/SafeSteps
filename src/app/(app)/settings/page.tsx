import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsTabs } from '@/components/settings/SettingsTabs'

export const metadata: Metadata = {
  title: 'Settings | SafeSteps',
  description: 'Manage account credentials, clinical data sharing preferences, privacy safeguards, and consultation languages.',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  // 1. Verify authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const userData = {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name || user.user_metadata?.full_name || null,
    createdAt: user.created_at,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Header & Regulatory Metadata matching Stitch */}
      <header className="space-y-2 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>SafeSteps Portal</span>
          <span className="text-slate-300">/</span>
          <span className="text-teal-800 font-semibold">Settings</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Manage your account credentials, clinical data sharing preferences, privacy safeguards, and consultation languages.
            </p>
          </div>

          <div className="self-start sm:self-auto flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200/80 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">
              DPDP Compliance Active • ISO 27001
            </span>
          </div>
        </div>
      </header>

      {/* Main Settings Tabs Container */}
      <SettingsTabs user={userData} profile={profile} />
    </div>
  )
}
