import { describe, it, expect, vi } from "vitest";
import {
  buildRetrievalQuery,
  formatReferenceMaterial,
  buildVerifiedSources,
  retrieveContext,
  MIN_SIMILARITY_THRESHOLD,
  RetrievedChunk,
} from "../src/lib/retrieval";
import {
  questionResponseSchema,
  resultResponseSchema,
} from "../src/types/response";

const mockVector = new Array(768).fill(0.01);
vi.mock("../src/lib/gemini", () => ({
  getGeminiClient: () => ({
    models: {
      embedContent: vi.fn().mockResolvedValue({
        embedding: { values: mockVector },
      }),
    },
  }),
  getGeminiModel: () => "gemini-2.5-flash",
  getGeminiEmbeddingModel: () => "text-embedding-004",
}));

describe("SafeSteps RAG Retrieval Module (src/lib/retrieval.ts)", () => {
  const sampleChunks: RetrievedChunk[] = [
    {
      id: "chunk-1",
      document_id: "doc-1",
      document_title: "Adult Fever Triage and Care",
      source_name: "SafeSteps Clinical Reference Sample",
      source_url: "https://safesteps.local/knowledge/samples/adult-fever-triage",
      language: "en",
      content:
        "For mild to moderate fevers where red-flag symptoms are absent, supportive home care is the primary approach. Maintain high oral hydration with water and oral electrolyte solutions.",
      chunk_index: 0,
      metadata: { heading: "Home Supportive Care and Safe Management" },
      similarity: 0.88,
      excerpt:
        "For mild to moderate fevers where red-flag symptoms are absent, supportive home care is the primary approach...",
    },
    {
      id: "chunk-2",
      document_id: "doc-2",
      document_title: "Headache Evaluation and Red Flags",
      source_name: "SafeSteps Clinical Reference Sample",
      source_url: "https://safesteps.local/knowledge/samples/headache-evaluation",
      language: "en",
      content:
        "Tension-type headaches are the most frequent primary headache disorder. They typically present as a dull, steady ache on both sides of the head.",
      chunk_index: 0,
      metadata: { heading: "Supportive Self-Care for Tension Headaches" },
      similarity: 0.74,
      excerpt:
        "Tension-type headaches are the most frequent primary headache disorder...",
    },
  ];

  describe("buildRetrievalQuery", () => {
    it("returns the latest message when no prior messages exist", () => {
      const query = buildRetrievalQuery("I have a persistent headache and nausea");
      expect(query).toBe("I have a persistent headache and nausea");
    });

    it("appends prior user symptom context from conversation history", () => {
      const messages = [
        { role: "user", content: "I had a fever for 2 days" },
        { role: "assistant", content: "How high was the temperature?" },
        { role: "user", content: "Around 101F, and now I have a cough" },
      ];

      const query = buildRetrievalQuery(messages[2].content, messages);
      expect(query).toContain("Around 101F, and now I have a cough");
      expect(query).toContain("Prior symptoms: I had a fever for 2 days");
    });

    it("caps query length at 500 characters", () => {
      const longPrior = "A".repeat(400);
      const longLatest = "B".repeat(200);
      const query = buildRetrievalQuery(longLatest, [
        { role: "user", content: longPrior },
      ]);
      expect(query.length).toBeLessThanOrEqual(500);
      expect(query.endsWith("...")).toBe(true);
    });
  });

  describe("formatReferenceMaterial", () => {
    it("returns empty string when no chunks are retrieved", () => {
      expect(formatReferenceMaterial([])).toBe("");
    });

    it("formats retrieved chunks into the labelled prompt section", () => {
      const formatted = formatReferenceMaterial(sampleChunks);

      expect(formatted).toContain("--- REFERENCE MATERIAL (use as the basis for general information; cite by number) ---");
      expect(formatted).toContain("[1] Title: Adult Fever Triage and Care > Home Supportive Care and Safe Management");
      expect(formatted).toContain("Source: SafeSteps Clinical Reference Sample (https://safesteps.local/knowledge/samples/adult-fever-triage)");
      expect(formatted).toContain("Similarity: 88%");
      expect(formatted).toContain("[2] Title: Headache Evaluation and Red Flags");
    });
  });

  describe("buildVerifiedSources", () => {
    it("returns empty array if no chunks were retrieved", () => {
      expect(buildVerifiedSources([], "According to [1]")).toEqual([]);
    });

    it("extracts cited source indices from model output [1]", () => {
      const modelText = "Based on clinical guidance [1], hydration is important.";
      const sources = buildVerifiedSources(sampleChunks, modelText);

      expect(sources.length).toBe(1);
      expect(sources[0].title).toBe("Adult Fever Triage and Care");
      expect(sources[0].source_name).toBe("SafeSteps Clinical Reference Sample");
      expect(sources[0].source_url).toBe("https://safesteps.local/knowledge/samples/adult-fever-triage");
    });

    it("drops citations that reference non-existent or out-of-range numbers [9]", () => {
      // sampleChunks has only 2 chunks, so [9] is invalid and MUST be dropped
      const modelText = "According to [9], take aspirin.";
      const sources = buildVerifiedSources(sampleChunks, modelText);

      // Drops fake index 9; falls back to available top retrieved chunks
      expect(sources.every((s) => s.id !== "9")).toBe(true);
      expect(sources.length).toBeLessThanOrEqual(sampleChunks.length);
    });

    it("deduplicates sources with identical source_url", () => {
      const duplicateChunks: RetrievedChunk[] = [
        sampleChunks[0],
        { ...sampleChunks[0], id: "chunk-1-part-2", chunk_index: 1 },
      ];

      const sources = buildVerifiedSources(duplicateChunks);
      expect(sources.length).toBe(1);
    });
  });

  describe("retrieveContext", () => {
    it("returns empty array for empty query without making API calls", async () => {
      const result = await retrieveContext("   ");
      expect(result).toEqual([]);
    });

    it("filters out chunks below minimum similarity threshold (0.5)", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [
          {
            id: "uuid-1",
            document_id: "doc-1",
            document_title: "High Match",
            source_name: "Source A",
            source_url: "https://example.com/a",
            content: "Relevant clinical text",
            similarity: 0.82,
          },
          {
            id: "uuid-2",
            document_id: "doc-2",
            document_title: "Low Match",
            source_name: "Source B",
            source_url: "https://example.com/b",
            content: "Irrelevant text",
            similarity: 0.35, // Below 0.5 threshold
          },
        ],
        error: null,
      });

      const mockSupabase = { rpc: mockRpc };

      const chunks = await retrieveContext("headache", "en", {
        supabaseClient: mockSupabase,
        minSimilarity: MIN_SIMILARITY_THRESHOLD,
      });

      expect(chunks.length).toBe(1);
      expect(chunks[0].document_title).toBe("High Match");
      expect(chunks[0].similarity).toBe(0.82);
    });
  });

  describe("Response Schema Extensions", () => {
    it("allows sources in questionResponseSchema", () => {
      const question = {
        type: "question",
        message: "How long has the fever lasted?",
        quick_replies: ["1 day", "2-3 days"],
        sources: [
          {
            id: "1",
            title: "Adult Fever Care",
            source_name: "NHS UK",
            source_url: "https://nhs.uk/fever",
          },
        ],
      };

      const parsed = questionResponseSchema.safeParse(question);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.sources?.length).toBe(1);
        expect(parsed.data.sources?.[0].title).toBe("Adult Fever Care");
      }
    });

    it("allows sources in resultResponseSchema", () => {
      const result = {
        type: "result",
        urgency: "see_doctor_soon",
        headline: "Persistent fever requiring clinical review",
        suggests: "A fever persisting past 3 days warrants examination.",
        actions: ["Visit a primary care clinic", "Stay hydrated"],
        warning_signs: ["Difficulty breathing", "Stiff neck"],
        sources: [
          {
            id: "1",
            title: "Adult Fever Care",
            source_name: "NHS UK",
            source_url: "https://nhs.uk/fever",
          },
        ],
      };

      const parsed = resultResponseSchema.safeParse(result);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.sources?.length).toBe(1);
      }
    });

    it("throws clear error when Supabase RPC fails", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "database connection timeout" },
        }),
      };

      await expect(
        retrieveContext("headache", "en", { supabaseClient: mockSupabase })
      ).rejects.toThrow("match_kb_chunks RPC failed: database connection timeout");
    });
  });
});
