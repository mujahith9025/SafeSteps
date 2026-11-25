import React from "react";
import { Plus } from "lucide-react";

export interface SuggestionChipsProps {
  onSelectChip: (text: string) => void;
  className?: string;
}

const DEFAULT_CHIPS = [
  "I have a headache",
  "I feel dizzy",
  "My child has a fever",
];

export function SuggestionChips({
  onSelectChip,
  className = "",
}: SuggestionChipsProps) {
  return (
    <div
      className={`w-full overflow-x-auto no-scrollbar py-2 px-1 flex items-center gap-2.5 sm:gap-3 ${className}`}
      role="region"
      aria-label="Common symptom suggestions"
    >
      {DEFAULT_CHIPS.map((chipText) => (
        <button
          key={chipText}
          type="button"
          onClick={() => onSelectChip(chipText)}
          className="whitespace-nowrap bg-surface border border-primary/25 text-primary hover:bg-primary-light/50 active:bg-primary-light px-4 py-2.5 rounded-full text-caption font-medium flex items-center gap-2 shadow-2xs transition-colors shrink-0 cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Plus className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{chipText}</span>
        </button>
      ))}
    </div>
  );
}
