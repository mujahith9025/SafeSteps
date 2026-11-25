import { describe, it, expect } from "vitest";
import { chatMessageSchema, chatRequestSchema } from "../src/app/api/chat/route";
import { checkRateLimit, getClientIp } from "../src/lib/rateLimit";

describe("SafeSteps Request Validation Schema", () => {
  it("rejects empty or whitespace-only messages", () => {
    const emptyResult = chatMessageSchema.safeParse({
      role: "user",
      content: "",
    });
    expect(emptyResult.success).toBe(false);
    if (!emptyResult.success) {
      expect(emptyResult.error.issues[0]?.message).toBe(
        "Message content cannot be empty."
      );
    }

    const whitespaceResult = chatMessageSchema.safeParse({
      role: "user",
      content: "      ",
    });
    expect(whitespaceResult.success).toBe(false);
    if (!whitespaceResult.success) {
      expect(whitespaceResult.error.issues[0]?.message).toBe(
        "Message content cannot be empty."
      );
    }
  });

  it("rejects messages exceeding 1000 characters", () => {
    const longText = "a".repeat(1001);
    const result = chatMessageSchema.safeParse({
      role: "user",
      content: longText,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Message content cannot exceed 1000 characters."
      );
    }
  });

  it("accepts valid messages between 1 and 1000 characters", () => {
    const validResult = chatMessageSchema.safeParse({
      role: "user",
      content: "I have had a mild headache for 2 hours.",
    });
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.data.content).toBe(
        "I have had a mild headache for 2 hours."
      );
    }
  });

  it("rejects invalid roles (e.g. 'system', 'admin', 'bot')", () => {
    const systemResult = chatMessageSchema.safeParse({
      role: "system",
      content: "You are an assistant.",
    });
    expect(systemResult.success).toBe(false);

    const adminResult = chatMessageSchema.safeParse({
      role: "admin",
      content: "Delete database",
    });
    expect(adminResult.success).toBe(false);
  });

  it("rejects empty conversation history (0 messages)", () => {
    const result = chatRequestSchema.safeParse({
      messages: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Please provide at least one message."
      );
    }
  });

  it("rejects conversation history exceeding 20 messages", () => {
    const messages = Array.from({ length: 21 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `Message turn ${i + 1}`,
    }));

    const result = chatRequestSchema.safeParse({ messages });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Conversation history cannot exceed 20 messages."
      );
    }
  });

  it("accepts valid conversation history up to 20 messages", () => {
    const messages = Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `Message turn ${i + 1}`,
    }));

    const result = chatRequestSchema.safeParse({ messages });
    expect(result.success).toBe(true);
  });
});

describe("SafeSteps Server-Side Rate Limiter", () => {
  it("allows up to 15 requests per minute and blocks the 16th request", () => {
    const testIp = `test-ratelimit-ip-${Date.now()}`;

    // First 15 requests must all be allowed
    for (let i = 1; i <= 15; i++) {
      const result = checkRateLimit(testIp);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(15 - i);
    }

    // 16th request must be blocked
    const blockedResult = checkRateLimit(testIp);
    expect(blockedResult.allowed).toBe(false);
    expect(blockedResult.remaining).toBe(0);
    expect(blockedResult.resetTime).toBeGreaterThan(Date.now());
  });

  it("tracks rate limits independently for different IP addresses", () => {
    const ipA = `isolated-ip-a-${Date.now()}`;
    const ipB = `isolated-ip-b-${Date.now()}`;

    // Exhaust IP A
    for (let i = 1; i <= 15; i++) {
      checkRateLimit(ipA);
    }
    expect(checkRateLimit(ipA).allowed).toBe(false);

    // IP B must remain completely unaffected
    const resultB = checkRateLimit(ipB);
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(14);
  });

  it("correctly resolves client IP from x-forwarded-for header chain", () => {
    const headers = new Headers();
    headers.set(
      "x-forwarded-for",
      "203.0.113.195, 70.41.3.18, 150.172.238.178"
    );

    const clientIp = getClientIp(headers);
    expect(clientIp).toBe("203.0.113.195");
  });

  it("falls back to x-real-ip or default 127.0.0.1 gracefully", () => {
    const realIpHeaders = new Headers();
    realIpHeaders.set("x-real-ip", "198.51.100.42");
    expect(getClientIp(realIpHeaders)).toBe("198.51.100.42");

    const emptyHeaders = new Headers();
    expect(getClientIp(emptyHeaders)).toBe("127.0.0.1");
  });
});
