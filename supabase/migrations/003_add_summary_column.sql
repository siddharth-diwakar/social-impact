-- Migration: Add summary column to documents table for AI-generated summaries

-- Add summary column
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS summary text;

