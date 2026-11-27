import { describe, it, expect, vi } from 'vitest'
import {
  parseFrontMatter,
  chunkMarkdown,
  scanKnowledgeDirectory,
  embedWithBackoff,
  EXPECTED_DIMENSION,
  DEFAULT_EMBEDDING_MODEL,
  KbFrontMatter,
} from '../scripts/ingest-kb'
import fs from 'fs'
import path from 'path'

describe('RAG Ingestion Pipeline (scripts/ingest-kb.ts)', () => {
  describe('parseFrontMatter', () => {
    it('parses valid YAML front matter with all fields', () => {
      const doc = `---
title: "Fever in Adults: Home Care and Red Flags"
source_name: "NHS UK"
source_url: "https://www.nhs.uk/conditions/fever-in-adults/"
language: en
licence_note: "Open Government Licence v3.0"
---

# Overview
A normal body temperature is around 37C.`

      const { frontMatter, body } = parseFrontMatter(doc)
      expect(frontMatter).not.toBeNull()
      expect(frontMatter?.title).toBe('Fever in Adults: Home Care and Red Flags')
      expect(frontMatter?.source_name).toBe('NHS UK')
      expect(frontMatter?.source_url).toBe('https://www.nhs.uk/conditions/fever-in-adults/')
      expect(frontMatter?.language).toBe('en')
      expect(frontMatter?.licence_note).toBe('Open Government Licence v3.0')
      expect(body).toContain('# Overview\nA normal body temperature is around 37C.')
    })

    it('handles Windows CRLF line endings in front matter', () => {
      const doc = `---\r\ntitle: Test Title\r\nsource_name: Source\r\nsource_url: https://example.com\r\nlanguage: hi\r\n---\r\n\r\nContent here.`
      const { frontMatter, body } = parseFrontMatter(doc)
      expect(frontMatter).not.toBeNull()
      expect(frontMatter?.title).toBe('Test Title')
      expect(frontMatter?.language).toBe('hi')
      expect(body).toBe('Content here.')
    })

    it('falls back to "en" when language is unrecognized', () => {
      const doc = `---
title: Test Title
source_name: Source
source_url: https://example.com
language: de
---
Content.`
      const { frontMatter } = parseFrontMatter(doc)
      expect(frontMatter?.language).toBe('en')
    })

    it('returns null frontMatter if mandatory fields are missing', () => {
      const docNoUrl = `---
title: Test Title
source_name: Source
---
Content.`
      const res = parseFrontMatter(docNoUrl)
      expect(res.frontMatter).toBeNull()

      const docNoTitle = `---
source_name: Source
source_url: https://example.com
---
Content.`
      expect(parseFrontMatter(docNoTitle).frontMatter).toBeNull()
    })

    it('returns null frontMatter if no front matter block is present', () => {
      const doc = `# Just Plain Markdown\nNo front matter block here.`
      const res = parseFrontMatter(doc)
      expect(res.frontMatter).toBeNull()
      expect(res.body).toBe(doc)
    })
  })

  describe('chunkMarkdown', () => {
    const dummyFm: KbFrontMatter = {
      title: 'Triage Guidelines',
      source_name: 'SafeSteps Clinical KB',
      source_url: 'https://safesteps.internal/triage',
      language: 'en',
      licence_note: null,
    }

    it('splits text into chunks of target size (~500 to 800 characters)', () => {
      const section1 = 'A'.repeat(450) + '. '
      const section2 = 'B'.repeat(450) + '. '
      const section3 = 'C'.repeat(450) + '. '
      const markdown = `## Section One\n\n${section1}\n\n## Section Two\n\n${section2}\n\n${section3}`

      const chunks = chunkMarkdown(markdown, dummyFm, 400, 800, 50)
      expect(chunks.length).toBeGreaterThan(1)

      for (const chunk of chunks) {
        expect(chunk.content.length).toBeLessThanOrEqual(900) // allow slight margin with overlap
        expect(chunk.chunk_index).toBeTypeOf('number')
        expect(chunk.metadata.title).toBe(dummyFm.title)
        expect(chunk.metadata.source_url).toBe(dummyFm.source_url)
      }
    })

    it('captures active section heading in chunk metadata', () => {
      const markdown = `## Emergency Red Flags
If experiencing chest pain, difficulty breathing, or severe sudden headache, seek emergency medical care immediately.

## Home Care Steps
Drink plenty of fluids, rest in a cool room, and monitor temperature regularly.`

      const chunks = chunkMarkdown(markdown, dummyFm)
      expect(chunks.length).toBeGreaterThan(0)

      const redFlagsChunk = chunks.find((c) => c.content.includes('chest pain'))
      expect(redFlagsChunk).toBeDefined()
      expect(redFlagsChunk?.metadata.heading).toBe('Emergency Red Flags')

      const homeCareChunk = chunks.find((c) => c.content.includes('Drink plenty of fluids'))
      expect(homeCareChunk).toBeDefined()
      expect(homeCareChunk?.metadata.heading).toBe('Home Care Steps')
    })

    it('adds overlap between successive chunks', () => {
      const text =
        'Sentence one describing the clinical guidelines. ' +
        'Sentence two expanding on the hydration recommendations. ' +
        'Sentence three cautioning about pediatric red flags. ' +
        'Sentence four specifying warning signs in elderly patients. ' +
        'Sentence five indicating when to consult a physician immediately.'

      const duplicated = (text + '\n\n').repeat(8)
      const chunks = chunkMarkdown(duplicated, dummyFm, 300, 600, 100)

      expect(chunks.length).toBeGreaterThan(1)
      // Check that chunk 1 has some tail text of chunk 0
      const chunk0End = chunks[0].content.slice(-40).trim()
      // In overlap logic, chunk 1 should start with or contain part of chunk 0's trailing content
      const chunk1Start = chunks[1].content.slice(0, 100)
      const hasOverlap = chunk0End.split(' ').some((word) => word.length > 5 && chunk1Start.includes(word))
      expect(hasOverlap).toBe(true)
    })
  })

  describe('scanKnowledgeDirectory', () => {
    it('skips README.md and reads .md and .txt files', () => {
      const knowledgeDir = path.resolve(process.cwd(), 'knowledge')
      if (fs.existsSync(knowledgeDir)) {
        const files = scanKnowledgeDirectory(knowledgeDir)
        expect(files.length).toBeGreaterThanOrEqual(3) // samples created
        for (const f of files) {
          expect(path.basename(f).toLowerCase()).not.toBe('readme.md')
          expect(f.endsWith('.md') || f.endsWith('.txt')).toBe(true)
        }
      }
    })
  })

  describe('embedWithBackoff', () => {
    it('returns embeddings when dimension matches expected schema dimension (768)', async () => {
      const mockVector = new Array(768).fill(0.123)
      const mockClient = {
        models: {
          embedContent: vi.fn().mockResolvedValue({
            embedding: { values: mockVector },
          }),
        },
      } as any

      const result = await embedWithBackoff(mockClient, DEFAULT_EMBEDDING_MODEL, 'Sample test text', EXPECTED_DIMENSION)
      expect(result).toEqual(mockVector)
      expect(result.length).toBe(768)
      expect(mockClient.models.embedContent).toHaveBeenCalledWith({
        model: DEFAULT_EMBEDDING_MODEL,
        contents: 'Sample test text',
        config: {
          outputDimensionality: EXPECTED_DIMENSION,
        },
      })
    })

    it('stops with a clear error on vector dimension mismatch and does not retry', async () => {
      const invalidVector = new Array(512).fill(0.5) // 512 != 768
      const mockClient = {
        models: {
          embedContent: vi.fn().mockResolvedValue({
            embedding: { values: invalidVector },
          }),
        },
      } as any

      await expect(
        embedWithBackoff(mockClient, DEFAULT_EMBEDDING_MODEL, 'Sample text', EXPECTED_DIMENSION)
      ).rejects.toThrow(/Vector dimension mismatch: Gemini model .* produced 512 dimensions, but the database schema 'kb_chunks.embedding' requires exactly 768 dimensions/)

      // Must fail immediately on first attempt without retrying
      expect(mockClient.models.embedContent).toHaveBeenCalledTimes(1)
    })

    it('retries on rate limit (429) with backoff before succeeding', async () => {
      const mockVector = new Array(768).fill(0.456)
      const mockClient = {
        models: {
          embedContent: vi
            .fn()
            .mockRejectedValueOnce({ status: 429, message: 'Resource exhausted: rate limit exceeded' })
            .mockResolvedValueOnce({
              embedding: { values: mockVector },
            }),
        },
      } as any

      const result = await embedWithBackoff(
        mockClient,
        DEFAULT_EMBEDDING_MODEL,
        'Retry test text',
        EXPECTED_DIMENSION,
        3,
        1 // 1ms baseDelay for rapid unit tests
      )
      expect(result.length).toBe(768)
      expect(mockClient.models.embedContent).toHaveBeenCalledTimes(2)
    })
  })

  describe('Knowledge Samples Validity', () => {
    it('verifies that all sample markdown files in knowledge/samples/ parse cleanly', () => {
      const samplesDir = path.resolve(process.cwd(), 'knowledge/samples')
      if (fs.existsSync(samplesDir)) {
        const sampleFiles = fs.readdirSync(samplesDir).filter((f) => f.endsWith('.md'))
        expect(sampleFiles.length).toBeGreaterThanOrEqual(3)

        for (const file of sampleFiles) {
          const filePath = path.join(samplesDir, file)
          const content = fs.readFileSync(filePath, 'utf-8')
          const { frontMatter, body } = parseFrontMatter(content)

          expect(frontMatter, `Front matter missing or invalid in ${file}`).not.toBeNull()
          expect(frontMatter?.title.length).toBeGreaterThan(5)
          expect(frontMatter?.source_name.length).toBeGreaterThan(2)
          expect(frontMatter?.source_url).toMatch(/^https?:\/\//)
          expect(['en', 'ta', 'hi']).toContain(frontMatter?.language)
          expect(body.length).toBeGreaterThan(100)

          const chunks = chunkMarkdown(body, frontMatter!)
          expect(chunks.length).toBeGreaterThan(0)
          for (const chunk of chunks) {
            expect(chunk.content.length).toBeGreaterThan(50)
            expect(chunk.metadata.heading.length).toBeGreaterThan(0)
          }
        }
      }
    })
  })
})
