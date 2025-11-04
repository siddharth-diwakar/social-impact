-- ============================================
-- ALL-IN-ONE SUPABASE SETUP SCRIPT
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- Click "Run" once - that's it! ✅
-- ============================================

-- ============================================
-- PART 1: CREATE STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 2: CREATE DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 3: DATABASE RLS POLICIES
-- ============================================

-- Policy: Users can view their own documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents"
  ON public.documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own documents
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
CREATE POLICY "Users can insert their own documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own documents
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
CREATE POLICY "Users can delete their own documents"
  ON public.documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 4: STORAGE POLICIES
-- ============================================

-- Policy 1: Users can upload their own files
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 2: Users can read/download their own files
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
CREATE POLICY "Users can read their own files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Users can delete their own files
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- PART 5: ADD ENHANCED FEATURES
-- ============================================

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

-- Add summary column (for AI-generated summaries)
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS summary text;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS documents_category_idx ON public.documents(category);
CREATE INDEX IF NOT EXISTS documents_tags_idx ON public.documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS documents_expiration_date_idx ON public.documents(expiration_date) WHERE expiration_date IS NOT NULL;
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

-- ============================================
-- ✅ DONE! Everything is set up.
-- ============================================
-- Verify by checking:
-- 1. Table Editor → Should see "documents" table ✅
-- 2. Storage → Should see "documents" bucket ✅
-- 3. Storage → documents → Policies tab → Should see 3 policies ✅
-- 4. Documents table should have enhanced columns (category, tags, etc.) ✅
-- ============================================

