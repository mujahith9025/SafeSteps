import React from "react";
import Link from "next/link";
import { Shield, CheckCheck, AlertTriangle, ArrowRight } from "lucide-react";
import { UrgencyResult } from "@/types/chat";

export interface MessageBubbleProps {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  status?: "sent" | "delivered" | "read";
  result?: UrgencyResult;
}

export function MessageBubble({
  id,
  role,
  content,
  timestamp = "10:14 AM",
  result,
}: MessageBubbleProps) {
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
