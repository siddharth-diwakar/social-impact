-- Migration: Add enhanced features to documents table
-- Add new columns for categories, tags, expiration, sharing, and linking

-- Add category column
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS category text;

-- Add tags column (stored as array)
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add expiration_date column
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS expiration_date timestamp with time zone;

-- Add shared_with column (array of user IDs)
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS shared_with uuid[] DEFAULT '{}';

-- Add linked_deadline_id column (for linking to compliance deadlines)
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS linked_deadline_id text;

-- Add description column
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS description text;

-- Create index for faster category queries
CREATE INDEX IF NOT EXISTS documents_category_idx ON public.documents(category);

-- Create index for faster tag queries
CREATE INDEX IF NOT EXISTS documents_tags_idx ON public.documents USING GIN(tags);

-- Create index for expiration date queries
CREATE INDEX IF NOT EXISTS documents_expiration_date_idx ON public.documents(expiration_date) WHERE expiration_date IS NOT NULL;

-- Create index for shared_with queries
CREATE INDEX IF NOT EXISTS documents_shared_with_idx ON public.documents USING GIN(shared_with);

-- Update RLS policies to allow viewing shared documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents"
  ON public.documents
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = ANY(shared_with)
  );

-- Add policy for updating own documents
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
CREATE POLICY "Users can update their own documents"
  ON public.documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

