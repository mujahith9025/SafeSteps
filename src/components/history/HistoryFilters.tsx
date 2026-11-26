"use client";

import React from "react";
import { Search, X, ArrowUpDown, Shield } from "lucide-react";
import { UrgencyTier } from "@/lib/conversations";

export type UrgencyFilterType = "all" | UrgencyTier;
export type SortOptionType = "recent" | "oldest" | "urgency" | "alpha";

interface HistoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedUrgency: UrgencyFilterType;
  onSelectUrgency: (urgency: UrgencyFilterType) => void;
  sortBy: SortOptionType;
  onSortChange: (sort: SortOptionType) => void;
  counts: {
    all: number;
    self_care: number;
    see_doctor_soon: number;
    emergency: number;
  };
}

export function HistoryFilters({
  searchQuery,
  onSearchChange,
  selectedUrgency,
  onSelectUrgency,
  sortBy,
  onSortChange,
  counts,
}: HistoryFiltersProps) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-xs border border-border/70 p-4 sm:p-5 flex flex-col gap-4 mb-6">
      {/* Search Input & Sort Action Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 flex items-center bg-slate-50 border border-border/60 rounded-xl px-3.5 h-11 focus-within:ring-2 focus-within:ring-teal-600 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" aria-hidden="true" />
          <input
            id="chat-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your chats by symptom, medication, or advice..."
            className="bg-transparent w-full text-text-main placeholder:text-slate-400 text-sm outline-none"
            aria-label="Search conversation history"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="p-1 rounded-md text-slate-400 hover:text-text-main hover:bg-slate-200 transition-colors ml-1"
              title="Clear search"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center bg-slate-50 border border-border/60 rounded-xl px-3 h-11 text-text-main text-xs sm:text-sm font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" aria-hidden="true" />
            <span className="text-text-muted mr-1.5 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOptionType)}
              className="bg-transparent text-text-main font-semibold text-xs sm:text-sm outline-none cursor-pointer pr-1"
              aria-label="Sort conversations"
            >
              <option value="recent">Most recent ↓</option>
              <option value="oldest">Oldest first ↑</option>
              <option value="urgency">Urgency tier (High to Low)</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Urgency Filter Chips with Live Counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm no-scrollbar">
        {/* All Chip */}
        <button
          type="button"
          onClick={() => onSelectUrgency("all")}
          className={`h-9 px-3.5 rounded-full font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
            selectedUrgency === "all"
              ? "bg-teal-700 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          aria-pressed={selectedUrgency === "all"}
        >
          <span>All</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
              selectedUrgency === "all"
                ? "bg-white/25 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {counts.all}
          </span>
        </button>

        {/* Self Care Filter */}
        <button
          type="button"
          onClick={() => onSelectUrgency("self_care")}
          className={`h-9 px-3.5 rounded-full font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
            selectedUrgency === "self_care"
              ? "bg-teal-800 text-white shadow-xs"
              : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-100"
          }`}
          aria-pressed={selectedUrgency === "self_care"}
        >
          <span>Self-care</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
              selectedUrgency === "self_care"
                ? "bg-white/25 text-white"
                : "bg-white text-teal-800 border border-teal-200"
            }`}
          >
            {counts.self_care}
          </span>
        </button>

        {/* See a doctor soon Filter */}
        <button
          type="button"
          onClick={() => onSelectUrgency("see_doctor_soon")}
          className={`h-9 px-3.5 rounded-full font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
            selectedUrgency === "see_doctor_soon"
              ? "bg-amber-700 text-white shadow-xs"
              : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
          }`}
          aria-pressed={selectedUrgency === "see_doctor_soon"}
        >
          <span>See a doctor soon</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
              selectedUrgency === "see_doctor_soon"
                ? "bg-white/25 text-white"
                : "bg-white text-amber-900 border border-amber-200"
            }`}
          >
            {counts.see_doctor_soon}
          </span>
        </button>

        {/* Emergency Filter */}
        <button
          type="button"
          onClick={() => onSelectUrgency("emergency")}
          className={`h-9 px-3.5 rounded-full font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
            selectedUrgency === "emergency"
              ? "bg-red-700 text-white shadow-xs"
              : "bg-red-50 text-red-800 hover:bg-red-100 border border-red-200"
          }`}
          aria-pressed={selectedUrgency === "emergency"}
        >
          <span>Emergency</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
              selectedUrgency === "emergency"
                ? "bg-white/25 text-white"
                : "bg-white text-red-800 border border-red-200"
            }`}
          >
            {counts.emergency}
          </span>
        </button>

        {/* End-to-end Encrypted Assurance (Desktop) */}
        <span className="ml-auto text-xs text-text-muted hidden md:inline-flex items-center gap-1.5 shrink-0">
          <Shield className="w-3.5 h-3.5 text-teal-700" />
          <span>Encrypted end-to-end</span>
        </span>
      </div>
    </div>
  );
}
