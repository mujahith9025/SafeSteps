import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Sparkles, Send } from "lucide-react";

/**
 * HeroSection component matching Stitch Screen 2 (SafeSteps - Home).
 * Two columns on desktop, stacked on mobile.
 * Left: Headline, calm description, CTAs, and trust disclaimer.
 * Right: Realistic HTML/CSS chat consultation preview card.
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="w-full pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Headline & Action Triggers (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-primary text-xs sm:text-caption font-semibold shadow-2xs">
            <span
              className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span>Clinical AI Health Guidance Assistant</span>
          </div>

          {/* Main H1 - Single H1 on page */}
          <h1
            id="hero-heading"
            className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 leading-[1.15]"
          >
            Understand your symptoms.{" "}
            <span className="text-primary block sm:inline">
              Know your next step.
            </span>
          </h1>

          {/* Subheading */}
          <p className="font-body text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            Describe how you feel and get calm, clear guidance on whether to
            rest at home, see a doctor, or seek urgent care.
          </p>

          {/* Primary & Secondary Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1 w-full sm:w-auto">
            <Link
              href="/chat"
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span>Start Symptom Chat</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              How it works
            </a>
          </div>

          {/* Small Trust Line */}
          <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span>Free. No diagnosis. Your guidance, not a verdict.</span>
          </p>
        </div>

        {/* Right Column: HTML & CSS Triage Preview Card (5 cols on desktop) */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <div
            className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col select-none"
            aria-hidden="true"
          >
            {/* Header Mini-Bar */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-xs font-semibold text-slate-800">
                  SafeSteps Triage Assistant
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Lock className="h-3 w-3 text-primary" />
                Encrypted
              </span>
            </div>

            {/* Simulated Chat Stream */}
            <div className="p-4 sm:p-5 flex flex-col gap-3.5 bg-[#F8F9FF]">
              {/* User Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[88%] bg-primary text-white p-3.5 rounded-2xl rounded-tr-none shadow-2xs">
                  <p className="text-xs sm:text-[13px] leading-relaxed">
                    I&apos;ve had a dull headache behind my eyes and light sensitivity since this morning. What should I do next?
                  </p>
                  <div className="text-right text-[10px] text-teal-100 mt-1">
                    10:42 AM
                  </div>
                </div>
              </div>

              {/* Assistant Reply Bubble */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none shadow-2xs text-xs sm:text-[13px] text-slate-800 flex flex-col gap-2">
                  <p className="leading-relaxed">
                    I understand this can feel draining. A dull headache with light sensitivity often stems from digital eye strain, dehydration, or mild tension.
                  </p>
                  <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-2.5 text-[12px] flex flex-col gap-1.5 text-slate-700">
                    <span className="font-semibold text-primary">Next Steps:</span>
                    <span>1. Hydrate &amp; step away from screens for 20 mins.</span>
                    <span>2. Rest in a softly lit, quiet space.</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    SafeSteps Clinical Guidance &bull; Non-diagnostic
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Input Dock */}
            <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
              <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-400">
                Type symptoms... e.g. mild fever
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Send className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
