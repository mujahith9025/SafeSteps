/**
 * Shared TypeScript types for SafeSteps
 */

export type TriageLevel =
  | "emergency"
  | "urgent_care"
  | "primary_care"
  | "self_care";

export interface SafetyCheckResult {
  isEmergency: boolean;
  reason?: string;
  recommendedAction?: string;
  matchedKeywords?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  safetyFlag?: boolean;
}

export interface HealthGuidanceRequest {
  message: string;
  history?: ChatMessage[];
}

export interface HealthGuidanceResponse {
  content: string;
  triageLevel: TriageLevel;
  safetyCheck: SafetyCheckResult;
  disclaimer: string;
}

export * from "./chat";
export * from "./response";

