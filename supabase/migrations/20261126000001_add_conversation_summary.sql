-- Add summary JSONB column to conversations table for caching doctor visit summaries
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS summary jsonb;
