import { ApiChatMessage, ApiResponse } from "@/types/chat";

export class ChatApiError extends Error {
  status?: number;
  retryAfter?: number;
  isRateLimit?: boolean;
  isNetworkError?: boolean;

  constructor(
    message: string,
    options?: { status?: number; retryAfter?: number; isNetworkError?: boolean }
  ) {
    super(message);
    this.name = "ChatApiError";
    this.status = options?.status;
    this.retryAfter = options?.retryAfter;
    this.isRateLimit = options?.status === 429;
    this.isNetworkError = options?.isNetworkError;
  }
}

/**
 * Sends conversation history to the SafeSteps backend API (/api/chat).
 * Calls the real backend route and handles question, result, and emergency responses.
 */
export async function sendMessageToApi(
  messages: ApiChatMessage[]
): Promise<ApiResponse> {
  let response: Response;

  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });
  } catch {
    // Network offline, DNS failure, or aborted connection
    throw new ChatApiError(
      "You appear to be offline. Check your connection.",
      { isNetworkError: true }
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter =
        typeof data.retryAfter === "number" ? data.retryAfter : 10;
      throw new ChatApiError(
        data.error ||
          "You're sending messages very quickly. Please wait a moment.",
        { status: 429, retryAfter }
      );
    }

    if (response.status === 400) {
      throw new ChatApiError(
        data.error ||
          "Please verify your message and try again.",
        { status: 400 }
      );
    }

    const friendlyError =
      data.error ||
      (response.status === 504
        ? "The request took too long to complete. Please try again."
        : "Sorry, something went wrong. Please try again.");

    throw new ChatApiError(friendlyError, { status: response.status });
  }

  // Handle emergency response from checkEmergency bypass
  if (data.type === "emergency") {
    return {
      type: "emergency",
      content:
        data.reason ||
        "CRITICAL ALERT: Your symptoms may indicate an acute medical emergency. Please call emergency services (112) or go to the nearest emergency department immediately.",
      reason: data.reason,
      category: data.category,
      result: {
        urgency: "emergency",
        headline: "Please seek urgent medical care now",
        suggests:
          data.reason ||
          "The combination of symptoms described poses acute clinical risk that requires immediate emergency evaluation.",
        actions: [
          "Call Emergency Help (112) or Ambulance (108) immediately.",
          "Do not wait to see if symptoms improve on their own.",
          "Do not drive yourself to the hospital.",
          "Stay with someone while awaiting emergency assistance.",
        ],
        warning_signs: [
          "Sudden shortness of breath, bluish tint to lips, or chest pressure.",
          "Loss of consciousness, confusion, or sudden facial droop.",
        ],
      },
    };
  }

  // Handle structured result response
  if (data.type === "result") {
    return {
      type: "result",
      content: data.content || `${data.headline}\n\n${data.suggests}`,
      result: data.result || {
        urgency: data.urgency,
        headline: data.headline,
        suggests: data.suggests,
        actions: data.actions || [],
        warning_signs: data.warning_signs || [],
      },
    };
  }

  // Normal question response
  return {
    type: "question",
    content:
      data.message ||
      data.content ||
      "Could you tell me a bit more about what symptoms you are experiencing?",
  };
}
