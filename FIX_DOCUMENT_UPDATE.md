# Fix: Document Update Not Working

The document update feature is failing because the **UPDATE RLS policy** is missing from your database.

## The Problem

Migration `001_create_documents_table.sql` creates the documents table but only has policies for:
- ✅ SELECT (view documents)
- ✅ INSERT (upload documents)
- ✅ DELETE (delete documents)
- ❌ UPDATE (edit documents) - **MISSING!**

Migration `002_add_document_features.sql` adds the UPDATE policy, but it appears this migration hasn't been run yet.

## The Fix

Run migration `002_add_document_features.sql` in your Supabase SQL Editor:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run the Migration

Copy and paste the entire contents of `supabase/migrations/002_add_document_features.sql` into the SQL Editor and click **"Run"**.

Or copy this SQL directly:

```sql
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

-- Add policy for updating own documents (THIS IS THE KEY FIX!)
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
CREATE POLICY "Users can update their own documents"
  ON public.documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Step 3: Verify It Works

After running the migration:

1. Refresh your app
2. Try editing a document (category, tags, expiration date, description)
3. It should work now! ✅

## What This Migration Does

- Adds missing columns: `category`, `tags`, `expiration_date`, `shared_with`, `linked_deadline_id`, `description`
- Creates indexes for faster queries
- **Most importantly**: Adds the UPDATE RLS policy that allows users to edit their own documents

## Why This Happened

The initial migration (`001_create_documents_table.sql`) only created basic functionality. The enhanced features (including the UPDATE policy) were added in a separate migration (`002_add_document_features.sql`) that needs to be run separately.

