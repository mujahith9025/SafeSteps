"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  X,
} from "lucide-react";
import { SourceCitation } from "@/types/response";

export interface SourcesDrawerProps {
  sources: SourceCitation[];
  isOpen?: boolean;
  onToggle?: () => void;
  title?: string;
  className?: string;
}

/**
 * Citation Chips rendered directly below assistant messages.
 * Tapping a chip opens the desktop expandable drawer or mobile bottom sheet.
 */
export function CitationChips({
  sources,
  onOpenSources,
}: {
  sources: SourceCitation[];
  onOpenSources?: (index?: number) => void;
}) {
  if (!sources || sources.length === 0) return null;

  return (
    <div
      className="pt-2 flex flex-wrap items-center gap-2 animate-fade-in"
      role="group"
      aria-label="Clinical evidence citations"
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted select-none flex items-center gap-1">
        <ShieldCheck className="h-3 w-3 text-primary inline" aria-hidden="true" />
        <span>Clinical Evidence:</span>
      </span>

      {sources.map((source, idx) => (
        <button
          key={source.id || idx}
          type="button"
          onClick={() => onOpenSources?.(idx)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-primary text-text-main text-[12px] font-medium border border-border/80 hover:border-primary/40 transition-colors shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
          title={`View excerpt from ${source.title} (${source.source_name})`}
          aria-label={`View citation for ${source.title}`}
        >
          <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
          <span className="truncate max-w-[200px]">
            {source.source_name || source.title}
          </span>
          <span className="text-[10px] text-text-muted bg-white px-1.5 py-0.2 rounded-full border border-border/60">
            Ref {idx + 1}
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * Sources Drawer component supporting:
 * 1. Desktop expandable inline panel (with accordion toggle)
 * 2. Mobile slide-in bottom sheet modal (with drag bar, backdrop overlay, and escape key trap)
 */
export function SourcesDrawer({
  sources,
  isOpen = false,
  onToggle,
  title = "Verified Sources & Excerpts",
  className = "",
}: SourcesDrawerProps) {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Sync external isOpen prop during render (React-recommended pattern)
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    setIsExpanded(isOpen);
  }

  // Close mobile bottom sheet on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileSheetOpen) {
        setIsMobileSheetOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileSheetOpen]);

  if (!sources || sources.length === 0) return null;

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileSheetOpen(true);
    } else {
      const next = !isExpanded;
      setIsExpanded(next);
      onToggle?.();
    }
  };

  return (
    <>
      {/* Desktop Expandable Panel */}
      <div
        className={`w-full bg-white rounded-xl border border-border/80 p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5 transition-all mt-2.5 ${className}`}
      >
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center justify-between text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-0.5"
          aria-expanded={isExpanded}
          aria-label={`Toggle verified sources list, ${sources.length} sources linked`}
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-teal-50 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-caption sm:text-body font-semibold text-text-main group-hover:text-primary transition-colors">
                {title} ({sources.length})
              </span>
              <span className="text-[11px] text-text-muted hidden sm:inline">
                • Public health clinical evidence base
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-text-muted group-hover:text-primary transition-colors text-xs font-medium">
            <span className="hidden sm:inline">
              {isExpanded ? "Collapse" : "Expand"}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
        </button>

        {/* Expanded Desktop Sources List */}
        {isExpanded && (
          <div className="flex flex-col gap-2.5 pt-2 border-t border-border/70 animate-fade-in">
            {sources.map((source, index) => (
              <div
                key={source.id || index}
                className="bg-slate-50 border border-slate-200/70 rounded-lg p-3 flex flex-col gap-1.5 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-caption text-text-main">
                      {source.title}
                    </span>
                    <span className="text-[11px] text-text-muted bg-white px-2 py-0.5 rounded border border-border/60">
                      {source.source_name}
                    </span>
                  </div>

                  <a
                    href={source.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-teal-800 text-[12px] font-medium hover:underline shrink-0 px-1 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Open source document for ${source.title} in new tab`}
                  >
                    <span>Open source</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>

                {source.excerpt && (
                  <p className="text-caption text-text-muted italic line-clamp-2 pl-6 border-l-2 border-teal-300 ml-1">
                    &ldquo;{source.excerpt}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Slide-in Bottom Sheet Modal (< 768px) */}
      {isMobileSheetOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Verified clinical sources bottom sheet"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsMobileSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Container */}
          <div className="relative bg-white rounded-t-2xl shadow-2xl z-50 p-5 max-h-[85vh] overflow-y-auto border-t border-border flex flex-col gap-4 animate-slide-up">
            {/* Pull / Drag bar */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto select-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                </span>
                <div className="flex flex-col">
                  <h3 className="font-bold text-body text-text-main">
                    {title} ({sources.length})
                  </h3>
                  <span className="text-[11px] text-text-muted">
                    Evidence-based clinical guidelines
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sources sheet"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Sources List in Sheet */}
            <div className="flex flex-col gap-3">
              {sources.map((source, idx) => (
                <div
                  key={source.id || idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-caption text-text-main leading-tight">
                          {source.title}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {source.source_name}
                        </span>
                      </div>
                    </div>

                    <a
                      href={source.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline shrink-0 bg-white px-2 py-1 rounded-md border border-border"
                      aria-label={`Open ${source.title} in new tab`}
                    >
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>

                  {source.excerpt && (
                    <p className="text-caption text-text-muted italic line-clamp-3 pl-3 border-l-2 border-teal-400 ml-1 leading-relaxed">
                      &ldquo;{source.excerpt}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileSheetOpen(false)}
              className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-text-main font-semibold text-caption transition-colors text-center cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Embedded Sources Box inside the UrgencyCard.
 * Matches Stitch "Validated against NICE Guideline CG191 & NHS Pathways Protocol"
 */
export function UrgencyCardSources({
  sources,
  onOpenSources,
}: {
  sources: SourceCitation[];
  onOpenSources?: () => void;
}) {
  if (!sources || sources.length === 0) return null;

  const names = sources.map((s) => s.source_name || s.title).slice(0, 3).join(" & ");

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
        <span className="text-caption text-text-main font-medium">
          Validated against: <strong className="text-text-main font-semibold">{names}</strong>
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenSources}
        className="inline-flex items-center gap-1 text-primary hover:text-teal-800 font-semibold text-[12px] hover:underline shrink-0 cursor-pointer self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        <span>View protocol details ({sources.length})</span>
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
