"use client";

import React from "react";
import { Lock } from "lucide-react";
import { SuggestionChips } from "./SuggestionChips";

export interface EmptyChatStateProps {
  onSelectChip: (text: string) => void;
}

/**
 * EmptyChatState component matching Stitch State 02 (Empty Welcoming State).
 * Displays a non-intimidating greeting, symptom suggestion chips, and
 * privacy/encryption reassurances for first-time or reset consultations.
 */
export function EmptyChatState({ onSelectChip }: EmptyChatStateProps) {
  return (
    <div className="w-full flex flex-col items-center text-center py-6 px-4 sm:py-8 animate-fade-in">
      {/* Friendly Wellness Shield Motif */}
      <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-teal-100/60 blur-xl" />
        <div className="relative w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 text-primary flex items-center justify-center shadow-xs">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M24 6L38 12V22C38 31 32 39 24 42C16 39 10 31 10 22V12L24 6Z"
              fill="#CCFBF1"
              stroke="#0F766E"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
            <path
              d="M20 23C20 20.7909 21.7909 19 24 19C26.2091 19 28 20.7909 28 23C28 26.5 24 29 24 29C24 29 20 26.5 20 23Z"
              fill="#0F766E"
            />
            <circle cx="21" cy="33" fill="#0F766E" r="2" />
            <circle cx="27" cy="33" fill="#0F766E" r="2" />
          </svg>
        </div>
      </div>

      <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-800 max-w-md">
        How are you feeling today?
      </h2>

      <p className="font-body text-xs sm:text-sm text-slate-600 max-w-md mt-2 leading-relaxed">
        Tell me what symptoms or health concerns you&apos;re experiencing in your own words. We&apos;ll take it step by step together.
      </p>

      {/* Suggestion Chips */}
      <div className="w-full max-w-md mt-5">
        <SuggestionChips onSelectChip={onSelectChip} className="justify-center" />
      </div>

      {/* Privacy & Encryption Reassurance Pill */}
      <div className="mt-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-600 text-xs font-medium">
        <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span>Private, Encrypted &amp; Non-Diagnostic Guidance</span>
      </div>
    </div>
  );
}
