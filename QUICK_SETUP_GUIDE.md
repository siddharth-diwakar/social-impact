# Quick Setup Guide - Document Upload Feature

This is a simplified, copy-paste guide to get everything working in ~5 minutes.

## ✅ Step 1: Run Database Migration (2 minutes)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Copy the **entire contents** of `supabase/migrations/001_create_documents_table.sql`
6. Paste into the SQL editor
7. Click **"Run"** (or press Ctrl+Enter)
8. ✅ You should see "Success. No rows returned"

## ✅ Step 2: Create Storage Bucket (1 minute)

1. In Supabase dashboard, click **"Storage"** in the left sidebar
2. Click **"Create bucket"** button
3. Fill in:
   - **Name**: `documents` (must be exactly this, case-sensitive)
   - **Public bucket**: ❌ **UNCHECKED** (keep it private)
4. Click **"Create bucket"**
5. ✅ You should see the `documents` bucket appear

## ✅ Step 3: Set Up Storage Policies (2 minutes)

1. Still in Storage, click on the **`documents`** bucket you just created
2. Click the **"Policies"** tab
3. You have two options:

### Option A: Use SQL (Recommended - Faster)
1. Go back to **"SQL Editor"**
2. Copy the **entire contents** of `supabase/storage-policies.sql`
3. Paste and click **"Run"**
4. ✅ Done! All three policies created

### Option B: Manual Setup (If SQL doesn't work)
1. Click **"New Policy"** (3 times, once for each policy)

**Policy 1: Upload**
- Name: `Users can upload their own files`
- Allowed operation: ✅ SELECT, ✅ INSERT
- Target roles: `authenticated`
- Policy definition:
```sql
(bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```

**Policy 2: Read**
- Name: `Users can read their own files`
- Allowed operation: ✅ SELECT
- Target roles: `authenticated`
- Policy definition:
```sql
(bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```

**Policy 3: Delete**
- Name: `Users can delete their own files`
- Allowed operation: ✅ DELETE
- Target roles: `authenticated`
- Policy definition:
```sql
(bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
```

## ✅ Step 4: Verify Everything (30 seconds)

1. **Database**: Go to "Table Editor" → You should see `documents` table ✅
2. **Storage**: Go to "Storage" → You should see `documents` bucket ✅
3. **Policies**: Click on `documents` bucket → "Policies" tab → Should see 3 policies ✅

## ✅ Step 5: Test It!

1. Make sure your dev server is running (`npm run dev`)
2. Go to http://localhost:3000/Documents
3. Try uploading a test file (PDF, DOCX, PNG, or JPG)
4. The file should appear in the list immediately! ✅

---

## 🆘 Troubleshooting

### "Bucket not found" error
→ Make sure the bucket is named exactly `documents` (lowercase, no spaces)

### "Policy violation" error
→ Check that all 3 storage policies are created and enabled (green toggle)

### "Table does not exist" error
→ Run the database migration again from Step 1

### Files not appearing
→ Check browser console (F12) for errors
→ Make sure you're logged in
→ Verify RLS policies are enabled on the `documents` table

---

**Total time: ~5 minutes** ⏱️

Once set up, this works for all your teammates automatically! 🎉

