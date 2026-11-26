'use client'

import React, { useState, useTransition } from 'react'
import { Languages, Check, Sparkles, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { setLocaleAction } from '@/i18n/actions'
import { LANGUAGE_OPTIONS, Locale } from '@/i18n/config'

export function SettingsLanguageSection() {
  const currentLocale = useLocale() as Locale
  const t = useTranslations('settings')
  const [selectedLocale, setSelectedLocale] = useState<Locale>(currentLocale)
  const [isPending, startTransition] = useTransition()
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = () => {
    startTransition(async () => {
      await setLocaleAction(selectedLocale)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    })
  }

  return (
    <section id="panel-language" role="tabpanel" className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Languages className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-900 text-base">{t('languageTitle')}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('languageSubtitle')}
          </p>
        </div>
        <span className="self-start sm:self-auto bg-teal-50 text-teal-800 font-semibold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-teal-100">
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          <span>{t('languageEngineBadge')}</span>
        </span>
      </div>

      {/* Language Radio Options matching Stitch */}
      <div className="space-y-3">
        {LANGUAGE_OPTIONS.map((option) => {
          const isSelected = selectedLocale === option.code
          return (
            <label
              key={option.code}
              className={`relative flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-50/40 border-teal-600/70 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="pt-0.5">
                <input
                  type="radio"
                  name="consultation_language"
                  value={option.code}
                  checked={isSelected}
                  onChange={() => setSelectedLocale(option.code)}
                  className="w-4 h-4 text-teal-700 accent-teal-700 focus:ring-teal-700/20 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1 w-full min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{option.label}</span>
                    <span className="text-xs text-slate-500 font-medium">({option.native})</span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {option.subLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{option.description}</p>

                {/* Sample Consultation Dialogue Box */}
                <div className="mt-2 p-2.5 bg-white border border-slate-200/70 rounded-lg text-xs italic text-teal-900 font-medium">
                  {option.sampleQuote}
                </div>
              </div>
            </label>
          )
        })}
      </div>

      {/* Bottom Save Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          {savedSuccess ? (
            <span className="text-teal-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              {t('languageSaveSuccess')}
            </span>
          ) : (
            t('languageSaveNote')
          )}
        </span>

        <button
          type="button"
          disabled={isPending || selectedLocale === currentLocale}
          onClick={handleSave}
          className="h-10 px-5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-700/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{t('languageSaveButton')}</span>
        </button>
      </div>
    </section>
  )
}
