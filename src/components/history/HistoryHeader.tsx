"use client";

import React from "react";
import Link from "next/link";
import { Plus, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryHeaderProps {
  onExportAll?: () => void;
  totalCount: number;
}

export function HistoryHeader({ onExportAll, totalCount }: HistoryHeaderProps) {
  return (
    <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div className="flex flex-col gap-1 max-w-2xl">
        <div className="flex items-center gap-1.5 text-teal-800 text-xs sm:text-sm font-semibold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
          <span>Clinical Consultation Archive</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">
          Your conversations
        </h1>
        <p className="text-sm sm:text-base text-text-muted">
          Review past symptom assessments, download summaries for your doctor, or resume consultations.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        {totalCount > 0 && onExportAll && (
          <Button
            variant="secondary"
            onClick={onExportAll}
            className="h-11 px-4 rounded-xl text-caption font-semibold gap-2 border-border hover:bg-slate-50 text-text-main shadow-xs"
            title="Export all clinical records"
            aria-label="Export all conversations"
          >
            <Download className="w-4 h-4 text-teal-700" aria-hidden="true" />
            <span>Export all</span>
          </Button>
        )}
        <Button
          href="/chat"
          className="h-11 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-caption font-semibold gap-2 shadow-xs transition-all flex items-center"
          aria-label="Start a new clinical health assessment"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New assessment</span>
        </Button>
      </div>
    </div>
  );
}
