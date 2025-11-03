# Document Upload & Storage Feature

This feature branch implements document upload and storage functionality for the compl.io application.

## Branch
`feature/document-upload`

## What Was Implemented

### 1. Database Schema
- **File**: `supabase/migrations/001_create_documents_table.sql`
- Creates `documents` table with columns:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to auth.users)
  - `filename` (text)
  - `file_path` (text) - path in Supabase Storage
  - `file_size` (bigint) - size in bytes
  - `file_type` (text) - MIME type
  - `uploaded_at`, `created_at`, `updated_at` (timestamps)
- Sets up Row Level Security (RLS) policies:
  - Users can only view their own documents
  - Users can only insert their own documents
  - Users can only delete their own documents

### 2. API Routes

#### Upload Route (`app/api/documents/upload/route.ts`)
- **POST** `/api/documents/upload`
- Handles multiple file uploads (up to 10 files)
- Validates file types (PDF, DOCX, XLSX, PNG, JPG)
- Validates file size (max 10MB per file)
- Uploads files to Supabase Storage bucket `documents`
- Saves metadata to database
- Returns detailed results for each file (success/failure)

#### Fetch/Delete Route (`app/api/documents/route.ts`)
- **GET** `/api/documents` - Fetches user's documents with signed download URLs
- **DELETE** `/api/documents?id={documentId}` - Deletes a document from storage and database

### 3. Frontend Components

#### DocumentUpload Component (`components/document-upload.tsx`)
- Client component for handling document uploads and display
- Features:
  - Drag and drop file upload
  - Click to browse file selection
  - File upload progress indicator
  - Success/error messages
  - Document list display with:
    - File icons based on type
    - File size and upload date
    - Download button
    - Delete button
  - Matches existing emerald/green theme
  - Full dark mode support

#### Updated Documents Page (`app/Documents/page.tsx`)
- Now fetches documents on server side
- Passes initial documents to DocumentUpload component
- Maintains existing styling and layout

### 4. Setup Documentation
- **SUPABASE_SETUP.md** - Complete guide for setting up Supabase Storage

## Styling

All new components match the existing design system:
- **Colors**: Emerald/green theme (`emerald-100`, `emerald-700`, etc.)
- **Components**: Uses existing Card, Button, Badge components
- **Dark Mode**: Full support with dark mode variants
- **Responsive**: Works on mobile and desktop
- **Icons**: Lucide React icons matching existing patterns

## Setup Required

Before this feature works, you need to:

1. **Run Database Migration**
   - Execute `supabase/migrations/001_create_documents_table.sql` in Supabase SQL Editor

2. **Create Storage Bucket**
   - Create a bucket named `documents` in Supabase Storage
   - Keep it private (not public)

3. **Configure Storage Policies**
   - Set up three policies (see SUPABASE_SETUP.md for details)
   - Users can only access files in their own folder

## File Structure

Files are stored with this structure:
```
documents/
  {user_id}/
    {timestamp}-{filename}
```

This ensures:
- Users can only see their own files
- No filename conflicts
- Easy cleanup if user is deleted

## Testing Checklist

- [ ] Run database migration
- [ ] Create storage bucket
- [ ] Configure storage policies
- [ ] Test file upload (single file)
- [ ] Test file upload (multiple files)
- [ ] Test file validation (wrong type)
- [ ] Test file validation (too large)
- [ ] Test document display
- [ ] Test document download
- [ ] Test document deletion
- [ ] Test dark mode
- [ ] Test responsive design

## Next Steps

1. Set up Supabase Storage (see SUPABASE_SETUP.md)
2. Test the feature
3. Review and merge to main branch
4. Deploy to production

