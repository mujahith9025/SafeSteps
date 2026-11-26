/**
 * SafeSteps RAG Clinical Knowledge Base Retrieval Service
 *
 * Implements semantic retrieval using vector similarity over trusted public health
 * guidance in Supabase (kb_chunks & kb_documents).
 *
 * Safety Inviolability:
 * - Retrieval is advisory only and NEVER relaxes Level 1 safety rules (no diagnoses, no doses, no prescriptions).
 * - Safety checks (emergency check, guardrail) NEVER depend on retrieval.
 * - If retrieval encounters any network, embedding, or database error, SafeSteps continues smoothly without retrieval.
 */

import { getGeminiClient, getGeminiEmbeddingModel } from "./gemini";
import { createClient } from "./supabase/server";
import { SourceCitation } from "@/types/response";

/**
 * Tunable similarity threshold. Only chunks matching at or above this threshold
 * are considered clinically relevant to the user query.
 */
export const MIN_SIMILARITY_THRESHOLD = 0.5;
export const DEFAULT_MATCH_COUNT = 5;
export const EXPECTED_EMBEDDING_DIM = 768;

export interface RetrievedChunk {
  id: string;
  document_id: string;
  document_title: string;
  source_name: string;
  source_url: string;
  language: string;
  content: string;
  chunk_index: number;
  metadata: {
    heading?: string;
    char_count?: number;
    [key: string]: unknown;
  };
  similarity: number;
  excerpt: string;
}

/**
 * Builds a search query from the latest user message plus a short summary of earlier user messages.
 * This provides conversational context to semantic search without bloating the embedding payload.
 */
export function buildRetrievalQuery(
  latestMessage: string,
  earlierMessages?: Array<{ role: string; content: string }>
): string {
  const cleanLatest = (latestMessage || "").trim();
  if (!earlierMessages || earlierMessages.length === 0) {
    return cleanLatest;
  }

  // Filter for prior user messages only, excluding the current latest message
  const priorUserTexts = earlierMessages
    .filter((m) => m.role === "user" && m.content.trim() !== cleanLatest)
    .slice(-2) // Take up to 2 most recent prior user turns
    .map((m) => m.content.trim().replace(/\s+/g, " "))
    .filter((t) => t.length > 0);

  if (priorUserTexts.length === 0) {
    return cleanLatest;
  }

  // Concise contextual query
  const priorSummary = priorUserTexts.join("; ");
  const combined = `${cleanLatest} (Prior symptoms: ${priorSummary})`;

  // Cap at 500 characters to keep query embedding sharp and avoid dilution
  if (combined.length > 500) {
    return combined.substring(0, 497) + "...";
  }

  return combined;
}

/**
 * Generates vector embedding for the query using the configured Gemini embedding model.
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const client = getGeminiClient();
  const model = getGeminiEmbeddingModel();

  const response = await client.models.embedContent({
    model,
    contents: query,
  });

  const values =
    (response as any).embedding?.values ||
    (response as any).embeddings?.[0]?.values;

  if (!values || !Array.isArray(values)) {
    throw new Error("Gemini returned an empty query embedding.");
  }

  if (values.length !== EXPECTED_EMBEDDING_DIM) {
    throw new Error(
      `Embedding dimension mismatch: got ${values.length}, expected ${EXPECTED_EMBEDDING_DIM}.`
    );
  }

  return values;
}

/**
 * Retrieves top matching clinical knowledge chunks from Supabase using cosine similarity.
 *
 * @param query Latest user query (or contextual query built with buildRetrievalQuery)
 * @param language Optional language filter (e.g. 'en', 'ta', 'hi')
 * @param options Optional overrides for similarity threshold, match count, or custom Supabase client
 * @returns Array of retrieved chunks above the minimum similarity threshold
 */
