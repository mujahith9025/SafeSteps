import React from "react";
import Link from "next/link";
import { ArrowRight, PhoneCall, Heart } from "lucide-react";

export function CtaBannerSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="w-full py-12 sm:py-16"
    >
      <div className="w-full rounded-3xl bg-primary p-8 sm:p-12 lg:p-16 text-white text-center flex flex-col items-center gap-6 shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-teal-100 mb-2"
          aria-hidden="true"
        >
          <Heart className="h-6 w-6" />
        </div>

        <h2
          id="cta-heading"
          className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl max-w-2xl text-white tracking-tight"
        >
          Take the guesswork out of your health symptoms.
        </h2>

        <p className="font-body text-sm sm:text-base text-teal-100 max-w-xl leading-relaxed">
          Start a free, confidential guidance conversation now and know exactly what steps to take next.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 w-full sm:w-auto">
          <Link
            href="/chat"
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-white hover:bg-slate-50 text-primary font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Start Free Assessment</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Link
            href="/emergency"
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-teal-800/80 hover:bg-teal-800 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all border border-teal-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            <span>Emergency Help (112)</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
