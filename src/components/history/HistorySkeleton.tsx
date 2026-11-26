import React from "react";

export function HistorySkeleton() {
  return (
    <div
      className="flex flex-col gap-4 animate-fade-in"
      aria-label="Loading conversation history"
      role="status"
    >
      {[1, 2, 3].map((key) => (
        <div
          key={key}
          className="relative bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-border/70 flex flex-col gap-3 animate-pulse"
        >
          {/* Accent Rail Placeholder */}
          <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-slate-200 rounded-r-full" />

          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="w-44 sm:w-56 h-4 bg-slate-200 rounded" />
                <div className="w-28 h-3 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="w-28 sm:w-32 h-6 bg-slate-200 rounded-full shrink-0" />
          </div>

          <div className="w-full h-3 bg-slate-100 rounded mt-2 pl-2" />
          <div className="w-4/5 h-3 bg-slate-100 rounded pl-2" />

          <div className="flex gap-2 mt-1 pl-2">
            <div className="w-16 h-5 bg-slate-100 rounded-md" />
            <div className="w-20 h-5 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading conversation history...</span>
    </div>
  );
}
