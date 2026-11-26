"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { UrgencyCard } from "./UrgencyCard";
import { ErrorBanner } from "./ErrorBanner";
import { OfflineBanner, useOnlineStatus } from "./OfflineBanner";
import { RateLimitNotice } from "./RateLimitNotice";
import { EmptyChatState } from "./EmptyChatState";
import { Shield, ShieldCheck, AlertTriangle } from "lucide-react";

export function ChatWindow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();
  const initialSymptomHandled = useRef<boolean>(false);
  const {
    messages,
    isLoading,
    error,
    errorType,
    retryAfter,
    sendMessage,
    retry,
    resetChat,
    clearError,
  } = useChat({
    onEmergency: (category) => {
      const query = category ? `?category=${encodeURIComponent(category)}` : "";
      router.push(`/emergency${query}`);
    },
  });

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-trigger symptom inquiry when routed from Landing Page with ?symptom=...
  useEffect(() => {
    if (initialSymptomHandled.current) return;
    const symptomParam = searchParams.get("symptom");
    if (symptomParam && symptomParam.trim().length > 0 && messages.length <= 1) {
      initialSymptomHandled.current = true;
      sendMessage(symptomParam.trim());
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/chat");
      }
    }
  }, [searchParams, messages.length, sendMessage]);

  // Dynamic 3-step triage progress:
  // Step 1: Symptoms (initial stage)
  // Step 2: Safety Check (user sent symptoms, questions active)
  // Step 3: Care Guidance (urgency result card displayed)
  const hasResult = messages.some((m) => m.type === "result" || m.result);
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  let currentStep: 1 | 2 | 3 = 1;
  if (hasResult) {
    currentStep = 3;
  } else if (userMessageCount >= 1 || isLoading) {
    currentStep = 2;
  } else {
    currentStep = 1;
  }

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, error, errorType]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading || !isOnline) return;
    sendMessage(text);
    setInputValue("");
  };

  // Immediate send when suggestion chip is clicked
  const handleChipSelect = (chipText: string) => {
    if (isLoading || !isOnline) return;
    sendMessage(chipText);
  };

  const isInitialState = messages.length <= 1;

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100dvh-120px)] sm:h-[calc(100dvh-136px)] bg-background relative">
      {/* Pinned Offline Sticky Top Banner (Stitch State 04) */}
      <OfflineBanner isOffline={!isOnline || errorType === "offline"} />

      {/* Pinned Chat Header with 3-Step Triage Progress Tracker */}
      <ChatHeader onNewChat={resetChat} currentStep={currentStep} />

      {/* Main Centered Chat Container (Max 760px from Stitch) */}
      <div className="flex-1 flex flex-col w-full max-w-[760px] mx-auto min-h-0 relative">
        {/* Accessible Primary Page Heading (Screen Readers) */}
        <h1 className="sr-only">SafeSteps Clinical Symptom Consultation</h1>

        {/* Scrollable Message List */}
        <div
          role="log"
          aria-live="polite"
          aria-label="Health consultation messages"
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
        >
          {/* Security & Privacy Timestamp Pill */}
          <div className="flex justify-center select-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-text-muted text-caption border border-border/60">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Today, SafeSteps Triage Session &bull; Private In-Memory</span>
            </span>
          </div>

          {/* Empty Welcoming Chat State (Stitch State 02) */}
          {isInitialState && !isLoading && (
            <EmptyChatState onSelectChip={handleChipSelect} />
          )}

          {/* Messages */}
          {messages.map((msg, index) => {
            // Skip rendering the raw initial welcome message if we're rendering EmptyChatState
            if (index === 0 && isInitialState && !isLoading) {
              return null;
            }

            // Render structured urgency result card for result responses
            if (msg.role === "assistant" && (msg.type === "result" || msg.result)) {
              return (
                <UrgencyCard
                  key={msg.id}
                  result={msg.result!}
                  onNewChat={resetChat}
                />
              );
            }

            // Normal user or assistant question bubble
            return (
              <MessageBubble
                key={msg.id}
                id={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                quickReplies={msg.quick_replies}
                onSelectChip={handleChipSelect}
                isLatest={index === messages.length - 1}
                disabled={isLoading || !isOnline}
              />
            );
          })}

          {/* Typing Indicator matching Stitch State 01: Three animated teal dots + SafeSteps is reviewing your symptoms... */}
          {isLoading && (
            <div
              className="flex items-start gap-3 w-full max-w-[92%] sm:max-w-[660px] animate-fade-in"
              role="status"
              aria-label="SafeSteps is reviewing your symptoms"
            >
              <div
                className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5"
                aria-hidden="true"
              >
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="bg-surface border border-border text-text-main rounded-2xl rounded-tl-xs p-4 px-5 shadow-xs flex items-center gap-3">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce motion-reduce:animate-none [animation-delay:-0.3s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce motion-reduce:animate-none [animation-delay:-0.15s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce motion-reduce:animate-none" />
                </div>
                <span className="text-caption sm:text-body text-text-muted font-medium">
                  SafeSteps is reviewing your symptoms...
                </span>
              </div>
            </div>
          )}

          {/* Rate Limit Notice (Stitch State 06) */}
          {errorType === "rate_limit" && (
            <RateLimitNotice
              retryAfterSeconds={retryAfter || 10}
              message={error || undefined}
              onCooldownComplete={clearError}
            />
          )}

          {/* Standard Error Banner (Stitch State 03) */}
          {error && errorType !== "rate_limit" && errorType !== "offline" && (
            <ErrorBanner
              message={error}
              onRetry={retry}
              onNewChat={resetChat}
            />
          )}

          {/* Anchor for auto-scroll */}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Pinned Bottom Input Area */}
        <div className="w-full px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent sticky bottom-0 z-10 space-y-2">
          {/* Always Visible Emergency Help Link Just Above Input */}
          <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-emergency-bg/70 border border-urgency-red/20 text-caption text-urgency-red">
            <div className="flex items-center gap-1.5 truncate">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-urgency-red" aria-hidden="true" />
              <span className="font-medium text-text-main text-xs sm:text-caption truncate">
                Chest pain, severe bleeding, or difficulty breathing?
              </span>
            </div>
            <Link
              href="/emergency"
              className="font-bold underline text-urgency-red hover:text-red-800 shrink-0 text-xs sm:text-caption ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-urgency-red rounded px-1"
            >
              Emergency Help &rarr;
            </Link>
          </div>

          {/* Input Dock with Full Validation and State Awareness */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={isLoading}
            isOffline={!isOnline}
          />
        </div>
      </div>
    </div>
  );
}
