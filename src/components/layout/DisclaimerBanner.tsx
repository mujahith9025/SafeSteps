import React from "react";
import { Info, PhoneCall } from "lucide-react";

interface DisclaimerBannerProps {
  className?: string;
  showEmergencyCall?: boolean;
}

export function DisclaimerBanner({
  className = "",
  showEmergencyCall = true,
}: DisclaimerBannerProps) {
  return (
    <aside
      role="note"
      aria-label="Medical emergency and regulatory disclaimer"
      className={`w-full bg-slate-100/90 border-b border-slate-200/80 text-slate-700 py-1.5 px-4 text-xs font-medium select-none z-40 flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2 truncate">
        <Info className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
        <span className="truncate">
          General information only. Not a diagnosis. In an emergency call 112.
        </span>
      </div>
      {showEmergencyCall && (
        <a
          href="tel:112"
          aria-label="Call emergency services 112 immediately"
          className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition-colors shrink-0"
        >
          <PhoneCall className="w-3 h-3" aria-hidden="true" />
          <span>Call 112</span>
        </a>
      )}
    </aside>
  );
}
