import React from "react";
import Link from "next/link";
import { Check, Clock, AlertTriangle, PhoneCall } from "lucide-react";

export function UrgencyLevelsSection() {
  return (
    <section
      id="urgency-levels"
      aria-labelledby="urgency-levels-heading"
      className="w-full py-12 sm:py-16 scroll-mt-24 border-t border-slate-200/60"
    >
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
          Clinical Guidance Tiers
        </span>
        <h2
          id="urgency-levels-heading"
          className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight"
        >
          Understand the Urgency Levels
        </h2>
        <p className="font-body text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Every assessment maps directly to verified medical triage categories so you always know your next action with zero guesswork.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Tier 1: Self-Care (Green) */}
        <div className="bg-white border-2 border-emerald-200/80 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col items-start text-left relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              Level 1: Self-Care
            </span>
            <span className="text-xs text-slate-500 font-medium">Mild &bull; Reversible</span>
          </div>

          <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">
            Self-Care at Home
          </h3>

          <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Can usually be managed safely at home with rest, hydration, over-the-counter care, and simple symptom monitoring.
          </p>

          <div className="w-full border-t border-slate-100 pt-4 mt-auto">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Common examples:
            </span>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>Mild tension headache</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>Seasonal common cold</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>Minor muscular fatigue</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tier 2: See Doctor Soon (Amber) */}
        <div className="bg-white border-2 border-amber-200/80 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col items-start text-left relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              Level 2: See Doctor Soon
            </span>
            <span className="text-xs text-slate-500 font-medium">Moderate &bull; Non-Emergency</span>
          </div>

          <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">
            See a Doctor in 24–48h
          </h3>

          <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Book an appointment within 24 to 48 hours. Symptoms require clinical evaluation, diagnostic tests, or prescription care.
          </p>

          <div className="w-full border-t border-slate-100 pt-4 mt-auto">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Common examples:
            </span>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                <span>Fever persisting beyond 48 hours</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                <span>Earache with unusual discharge</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                <span>Deep, productive chest cough</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tier 3: Emergency Care (Red) */}
        <div className="bg-white border-2 border-red-200/80 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col items-start text-left relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
              Level 3: Emergency Care
            </span>
            <span className="text-xs text-red-700 font-semibold">Immediate &bull; Critical</span>
          </div>

          <h3 className="font-heading font-semibold text-xl text-red-900 mb-2">
            Immediate Emergency Care
          </h3>

          <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
            Call emergency dispatch (112 / 108) or proceed to the nearest hospital ER right now. Signs of potentially life-threatening conditions.
          </p>

          <div className="w-full border-t border-slate-100 pt-4 mb-4">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Critical red flags:
            </span>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" aria-hidden="true" />
                <span>Crushing chest pain or pressure</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" aria-hidden="true" />
                <span>Sudden weakness, facial drooping</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" aria-hidden="true" />
                <span>Severe, unyielding shortness of breath</span>
              </li>
            </ul>
          </div>

          <Link
            href="/emergency"
            className="w-full h-11 rounded-xl bg-urgency-red hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors mt-auto shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-urgency-red"
          >
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            <span>Emergency 112 Dispatch</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
