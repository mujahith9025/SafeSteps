"use client";

import React, { useState } from "react";
import { Plus, PhoneCall, ShieldCheck, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onNewChat?: () => void;
  sessionTitle?: string;
  currentStep?: 1 | 2 | 3;
}

export function ChatHeader({
  onNewChat,
  sessionTitle = "Encrypted Session #SF-204",
  currentStep = 1,
}: ChatHeaderProps) {
  const [showMobileDisclaimer, setShowMobileDisclaimer] = useState(false);

  return (
    <div className="w-full bg-surface/90 border-b border-border backdrop-blur-md sticky top-0 z-20">
      {/* Collapsible Mobile Disclaimer Header */}
      <div className="md:hidden bg-info-bg/70 border-b border-info-border/60 px-4 py-1.5 flex items-center justify-between text-caption text-info-text">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Non-diagnostic triage &bull; Call 112 in emergency</span>
        </div>
        <button
          type="button"
          onClick={() => setShowMobileDisclaimer((prev) => !prev)}
          className="text-info-text hover:text-primary p-1 rounded min-h-[32px] min-w-[32px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-expanded={showMobileDisclaimer}
          aria-label={showMobileDisclaimer ? "Hide disclaimer details" : "Show disclaimer details"}
        >
          {showMobileDisclaimer ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {showMobileDisclaimer && (
        <div className="md:hidden bg-info-bg border-b border-info-border px-4 py-2.5 text-caption text-info-text animate-fade-in space-y-1">
          <p className="font-semibold text-xs uppercase tracking-wider">
            Medical Safety Notice:
          </p>
          <p className="leading-relaxed">
            SafeSteps provides automated guidance based on standardized clinical triage algorithms. It does not diagnose or prescribe. If symptoms are acute, seek emergency care immediately.
          </p>
        </div>
      )}

      {/* Main Chat Navigation Header */}
      <div className="max-w-[760px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: New Chat Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onNewChat}
            className="h-10 px-3.5 text-caption font-semibold rounded-xl gap-1.5 border-border hover:bg-slate-50"
            aria-label="Start a new chat session"
          >
            <Plus className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="hidden xs:inline">New chat</span>
          </Button>

          {/* Session Security Indicator (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-text-muted text-caption font-medium border border-border/60">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="truncate max-w-[180px]">{sessionTitle}</span>
            <span className="text-slate-300" aria-hidden="true">&bull;</span>
            <span className="text-primary font-semibold">Clinical Mode</span>
          </div>
        </div>

        {/* Right: Always-Visible Red Emergency Help Button */}
        <div className="shrink-0">
          <Button
            variant="emergency"
            size="sm"
            href="/emergency"
            aria-label="Emergency Help: Call 112 or view emergency steps"
            className="h-10 px-3.5 sm:px-4 text-caption font-semibold rounded-xl gap-2 shadow-xs"
          >
            <PhoneCall className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Emergency Help</span>
            <span className="hidden sm:inline">(112)</span>
          </Button>
        </div>
      </div>

      {/* 3-Step Triage Progress Tracker */}
      <div
        className="bg-slate-50/95 border-t border-border/70 py-2 px-4 select-none"
        role="region"
        aria-label="Triage consultation progress tracker"
      >
        <div className="max-w-[760px] mx-auto flex items-center justify-between text-xs">
          {/* Step 1: Symptoms */}
          <div
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              currentStep >= 1 ? "text-primary" : "text-slate-400"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                currentStep > 1
                  ? "bg-primary text-white"
                  : currentStep === 1
                  ? "bg-primary text-white ring-2 ring-primary/25"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {currentStep > 1 ? "✓" : "1"}
            </span>
            <span className="text-xs sm:text-caption font-semibold">
              1. Symptoms
            </span>
          </div>

          {/* Connector 1 */}
          <div
            className={`flex-1 h-0.5 mx-2.5 sm:mx-4 rounded-full transition-colors ${
              currentStep >= 2 ? "bg-primary" : "bg-slate-200"
            }`}
          />

          {/* Step 2: Safety Check */}
          <div
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              currentStep >= 2 ? "text-primary" : "text-slate-400"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                currentStep > 2
                  ? "bg-primary text-white"
                  : currentStep === 2
                  ? "bg-primary text-white ring-2 ring-primary/25 animate-pulse"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {currentStep > 2 ? "✓" : "2"}
            </span>
            <span className="text-xs sm:text-caption font-semibold">
              2. Safety Check
            </span>
          </div>

          {/* Connector 2 */}
          <div
            className={`flex-1 h-0.5 mx-2.5 sm:mx-4 rounded-full transition-colors ${
              currentStep >= 3 ? "bg-emerald-600" : "bg-slate-200"
            }`}
          />

          {/* Step 3: Care Guidance */}
          <div
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              currentStep === 3 ? "text-emerald-700 font-bold" : "text-slate-400"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                currentStep === 3
                  ? "bg-emerald-600 text-white ring-2 ring-emerald-600/30"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              3
            </span>
            <span className="text-xs sm:text-caption font-semibold">
              3. Care Guidance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
