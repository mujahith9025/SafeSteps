'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, PhoneCall } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'

export interface AppTopBarProps {
  onOpenMobile?: () => void
  isMobileOpen?: boolean
}

export function AppTopBar({ onOpenMobile, isMobileOpen = false }: AppTopBarProps) {
  const pathname = usePathname()
  const t = useTranslations('shell')
  const tCommon = useTranslations('common')

  const routeTitles: Record<string, string> = {
    '/chat': t('navChat'),
    '/reports': t('navReports'),
    '/profile': t('navProfile'),
    '/history': t('navHistory'),
    '/settings': t('navSettings'),
  }

  // Match root segment
  const rootSegment = '/' + (pathname.split('/')[1] || 'chat')
  const currentTitle = routeTitles[rootSegment] || tCommon('brandName')

  return (
    <header className="h-16 sm:h-18 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left: Hamburger (mobile) + Breadcrumbs & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
          aria-expanded={isMobileOpen}
          className="md:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700/20 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 truncate">
            <span className="hidden sm:inline">{tCommon('brandName')} Portal</span>
            <span className="hidden sm:inline text-slate-300">/</span>
            <span className="text-slate-500 font-semibold">{currentTitle}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right: Language Switcher + Solid Red Emergency Help Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <LanguageSwitcher />

        {/* Emergency Help (112) Button */}
        <Link
          href="/emergency"
          aria-label={t('emergencyButton')}
          className="h-10 px-3 sm:px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 shadow-xs transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-red-600/30"
        >
          <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
          <span className="hidden sm:inline">{t('emergencyButton')}</span>
          <span className="sm:hidden">{t('emergencyShort')}</span>
        </Link>
      </div>
    </header>
  )
}