export async function retrieveContext(
  query: string,
  language?: string,
  options?: {
    minSimilarity?: number;
    matchCount?: number;
    supabaseClient?: any;
  }
): Promise<RetrievedChunk[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const minSimilarity = options?.minSimilarity ?? MIN_SIMILARITY_THRESHOLD;
  const matchCount = options?.matchCount ?? DEFAULT_MATCH_COUNT;

  // 1. Generate query embedding
  const queryEmbedding = await generateQueryEmbedding(query);

  // 2. Obtain Supabase client (passed in or server client)
  const supabase = options?.supabaseClient || (await createClient());

  // 3. Call match_kb_chunks SQL function via RPC
  const { data, error } = await supabase.rpc("match_kb_chunks", {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    language_filter: language && language !== "all" ? language : null,
  });

  if (error) {
    throw new Error(`match_kb_chunks RPC failed: ${error.message}`);
  }

  if (!data || !Array.isArray(data)) {
    return [];
  }

  // 4. Filter by minimum similarity threshold & format excerpts
  const matchingChunks: RetrievedChunk[] = data
    .filter((row: any) => typeof row.similarity === "number" && row.similarity >= minSimilarity)
    .map((row: any) => {
      const fullText = (row.content || "").trim();
      // Generate two-line excerpt (~160 chars) cleanly
      const excerpt =
        fullText.length > 180 ? fullText.substring(0, 177).trim() + "..." : fullText;

      return {
        id: String(row.id),
        document_id: String(row.document_id),
        document_title: String(row.document_title || "Clinical Reference Document"),
        source_name: String(row.source_name || "SafeSteps Public Health Knowledge"),
        source_url: String(row.source_url || "#"),
        language: String(row.language || "en"),
        content: fullText,
        chunk_index: Number(row.chunk_index || 0),
        metadata: (row.metadata || {}) as Record<string, unknown>,
        similarity: Number(row.similarity),
        excerpt,
      };
    });

  return matchingChunks;
}

/**
 * Formats retrieved chunks into the prompt section:
 * "REFERENCE MATERIAL (use as the basis for general information; cite by number)"
 */
export function formatReferenceMaterial(chunks: RetrievedChunk[]): string {
  if (!chunks || chunks.length === 0) {
    return "";
  }

  const sections = chunks.map((chunk, index) => {
    const heading = chunk.metadata?.heading ? ` > ${chunk.metadata.heading}` : "";
    return `[${index + 1}] Title: ${chunk.document_title}${heading}
Source: ${chunk.source_name} (${chunk.source_url})
Similarity: ${(chunk.similarity * 100).toFixed(0)}%
Excerpt:
${chunk.content}`;
  });

  return (
    `\n\n--- REFERENCE MATERIAL (use as the basis for general information; cite by number) ---\n` +
    `The following excerpts are trusted public health guidance retrieved for this query. ` +
    `Base general information on this material when relevant, and cite by number (e.g. [1] or [Ref 1]). ` +
    `NEVER invent or hallucinate sources.\n\n` +
    sections.join("\n\n") +
    `\n----------------------------------------------------------------------------------------`
  );
}

/**
 * Builds verified source citations strictly from the retrieved chunks.
 * Ensures the model can NEVER invent an unauthorized citation or source URL.
 * If the model references a source number that was not retrieved, it is dropped.
 *
 * @param retrievedChunks Chunks actually retrieved from database
 * @param modelText Optional raw model output or message to match cited [1], [Ref 1]
 */
export function buildVerifiedSources(
  retrievedChunks: RetrievedChunk[],
  modelText?: string
): SourceCitation[] {
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return [];
  }

  // Scan model text for citations (e.g. [1], [Ref 2], Ref 1, [Source 1])
  const citedIndices = new Set<number>();
  if (modelText) {
    const matches = modelText.matchAll(
      /\[(?:Ref|Source|ref\.?)?\s*(\d+)\]|(?:Ref|Reference)\s+(\d+)/gi
    );
    for (const match of matches) {
      const num = parseInt(match[1] || match[2], 10);
      // Only keep if number corresponds to an actually retrieved chunk
      if (!isNaN(num) && num >= 1 && num <= retrievedChunks.length) {
        citedIndices.add(num - 1);
      }
    }
  }

  // If the model explicitly cited valid numbers, prioritize those chunks.
  // Otherwise, if chunks were retrieved above threshold for the query, use the top chunks (up to 3).
  const candidateChunks =
    citedIndices.size > 0
      ? Array.from(citedIndices)
          .sort((a, b) => a - b)
          .map((idx) => retrievedChunks[idx])
          .filter(Boolean)
      : retrievedChunks.slice(0, 3);

  // Deduplicate by source_url so multiple chunks from same source form one citation
  const seenUrls = new Set<string>();
  const citations: SourceCitation[] = [];

  candidateChunks.forEach((chunk, idx) => {
    if (chunk && !seenUrls.has(chunk.source_url)) {
      seenUrls.add(chunk.source_url);
      citations.push({
        id: String(idx + 1),
        title: chunk.document_title,
        source_name: chunk.source_name,
        source_url: chunk.source_url,
        excerpt: chunk.excerpt,
        similarity: chunk.similarity,
      });
    }
  });

  return citations;
}
