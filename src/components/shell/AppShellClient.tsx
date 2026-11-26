'use client'

import React, { useState } from 'react'
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner'
import { AppSidebar } from './AppSidebar'
import { AppTopBar } from './AppTopBar'

export interface AppShellClientProps {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
  }
  children: React.ReactNode
}

export function AppShellClient({ user, children }: AppShellClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-50 overflow-hidden text-slate-800">
      {/* 1. Skip-to-content accessibility link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:px-4 focus:py-2.5 focus:bg-teal-700 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-sm"
      >
        Skip to main content
      </a>

      {/* 2. Top Regulatory & Emergency Disclaimer Banner */}
      <DisclaimerBanner showEmergencyCall={true} />

      {/* 3. Main Frame (Sidebars + Workspace) */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {/* Mobile Slide-in Drawer */}
        <AppSidebar
          user={user}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Tablet Collapsed Sidebar (768px - 1023px) */}
        <div className="hidden md:flex lg:hidden h-full">
          <AppSidebar user={user} isCollapsed={true} />
        </div>

        {/* Desktop Expanded Sidebar (>=1024px) */}
        <div className="hidden lg:flex h-full">
          <AppSidebar user={user} isCollapsed={false} />
        </div>

        {/* 4. Workspace Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-hidden">
          {/* Top Bar */}
          <AppTopBar
            onOpenMobile={() => setIsMobileOpen(true)}
            isMobileOpen={isMobileOpen}
          />

          {/* Main Landmark */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-700/20"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
