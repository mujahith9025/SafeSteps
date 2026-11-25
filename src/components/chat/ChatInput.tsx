"use client";

import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Lock, Mic, AlertCircle, AlertTriangle } from "lucide-react";

export interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isOffline?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  isOffline = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [emptyAttempted, setEmptyAttempted] = useState<boolean>(false);

  // Auto-grow textarea up to max 140px (~5 lines)
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    }
  }, [value]);

  const charCount = value.length;
  const isTooLong = charCount > 1000;
  const isInputEmpty = value.trim().length === 0;

  // Clear empty attempt flag when user types
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (emptyAttempted && e.target.value.trim().length > 0) {
      setEmptyAttempted(false);
    }
    onChange(e.target.value);
  };

  const attemptSend = () => {
    if (disabled || isOffline) return;

    if (isInputEmpty) {
      setEmptyAttempted(true);
      return;
    }

    if (isTooLong) {
      return;
    }

    setEmptyAttempted(false);
    onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      attemptSend();
    }
  };

  // Determine active validation error message matching Stitch State 05
  let validationMessage: string | null = null;
  if (emptyAttempted && isInputEmpty) {
    validationMessage = "Please type something before sending.";
  } else if (isTooLong) {
    validationMessage = "Your message is too long. Please keep it under 1000 characters.";
  }

  const hasError = Boolean(validationMessage);
  const canSend = !isInputEmpty && !isTooLong && !disabled && !isOffline;

  // Placeholder based on system state
  let placeholder = "Describe your symptoms in your own words...";
  if (isOffline) {
    placeholder = "You are currently offline. Check your connection...";
  } else if (disabled) {
    placeholder = "Waiting for SafeSteps response...";
  }

  return (
    <div className="w-full flex flex-col gap-1.5">
      {/* Input Shell with validation error border / ring when violated */}
      <div
        className={`rounded-2xl transition-all p-3 sm:p-4 shadow-xs ${
          hasError
            ? "bg-[#FEF2F2] border-2 border-red-500 shadow-[0_0_0_1px_#EF4444]"
            : disabled || isOffline
            ? "bg-slate-50 border border-border opacity-85"
            : "bg-surface border border-border focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
        }`}
      >
        <label htmlFor="symptom-input" className="sr-only">
          Describe your symptoms in your own words
        </label>
        <textarea
          id="symptom-input"
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isOffline}
          rows={2}
          placeholder={placeholder}
          className={`font-body text-body w-full resize-none min-h-[52px] bg-transparent leading-relaxed outline-none ${
            disabled || isOffline
              ? "cursor-not-allowed text-slate-500 placeholder:text-slate-400"
              : "text-text-main placeholder:text-text-muted"
          }`}
          aria-describedby="char-count privacy-notice input-validation-msg"
          aria-invalid={hasError}
        />

        {/* Action Controls & Live Character Counter */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Voice input dictation"
              title="Voice dictation"
              disabled={disabled || isOffline}
            >
              <Mic className="h-5 w-5" aria-hidden="true" />
            </button>
            <span
              id="char-count"
              className={`text-caption font-medium ${
                isTooLong
                  ? "text-urgency-red font-semibold"
                  : charCount > 900
                  ? "text-amber-600 font-medium"
                  : "text-text-muted"
              }`}
            >
              {charCount.toLocaleString()} / 1,000
            </span>
          </div>

          <button
            type="button"
            onClick={attemptSend}
            disabled={!canSend}
            aria-label="Send message"
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-primary hover:bg-primary-hover active:bg-primary-active text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light cursor-pointer"
          >
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Validation Message Below Input (Stitch State 05: 14px red text with icon) */}
      {validationMessage && (
        <div
          id="input-validation-msg"
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1.5 text-urgency-red font-medium text-xs sm:text-sm px-1 pt-0.5 animate-fade-in"
        >
          {isTooLong ? (
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{validationMessage}</span>
        </div>
      )}

      {/* Privacy Notice Note Below Input */}
      <div
        id="privacy-notice"
        className="flex items-center justify-center gap-1.5 text-caption text-text-muted text-center px-2 py-0.5"
      >
        <Lock className="h-3 w-3 shrink-0 text-text-muted" aria-hidden="true" />
        <span>
          Private and anonymous. Never substitutes for professional medical diagnosis.
        </span>
      </div>
    </div>
  );
}
