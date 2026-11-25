import React from "react";
import Link from "next/link";
import { Compass, Home, MessageSquare, PhoneCall, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Page Not Found | SafeSteps",
  description: "The requested SafeSteps health guidance page could not be found.",
};

/**
 * 404 Not Found Page matching Stitch State 07.
 * De-escalates user confusion, guides back to home or symptom chat,
 * and maintains instant access to Indian emergency numbers (112 & 108).
 */
export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-140px)] w-full bg-background flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle decorative glow circles */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-teal-100/40 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-teal-50/60 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-2xl bg-surface border border-border/80 rounded-3xl shadow-xs p-8 sm:p-12 flex flex-col items-center text-center relative z-10">
        {/* 404 Soft Graphics & Route Motif */}
        <div className="relative mb-6 flex items-center justify-center" aria-hidden="true">
          <div className="text-[80px] sm:text-[110px] font-extrabold leading-none text-slate-100 select-none tracking-tighter">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 text-primary flex items-center justify-center shadow-xs">
              <Compass className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Heading & Subtext */}
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-800 max-w-md">
          We couldn&apos;t find that page
        </h1>
        <p className="font-body text-sm sm:text-base text-slate-600 max-w-lg mt-3 leading-relaxed">
          The health guidance page or triage session you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        {/* Action Buttons: Teal "Back to home" + "Start a symptom chat" */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8 w-full">
          <Link
            href="/"
            className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs min-w-[160px]"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Back to home</span>
          </Link>
          <Link
            href="/chat"
            className="h-12 px-6 rounded-xl bg-teal-50 border border-teal-200 text-primary hover:bg-teal-100/70 font-medium text-sm flex items-center justify-center gap-2 transition-all min-w-[180px]"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span>Start a symptom chat</span>
          </Link>
        </div>

        {/* Emergency Dispatch Card (112 & 108) */}
        <div className="w-full mt-10 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              className="w-10 h-10 rounded-xl bg-red-100 text-urgency-red flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-800">
                In a medical crisis?
              </div>
              <div className="text-xs text-slate-600">
                Immediate Help: Emergency 112 &bull; Ambulance 108
              </div>
            </div>
          </div>

          <a
            href="tel:112"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-urgency-red hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
          >
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            <span>Call 112 Now</span>
          </a>
        </div>
      </div>
    </div>
  );
}
