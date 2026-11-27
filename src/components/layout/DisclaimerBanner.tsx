'use client'

import React from "react";
import { Info, PhoneCall } from "lucide-react";
import { useTranslations } from "next-intl";

interface DisclaimerBannerProps {
  className?: string;
  showEmergencyCall?: boolean;
}

export function DisclaimerBanner({
  className = "",
  showEmergencyCall = true,
}: DisclaimerBannerProps) {
  const t = useTranslations("disclaimer");

  return (
    <aside
      role="note"
      aria-label="Medical emergency and regulatory disclaimer"
      className={`w-full bg-slate-100/90 border-b border-slate-200/80 text-slate-700 py-1.5 px-4 text-xs font-medium select-none z-40 flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2 truncate">
        <Info className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
        <span className="truncate">
          {t("bannerText")}
        </span>
      </div>
      {showEmergencyCall && (
        <a
          href="tel:112"
          aria-label={`${t("callEmergency")}: Emergency Services 112`}
          className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0 min-h-[36px]"
        >
          <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t("callEmergency")}</span>
        </a>
      )}
    </aside>
  );
}
