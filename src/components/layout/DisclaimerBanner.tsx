import React from "react";
import { Info } from "lucide-react";

interface DisclaimerBannerProps {
  className?: string;
}

export function DisclaimerBanner({ className = "" }: DisclaimerBannerProps) {
  return (
    <aside
      role="note"
      aria-label="Medical emergency and regulatory disclaimer"
      className={`w-full bg-info-bg border-b border-info-border text-info-text text-center py-2 px-4 text-caption font-medium select-none z-50 flex items-center justify-center gap-2 ${className}`}
    >
      <Info className="h-4 w-4 shrink-0 text-info-text" aria-hidden="true" />
      <span className="leading-tight text-center">
        General information only. Not a diagnosis. In an emergency call 112.
      </span>
    </aside>
  );
}
