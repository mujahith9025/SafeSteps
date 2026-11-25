/**
 * Groq AI Client for SafeSteps
 *
 * Provides ultra-fast (~300ms) clinical inference with native JSON enforcement.
 * Backed by OpenAI-compatible REST API.
 */

export function getGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY;
  if (!key || !key.trim()) return null;
  return key.trim();
}

export function getGroqModel(): string {
  return process.env.GROQ_MODEL || "openai/gpt-oss-120b";
}

export async function callGroq(
  messages: Array<{ role: string; content: string }>,
  systemInstruction: string
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable.");
  }

  const model = getGroqModel();

  // Format messages with system instruction at the beginning
  const formattedMessages = [
    { role: "system", content: systemInstruction },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Groq API returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Groq API returned an empty response.");
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}
