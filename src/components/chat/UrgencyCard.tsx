"use client";

import React from "react";
import {
  Shield,
  ShieldCheck,
  CheckCircle,
  Calendar,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  Stethoscope,
  FileText,
  PhoneCall,
  Ambulance,
  ClipboardList,
  RotateCcw,
  Clock,
  CheckCheck,
  ClipboardCheck,
} from "lucide-react";
import { UrgencyResult, UrgencyLevel } from "@/types/chat";

export interface UrgencyCardProps {
  result: UrgencyResult;
  onNewChat?: () => void;
  onShowSummary?: () => void;
  onPrepareVisit?: () => void;
  className?: string;
}

/**
 * Normalizes urgency tier from either urgency or tier property
 */
function getNormalizedUrgency(result: UrgencyResult): UrgencyLevel {
  if (result.urgency) return result.urgency;
  if (result.tier === "emergency") return "emergency";
  if (result.tier === "urgent_care" || result.tier === "primary_care")
    return "see_doctor_soon";
  return "self_care";
}

export function UrgencyCard({
  result,
  onNewChat,
  onShowSummary,
  onPrepareVisit,
  className = "",
}: UrgencyCardProps) {
  const urgency = getNormalizedUrgency(result);
  const isEmergency = urgency === "emergency";
  const isDoctorSoon = urgency === "see_doctor_soon";

  // Level-specific configurations matching Stitch source of truth
  const config = {
    self_care: {
      label: "Level 1: Self-Care",
      headerPillText: "Level 1 Guidance",
      headerTextColor: "text-urgency-green",
      stripeColor: "bg-[#16A34A]",
      badgeBg: "bg-[#DCFCE7]",
      badgeText: "text-[#15803D]",
      BadgeIcon: CheckCircle,
      SuggestsIcon: Info,
      suggestsIconColor: "text-primary",
      ActionsHeaderIcon: CheckCheck,
      actionsIconColor: "text-[#16A34A]",
      checkColor: "text-[#16A34A]",
      warningBoxBg: "bg-amber-50/50",
      warningBoxBorder: "border-amber-200/60",
      warningIconColor: "text-[#D97706]",
      warningDotColor: "bg-[#D97706]",
    },
    see_doctor_soon: {
      label: "Level 2: See Doctor Soon",
      headerPillText: "Level 2 Advisory",
      headerTextColor: "text-[#B45309]",
      stripeColor: "bg-[#D97706]",
      badgeBg: "bg-[#FEF3C7]",
      badgeText: "text-[#B45309]",
      BadgeIcon: Calendar,
      SuggestsIcon: Stethoscope,
      suggestsIconColor: "text-[#B45309]",
      ActionsHeaderIcon: ClipboardCheck,
      actionsIconColor: "text-[#D97706]",
      checkColor: "text-[#D97706]",
      warningBoxBg: "bg-amber-50/60",
      warningBoxBorder: "border-amber-200/70",
      warningIconColor: "text-urgency-red",
      warningDotColor: "bg-urgency-red",
    },
    emergency: {
      label: "Level 3: Immediate Care Required",
      headerPillText: "Level 3 Critical Escalation",
      headerTextColor: "text-urgency-red",
      stripeColor: "bg-[#DC2626]",
      badgeBg: "bg-[#FEE2E2]",
      badgeText: "text-[#DC2626]",
      BadgeIcon: AlertOctagon,
      SuggestsIcon: FileText,
      suggestsIconColor: "text-primary",
      ActionsHeaderIcon: AlertCircle,
      actionsIconColor: "text-urgency-red",
      checkColor: "text-urgency-red",
      warningBoxBg: "bg-red-50/60",
      warningBoxBorder: "border-red-200/70",
      warningIconColor: "text-urgency-red",
      warningDotColor: "bg-urgency-red",
    },
  }[urgency];

  const actionsList =
    result.actions && result.actions.length > 0 ? result.actions : [];
  const warningSignsList =
    result.warning_signs && result.warning_signs.length > 0
      ? result.warning_signs
      : result.warningSigns || [];
  const suggestsText = result.suggests || result.summary || "";

  return (
    <article
      className={`space-y-3 w-full animate-fade-in ${className}`}
      aria-label={`Urgency result: ${config.label}`}
    >
      {/* Assistant Metadata Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs shrink-0">
          <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption">
          <span className="font-semibold text-text-main">SafeSteps AI</span>
          <span className="text-slate-300" aria-hidden="true">&bull;</span>
          <span className="text-text-muted">Triage Completed</span>
          <span className="text-slate-300" aria-hidden="true">&bull;</span>
          <span className={`font-semibold ${config.headerTextColor}`}>
            {config.headerPillText}
          </span>
        </div>
      </div>

      {/* Result Card Body */}
      <div className="bg-surface border border-border rounded-2xl shadow-md overflow-hidden pl-0.5 flex">
        {/* 6px Accent Left Stripe from Stitch */}
        <div className={`w-1.5 ${config.stripeColor} rounded-l-2xl self-stretch shrink-0`} />

        <div className="flex-1 p-5 sm:p-6 space-y-6">
          {/* Card Header & Multi-Sensory Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-caption font-semibold ${config.badgeBg} ${config.badgeText}`}
            >
              <config.BadgeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="uppercase tracking-wider">{config.label}</span>
            </div>

            {isEmergency ? (
              <span className="text-urgency-red text-caption font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-urgency-red animate-ping motion-reduce:animate-none inline-block" />
                <span>Urgent Clinical Action</span>
              </span>
            ) : (
              <span className="text-text-muted text-caption flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                <span>Evaluated just now</span>
              </span>
            )}
          </div>

          {/* Headline */}
          <div>
            <h2
              className={`font-headline-md text-headline-md font-semibold ${
                isEmergency ? "text-urgency-red" : "text-text-main"
              }`}
            >
              {result.headline}
            </h2>
          </div>

          {/* Critical Emergency Call-to-Action Bar (Level 3 Emergency) */}
          {isEmergency && (
            <>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="tel:112"
                  className="flex-1 bg-urgency-red hover:bg-red-700 active:bg-red-800 text-white px-6 py-3.5 rounded-xl font-semibold text-label-md flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99] text-center"
                >
                  <PhoneCall className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Call Emergency Help (112)</span>
                </a>
                <a
                  href="tel:108"
                  className="flex-1 bg-white text-urgency-red border border-urgency-red/30 hover:bg-red-50 px-5 py-3.5 rounded-xl font-semibold text-label-md flex items-center justify-center gap-2.5 transition-colors shadow-xs text-center"
                >
                  <Ambulance className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Call Ambulance (108)</span>
                </a>
              </div>

              {/* Crucial Immediate Safety Instructions */}
              <div className="bg-red-50/80 border border-red-200/80 rounded-xl p-4 space-y-2.5">
                <h3 className="font-semibold text-body text-red-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-urgency-red shrink-0" aria-hidden="true" />
                  <span>Immediate Safety Instructions</span>
                </h3>
                <ul className="space-y-2 text-body text-text-main">
                  <li className="flex items-start gap-2.5">
                    <span className="text-urgency-red font-bold text-lg leading-none mt-0.5">&times;</span>
                    <span><strong>Do not wait</strong> to see if symptoms improve on their own.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-urgency-red font-bold text-lg leading-none mt-0.5">&times;</span>
                    <span><strong>Do not drive yourself</strong> to the hospital. Arrange emergency transport or ask someone to drive you.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-urgency-red font-bold text-lg leading-none mt-0.5">&bull;</span>
                    <span><strong>Stay with someone</strong> or keep a trusted contact on the phone line while awaiting emergency assistance.</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Section: What this suggests */}
          {suggestsText && (
            <div className="bg-slate-50 border border-border/60 rounded-xl p-4 flex gap-3">
              <config.SuggestsIcon
                className={`h-5 w-5 shrink-0 mt-0.5 ${config.suggestsIconColor}`}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <h3 className="font-semibold text-body text-text-main">What this suggests</h3>
                <p className="text-body text-text-muted leading-relaxed">
                  {suggestsText}
                </p>
              </div>
            </div>
          )}

          {/* Section: What you can do now */}
          {actionsList.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-body text-text-main flex items-center gap-2">
                <config.ActionsHeaderIcon
                  className={`h-5 w-5 ${config.actionsIconColor}`}
                  aria-hidden="true"
                />
                <span>What you can do now</span>
              </h3>
              <ul className="space-y-2.5 text-body text-text-muted">
                {actionsList.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle
                      className={`h-4 w-4 shrink-0 mt-1 ${config.checkColor}`}
                      aria-hidden="true"
                    />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Primary Guided Action Box for Level 2 (Doctor Visit Prep) */}
          {isDoctorSoon && (
            <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-caption font-semibold text-primary block">
                  Doctor visit preparation
                </span>
                <p className="text-body text-text-main">
                  Generate a structured checklist of your reported symptoms.
                </p>
              </div>
              <button
                type="button"
                onClick={onPrepareVisit}
                className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-caption font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 min-h-[44px] transition-colors shadow-xs shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                <span>How to prepare for your visit</span>
              </button>
            </div>
          )}

          {/* Section: Warning signs to watch for */}
          {warningSignsList.length > 0 && (
            <div
              className={`${config.warningBoxBg} border ${config.warningBoxBorder} rounded-xl p-4 space-y-2.5`}
            >
              <h3 className="font-semibold text-body text-text-main flex items-center gap-2">
                <AlertTriangle
                  className={`h-5 w-5 ${config.warningIconColor}`}
                  aria-hidden="true"
                />
                <span>
                  {isEmergency
                    ? "Red-flag signs that need instantaneous response"
                    : isDoctorSoon
                    ? "Warning signs that require immediate care"
                    : "Warning signs to watch for"}
                </span>
              </h3>
              <ul className="space-y-2 text-body text-text-muted">
                {warningSignsList.map((sign, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${config.warningDotColor} mt-2.5 shrink-0`}
                    />
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer & Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/50">
            <p className="text-caption text-text-muted flex items-center gap-1.5">
              <Shield
                className={`h-4 w-4 shrink-0 ${
                  isEmergency ? "text-urgency-red" : "text-text-muted"
                }`}
                aria-hidden="true"
              />
              <span>
                {isEmergency
                  ? "This is urgent guidance, not a medical diagnosis. Prioritize calling 112."
                  : "This is general guidance, not a medical diagnosis."}
              </span>
            </p>
            <div className="flex items-center gap-3">
              {onNewChat && (
                <button
                  type="button"
                  onClick={onNewChat}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-text-main transition-colors text-caption font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Start a new chat</span>
                </button>
              )}
              {onShowSummary && (
                <button
                  type="button"
                  onClick={onShowSummary}
                  className="px-3 py-2 rounded-xl text-primary hover:bg-primary-light/40 transition-colors text-caption font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span>Show summary</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gentle post-result line */}
      <div className="text-center py-1">
        <p className="text-caption text-text-muted select-none">
          You can start a new chat any time, or continue describing how you feel below.
        </p>
      </div>
    </article>
  );
}
