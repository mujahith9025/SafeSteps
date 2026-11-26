"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MoreVertical,
  ExternalLink,
  Pencil,
  Download,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { ConversationSummary, UrgencyTier } from "@/lib/conversations";

interface ConversationCardProps {
  conversation: ConversationSummary;
  onRename: (conv: ConversationSummary) => void;
  onDelete: (conv: ConversationSummary) => void;
  onDownloadSummary: (conv: ConversationSummary) => void;
}

export function ConversationCard({
  conversation,
  onRename,
  onDelete,
  onDownloadSummary,
}: ConversationCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Close menu on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const consultationId = `#SF-${conversation.id.replace(/-/g, "").substring(0, 5).toUpperCase()}`;

  const formattedDate = new Date(conversation.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(conversation.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Rail & Badge styles according to urgency
  const getUrgencyConfig = (urgency: UrgencyTier | null) => {
    switch (urgency) {
      case "emergency":
        return {
          railClass: "bg-red-600",
          iconBg: "bg-red-100 text-red-700",
          Icon: AlertTriangle,
          badgeBg: "bg-red-50 text-red-700 border-red-200",
          badgeText: "Emergency — Call 112",
          pulse: true,
        };
      case "see_doctor_soon":
        return {
          railClass: "bg-amber-600",
          iconBg: "bg-amber-100 text-amber-800",
          Icon: Clock,
          badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
          badgeText: "See a doctor soon (24–48h)",
          pulse: false,
        };
      case "self_care":
        return {
          railClass: "bg-teal-700",
          iconBg: "bg-teal-100 text-teal-800",
          Icon: Sparkles,
          badgeBg: "bg-teal-50 text-teal-800 border-teal-200",
          badgeText: "Self-care & hydration",
          pulse: false,
        };
      default:
        return {
          railClass: "bg-slate-300",
          iconBg: "bg-slate-100 text-slate-700",
          Icon: MessageSquare,
          badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
          badgeText: "Clinical Assessment",
          pulse: false,
        };
    }
  };

  const { railClass, iconBg, Icon, badgeBg, badgeText, pulse } = getUrgencyConfig(
    conversation.urgency
  );

  return (
    <div className="relative bg-white rounded-2xl shadow-xs hover:shadow-md transition-shadow border border-border/70 p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 group overflow-hidden">
      {/* Accent Visual Indicator Rail on the left */}
      <div className={`absolute left-0 top-3 bottom-3 w-1.5 ${railClass} rounded-r-full`} />

      {/* Main Content Area */}
      <div className="flex items-start gap-3.5 pl-2 flex-1 min-w-0">
        {/* Category Icon */}
        <div
          className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>

        {/* Text Details */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/chat/${conversation.id}`}
              className="text-base sm:text-lg font-bold text-text-main group-hover:text-teal-700 transition-colors truncate max-w-full"
            >
              {conversation.title}
            </Link>

            {/* Urgency Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeBg}`}
            >
              {pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />}
              <span>{badgeText}</span>
            </span>
          </div>

          {/* Timestamp and Consultation ID */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted flex-wrap">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span>
              {formattedDate} • {formattedTime}
            </span>
            <span aria-hidden="true">&bull;</span>
            <span className="font-medium text-slate-600">{consultationId}</span>
          </div>

          {/* Message Preview Excerpt */}
          <p className="text-sm text-slate-600 line-clamp-2 mt-1 leading-relaxed">
            {conversation.preview || "No messages recorded yet in this consultation."}
          </p>

          {/* Metadata Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
              Clinical triage
            </span>
            <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-700" />
              <span>Encrypted</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Area / 3-Dot Dropdown Menu */}
      <div className="relative shrink-0 self-end md:self-start" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-text-main transition-colors border border-border/50 focus:outline-none focus:ring-2 focus:ring-teal-600"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={`Options for ${conversation.title}`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-11 w-52 bg-white rounded-xl shadow-lg border border-border/70 z-30 py-1.5 flex flex-col animate-fade-in"
          >
            <Link
              href={`/chat/${conversation.id}`}
              role="menuitem"
              className="px-3.5 py-2 text-text-main hover:bg-slate-50 text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <ExternalLink className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Open conversation</span>
            </Link>

            <Link
              href={`/summary/${conversation.id}`}
              role="menuitem"
              className="px-3.5 py-2 text-text-main hover:bg-slate-50 text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <FileText className="w-4 h-4 text-teal-700 shrink-0" />
              <span>View visit summary</span>
            </Link>

            <button
              type="button"
              role="menuitem"
              className="w-full text-left px-3.5 py-2 text-text-main hover:bg-slate-50 text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors"
              onClick={() => {
                setMenuOpen(false);
                onRename(conversation);
              }}
            >
              <Pencil className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Rename chat</span>
            </button>

            <button
              type="button"
              role="menuitem"
              className="w-full text-left px-3.5 py-2 text-text-main hover:bg-slate-50 text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors"
              onClick={() => {
                setMenuOpen(false);
                onDownloadSummary(conversation);
              }}
            >
              <Download className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Download visit summary (PDF)</span>
            </button>

            <div className="h-px bg-slate-100 my-1" />

            <button
              type="button"
              role="menuitem"
              className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50 text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors"
              onClick={() => {
                setMenuOpen(false);
                onDelete(conversation);
              }}
            >
              <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
