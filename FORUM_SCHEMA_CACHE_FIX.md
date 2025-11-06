# Fix: Schema Cache Issue - Forum Tables Not Found

## Quick Fix Steps

### Step 1: Verify Migration Was Run

Run this in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'forum_%';
```

**Expected Result:** Should show 5 tables:
- forum_posts
- forum_replies
- forum_likes
- forum_bookmarks
- forum_follows

**If you see 0 rows:** The migration wasn't run. Go to Step 2.

**If you see 5 tables:** The migration was successful. Go to Step 3.

### Step 2: Run the Migration (If Tables Don't Exist)

1. Go to Supabase Dashboard → SQL Editor
2. Click "New query"
3. Open `supabase/migrations/009_add_forum_system.sql`
4. Copy the ENTIRE file contents
5. Paste into SQL Editor
6. Click "Run" (Ctrl+Enter)
7. Wait for "Success" message

### Step 3: Force Schema Cache Refresh

After running the migration, Supabase needs to refresh its schema cache. Try these methods:

#### Method 1: Wait and Restart
1. Wait 30-60 seconds after running migration
2. Restart your Next.js dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```
3. Hard refresh browser (Ctrl+Shift+R)

#### Method 2: Force Cache Refresh via API
Run this in Supabase SQL Editor to force a schema refresh:

```sql
-- This will force Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';
```

#### Method 3: Check Supabase Project Settings
1. Go to Supabase Dashboard
2. Settings → API
3. Check if "Schema Cache" or "Auto-refresh" is enabled
4. If available, click "Refresh Schema Cache"

### Step 4: Verify Connection

Check your `.env.local` file has the correct Supabase URL:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Make sure you're using the correct project (not a different Supabase project).

### Step 5: Test Direct Database Access

Run this in Supabase SQL Editor to test if you can insert:

```sql
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
INSERT INTO public.forum_posts (
  user_id, 
  title, 
  content, 
  status
) VALUES (
  'YOUR_USER_ID'::uuid,
  'Test Post',
  'This is a test',
  'published'
) RETURNING id;
```

If this works, the table exists and the issue is with the API connection.

### Step 6: Check RLS Policies

Verify RLS policies exist:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'forum_posts';
```

Should show 4 policies:
- "Anyone can view published posts"
- "Users can create their own posts"
- "Users can update their own posts"
- "Users can delete their own posts"

## Still Not Working?

If tables exist but you still get the error:

1. **Check Supabase Dashboard → Table Editor**
   - Can you see `forum_posts` table?
   - If yes, the table exists
   - If no, migration didn't run

2. **Check Browser Console**
   - Open DevTools (F12)
   - Look for the detailed error message
   - Share the full error

3. **Check Server Logs**
   - Look at your terminal where `npm run dev` is running
   - Share any error messages

4. **Try Different Approach**
   - Log out and log back in
   - Clear browser cookies for localhost
   - Try in incognito/private window

## Common Issues

### Issue: Wrong Supabase Project
- Make sure `.env.local` points to the correct project
- Check Supabase Dashboard URL matches your env vars

### Issue: Migration Partially Run
- Some tables created but not all
- Run the migration again (it uses `IF NOT EXISTS` so it's safe)

### Issue: Schema Cache Stale
- Supabase caches schema for performance
- Can take 1-2 minutes to refresh after migration
- Restart dev server to force refresh

