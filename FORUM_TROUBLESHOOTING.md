# Forum System Troubleshooting

## Issue: "Failed to create post"

### Step 1: Check if Migration Was Run

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor**
3. Look for these tables:
   - `forum_posts`
   - `forum_replies`
   - `forum_likes`
   - `forum_bookmarks`
   - `forum_follows`

**If these tables don't exist**, you need to run the migration:

1. Go to **SQL Editor** in Supabase
2. Click **"New query"**
3. Open `supabase/migrations/009_add_forum_system.sql`
4. Copy the entire file contents
5. Paste into SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. Wait for success message

### Step 2: Check Browser Console for Detailed Error

After the improved error handling, you should now see more details:

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try creating a post again
4. Look for error messages that show:
   - `details`: The actual database error
   - `code`: Error code (e.g., "42P01" = table doesn't exist)
   - `hint`: Helpful hint from PostgreSQL

### Step 3: Common Error Codes

- **42P01**: Table doesn't exist → Run migration
- **42501**: Permission denied → Check RLS policies
- **23503**: Foreign key violation → Check user authentication
- **23505**: Unique constraint violation → Duplicate entry

### Step 4: Verify RLS Policies

1. In Supabase Dashboard, go to **Authentication** → **Policies**
2. Or go to **Table Editor** → Select `forum_posts` → **Policies** tab
3. Verify these policies exist:
   - "Anyone can view published posts"
   - "Users can create their own posts"
   - "Users can update their own posts"
   - "Users can delete their own posts"

### Step 5: Check Authentication

Make sure you're logged in:
1. Check if you see your profile in the top right
2. Try logging out and back in
3. Verify your session is valid

### Step 6: Test Database Connection

Run this in Supabase SQL Editor to test:

```sql
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'forum_posts'
);

-- Check if you can insert (replace YOUR_USER_ID with actual UUID)
INSERT INTO forum_posts (user_id, title, content, status)
VALUES ('YOUR_USER_ID', 'Test', 'Test content', 'published')
RETURNING id;
```

### Step 7: Check Server Logs

If running locally:
1. Check your terminal where `npm run dev` is running
2. Look for error messages starting with "Error creating post:"
3. The error should show the actual database error

## Quick Fix Checklist

- [ ] Migration `009_add_forum_system.sql` has been run
- [ ] All 5 forum tables exist in Supabase
- [ ] RLS policies are enabled on all tables
- [ ] You are logged in
- [ ] Browser console shows detailed error (check it!)
- [ ] Server logs show detailed error (check terminal!)

## Still Not Working?

Share the error details from:
1. Browser console (F12 → Console)
2. Server terminal output
3. The `details`, `code`, and `hint` fields from the error response

This will help identify the exact issue!

