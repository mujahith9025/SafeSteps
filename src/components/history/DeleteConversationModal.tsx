"use client";

import React, { useEffect, useRef } from "react";
import { Trash2, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationSummary } from "@/lib/conversations";

interface DeleteConversationModalProps {
  conversation: ConversationSummary | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConversationModal({
  conversation,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConversationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !conversation) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-border/70 flex flex-col gap-4 animate-scale-in"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <h2 id="delete-dialog-title" className="text-lg font-bold text-text-main">
              Delete this conversation?
            </h2>
            <p id="delete-dialog-description" className="text-sm text-text-muted leading-relaxed">
              This can&apos;t be undone. Your chat history, triage result, and generated clinical
              summary for <strong className="text-text-main font-semibold">&ldquo;{conversation.title}&rdquo;</strong> will
              be permanently removed.
            </p>
          </div>
        </div>

        {/* Clinical Safety Purge Badge */}
        <div className="p-3 bg-slate-50 border border-border/60 rounded-xl flex items-center gap-2 text-text-muted">
          <Lock className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
          <span className="text-xs font-medium text-slate-700">
            Encrypted data will be purged from local and cloud storage.
          </span>
        </div>

        {/* Button Row */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
            className="h-10 px-4 rounded-xl text-caption font-semibold"
          >
            Cancel
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-10 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-caption font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete conversation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
