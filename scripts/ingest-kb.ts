/**
 * SafeSteps RAG Knowledge Base Ingestion Pipeline
 *
 * Reads Markdown / Text documents in knowledge/, parses front matter,
 * splits content into 500-800 character chunks with ~100 characters overlap,
 * generates vector embeddings using Gemini, and upserts into kb_documents
 * and kb_chunks in Supabase with the service role client.
 *
 * Usage:
 *   npm run ingest
 *   npx tsx scripts/ingest-kb.ts
 *   npx tsx scripts/ingest-kb.ts --dry-run
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

// Target vector embedding dimension configured in Supabase schema (20261126000000_create_safesteps_schema.sql)
export const EXPECTED_DIMENSION = 768
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-004'

export interface KbFrontMatter {
  title: string
  source_name: string
  source_url: string
  language: 'en' | 'ta' | 'hi'
  licence_note?: string | null
}

export interface TextChunk {
  content: string
  chunk_index: number
  metadata: {
    heading: string
    char_count: number
    title: string
    source_name: string
    source_url: string
  }
}

export interface ParsedDocument {
  filePath: string
  relativePath: string
  frontMatter: KbFrontMatter
  body: string
}

export interface IngestionSummary {
  documentsFound: number
  documentsProcessed: number
  documentsUpserted: number
  documentsUpdated: number
  chunksGenerated: number
  skippedFiles: number
  totalCharacters: number
  embeddingModel: string
  durationMs: number
}

/**
 * Loads .env.local and .env into process.env if not already set
 */
export function loadEnvFiles() {
  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8')
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) continue
          const eqIdx = trimmed.indexOf('=')
          if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx).trim()
            let val = trimmed.substring(eqIdx + 1).trim()
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1)
            }
            if (!process.env[key]) {
              process.env[key] = val
            }
          }
        }
      } catch {
        // ignore read errors
      }
    }
  }
}

/**
 * Parses YAML front matter from a Markdown or Text document.
 */
export function parseFrontMatter(fileContent: string): {
  frontMatter: KbFrontMatter | null
  body: string
} {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { frontMatter: null, body: fileContent }
  }

  const rawYaml = match[1]
  const body = match[2].trim()
  const data: Record<string, string> = {}

  for (const line of rawYaml.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx > 0) {
      const key = trimmed.substring(0, colonIdx).trim()
      let val = trimmed.substring(colonIdx + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      data[key] = val
    }
  }

  if (!data.title || !data.source_name || !data.source_url) {
    return { frontMatter: null, body }
  }

  const lang = data.language === 'ta' || data.language === 'hi' ? data.language : 'en'

  return {
    frontMatter: {
      title: data.title.trim(),
      source_name: data.source_name.trim(),
      source_url: data.source_url.trim(),
      language: lang,
      licence_note: data.licence_note?.trim() || null,
    },
    body,
  }
}

/**
 * Splits document body into 500-800 character chunks with ~100 characters overlap.
 * Preserves section headings in each chunk's metadata.
 */
