'use client'

import React, { useState, useEffect } from 'react'
import { User, ShieldCheck, Globe } from 'lucide-react'
import { ExportReadyToast } from './ExportReadyToast'
import { SettingsAccountSection } from './SettingsAccountSection'
import { SettingsPrivacySection } from './SettingsPrivacySection'
import { SettingsLanguageSection } from './SettingsLanguageSection'

export type SettingsTabId = 'account' | 'privacy' | 'language'

export interface SettingsTabsProps {
  user: {
    id: string
    email?: string | null
    fullName?: string | null
    createdAt?: string | null
  }
  profile: {
    personalise?: boolean
    preferred_language?: string
    consent_version?: string | null
    consent_accepted_at?: string | null
    age?: number | null
    conditions?: string[]
    allergies?: string[]
  } | null
}

export function SettingsTabs({ user, profile }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('privacy')
  const [exportToastInfo, setExportToastInfo] = useState<{
    fileSize: string
    filename: string
  } | null>(null)

  // Listen to hash changes or initial hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'account' || hash === 'privacy' || hash === 'language') {
        setActiveTab(hash as SettingsTabId)
      }
    }
  }, [])

  const handleTabClick = (tab: SettingsTabId) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      window.location.hash = tab
    }
  }

  const handleExportSuccess = (info: { fileSize: string; filename: string }) => {
    setExportToastInfo(info)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      {/* Pinned / Floating Export Ready Toast matching Stitch */}
      {exportToastInfo && (
        <ExportReadyToast
          fileSize={exportToastInfo.fileSize}
          filename={exportToastInfo.filename}
          onDownloadAgain={async () => {
            const res = await fetch('/api/user/export')
            if (res.ok) {
              const blob = await res.blob()
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = exportToastInfo.filename
              document.body.appendChild(a)
              a.click()
              a.remove()
              window.URL.revokeObjectURL(url)
            }
          }}
          onDismiss={() => setExportToastInfo(null)}
        />
      )}

      {/* Interactive Tabs Bar matching Stitch nav */}
      <nav
        aria-label="Settings categories"
        role="tablist"
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100 rounded-2xl"
      >
        {/* Account Tab */}
        <button
          type="button"
          role="tab"
          id="tab-btn-account"
          aria-controls="panel-account"
          aria-selected={activeTab === 'account'}
          onClick={() => handleTabClick('account')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'account'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Account</span>
        </button>

        {/* Privacy & Data Tab */}
        <button
          type="button"
          role="tab"
          id="tab-btn-privacy"
          aria-controls="panel-privacy"
          aria-selected={activeTab === 'privacy'}
          onClick={() => handleTabClick('privacy')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'privacy'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Privacy & data</span>
          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
        </button>

        {/* Language Tab */}
        <button
          type="button"
          role="tab"
          id="tab-btn-language"
          aria-controls="panel-language"
          aria-selected={activeTab === 'language'}
          onClick={() => handleTabClick('language')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'language'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>Language & Locale</span>
        </button>
      </nav>

      {/* Tab Panels */}
      <div>
        {activeTab === 'account' && <SettingsAccountSection user={user} />}

        {activeTab === 'privacy' && (
          <SettingsPrivacySection
            userEmail={user.email || undefined}
            initialPersonalise={Boolean(profile?.personalise)}
            profileContextSummary={{
              age: profile?.age,
              conditions: profile?.conditions,
              allergies: profile?.allergies,
            }}
            consentVersion={profile?.consent_version}
            consentDate={profile?.consent_accepted_at}
            onExportSuccess={handleExportSuccess}
          />
        )}

        {activeTab === 'language' && <SettingsLanguageSection />}
      </div>
    </div>
  )
}
