import "server-only";
import { GoogleGenAI } from "@google/genai";

/**
 * Validates and retrieves required Gemini environment configuration.
 * Throws a clear error if either variable is missing, without ever revealing sensitive key contents.
 */
function validateGeminiEnv(): { apiKey: string; model: string } {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable. Please configure GEMINI_API_KEY in .env.local."
    );
  }

  if (!model || model.trim() === "") {
    throw new Error(
      "Missing GEMINI_MODEL environment variable. Please configure GEMINI_MODEL in .env.local."
    );
  }

  return { apiKey, model };
}

let cachedClient: GoogleGenAI | null = null;

/**
 * Retrieves the singleton GoogleGenAI client.
 * The API key is held exclusively on the server and never exposed to client bundles.
 */
export function getGeminiClient(): GoogleGenAI {
  const { apiKey } = validateGeminiEnv();
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

/**
 * Retrieves the configured Gemini model name from environment variables.
 */
export function getGeminiModel(): string {
  const { model } = validateGeminiEnv();
  return model;
}

/**
 * Retrieves the configured Gemini embedding model name (defaults to 'text-embedding-004').
 */
export function getGeminiEmbeddingModel(): string {
  return process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
}
