"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, PhoneCall } from "lucide-react";

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary (src/app/error.tsx)
 *
 * Catches unhandled client-side runtime errors across the application.
 * Follows the SafeSteps Emotional & Clinical Safety Principles:
 * 1. Never Alarm: No raw stack traces, error codes, or technical jargon.
 * 2. Retain Calm: Conversational, reassuring copy with a clean reset option.
 * 3. Constant Safe Exit: Immediate bridge to emergency line 112.
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Only log the error name/class in development; NEVER log sensitive user health data
    if (process.env.NODE_ENV !== "production") {
      console.error(`[SafeSteps Boundary Caught Error]: ${error.name || "AppRuntimeError"}`);
    }
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-140px)] w-full bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col items-center text-center">
        {/* Soft Amber / Warning Icon Container */}
        <div
          className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs mb-5"
          aria-hidden="true"
        >
          <AlertCircle className="h-8 w-8" />
        </div>

        <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-800">
          Something unexpected happened
        </h1>

        <p className="font-body text-xs sm:text-sm text-slate-600 max-w-md mt-2.5 leading-relaxed">
          We encountered a hiccup loading this page. Your data remains secure and anonymous. Please try refreshing or returning home.
        </p>

        {/* Action Buttons: Retry + Return Home */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 w-full">
          <button
            type="button"
            onClick={() => reset()}
            className="h-11 px-5 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs min-w-[140px] cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Try again</span>
          </button>

          <Link
            href="/"
            className="h-11 px-5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all min-w-[140px]"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Medical Crisis Bridge (Emergency 112) */}
        <div className="w-full mt-8 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>In an acute medical emergency, do not wait.</span>
          <a
            href="tel:112"
            className="font-semibold text-urgency-red hover:underline flex items-center gap-1.5 shrink-0"
          >
            <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Emergency: Call 112</span>
          </a>
        </div>
      </div>
    </div>
  );
}
