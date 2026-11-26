"use client";

import React from "react";
import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function HistoryEmptyState({ isFiltered = false, onClearFilters }: HistoryEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xs border border-border/70 flex flex-col items-center text-center justify-center min-h-[340px] relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
          <MessageSquarePlus className="w-8 h-8" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-text-main mb-1.5">
          No matching conversations
        </h3>
        <p className="text-sm text-text-muted max-w-md mb-6 leading-relaxed">
          No past consultations matched your current search criteria or urgency filter.
        </p>
        {onClearFilters && (
          <Button
            variant="secondary"
            onClick={onClearFilters}
            className="h-11 px-5 rounded-xl text-caption font-semibold"
          >
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xs border border-border/70 flex flex-col items-center text-center justify-center min-h-[380px] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 bg-teal-100/40 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Healthcare Themed SVG Illustration (Stitch Showcase A) */}
      <div className="w-20 h-20 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4 text-teal-700 shadow-2xs">
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M12 18v-6" />
          <path d="M9 15h6" />
        </svg>
      </div>

      <span className="text-[12px] font-semibold uppercase tracking-wider text-teal-800 mb-1">
        SafeSteps Archive
      </span>
      <h3 className="text-xl sm:text-2xl font-bold text-text-main mb-2">
        No conversations yet
      </h3>
      <p className="text-sm sm:text-base text-text-muted max-w-md mb-6 leading-relaxed">
        When you start a health consultation or check symptoms, your structured assessments and GP
        summaries will appear here.
      </p>

      <Button
        href="/chat"
        className="h-11 px-6 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-caption font-semibold shadow-xs flex items-center gap-2"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span>Start a chat</span>
      </Button>
    </div>
  );
}
