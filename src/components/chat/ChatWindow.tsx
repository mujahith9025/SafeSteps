"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { Message } from "@/types/chat";
import { renameConversationAction } from "@/app/(app)/history/actions";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { UrgencyCard } from "./UrgencyCard";
import { ErrorBanner } from "./ErrorBanner";
import { OfflineBanner, useOnlineStatus } from "./OfflineBanner";
import { RateLimitNotice } from "./RateLimitNotice";
import { EmptyChatState } from "./EmptyChatState";
import { PersonalisationPill } from "./PersonalisationPill";
import { Shield, ShieldCheck, AlertTriangle, Pencil, CheckCircle2 } from "lucide-react";

export interface ChatWindowProps {
  initialMessages?: Message[];
  initialConversationId?: string | null;
  initialTitle?: string;
  isGuest?: boolean;
  initialPersonalise?: boolean;
  profileSummary?: string;
}

export function ChatWindow({
  initialMessages,
  initialConversationId,
  initialTitle,
  isGuest = false,
  initialPersonalise = false,
  profileSummary,
}: ChatWindowProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();
  const initialSymptomHandled = useRef<boolean>(false);
  const {
    messages,
    conversationId,
    title,
    setTitle,
    isLoading,
    error,
    errorType,
    retryAfter,
    sendMessage,
    retry,
    resetChat,
    clearError,
  } = useChat({
    initialMessages,
    initialConversationId,
    initialTitle,
    onEmergency: (category) => {
      const query = category ? `?category=${encodeURIComponent(category)}` : "";
      router.push(`/emergency${query}`);
    },
    onConversationCreated: (newId) => {
      if (typeof window !== "undefined" && !isGuest && !window.location.pathname.startsWith("/chat-guest")) {
        window.history.replaceState({}, "", `/chat/${newId}`);
      }
    },
  });

  const [inputValue, setInputValue] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleStartRename = () => {
    setEditTitleValue(title);
    setIsEditingTitle(true);
  };

  const handleSaveRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editTitleValue.trim();
    if (!trimmed || trimmed === title || !conversationId) {
      setIsEditingTitle(false);
      return;
    }
    setIsSavingTitle(true);
    try {
      const res = await renameConversationAction(conversationId, trimmed);
      if (res.success && res.title) {
        setTitle(res.title);
      }
    } catch {
      // ignore
    } finally {
      setIsSavingTitle(false);
      setIsEditingTitle(false);
    }
  };

  const handleNewChat = () => {
    if (conversationId) {
      router.push("/chat");
    } else {
      resetChat();
    }
  };

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
      <ChatHeader onNewChat={handleNewChat} sessionTitle={title} currentStep={currentStep} />

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
          {/* Header Block: Assessment Title & Cloud Auto-Save Status (Stitch Chat Updates) */}
          {!isGuest && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/50">
              <div className="flex items-center gap-2 group min-w-0">
                {isEditingTitle ? (
                  <form onSubmit={handleSaveRename} className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={editTitleValue}
                      onChange={(e) => setEditTitleValue(e.target.value)}
                      disabled={isSavingTitle}
                      maxLength={60}
                      className="text-base sm:text-lg font-bold text-text-main border border-teal-500 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSavingTitle}
                      className="text-xs bg-teal-700 hover:bg-teal-800 text-white px-2.5 py-1.5 rounded-md font-semibold transition-colors"
                    >
                      {isSavingTitle ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(false)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h2 className="font-bold text-lg sm:text-xl text-text-main tracking-tight truncate" id="chat-title">
                      {title}
                    </h2>
                    {conversationId && (
                      <button
                        type="button"
                        onClick={handleStartRename}
                        className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition-colors shrink-0"
                        title="Rename assessment"
                        aria-label="Rename assessment"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
              {/* Auto-saved Indicator */}
              {conversationId ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold self-start sm:self-auto border border-teal-200 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" />
                  <span>Auto-saved to my reports</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Personalisation Info Pill (Stitch Chat Updates) */}
          {!isGuest && (
            <PersonalisationPill
              initialPersonalise={initialPersonalise}
              profileSummary={profileSummary}
            />
          )}

          {/* Security & Privacy Timestamp Pill */}
          <div className="flex justify-center select-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-text-muted text-caption border border-border/60">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>
                {isGuest
                  ? "Today, SafeSteps Triage Session • Private In-Memory"
                  : conversationId
                  ? "SafeSteps Clinical Consultation • Encrypted Session"
                  : "New Assessment • Encrypted Session"}
              </span>
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
                  sources={msg.sources || msg.result?.sources}
                  conversationId={conversationId}
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
                sources={msg.sources}
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
