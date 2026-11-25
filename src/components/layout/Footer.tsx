"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhoneCall, AlertOctagon, HeartHandshake } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  const pathname = usePathname();

  // Hide marketing footer on emergency screen
  if (pathname === "/emergency") {
    return null;
  }
  return (
    <footer className="w-full bg-slate-50/80 border-t border-border shadow-[0_-1px_6px_rgba(0,0,0,0.02)] mt-auto">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
        {/* Top Row: Brand & Immediate Dispatch Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/70">
          <div className="flex flex-col gap-2">
            <Logo href="/" />
            <p className="text-body text-text-muted mt-1">
              Know your next step, safely.
            </p>
          </div>

          {/* Immediate Dispatch Contact Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-surface p-4 rounded-2xl border border-border shadow-xs">
            <div className="flex items-center gap-2 text-urgency-red">
              <AlertOctagon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="text-caption font-semibold text-text-main">
                Immediate Dispatch:
              </span>
            </div>
            <div className="text-caption font-medium text-urgency-red flex flex-wrap items-center gap-3">
              <a
                href="tel:112"
                className="hover:underline flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Emergency 112</span>
              </a>
              <span className="text-slate-300" aria-hidden="true">
                &bull;
              </span>
              <a
                href="tel:108"
                className="hover:underline flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ambulance 108</span>
              </a>
            </div>
          </div>
        </div>

        {/* Middle Row: Disclaimers & Regulatory Navigation */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <p className="text-caption text-text-muted leading-relaxed">
              SafeSteps provides automated guidance based on standardized triage algorithms. It does not replace medical consultation, clinical diagnosis, or emergency dispatch protocols.
            </p>
            <p className="text-caption font-medium text-primary">
              This is a college project and not a medical service.
            </p>
          </div>

          <nav
            aria-label="Legal & Safety Navigation"
            className="flex flex-wrap items-center gap-6 text-caption font-medium text-text-muted shrink-0"
          >
            <Link
              href="/#safety"
              className="hover:text-text-main hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Safety Protocols
            </Link>
            <Link
              href="/#urgency-levels"
              className="hover:text-text-main hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Triage Tiers
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-text-main hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              How It Works
            </Link>
          </nav>
        </div>

        {/* Bottom Row: Copyright Notice */}
        <div className="pt-4 text-center md:text-left text-caption text-text-muted border-t border-border/40">
          <p>© 2024 SafeSteps AI Assistant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
