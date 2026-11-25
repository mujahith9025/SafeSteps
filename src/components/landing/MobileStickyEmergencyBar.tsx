import React from "react";
import { PhoneCall } from "lucide-react";

/**
 * MobileStickyEmergencyBar component matching Stitch Screen 8 (Mobile Landing Page).
 * Fixed at the bottom of the screen exclusively on mobile viewports (< 640px)
 * to provide an instant, single-tap bridge to Indian Emergency Services (112).
 */
export function MobileStickyEmergencyBar() {
  return (
    <aside
      aria-label="Emergency Assistance Quick Dial"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <a
        href="tel:112"
        className="w-full h-12 flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#b91c1c] active:bg-[#93000a] text-white rounded-xl font-semibold text-sm transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
        aria-label="Emergency Help: Call 112 immediately"
      >
        <PhoneCall className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Emergency Help (112)</span>
      </a>
    </aside>
  );
}
