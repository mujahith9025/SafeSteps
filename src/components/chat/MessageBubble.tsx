"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, CheckCheck, AlertTriangle, ArrowRight } from "lucide-react";
import { UrgencyResult, SourceCitation } from "@/types/chat";
import { CitationChips, SourcesDrawer } from "./SourcesPanel";

export interface MessageBubbleProps {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  status?: "sent" | "delivered" | "read";
  result?: UrgencyResult;
  quickReplies?: string[];
  sources?: SourceCitation[];
  onSelectChip?: (text: string) => void;
  isLatest?: boolean;
  disabled?: boolean;
}

export function MessageBubble({
  id,
  role,
  content,
  timestamp = "10:14 AM",
  result,
  quickReplies,
  sources,
  onSelectChip,
  isLatest = false,
  disabled = false,
}: MessageBubbleProps) {
  const [showSources, setShowSources] = useState(false);
  if (role === "user") {
    return (
      <div className="flex flex-col items-end w-full group animate-fade-in">
        <div className="bg-primary text-white rounded-2xl rounded-tr-xs p-4 px-5 max-w-[85%] sm:max-w-[560px] shadow-xs">
          <p className="font-body text-body leading-relaxed whitespace-pre-wrap break-words select-text">
            {content}
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1 text-caption text-text-muted select-none">
          <span>{timestamp}</span>
          <span className="text-slate-300" aria-hidden="true">&bull;</span>
          <span className="flex items-center gap-1 text-primary">
            <span>Delivered</span>
            <CheckCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          </span>
        </div>
      </div>
    );
  }

  // Assistant bubble
  const isWelcome = id === "welcome-message";

  return (
    <div className="flex items-start gap-3 w-full max-w-[92%] sm:max-w-[660px] group animate-fade-in">
      {/* Stitch Assistant Avatar: Teal Circle with Shield */}
      <div
        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5"
        aria-hidden="true"
      >
        <Shield className="h-4 w-4 text-white" />
      </div>

      {/* Assistant Message Bubble */}
      <div className="flex flex-col items-start w-full space-y-2">
        <div className="bg-surface border border-border text-text-main rounded-2xl rounded-tl-xs p-5 shadow-xs w-full">
          <p className="font-body text-body leading-relaxed text-text-main whitespace-pre-wrap break-words select-text">
            {content}
          </p>

          {/* Visible link to /emergency inside assistant's first message */}
          {isWelcome && (
            <div className="mt-3 pt-3 border-t border-border/70 flex flex-wrap items-center gap-1.5 text-caption">
              <AlertTriangle className="h-4 w-4 text-urgency-red shrink-0" aria-hidden="true" />
              <span className="text-text-muted">In an acute medical emergency, go to</span>
              <Link
                href="/emergency"
                className="font-semibold text-urgency-red hover:text-red-700 underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-urgency-red rounded px-0.5"
              >
                Emergency Help <ArrowRight className="h-3 w-3 inline" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* Urgent Result Card preview if present */}
          {result && (
            <div
              className={`mt-4 p-4 rounded-xl border ${
                result.tier === "emergency"
                  ? "bg-emergency-bg border-urgency-red/30 text-urgency-red"
                  : result.tier === "urgent_care"
                  ? "bg-amber-50 border-urgency-amber/30 text-urgency-amber"
                  : "bg-emerald-50 border-urgency-green/30 text-urgency-green"
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-h3">
                <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{result.headline}</span>
              </div>
              <p className="text-body text-text-main mb-3">{result.summary}</p>
              {result.actions && result.actions.length > 0 && (
                <div className="space-y-1 mb-2">
                  <div className="text-caption font-semibold uppercase tracking-wider text-text-muted">
                    Recommended Actions:
                  </div>
                  <ul className="list-disc pl-5 text-caption text-text-main space-y-1">
                    {result.actions.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {/* Interactive Tap-to-Answer Quick Replies */}
          {quickReplies && quickReplies.length > 0 && isLatest && (
            <div className="mt-3.5 pt-3 border-t border-border/70 animate-fade-in">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5 select-none">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Quick Responses (Tap to reply):</span>
              </div>
              <div
                className="flex flex-wrap items-center gap-2"
                role="group"
                aria-label="Suggested quick reply options"
              >
                {quickReplies.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelectChip?.(chip)}
                    className="group/chip inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-caption font-medium bg-surface hover:bg-primary-light active:bg-primary/20 text-primary border border-primary/30 hover:border-primary transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 group-hover/chip:scale-125 transition-transform" />
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Citation Chips & Evidence Drawer (Matching Stitch Design) */}
          {sources && sources.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-border/60">
              <CitationChips
                sources={sources}
                onOpenSources={() => setShowSources((prev) => !prev)}
              />
              <SourcesDrawer
                sources={sources}
                isOpen={showSources}
                onToggle={() => setShowSources((prev) => !prev)}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1 px-1 text-caption text-text-muted select-none">
          <span className="font-medium text-primary">SafeSteps AI Guidance</span>
          <span className="text-slate-300" aria-hidden="true">&bull;</span>
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
