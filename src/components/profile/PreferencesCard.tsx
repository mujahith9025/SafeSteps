'use client'

import React from 'react'
import { Sliders, Languages, Sparkles, ChevronDown } from 'lucide-react'

export interface PreferencesCardProps {
  language: 'en' | 'ta' | 'hi'
  personalise: boolean
  onLanguageChange: (lang: 'en' | 'ta' | 'hi') => void
  onPersonaliseChange: (personalise: boolean) => void
  disabled?: boolean
}

export function PreferencesCard({
  language,
  personalise,
  onLanguageChange,
  onPersonaliseChange,
  disabled = false,
}: PreferencesCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-base">Preferences</h2>
          <p className="text-xs text-slate-500">Language outputs and intelligent context parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preferred Language Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-language" className="text-xs font-semibold text-slate-700">
            Preferred consultation language
          </label>
          <div className="relative flex items-center">
            <Languages className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <select
              id="profile-language"
              disabled={disabled}
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as 'en' | 'ta' | 'hi')}
              className="w-full h-11 bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-9 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all appearance-none cursor-pointer disabled:opacity-60"
            >
              <option value="en">English (Default)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 pointer-events-none text-slate-400" />
          </div>
        </div>

        {/* Informational note */}
        <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600 self-end">
          <span className="w-2 h-2 rounded-full bg-teal-700 shrink-0" />
          <span>AI health summaries and consultation questions will be delivered in this language.</span>
        </div>
      </div>

      {/* Personalisation Toggle Switch */}
      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-900">
              Use my profile to personalise answers
            </span>
            <span className="text-[11px] text-slate-500 leading-relaxed">
              When enabled, triage assessments will automatically consider your recorded allergies and conditions for tailored, medically relevant guidance.
            </span>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={personalise}
          disabled={disabled}
          onClick={() => onPersonaliseChange(!personalise)}
          aria-label="Toggle personalised triage answers"
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-700/30 ${
            personalise ? 'bg-teal-700' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
              personalise ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
