"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export interface ErrorBannerProps {
  message?: string;
  onRetry: () => void;
  onNewChat?: () => void;
}

/**
 * ErrorBanner component matching Stitch State 03 (Response Failure).
 * Uses calm amber/warm tones, non-technical de-escalating copy, and keeps
 * user questions saved in memory without requiring re-typing.
 */
export function ErrorBanner({
  message = "Sorry, something went wrong. Please try again.",
  onRetry,
  onNewChat,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-5 shadow-xs flex flex-col gap-3 animate-fade-in"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Amber Warning Icon & Friendly Copy */}
        <div className="flex items-start gap-3.5">
          <div
            className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[#92400E] text-sm sm:text-base leading-snug">
              {message}
            </span>
            <span className="text-xs sm:text-sm text-[#B45309] mt-0.5">
              Your question has been saved. No need to retype.
            </span>
          </div>
        </div>

        {/* Right: Retry Button & Alternate Action */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Retry</span>
          </button>
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="text-xs sm:text-sm font-medium text-[#92400E] hover:text-[#78350F] underline cursor-pointer bg-transparent border-none p-0 focus-visible:outline-none"
            >
              Start new chat
            </button>
          )}
        </div>
      </div>

      {/* Bottom Reassurance / Triage Guidance */}
      <div className="text-xs text-[#B45309]/80 border-t border-[#FDE68A]/60 pt-2 text-center sm:text-left">
        If you need urgent dosage guidance, consult a pharmacist or call emergency services (112).
      </div>
    </div>
  );
}
