-- ============================================
-- SUPABASE STORAGE SETUP SCRIPT
-- Copy and paste this entire script into Supabase SQL Editor
-- ============================================

-- Step 1: Create the storage bucket (if not exists)
-- Note: You'll need to create the bucket manually in the Storage UI first
-- But if you want to ensure it exists, run this (requires service_role key):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
-- ON CONFLICT (id) DO NOTHING;

-- Step 2: Create storage policies
-- These policies ensure users can only access their own files

-- Policy 1: Allow users to upload files to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to read/download files from their own folder
CREATE POLICY IF NOT EXISTS "Users can read their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to delete files from their own folder
CREATE POLICY IF NOT EXISTS "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