export function chunkMarkdown(
  text: string,
  frontMatter: KbFrontMatter,
  minChunkSize = 500,
  maxChunkSize = 800,
  targetOverlap = 100
): TextChunk[] {
  const chunks: TextChunk[] = []
  const lines = text.split(/\r?\n/)

  type Block = { heading: string; text: string }
  const blocks: Block[] = []
  let currentHeading = frontMatter.title
  let currentParagraphLines: string[] = []

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const p = currentParagraphLines.join('\n').trim()
      if (p.length > 0) {
        blocks.push({ heading: currentHeading, text: p })
      }
      currentParagraphLines = []
    }
  }

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,4}\s+(.+)$/)
    if (headingMatch) {
      flushParagraph()
      currentHeading = headingMatch[1].trim()
      blocks.push({ heading: currentHeading, text: `## ${currentHeading}` })
      continue
    }

    if (line.trim().length === 0) {
      flushParagraph()
    } else {
      currentParagraphLines.push(line)
    }
  }
  flushParagraph()

  let currentBuffer = ''
  let activeHeading = frontMatter.title
  let chunkIndex = 0

  for (const block of blocks) {
    if (block.text.startsWith('## ')) {
      if (currentBuffer.trim().length > 0) {
        const content = currentBuffer.trim()
        chunks.push({
          content,
          chunk_index: chunkIndex++,
          metadata: {
            heading: activeHeading,
            char_count: content.length,
            title: frontMatter.title,
            source_name: frontMatter.source_name,
            source_url: frontMatter.source_url,
          },
        })
        currentBuffer = ''
      }
      activeHeading = block.heading
      continue
    }

    let blockFragments: string[] = [block.text]
    if (block.text.length > maxChunkSize) {
      blockFragments = block.text.match(/[^.!?]+[.!?]+(\s+|$)/g) || [block.text]
    }

    for (const fragment of blockFragments) {
      if (
        currentBuffer.length > 0 &&
        currentBuffer.length + fragment.length > maxChunkSize
      ) {
        const content = currentBuffer.trim()
        if (content.length > 0) {
          chunks.push({
            content,
            chunk_index: chunkIndex++,
            metadata: {
              heading: activeHeading,
              char_count: content.length,
              title: frontMatter.title,
              source_name: frontMatter.source_name,
              source_url: frontMatter.source_url,
            },
          })
          const overlapSlice =
            content.length > targetOverlap ? content.slice(-targetOverlap) : ''
          const spaceIdx = overlapSlice.indexOf(' ')
          currentBuffer =
            spaceIdx > 0
              ? overlapSlice.slice(spaceIdx).trim() + '\n\n'
              : ''
        }
      }
      currentBuffer += (currentBuffer ? '\n\n' : '') + fragment
    }
  }

  if (currentBuffer.trim().length > 0) {
    const content = currentBuffer.trim()
    chunks.push({
      content,
      chunk_index: chunkIndex++,
      metadata: {
        heading: activeHeading,
        char_count: content.length,
        title: frontMatter.title,
        source_name: frontMatter.source_name,
        source_url: frontMatter.source_url,
      },
    })
  }

  return chunks
}

/**
 * Recursively scans directory for knowledge documents (.md, .txt), skipping README.md
 */
export function scanKnowledgeDirectory(dir: string): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir)) return files

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...scanKnowledgeDirectory(fullPath))
    } else if (entry.isFile()) {
      if (entry.name.toLowerCase() === 'readme.md') {
        continue
      }
      if (entry.name.endsWith('.md') || entry.name.endsWith('.txt')) {
        files.push(fullPath)
      }
    }
  }
  return files
}

/**
 * Generates an embedding for a chunk of text with exponential backoff on rate limits.
 * Validates that returned vector matches the expected dimension.
 */
export async function embedWithBackoff(
  client: GoogleGenAI,
  model: string,
  text: string,
  expectedDim = EXPECTED_DIMENSION,
  maxRetries = 5,
  baseDelayMs = 1000
): Promise<number[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.models.embedContent({
        model,
        contents: text,
      })

      const values =
        (response as any).embedding?.values ||
        (response as any).embeddings?.[0]?.values

      if (!values || !Array.isArray(values)) {
        throw new Error('Gemini API returned an empty embedding response.')
      }

      // Respect the vector dimension configured in the schema; stop with a clear error if mismatch
      if (values.length !== expectedDim) {
        throw new Error(
          `Vector dimension mismatch: Gemini model '${model}' produced ${values.length} dimensions, ` +
            `but the database schema 'kb_chunks.embedding' requires exactly ${expectedDim} dimensions.\n` +
            `Check GEMINI_EMBEDDING_MODEL or update the database vector(${expectedDim}) configuration.`
        )
      }

      return values
    } catch (err: any) {
      const msg = String(err?.message || err)
      // If error is dimension mismatch, do not retry; throw immediately
      if (msg.includes('Vector dimension mismatch')) {
        throw err
      }

      const isRateLimit =
        err?.status === 429 ||
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota') ||
        msg.includes('rate limit')

      if (isRateLimit && attempt < maxRetries) {
        const delayMs =
          Math.pow(2, attempt - 1) * baseDelayMs +
          (baseDelayMs > 10 ? Math.floor(Math.random() * 500) : 0)
        console.warn(
          `  ⏳ Rate limit encountered. Waiting ${(delayMs / 1000).toFixed(1)}s before retry (attempt ${attempt}/${maxRetries})...`
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        continue
      }
      throw err
    }
  }

  throw new Error(`Exceeded maximum retry attempts (${maxRetries}) for embedding generation.`)
}

/**
 * Main Ingestion Execution Function
 */
