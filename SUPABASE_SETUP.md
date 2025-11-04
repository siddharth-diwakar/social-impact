# Supabase Setup for Document Upload Feature

## 🚀 Quick Setup (Recommended - 1 Minute)

**Easiest way: Run everything in one go!**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (`fjrydnkfpdscskdcghqw`)
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Open `supabase/ALL_IN_ONE_SETUP.sql` and **copy the entire file**
6. Paste into the SQL editor
7. Click **"Run"** (or press Ctrl+Enter)
8. ✅ **Done!** Everything is set up automatically

This one script will:
- ✅ Create the `documents` storage bucket
- ✅ Create the `documents` database table with all enhanced features
- ✅ Add category, tags, expiration_date, shared_with, linked_deadline_id, and description columns
- ✅ Set up all Row Level Security (RLS) policies (including shared document access)
- ✅ Set up all storage policies
- ✅ Create indexes for fast searching and filtering

**That's it!** Total time: ~1 minute ⏱️

> **Note:** If you already ran the basic setup, you can run just `supabase/migrations/002_add_document_features.sql` to add the enhanced features.

---

## 📋 Manual Setup (Alternative)

If the all-in-one script doesn't work for some reason, follow these steps:

### Step 1: Run Database Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar
4. Copy and paste the contents of `supabase/migrations/001_create_documents_table.sql`
5. Click "Run" to execute the migration

This will:
- Create the `documents` table
- Set up Row Level Security (RLS) policies
- Ensure users can only access their own documents

### Step 2: Create Storage Bucket

1. In your Supabase dashboard, click on "Storage" in the left sidebar
2. Click "Create bucket"
3. Configure the bucket:
   - **Name**: `documents`
   - **Public bucket**: ❌ Unchecked (keep private)
   - Click "Create bucket"

### Step 3: Configure Storage Policies

1. Go back to "SQL Editor"
2. Copy and paste the contents of `supabase/storage-policies.sql`
3. Click "Run"

Or manually:
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

