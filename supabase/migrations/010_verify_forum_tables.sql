-- VERIFICATION SCRIPT: Check if forum tables exist
-- Run this FIRST in Supabase SQL Editor to verify migration was successful

-- Check if tables exist
SELECT 
  'Tables Check' as check_type,
  COUNT(*) as count,
  string_agg(table_name, ', ') as tables_found
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'forum_%';

-- Detailed table list
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'forum_posts' THEN '✓ Main posts table'
    WHEN table_name = 'forum_replies' THEN '✓ Replies table'
    WHEN table_name = 'forum_likes' THEN '✓ Likes table'
    WHEN table_name = 'forum_bookmarks' THEN '✓ Bookmarks table'
    WHEN table_name = 'forum_follows' THEN '✓ Follows table'
    ELSE '? Unknown table'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'forum_%'
ORDER BY table_name;

-- Check RLS policies
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename LIKE 'forum_%'
GROUP BY tablename
ORDER BY tablename;

-- Expected result: 5 tables, each with multiple policies
