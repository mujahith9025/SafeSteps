import React from "react";
import { ShieldCheck, Pill, PhoneCall, UserCheck } from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "We never diagnose",
    description:
      "We provide structured health guidance and triage context, never definitive medical diagnoses or clinical verdicts.",
  },
  {
    icon: Pill,
    title: "We never recommend medicine doses",
    description:
      "We will never suggest specific prescription dosages, medication schedules, or pharmaceutical changes without a physician.",
  },
  {
    icon: PhoneCall,
    title: "We always show emergency numbers",
    description:
      "If your inputs match high-acuity red flags, we instantly surface direct dispatch buttons for 112 and 108.",
  },
  {
    icon: UserCheck,
    title: "We encourage professional care",
    description:
      "We always prompt you to consult qualified physicians and provide organized symptom summaries you can readily share.",
  },
];

export function SafetyPromiseSection() {
  return (
    <section
      id="safety"
      aria-labelledby="safety-promise-heading"
      className="w-full py-12 sm:py-16 scroll-mt-24 border-t border-slate-200/60"
    >
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
          Clinical Governance
        </span>
        <h2
          id="safety-promise-heading"
          className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight"
        >
          Our Safety Promise
        </h2>
        <p className="font-body text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Engineered with clinical safeguards and ethical guardrails at every touchpoint to protect user safety above all else.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col items-start text-left"
            >
              <div
                className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200/60 text-primary flex items-center justify-center mb-4 shrink-0"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-semibold text-base text-slate-900 mb-2">
                {p.title}
              </h3>
              <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed">
                {p.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
