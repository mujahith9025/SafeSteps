'use client'

import React, { useState, useRef, useEffect, useTransition } from 'react'
import { Languages, ChevronDown, Check, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { setLocaleAction } from '@/i18n/actions'
import { LANGUAGE_OPTIONS, Locale } from '@/i18n/config'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const currentLocale = useLocale()
  const t = useTranslations('shell')
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const currentOption =
    LANGUAGE_OPTIONS.find((l) => l.code === currentLocale) || LANGUAGE_OPTIONS[0]

  const handleSelectLanguage = (code: Locale) => {
    if (code === currentLocale) {
      setIsOpen(false)
      return
    }

    startTransition(async () => {
      await setLocaleAction(code)
      setIsOpen(false)
    })
  }

  return (
    <div ref={menuRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('languageSwitcherLabel')}
        className="h-10 px-3 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700/20 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 text-teal-700 animate-spin shrink-0" />
        ) : (
          <Languages className="w-4 h-4 text-slate-500 shrink-0" />
        )}
        <span className="hidden sm:inline-block font-medium">{currentOption.native}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 mb-1">
            {t('languageSwitcherLabel')}
          </div>
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              role="option"
              type="button"
              disabled={isPending}
              aria-selected={currentLocale === lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors disabled:opacity-50"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{lang.native}</span>
                <span className="text-[10px] text-slate-400">{lang.label}</span>
              </div>
              {currentLocale === lang.code && (
                <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
