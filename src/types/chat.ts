/**
 * Client and API chat type definitions for SafeSteps
 */

export type UrgencyLevel = "self_care" | "see_doctor_soon" | "emergency";

/**
 * Structured urgency result displayed in UrgencyCard component
 */
export interface UrgencyResult {
  urgency: UrgencyLevel;
  headline: string;
  suggests: string;
  actions: string[];
  warning_signs: string[];
  // Compatibility aliases
  tier?: string;
  summary?: string;
  warningSigns?: string[];
}

/**
 * Chat message model supporting questions, structured results, and emergency alerts
 */
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  type?: "question" | "result" | "emergency";
  result?: UrgencyResult;
}

/**
 * Client-side conversation state
 */
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Minimal payload sent to the chat API
 */
export interface ApiChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Expected response structure from the chat API
 */
export interface ApiResponse {
  content: string;
  type: "question" | "result" | "emergency";
  result?: UrgencyResult;
  reason?: string;
  category?: string;
}
