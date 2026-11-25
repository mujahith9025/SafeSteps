import React from "react";
import { MessageSquare, HelpCircle, CheckCircle } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: MessageSquare,
    title: "Describe your symptoms",
    description:
      "Type in your own words how you are feeling, how long symptoms have lasted, and what hurts. No complicated medical jargon required.",
  },
  {
    step: "02",
    icon: HelpCircle,
    title: "Answer a few questions",
    description:
      "The assistant asks simple follow-up questions to understand severity, pain levels, and any key warning signs calmly.",
  },
  {
    step: "03",
    icon: CheckCircle,
    title: "Get your next step",
    description:
      "See a clear urgency level with safe guidance on whether home remedies suffice, a clinic visit is best, or urgent care is needed.",
  },
];

/**
 * HowItWorksSection component matching Stitch Screen 2 & Section 2.
 * Three straightforward, accessible guidance step cards.
 */
export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="w-full py-12 sm:py-16 scroll-mt-24 border-t border-slate-200/60"
    >
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
          Step-by-Step Triage
        </span>
        <h2
          id="how-it-works-heading"
          className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight"
        >
          How SafeSteps Guides You
        </h2>
        <p className="font-body text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Three straightforward steps designed to ease uncertainty in minutes, keeping you safe and informed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col items-start text-left relative overflow-hidden group hover:border-teal-300 transition-colors"
            >
              {/* Step indicator watermark */}
              <div
                className="absolute top-4 right-4 text-3xl font-extrabold text-slate-100 select-none"
                aria-hidden="true"
              >
                {s.step}
              </div>

              {/* Icon Container */}
              <div
                className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/60 text-primary flex items-center justify-center mb-5 shrink-0"
                aria-hidden="true"
              >
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">
                {s.title}
              </h3>

              <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed">
                {s.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
