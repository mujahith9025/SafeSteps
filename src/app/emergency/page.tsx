"use client";

import React, { useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PhoneCall,
  Ambulance,
  AlertTriangle,
  ArrowLeft,
  HeartHandshake,
  Hourglass,
  Phone,
} from "lucide-react";

const ALLOWED_CATEGORIES = new Set([
  "selfharm",
  "cardiac",
  "breathing",
  "stroke",
  "bleeding",
  "consciousness",
  "allergy",
  "poisoning",
  "pregnancy and infants",
]);

function EmergencyContent() {
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get("category");
  const normalizedCategory =
    rawCategory && ALLOWED_CATEGORIES.has(rawCategory.toLowerCase())
      ? rawCategory.toLowerCase()
      : null;

  const isSelfHarm = normalizedCategory === "selfharm";
  const h1Ref = useRef<HTMLHeadingElement>(null);

  // Focus H1 on load for screen reader announcement and immediate orientation
  useEffect(() => {
    h1Ref.current?.focus();
  }, []);

  // Soft blue mental health support card
  const mentalHealthCard = (
    <div
      className={`rounded-xl p-6 flex flex-col gap-4 text-left border ${
        isSelfHarm
          ? "bg-[#EFF4FF] border-[#93C5FD] ring-2 ring-[#3B82F6]/30"
          : "bg-[#EFF4FF] border-[#BFDBFE]"
      }`}
      role="region"
      aria-label="Mental health crisis support"
    >
      <div className="flex items-center gap-2.5">
        <HeartHandshake className="h-6 w-6 text-[#005682] shrink-0" aria-hidden="true" />
        <h3 className="font-headline-md text-[18px] text-[#005682] font-bold">
          If you are having thoughts of harming yourself
        </h3>
      </div>
      <p className="font-body-md text-body-md text-text-main leading-relaxed">
        You are not alone. Please reach out to someone you trust or a mental health
        helpline right now.
      </p>
      <div>
        <a
          href="tel:14416"
          className="inline-flex items-center gap-2.5 bg-[#005682] hover:bg-[#004366] active:bg-[#00334d] text-white px-5 py-3 rounded-xl font-semibold text-caption shadow-sm transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200"
          role="button"
        >
          <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Tele-MANAS: 14416</span>
        </a>
      </div>
    </div>
  );

  // "While you wait for help" numbered instructions
  const whileYouWaitCard = (
    <div className="bg-[#F8FAFC] border border-border/70 rounded-xl p-6 sm:p-7 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Hourglass className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
        <h2 className="font-headline-md text-headline-md font-bold text-text-main">
          While you wait for help
        </h2>
      </div>

      <ol className="flex flex-col gap-4" role="list">
        <li className="flex items-start gap-4">
          <span
            className="w-7 h-7 rounded-full bg-red-100 text-urgency-red flex items-center justify-center font-bold text-caption shrink-0 select-none mt-0.5"
            aria-hidden="true"
          >
            1
          </span>
          <span className="text-[18px] sm:text-[20px] font-medium text-text-main leading-snug">
            Stay calm and sit down if you can.
          </span>
        </li>
        <li className="flex items-start gap-4">
          <span
            className="w-7 h-7 rounded-full bg-red-100 text-urgency-red flex items-center justify-center font-bold text-caption shrink-0 select-none mt-0.5"
            aria-hidden="true"
          >
            2
          </span>
          <span className="text-[18px] sm:text-[20px] font-medium text-text-main leading-snug">
            Unlock your door and stay near it.
          </span>
        </li>
        <li className="flex items-start gap-4">
          <span
            className="w-7 h-7 rounded-full bg-red-100 text-urgency-red flex items-center justify-center font-bold text-caption shrink-0 select-none mt-0.5"
            aria-hidden="true"
          >
            3
          </span>
          <span className="text-[18px] sm:text-[20px] font-medium text-text-main leading-snug">
            Tell someone nearby that you need help.
          </span>
        </li>
        <li className="flex items-start gap-4">
          <span
            className="w-7 h-7 rounded-full bg-red-100 text-urgency-red flex items-center justify-center font-bold text-caption shrink-0 select-none mt-0.5"
            aria-hidden="true"
          >
            4
          </span>
          <span className="text-[18px] sm:text-[20px] font-medium text-text-main leading-snug">
            Do not eat or drink anything.
          </span>
        </li>
      </ol>
    </div>
  );

  return (
    <main className="w-full min-h-[calc(100dvh-120px)] flex items-center justify-center p-4 sm:p-6 bg-[#FEF2F2]">
      <div className="flex flex-col w-full items-center justify-center py-6 px-2 sm:px-4">
        {/* Central Emergency Card (Reference 640px wide, 16px radius) */}
        <div className="relative w-full max-w-[640px] bg-surface rounded-2xl shadow-[0_20px_25px_-5px_rgba(220,38,38,0.08),0_8px_10px_-6px_rgba(220,38,38,0.04)] overflow-hidden border border-border/40">
          {/* Prominent 4px Red Top Accent Border */}
          <div className="w-full h-1 bg-urgency-red" aria-hidden="true" />

          <div className="p-6 sm:p-10 flex flex-col gap-8">
            {/* Card Header: Visual Alert Badge & Headings */}
            <div className="flex flex-col items-center text-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-urgency-red shadow-2xs"
                aria-hidden="true"
              >
                <AlertTriangle className="h-8 w-8 text-urgency-red" />
              </div>

              <div className="flex flex-col gap-2">
                <h1
                  ref={h1Ref}
                  tabIndex={-1}
                  className="font-headline-xl-mobile sm:font-headline-xl text-headline-xl-mobile sm:text-headline-xl font-bold text-text-main tracking-tight outline-none"
                >
                  This may be an emergency
                </h1>
                <p className="font-body-lg text-body-lg text-text-muted max-w-lg mx-auto leading-relaxed">
                  Based on what you described, you should get help right now. Please
                  do not wait.
                </p>
              </div>
            </div>

            {/* High-Priority Stacked Emergency Call Buttons (First focusable elements) */}
            <div className="flex flex-col gap-3.5 w-full">
              <a
                href="tel:112"
                role="button"
                className="w-full h-16 bg-urgency-red hover:bg-[#b91c1c] active:bg-[#991b1b] text-white rounded-xl flex items-center justify-center gap-3.5 px-6 shadow-md transition-colors focus:outline-none focus:ring-4 focus:ring-red-200"
              >
                <PhoneCall className="h-7 w-7 shrink-0 text-white" aria-hidden="true" />
                <span className="font-headline-md text-headline-md font-bold tracking-tight text-white">
                  Call Emergency Services: 112
                </span>
              </a>

              <a
                href="tel:108"
                role="button"
                className="w-full h-16 bg-[#991b1b] hover:bg-[#7f1d1d] active:bg-[#681818] text-white rounded-xl flex items-center justify-center gap-3.5 px-6 shadow-sm transition-colors focus:outline-none focus:ring-4 focus:ring-red-200"
              >
                <Ambulance className="h-7 w-7 shrink-0 text-white" aria-hidden="true" />
                <span className="font-headline-md text-headline-md font-bold tracking-tight text-white">
                  Call Ambulance: 108
                </span>
              </a>
            </div>

            {/* Conditional Positioning: If selfharm, show support card near top ABOVE "While you wait" */}
            {isSelfHarm ? (
              <>
                {mentalHealthCard}
                {whileYouWaitCard}
              </>
            ) : (
              <>
                {whileYouWaitCard}
                {mentalHealthCard}
              </>
            )}

            {/* Safe Exit & Regulatory Clinical Disclaimer */}
            <div className="flex flex-col items-center text-center gap-3 pt-2">
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 font-medium text-caption text-text-muted hover:text-text-main transition-colors py-1 px-3 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>I&apos;m safe, return to chat</span>
              </Link>
              <p className="text-caption text-text-muted">
                SafeSteps cannot provide emergency medical care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EmergencyPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-[calc(100dvh-120px)] flex items-center justify-center p-6 bg-[#FEF2F2]">
          <div className="w-full max-w-[640px] bg-surface rounded-2xl h-96 animate-pulse" />
        </main>
      }
    >
      <EmergencyContent />
    </Suspense>
  );
}
