"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { togglePersonaliseAction } from "@/app/(app)/profile/actions";

interface PersonalisationPillProps {
  initialPersonalise?: boolean;
  profileSummary?: string;
  onToggleChange?: (enabled: boolean) => void;
}

export function PersonalisationPill({
  initialPersonalise = false,
  profileSummary,
  onToggleChange,
}: PersonalisationPillProps) {
  const [personalise, setPersonalise] = useState(initialPersonalise);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.checked;
    setPersonalise(nextVal);
    if (onToggleChange) onToggleChange(nextVal);

    startTransition(async () => {
      const res = await togglePersonaliseAction(nextVal);
      if (!res.success) {
        // Rollback on server failure
        setPersonalise(!nextVal);
        if (onToggleChange) onToggleChange(!nextVal);
      }
    });
  };

  return (
    <div
      role="region"
      aria-label="Health profile personalization status"
      className={`w-full rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs border transition-colors ${
        personalise
          ? "bg-teal-50/80 border-teal-200 text-teal-950"
          : "bg-slate-50 border-border/70 text-slate-600"
      }`}
    >
      {/* Left: Indicator & Summary Details */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            personalise
              ? "bg-teal-600 text-white shadow-2xs"
              : "bg-slate-200 text-slate-500"
          }`}
          aria-hidden="true"
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-xs sm:text-sm font-medium truncate">
          {personalise ? (
            <>
              Personalised using your health profile{" "}
              {profileSummary ? (
                <span className="font-semibold text-teal-900">{profileSummary}</span>
              ) : (
                <span className="font-semibold text-teal-900">(Active)</span>
              )}
            </>
          ) : (
            <>
              Health profile context is paused{" "}
              <span className="text-slate-500 text-xs">(Not used in triage)</span>
            </>
          )}
        </p>
      </div>

      {/* Right: Toggle Switch & Edit Profile Link */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
        <label
          htmlFor="profile-context-toggle"
          className="flex items-center gap-2 cursor-pointer select-none"
          title="Toggle health profile context in assessment"
        >
          <span className="text-xs font-semibold text-text-muted">Context</span>
          <div className="relative inline-flex items-center">
            <input
              id="profile-context-toggle"
              type="checkbox"
              checked={personalise}
              onChange={handleToggle}
              disabled={isPending}
              className="sr-only peer"
              aria-label="Use health profile context in triage"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-600 rounded-full peer peer-checked:bg-teal-700 transition-colors"></div>
            <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 shadow-xs"></div>
          </div>
        </label>

        <span className="text-slate-300" aria-hidden="true">
          |
        </span>

        <Link
          href="/profile"
          className="inline-flex items-center gap-0.5 text-teal-700 hover:text-teal-800 text-xs font-semibold hover:underline"
          title="Manage health profile details"
        >
          <span>Edit profile</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
