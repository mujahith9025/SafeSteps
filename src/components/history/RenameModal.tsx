"use client";

import React, { useState, useRef } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationSummary } from "@/lib/conversations";
import { useModalA11y } from "@/hooks/useModalA11y";

interface RenameModalProps {
  conversation: ConversationSummary | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void;
}

export function RenameModal({
  conversation,
  isOpen,
  isSaving,
  onClose,
  onSave,
}: RenameModalProps) {
  const [prevConversation, setPrevConversation] = useState(conversation);
  const [titleValue, setTitleValue] = useState(conversation?.title || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when conversation prop changes during render
  if (conversation !== prevConversation) {
    setPrevConversation(conversation);
    setTitleValue(conversation ? conversation.title : "");
  }

  const modalRef = useModalA11y<HTMLDivElement>({
    isOpen,
    onClose,
    initialFocusRef: inputRef,
    disabled: isSaving,
  });

  if (!isOpen || !conversation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = titleValue.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-border/70 flex flex-col gap-4 animate-scale-in"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Pencil className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="rename-dialog-title" className="text-lg font-bold text-text-main">
              Rename assessment
            </h2>
            <p className="text-xs text-text-muted">
              Choose a clear, descriptive title for this consultation.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="assessment-title" className="text-xs font-semibold text-text-main">
            Assessment title
          </label>
          <input
            id="assessment-title"
            ref={inputRef}
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            disabled={isSaving}
            maxLength={60}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-teal-600 focus:outline-none text-sm text-text-main"
            placeholder="e.g. Fever & Cough Assessment"
          />
          <div className="flex justify-end text-[11px] text-text-muted">
            <span>{titleValue.length}/60</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
            className="h-10 px-4 rounded-xl text-caption font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !titleValue.trim()}
            className="h-10 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-caption font-semibold flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save title</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
