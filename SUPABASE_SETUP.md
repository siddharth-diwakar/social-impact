# Supabase Setup for Document Upload Feature

This guide explains how to set up Supabase Storage for the document upload feature.

## Prerequisites

- Access to your Supabase project dashboard
- Admin access to the Supabase project

## Step 1: Run Database Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar
4. Copy and paste the contents of `supabase/migrations/001_create_documents_table.sql`
5. Click "Run" to execute the migration

This will:
- Create the `documents` table
- Set up Row Level Security (RLS) policies
- Ensure users can only access their own documents

## Step 2: Create Storage Bucket

1. In your Supabase dashboard, click on "Storage" in the left sidebar
2. Click "Create bucket"
3. Configure the bucket:
   - **Name**: `documents`
   - **Public bucket**: ❌ Unchecked (keep private)
   - Click "Create bucket"

## Step 3: Configure Storage Policies

1. Click on the `documents` bucket you just created
2. Click on "Policies" tab
3. Click "New Policy" and create the following policies:

### Policy 1: Allow users to upload their own files

**Policy Name**: `Users can upload their own files`

**Policy Definition**:
```sql
(bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```

**Allowed Operations**: SELECT, INSERT

### Policy 2: Allow users to read their own files

**Policy Name**: `Users can read their own files`

**Policy Definition**:
```sql
(bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```

**Allowed Operations**: SELECT

### Policy 3: Allow users to delete their own files

**Policy Name**: `Users can delete their own files`

**Policy Definition**:
```sql
(bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```

**Allowed Operations**: DELETE

## Step 4: Verify Setup

1. The `documents` table should be visible in the "Table Editor"
2. The `documents` storage bucket should be visible in "Storage"
3. All three storage policies should be active

## Testing

After setup, you can test the feature by:
1. Logging in to the application
2. Navigating to the "Documents" page
3. Uploading a test file (PDF, DOCX, XLSX, PNG, or JPG)
4. Verifying the file appears in the list
5. Testing download and delete functionality

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket is named exactly `documents` (case-sensitive)
- Verify the bucket exists in Storage

### Error: "Policy violation"
- Check that all three storage policies are created and enabled
- Verify the policies match the user ID folder structure

### Error: "Table does not exist"
- Run the SQL migration again
- Verify the table was created in the Table Editor

### Files not appearing
- Check browser console for errors
- Verify the user is logged in
- Check that RLS policies are correctly configured

## File Structure

Files are stored in Supabase Storage with the following structure:
```
documents/
  {user_id}/
    {timestamp}-{filename}
```

This ensures:
- Users can only access files in their own folder
- Files are organized by user
- No filename conflicts between users

