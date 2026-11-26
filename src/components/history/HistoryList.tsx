"use client";

import React, { useState, useMemo } from "react";
import { ConversationSummary } from "@/lib/conversations";
import { HistoryHeader } from "./HistoryHeader";
import { HistoryFilters, UrgencyFilterType, SortOptionType } from "./HistoryFilters";
import { ConversationCard } from "./ConversationCard";
import { HistoryEmptyState } from "./HistoryEmptyState";
import { DeleteConversationModal } from "./DeleteConversationModal";
import { RenameModal } from "./RenameModal";
import { renameConversationAction, deleteConversationAction } from "@/app/(app)/history/actions";
import { ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryListProps {
  initialConversations: ConversationSummary[];
}

const ITEMS_PER_PAGE = 20;

export function HistoryList({ initialConversations }: HistoryListProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyFilterType>("all");
  const [sortBy, setSortBy] = useState<SortOptionType>("recent");
  const [page, setPage] = useState(1);

  // Rename modal state
  const [renamingConv, setRenamingConv] = useState<ConversationSummary | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete modal state
  const [deletingConv, setDeletingConv] = useState<ConversationSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Compute live counts across entire dataset
  const counts = useMemo(() => {
    let self_care = 0;
    let see_doctor_soon = 0;
    let emergency = 0;

    for (const c of conversations) {
      if (c.urgency === "self_care") self_care++;
      else if (c.urgency === "see_doctor_soon") see_doctor_soon++;
      else if (c.urgency === "emergency") emergency++;
    }

    return {
      all: conversations.length,
      self_care,
      see_doctor_soon,
      emergency,
    };
  }, [conversations]);

  // Filter conversations by search and urgency tier
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Urgency filter
      if (selectedUrgency !== "all" && c.urgency !== selectedUrgency) {
        return false;
      }

      // Search query (matches title or preview text)
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = c.title.toLowerCase().includes(query);
        const previewMatch = c.preview ? c.preview.toLowerCase().includes(query) : false;
        if (!titleMatch && !previewMatch) {
          return false;
        }
      }

      return true;
    });
  }, [conversations, selectedUrgency, searchQuery]);

  // Sort filtered conversations
  const sortedConversations = useMemo(() => {
    const list = [...filteredConversations];
    switch (sortBy) {
      case "recent":
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return list.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "urgency": {
        const priority: Record<string, number> = {
          emergency: 3,
          see_doctor_soon: 2,
          self_care: 1,
        };
        return list.sort((a, b) => {
          const pA = a.urgency ? priority[a.urgency] || 0 : 0;
          const pB = b.urgency ? priority[b.urgency] || 0 : 0;
          return pB - pA;
        });
      }
      case "alpha":
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  }, [filteredConversations, sortBy]);

  // Pagination: 20 per page
  const visibleCount = page * ITEMS_PER_PAGE;
  const paginatedConversations = useMemo(() => {
    return sortedConversations.slice(0, visibleCount);
  }, [sortedConversations, visibleCount]);

  const remainingCount = Math.max(0, sortedConversations.length - visibleCount);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // Rename action handler
  const handleConfirmRename = async (newTitle: string) => {
    if (!renamingConv) return;
    setIsRenaming(true);
    try {
      const res = await renameConversationAction(renamingConv.id, newTitle);
      if (res.success && res.title) {
        setConversations((prev) =>
          prev.map((c) => (c.id === renamingConv.id ? { ...c, title: res.title! } : c))
        );
      }
    } catch {
      // ignore
    } finally {
      setIsRenaming(false);
      setRenamingConv(null);
    }
  };

  // Delete action handler
  const handleConfirmDelete = async () => {
    if (!deletingConv) return;
    setIsDeleting(true);
    try {
      const res = await deleteConversationAction(deletingConv.id);
      if (res.success) {
        setConversations((prev) => prev.filter((c) => c.id !== deletingConv.id));
      }
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
      setDeletingConv(null);
    }
  };

  // Single conversation summary download
  const handleDownloadSummary = (conv: ConversationSummary) => {
    const consultationId = `#SF-${conv.id.replace(/-/g, "").substring(0, 5).toUpperCase()}`;
    const dateStr = new Date(conv.createdAt).toLocaleString();
    const content = [
      `SafeSteps Clinical Consultation Summary`,
      `=======================================`,
      `Consultation ID: ${consultationId}`,
      `Title: ${conv.title}`,
      `Date: ${dateStr}`,
      `Urgency Level: ${conv.urgency ? conv.urgency.replace(/_/g, " ").toUpperCase() : "NOT SPECIFIED"}`,
      ``,
      `Clinical Preview:`,
      conv.preview || "No messages recorded.",
      ``,
      `Clinical Protocol Notice:`,
      `Guidance is informational triage based on standardized NHS/WHO algorithms.`,
      `SafeSteps is not a replacement for in-person diagnosis. Call 112 in emergencies.`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `safesteps-summary-${conv.id.substring(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export all conversations
  const handleExportAll = () => {
    const data = conversations.map((c) => ({
      id: c.id,
      title: c.title,
      urgency: c.urgency,
      createdAt: c.createdAt,
      preview: c.preview,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `safesteps-archive-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <HistoryHeader totalCount={conversations.length} onExportAll={handleExportAll} />

      {/* Filter and Search Bar */}
      <HistoryFilters
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        selectedUrgency={selectedUrgency}
        onSelectUrgency={(u) => {
          setSelectedUrgency(u);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={counts}
      />

      {/* Empty States */}
      {conversations.length === 0 ? (
        <HistoryEmptyState />
      ) : sortedConversations.length === 0 ? (
        <HistoryEmptyState
          isFiltered={true}
          onClearFilters={() => {
            setSearchQuery("");
            setSelectedUrgency("all");
            setPage(1);
          }}
        />
      ) : (
        <>
          {/* Card List */}
          <div className="flex flex-col gap-3.5 mb-8">
            {paginatedConversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                conversation={conv}
                onRename={(c) => setRenamingConv(c)}
                onDelete={(c) => setDeletingConv(c)}
                onDownloadSummary={handleDownloadSummary}
              />
            ))}
          </div>

          {/* Pagination / Load More Section */}
          <div className="w-full flex flex-col items-center justify-center gap-3 mb-8">
            {remainingCount > 0 && (
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                className="h-12 px-8 rounded-xl font-semibold text-sm gap-2 bg-white hover:bg-slate-50 border border-border shadow-xs text-teal-800"
              >
                <ArrowDown className="w-4 h-4 text-teal-700" />
                <span>Load more conversations ({remainingCount} remaining)</span>
              </Button>
            )}

            <div className="text-xs text-text-muted">
              Showing {paginatedConversations.length} of {sortedConversations.length} conversations
            </div>
          </div>
        </>
      )}

      {/* Rename Modal */}
      <RenameModal
        isOpen={Boolean(renamingConv)}
        conversation={renamingConv}
        isSaving={isRenaming}
        onClose={() => setRenamingConv(null)}
        onSave={handleConfirmRename}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConversationModal
        isOpen={Boolean(deletingConv)}
        conversation={deletingConv}
        isDeleting={isDeleting}
        onClose={() => setDeletingConv(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
