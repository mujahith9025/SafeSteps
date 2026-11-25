"use client";

import { useState, useCallback, useRef } from "react";
import { Message, ApiChatMessage } from "@/types/chat";
import { sendMessageToApi, ChatApiError } from "@/lib/chatClient";

/**
 * PRIVACY ARCHITECTURE NOTE (Level 1 Deliberate Design):
 * Health inquiries and symptom descriptions are held exclusively in volatile React
 * state memory. Messages are NEVER saved to localStorage, sessionStorage, cookies,
 * or a client-side database. On page reload or tab closure, all chat history is
 * immediately wiped to ensure user health privacy and zero footprint.
 */

export const INITIAL_WELCOME_MESSAGE: Message = {
  id: "welcome-message",
  role: "assistant",
  content:
    "Hello, I'm SafeSteps. Tell me what you're feeling, and I'll help guide you on the safest next steps. How can I help today?",
  timestamp: "10:14 AM",
  quick_replies: [
    "I have a headache",
    "Stomach pain & nausea",
    "Fever & cold symptoms",
    "Feeling dizzy or weak",
  ],
};

export type ChatErrorType = "error" | "rate_limit" | "offline" | null;

export interface UseChatOptions {
  onEmergency?: (category?: string) => void;
}

export function useChat(options?: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ChatErrorType>(null);
  const [retryAfter, setRetryAfter] = useState<number | undefined>(undefined);

  // Store last sent user message content for retry support
  const lastUserTextRef = useRef<string | null>(null);

  /**
   * Helper to format time for messages
   */
  const formatTime = (): string => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Maps caught errors to friendly error types and user-facing messages
   */
  const handleCatchError = (err: unknown) => {
    if (err instanceof ChatApiError) {
      if (err.isRateLimit) {
        setErrorType("rate_limit");
        setRetryAfter(err.retryAfter || 10);
        setError(err.message || "You're sending messages very quickly. Please wait a moment.");
        return;
      }
      if (err.isNetworkError) {
        setErrorType("offline");
        setError("You appear to be offline. Check your connection.");
        return;
      }
      setErrorType("error");
      setError(err.message || "Sorry, something went wrong. Please try again.");
      return;
    }

    setErrorType("error");
    setError("Sorry, something went wrong. Please try again.");
  };

  /**
   * Send a message to the assistant
   */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      // Block empty, oversized messages, or duplicate sends while loading
      if (!trimmed || trimmed.length > 1000 || isLoading) {
        return;
      }

      // Record last user message for retry capability
      lastUserTextRef.current = trimmed;
      setError(null);
      setErrorType(null);
      setRetryAfter(undefined);

      const userMessage: Message = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: "user",
        content: trimmed,
        timestamp: formatTime(),
      };

      // Immediately append user message to local state
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      // Extract only role and content, capped at last 20 messages maximum
      const conversationPayload: ApiChatMessage[] = updatedMessages
        .slice(-20)
        .map(({ role, content }) => ({
          role: role === "user" ? "user" : "assistant",
          content,
        }));

      try {
        const response = await sendMessageToApi(conversationPayload);

        const assistantMessage: Message = {
          id: `asst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          role: "assistant",
          content: response.content,
          timestamp: formatTime(),
          type: response.type,
          result: response.result,
          quick_replies: response.quick_replies,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // If emergency type received, trigger emergency navigation callback with category
        if (response.type === "emergency" && options?.onEmergency) {
          options.onEmergency(response.category);
        }
      } catch (err) {
        handleCatchError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, options]
  );

  /**
   * Retry the last attempted user query
   */
  const retry = useCallback(async () => {
    if (!lastUserTextRef.current || isLoading) {
      return;
    }
    setError(null);
    setErrorType(null);
    setRetryAfter(undefined);
    setIsLoading(true);

    // Extract current conversation payload
    const conversationPayload: ApiChatMessage[] = messages
      .slice(-20)
      .map(({ role, content }) => ({
        role: role === "user" ? "user" : "assistant",
        content,
      }));

    try {
      const response = await sendMessageToApi(conversationPayload);

      const assistantMessage: Message = {
        id: `asst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: "assistant",
        content: response.content,
        timestamp: formatTime(),
        type: response.type,
        result: response.result,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.type === "emergency" && options?.onEmergency) {
        options.onEmergency(response.category);
      }
    } catch (err) {
      handleCatchError(err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, options]);

  /**
   * Reset conversation back to the initial welcome message
   */
  const resetChat = useCallback(() => {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        timestamp: formatTime(),
      },
    ]);
    setIsLoading(false);
    setError(null);
    setErrorType(null);
    setRetryAfter(undefined);
    lastUserTextRef.current = null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
    setRetryAfter(undefined);
  }, []);

  return {
    messages,
    isLoading,
    error,
    errorType,
    retryAfter,
    sendMessage,
    retry,
    resetChat,
    clearError,
  };
}
