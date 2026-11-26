-- ==============================================================================
-- SafeSteps Health Guidance System - Database Schema Migration
-- Migration: 20261126000000_create_safesteps_schema.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ------------------------------------------------------------------------------
-- 2. TABLES DEFINITIONS
-- ------------------------------------------------------------------------------

-- 2.1 PROFILES
-- Stores clinical baseline and health preferences linked to auth.users.
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    age integer CHECK (age >= 0 AND age <= 130),
    sex text,
    height_cm numeric CHECK (height_cm > 0),
    weight_kg numeric CHECK (weight_kg > 0),
    pregnant boolean DEFAULT false,
    allergies text[] DEFAULT '{}'::text[],
    conditions text[] DEFAULT '{}'::text[],
    medicines text[] DEFAULT '{}'::text[],
    preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'ta', 'hi')),
    personalise boolean DEFAULT false,
    consent_version text,
    consent_accepted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.2 CONVERSATIONS
-- Stores symptom triage sessions.
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL DEFAULT 'New Consultation',
    urgency text CHECK (urgency IN ('self_care', 'see_doctor_soon', 'emergency')),
    language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ta', 'hi')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.3 MESSAGES
-- Individual conversational turns within a consultation.
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    structured jsonb, -- Holds validated clinical triage result, citations, and follow-ups
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.4 REPORTS
-- Uploaded lab documents and pathology records.
CREATE TABLE IF NOT EXISTS public.reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    source_type text NOT NULL CHECK (source_type IN ('text', 'file')),
    raw_text_deleted_at timestamptz,
    summary jsonb, -- Holds executive plain-English summary and GP discussion points
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.5 REPORT_VALUES
-- Individual extracted biomarkers and laboratory parameters.
CREATE TABLE IF NOT EXISTS public.report_values (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    test_name text NOT NULL,
    value_numeric numeric,
    value_text text,
    unit text,
    reference_low numeric,
    reference_high numeric,
    status text NOT NULL CHECK (status IN ('normal', 'high', 'low', 'critical', 'unknown')),
    explanation text,
    corrected_by_user boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.6 KB_DOCUMENTS
-- Medical guidelines and clinical references (e.g. NICE, NHS Pathways, WHO).
CREATE TABLE IF NOT EXISTS public.kb_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    source_name text NOT NULL,
    source_url text,
    language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ta', 'hi')),
    licence_note text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.7 KB_CHUNKS
-- Vectorized document chunks for RAG semantic search.
-- [VECTOR EMBEDDING DIMENSION CONFIGURATION]
-- Default: 768 dimensions (for Google Gemini text-embedding-004)
-- To change embedding model (e.g. OpenAI 1536), modify the vector(768) dimension below.
CREATE TABLE IF NOT EXISTS public.kb_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id uuid NOT NULL REFERENCES public.kb_documents(id) ON DELETE CASCADE,
    content text NOT NULL,
    chunk_index integer NOT NULL,
    embedding vector(768), -- [DIMENSION: 768] Gemini text-embedding-004
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.8 AUDIT_LOG
-- Compliance audit trail. Strictly prohibited from storing clinical messages or health contents.
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES
-- ------------------------------------------------------------------------------

-- Foreign key & query performance indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_report_values_report_id ON public.report_values(report_id);
CREATE INDEX IF NOT EXISTS idx_report_values_user_id ON public.report_values(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_document_id ON public.kb_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);

-- Vector index for cosine distance similarity search (HNSW index)
CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding 
    ON public.kb_chunks 
    USING hnsw (embedding vector_cosine_ops);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 4.1 PROFILES POLICIES
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" 
    ON public.profiles FOR DELETE 
    USING (auth.uid() = id);

-- 4.2 CONVERSATIONS POLICIES
CREATE POLICY "Users can view own conversations" 
    ON public.conversations FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" 
    ON public.conversations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" 
    ON public.conversations FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" 
    ON public.conversations FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.3 MESSAGES POLICIES
CREATE POLICY "Users can view own messages" 
    ON public.messages FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" 
    ON public.messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" 
    ON public.messages FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" 
    ON public.messages FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.4 REPORTS POLICIES
CREATE POLICY "Users can view own reports" 
    ON public.reports FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" 
    ON public.reports FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" 
    ON public.reports FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.5 REPORT_VALUES POLICIES
CREATE POLICY "Users can view own report values" 
    ON public.report_values FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own report values" 
    ON public.report_values FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own report values" 
    ON public.report_values FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own report values" 
    ON public.report_values FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.6 KB_DOCUMENTS POLICIES
-- Readable by any authenticated user; insert/update/delete restricted to service_role.
CREATE POLICY "Authenticated users can read clinical documents" 
    ON public.kb_documents FOR SELECT 
    TO authenticated 
    USING (true);

-- 4.7 KB_CHUNKS POLICIES
-- Readable by any authenticated user; insert/update/delete restricted to service_role.
CREATE POLICY "Authenticated users can read clinical chunks" 
    ON public.kb_chunks FOR SELECT 
    TO authenticated 
    USING (true);

-- 4.8 AUDIT_LOG POLICIES
-- Users can only append audit records for their own actions. Reading/modifying is restricted to service_role.
CREATE POLICY "Users can append own audit entries" 
    ON public.audit_log FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- 5.1 UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 5.2 AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        preferred_language,
        personalise,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
        false,
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5.3 VECTOR SIMILARITY SEARCH FUNCTION
-- Matches clinical knowledge chunks using cosine distance with optional language filtering.
CREATE OR REPLACE FUNCTION public.match_kb_chunks (
    query_embedding vector(768),
    match_count int DEFAULT 5,
    language_filter text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    document_title text,
    source_name text,
    source_url text,
    language text,
    content text,
    chunk_index integer,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.document_id,
        d.title AS document_title,
        d.source_name,
        d.source_url,
        d.language,
        c.content,
        c.chunk_index,
        c.metadata,
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM public.kb_chunks c
    INNER JOIN public.kb_documents d ON c.document_id = d.id
    WHERE (language_filter IS NULL OR d.language = language_filter)
      AND c.embedding IS NOT NULL
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
