"use client";

import React, { useSyncExternalStore } from "react";
import { WifiOff, PhoneCall } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerSnapshot(): boolean {
  return true;
}

/**
 * Custom hook to detect network connectivity status using browser online/offline events.
 * Uses useSyncExternalStore to eliminate cascading renders and support SSR.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export interface OfflineBannerProps {
  isOffline?: boolean;
}

/**
 * OfflineBanner component matching Stitch State 04 (Network Offline).
 * Floats or sticks cleanly, reassuring users their drafted context is retained
 * in local memory, while offering a direct emergency 112 bridge.
 */
export function OfflineBanner({ isOffline: propOffline }: OfflineBannerProps) {
  const hookOnline = useOnlineStatus();
  const isOffline = propOffline !== undefined ? propOffline : !hookOnline;

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-[#F1F5F9] border-b border-[#CBD5E1] px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs transition-all animate-fade-in"
    >
      <div className="max-w-[760px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Wifi Off Icon & Calm Explanatory Message */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg bg-white text-[#475569] shadow-xs flex items-center justify-center shrink-0 border border-[#CBD5E1]/60"
            aria-hidden="true"
          >
            <WifiOff className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">
              You appear to be offline. Check your connection.
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              We&apos;ll reconnect automatically as soon as your signal returns.
            </p>
          </div>
        </div>

        {/* Right: Pulsing Reconnecting State & Emergency Bridge */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span
              className="inline-block w-2 h-2 rounded-full bg-slate-400 animate-ping motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span>Reconnecting...</span>
          </div>

          <a
            href="tel:112"
            className="inline-flex items-center gap-1 font-semibold text-urgency-red hover:underline ml-2"
          >
            <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Call 112</span>
          </a>
        </div>
      </div>
    </div>
  );
}
