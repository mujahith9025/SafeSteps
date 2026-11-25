"use client";

import React, { useState, useEffect } from "react";
import { Hourglass } from "lucide-react";

export interface RateLimitNoticeProps {
  retryAfterSeconds?: number;
  message?: string;
  onCooldownComplete?: () => void;
}

/**
 * RateLimitNotice component matching Stitch State 06 (Cooldown Pacer).
 * Conversational throttling with a calming countdown timer so users
 * know precisely when the cooldown finishes without panic.
 */
export function RateLimitNotice({
  retryAfterSeconds = 10,
  message = "You're sending messages very quickly. Please wait a moment.",
  onCooldownComplete,
}: RateLimitNoticeProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(retryAfterSeconds);

  useEffect(() => {
    if (retryAfterSeconds <= 0) {
      onCooldownComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCooldownComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfterSeconds, onCooldownComplete]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-[#F0FDF4]/60 sm:bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs animate-fade-in"
    >
      {/* Hourglass Icon */}
      <div
        className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5"
        aria-hidden="true"
      >
        <Hourglass className="h-5 w-5 animate-pulse motion-reduce:animate-none" />
      </div>

      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
            Taking a quick breather
          </h3>
          {secondsRemaining > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-primary text-xs font-medium flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse motion-reduce:animate-none" />
              <span>You can send another message in {secondsRemaining}s</span>
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
