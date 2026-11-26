'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Languages, ChevronDown, Check } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English (US)', native: 'English' },
  { code: 'ta', label: 'தமிழ்', native: 'Tamil' },
  { code: 'hi', label: 'हिन्दी', native: 'Hindi' },
]

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const [selectedLang, setSelectedLang] = useState('en')
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLabel = LANGUAGES.find((l) => l.code === selectedLang)?.label || 'English (US)'

  return (
    <div ref={menuRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Interface Language"
        className="h-10 px-3 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700/20"
      >
        <Languages className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="hidden sm:inline-block">{currentLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 mb-1">
            Interface Language
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={selectedLang === lang.code}
              onClick={() => {
                setSelectedLang(lang.code)
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{lang.label}</span>
                <span className="text-[10px] text-slate-400">{lang.native}</span>
              </div>
              {selectedLang === lang.code && (
                <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