export async function runIngestion(options: { dryRun?: boolean } = {}): Promise<IngestionSummary> {
  const startTime = Date.now()
  loadEnvFiles()

  const knowledgeDir = path.resolve(process.cwd(), 'knowledge')
  const embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL
  const geminiApiKey = process.env.GEMINI_API_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('=================================================================')
  console.log('         SafeSteps Clinical Knowledge Base Ingestion             ')
  console.log('=================================================================')
  console.log(`Knowledge Directory: ${knowledgeDir}`)
  console.log(`Embedding Model:     ${embeddingModel} (Expected Dimension: ${EXPECTED_DIMENSION})`)
  if (options.dryRun) {
    console.log(`Mode:                DRY RUN (No API calls or DB writes)`)
  }
  console.log('-----------------------------------------------------------------')

  if (!fs.existsSync(knowledgeDir)) {
    throw new Error(`Directory '${knowledgeDir}' does not exist. Please create it first.`)
  }

  const allFiles = scanKnowledgeDirectory(knowledgeDir)
  if (allFiles.length === 0) {
    console.log('No Markdown (.md) or Text (.txt) files found in knowledge/.')
    return {
      documentsFound: 0,
      documentsProcessed: 0,
      documentsUpserted: 0,
      documentsUpdated: 0,
      chunksGenerated: 0,
      skippedFiles: 0,
      totalCharacters: 0,
      embeddingModel,
      durationMs: Date.now() - startTime,
    }
  }

  // Parse front matter and collect valid documents
  const validDocs: { doc: ParsedDocument; chunks: TextChunk[] }[] = []
  let skippedFiles = 0
  let totalCharacters = 0

  for (const filePath of allFiles) {
    const relPath = path.relative(process.cwd(), filePath)
    const content = fs.readFileSync(filePath, 'utf-8')
    const { frontMatter, body } = parseFrontMatter(content)

    if (!frontMatter) {
      console.warn(`  ⚠️ Skipping '${relPath}': Missing valid YAML front matter (title, source_name, source_url required).`)
      skippedFiles++
      continue
    }

    if (!body || body.trim().length === 0) {
      console.warn(`  ⚠️ Skipping '${relPath}': Document body is empty.`)
      skippedFiles++
      continue
    }

    const chunks = chunkMarkdown(body, frontMatter)
    totalCharacters += body.length
    validDocs.push({
      doc: {
        filePath,
        relativePath: relPath,
        frontMatter,
        body,
      },
      chunks,
    })
  }

  console.log(`Found ${allFiles.length} file(s): ${validDocs.length} valid document(s), ${skippedFiles} skipped.`)
  console.log(`Generated ${validDocs.reduce((acc, d) => acc + d.chunks.length, 0)} total text chunk(s).`)

  if (options.dryRun) {
    console.log('\n--- DRY RUN PREVIEWS ---')
    for (const { doc, chunks } of validDocs) {
      console.log(`\n📄 [${doc.frontMatter.language}] ${doc.frontMatter.title}`)
      console.log(`   Source:  ${doc.frontMatter.source_name} (${doc.frontMatter.source_url})`)
      console.log(`   Chunks:  ${chunks.length} chunk(s)`)
      for (const ch of chunks) {
        console.log(`   - Chunk #${ch.chunk_index} [${ch.metadata.heading}] (${ch.content.length} chars): "${ch.content.slice(0, 70)}..."`)
      }
    }

    const durationMs = Date.now() - startTime
    console.log('\n=================================================================')
    console.log('                   DRY RUN COMPLETED                             ')
    console.log('=================================================================')
    return {
      documentsFound: allFiles.length,
      documentsProcessed: validDocs.length,
      documentsUpserted: 0,
      documentsUpdated: 0,
      chunksGenerated: validDocs.reduce((acc, d) => acc + d.chunks.length, 0),
      skippedFiles,
      totalCharacters,
      embeddingModel,
      durationMs,
    }
  }

  // Check required credentials for live ingestion
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is missing. Please set it in .env.local to generate embeddings.')
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local to upsert into Supabase.')
  }

  const geminiClient = new GoogleGenAI({ apiKey: geminiApiKey })
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })

  let documentsUpserted = 0
  let documentsUpdated = 0
  let totalChunksIngested = 0

  console.log('\nGenerating vector embeddings and upserting into Supabase...')

  for (let i = 0; i < validDocs.length; i++) {
    const { doc, chunks } = validDocs[i]
    console.log(`\n[${i + 1}/${validDocs.length}] Ingesting: "${doc.frontMatter.title}" (${chunks.length} chunks)`)

    // Generate embeddings for all chunks with rate-limit retry
    const chunksWithEmbeddings: { chunk: TextChunk; embedding: number[] }[] = []
    for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
      const chunk = chunks[cIdx]
      process.stdout.write(`  -> Embedding chunk ${cIdx + 1}/${chunks.length}... `)
      const embedding = await embedWithBackoff(geminiClient, embeddingModel, chunk.content, EXPECTED_DIMENSION)
      chunksWithEmbeddings.push({ chunk, embedding })
      console.log(`✓ (${embedding.length} dims)`)
    }

    // Upsert into kb_documents matching on source_url
    const { data: existingDoc, error: fetchErr } = await supabase
      .from('kb_documents')
      .select('id')
      .eq('source_url', doc.frontMatter.source_url)
      .maybeSingle()

    if (fetchErr) {
      throw new Error(`Database error querying existing document: ${fetchErr.message}`)
    }

    let documentId: string

    if (existingDoc) {
      documentId = existingDoc.id
      documentsUpdated++
      console.log(`  Updating existing document ID: ${documentId}`)

      const { error: updateDocErr } = await supabase
        .from('kb_documents')
        .update({
          title: doc.frontMatter.title,
          source_name: doc.frontMatter.source_name,
          language: doc.frontMatter.language,
          licence_note: doc.frontMatter.licence_note,
        })
        .eq('id', documentId)

      if (updateDocErr) {
        throw new Error(`Failed to update kb_documents: ${updateDocErr.message}`)
      }

      // Delete old chunks of this document to prevent duplicates
      const { error: delChunksErr } = await supabase
        .from('kb_chunks')
        .delete()
        .eq('document_id', documentId)

      if (delChunksErr) {
        throw new Error(`Failed to purge old chunks: ${delChunksErr.message}`)
      }
    } else {
      documentsUpserted++
      const { data: newDoc, error: insertDocErr } = await supabase
        .from('kb_documents')
        .insert({
          title: doc.frontMatter.title,
          source_name: doc.frontMatter.source_name,
          source_url: doc.frontMatter.source_url,
          language: doc.frontMatter.language,
          licence_note: doc.frontMatter.licence_note,
        })
        .select('id')
        .single()

      if (insertDocErr || !newDoc) {
        throw new Error(`Failed to insert kb_documents: ${insertDocErr?.message}`)
      }
      documentId = newDoc.id
      console.log(`  Created new document ID: ${documentId}`)
    }

    // Insert new chunks into kb_chunks
    const chunkRows = chunksWithEmbeddings.map(({ chunk, embedding }) => ({
      document_id: documentId,
      chunk_index: chunk.chunk_index,
      content: chunk.content,
      embedding: `[${embedding.join(',')}]`,
      metadata: chunk.metadata,
    }))

    const { error: insertChunksErr } = await supabase.from('kb_chunks').insert(chunkRows)
    if (insertChunksErr) {
      throw new Error(`Failed to insert chunks into kb_chunks: ${insertChunksErr.message}`)
    }

    totalChunksIngested += chunkRows.length
    console.log(`  ✓ Inserted ${chunkRows.length} chunks successfully.`)
  }

  const durationMs = Date.now() - startTime

  console.log('\n=================================================================')
  console.log('                 INGESTION PIPELINE SUMMARY                      ')
  console.log('=================================================================')
  console.log(`Documents Found:     ${allFiles.length}`)
  console.log(`Documents Processed: ${validDocs.length}`)
  console.log(`New Documents:       ${documentsUpserted}`)
  console.log(`Updated Documents:   ${documentsUpdated}`)
  console.log(`Chunks Ingested:     ${totalChunksIngested}`)
  console.log(`Skipped Files:       ${skippedFiles}`)
  console.log(`Total Characters:    ${totalCharacters.toLocaleString()}`)
  console.log(`Embedding Model:     ${embeddingModel} (${EXPECTED_DIMENSION} dimensions)`)
  console.log(`Elapsed Time:        ${(durationMs / 1000).toFixed(2)}s`)
  console.log('=================================================================')
  console.log('SafeSteps RAG knowledge base is up to date and ready for retrieval!')

  return {
    documentsFound: allFiles.length,
    documentsProcessed: validDocs.length,
    documentsUpserted,
    documentsUpdated,
    chunksGenerated: totalChunksIngested,
    skippedFiles,
    totalCharacters,
    embeddingModel,
    durationMs,
  }
}

// Direct CLI invocation
const isMainScript =
  Boolean(process.argv[1]) &&
  (process.argv[1].endsWith('ingest-kb.ts') ||
    process.argv[1].endsWith('ingest-kb.js') ||
    (typeof import.meta.url === 'string' &&
      fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase()))

if (isMainScript) {
  const isDryRun = process.argv.includes('--dry-run')
  runIngestion({ dryRun: isDryRun }).catch((err) => {
    console.error('\n❌ Ingestion Pipeline Error:', err.message || err)
    process.exit(1)
  })
}
