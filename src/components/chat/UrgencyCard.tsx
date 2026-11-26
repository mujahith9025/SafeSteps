"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Copy,
  Check,
  Printer,
  Download,
  X,
} from "lucide-react";
import { UrgencyResult, UrgencyLevel, SourceCitation } from "@/types/chat";
import { UrgencyCardSources, SourcesDrawer } from "./SourcesPanel";

export interface UrgencyCardProps {
  result: UrgencyResult;
  sources?: SourceCitation[];
  conversationId?: string | null;
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
  sources,
  conversationId,
  onNewChat,
  onShowSummary: _onShowSummary,
  onPrepareVisit,
  className = "",
}: UrgencyCardProps) {
  const urgency = getNormalizedUrgency(result);
  const isEmergency = urgency === "emergency";
  const isDoctorSoon = urgency === "see_doctor_soon";

  const [isCopied, setIsCopied] = useState(false);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);

  const activeSources = sources || result.sources || [];

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

  // Generates a structured clinical summary formatted for physician evaluation
  const generateDoctorBrief = () => {
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return [
      `==================================================`,
      `SAFESTEPS PATIENT CLINICAL TRIAGE BRIEF`,
      `Date & Time: ${dateStr}`,
      `--------------------------------------------------`,
      `TRIAGE ASSESSMENT: ${config.label}`,
      `HEADLINE: ${result.headline}`,
      ``,
      `CLINICAL SUGGESTION:`,
      `${suggestsText}`,
      ``,
      `RECOMMENDED HOME / CONSULTATION ACTIONS:`,
      ...actionsList.map((act, i) => `  ${i + 1}. ${act}`),
      ``,
      `RED-FLAG WARNING SIGNS EVALUATED:`,
      ...warningSignsList.map((sign) => `  • ${sign}`),
      ``,
      `SUGGESTED QUESTIONS TO ASK YOUR DOCTOR:`,
      `  1. Could these symptoms be related to an infection, seasonal allergy, or fatigue?`,
      `  2. Do you recommend any diagnostic tests, blood work, or prescription medications?`,
      `  3. What specific changes in these symptoms should prompt immediate emergency care?`,
      `--------------------------------------------------`,
      `DISCLAIMER: Non-diagnostic orientation generated by SafeSteps AI. Always consult a licensed healthcare professional for medical diagnosis and prescriptions.`,
      `==================================================`,
    ].join("\n");
  };

  const handleCopyDoctorBrief = async () => {
    try {
      const briefText = generateDoctorBrief();
      await navigator.clipboard.writeText(briefText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = generateDoctorBrief();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

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

          {/* Embedded Sources Section matching Stitch Clinical Assessment */}
          {activeSources.length > 0 && (
            <div className="space-y-2">
              <UrgencyCardSources
                sources={activeSources}
                onOpenSources={() => setShowSourcesPanel((prev) => !prev)}
              />
              <SourcesDrawer
                sources={activeSources}
                isOpen={showSourcesPanel}
                onToggle={() => setShowSourcesPanel((prev) => !prev)}
              />
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
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Copy Doctor Visit Brief Button */}
              <button
                type="button"
                onClick={handleCopyDoctorBrief}
                className={`px-3.5 py-2 rounded-xl transition-all text-caption font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs active:scale-95 ${
                  isCopied
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-primary hover:bg-primary-hover active:bg-primary-active text-white"
                }`}
                aria-label="Copy doctor visit brief to clipboard"
                title="Copy formatted clinical summary to show your doctor or pharmacist"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    <span>✓ Brief Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span>Copy Doctor Brief</span>
                  </>
                )}
              </button>

              {/* View Doctor Brief Note Button */}
              <button
                type="button"
                onClick={() => setShowBriefModal(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-text-main transition-colors text-caption font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="View formatted note to share with doctor"
              >
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>View Note</span>
              </button>

              {/* Doctor Visit Summary & PDF Actions */}
              {conversationId && (
                <>
                  <Link
                    href={`/summary/${conversationId}`}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 transition-colors text-caption font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="View printable doctor visit summary document"
                  >
                    <FileText className="h-4 w-4 text-teal-700" aria-hidden="true" />
                    <span>Save summary</span>
                  </Link>

                  <a
                    href={`/api/summary/${conversationId}/pdf`}
                    download={`SafeSteps-Visit-Summary-${conversationId.substring(0, 8)}.pdf`}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white transition-colors text-caption font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Download doctor visit summary PDF"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Download visit summary (PDF)</span>
                  </a>
                </>
              )}

              {onNewChat && (
                <button
                  type="button"
                  onClick={onNewChat}
                  className="px-3 py-2 rounded-xl text-text-muted hover:text-text-main hover:bg-slate-100 transition-colors text-caption font-medium flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>New chat</span>
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

      {/* Doctor Visit Brief Note Modal Dialog */}
      {showBriefModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctor-brief-modal-title"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 id="doctor-brief-modal-title" className="font-bold text-base text-slate-900">
                  Doctor Visit Brief Note
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBriefModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close brief preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Preformatted Monospace Note */}
            <div className="p-5 overflow-y-auto bg-[#F8FAFC] select-all">
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 leading-relaxed">
                {generateDoctorBrief()}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
              <span className="text-xs text-slate-500">
                {isCopied ? "✓ Copied to clipboard!" : "Show or share directly with your clinic."}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyDoctorBrief}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  <span>{isCopied ? "Copied!" : "Copy Full Note"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") window.print();
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
