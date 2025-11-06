-- Migration: Add forum/community system
-- Creates tables for posts, replies, likes, bookmarks, and follows

-- ============================================
-- PART 1: FORUM POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Post content
  title text NOT NULL,
  content text NOT NULL,
  
  -- Post metadata
  industry text,
  business_model text,
  customer_demographic text,
  weekly_customers text,
  
  -- Post status
  status text DEFAULT 'published' NOT NULL, -- 'published', 'draft', 'archived'
  
  -- Engagement metrics (denormalized for performance)
  reply_count integer DEFAULT 0 NOT NULL,
  like_count integer DEFAULT 0 NOT NULL,
  view_count integer DEFAULT 0 NOT NULL,
  
  -- Board/category
  board text, -- e.g., "Growth Experiments", "Local Collaborations", "Operations & Logistics"
  
  -- Images (stored as array of file paths)
  images text[] DEFAULT ARRAY[]::text[],
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_activity_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for forum_posts
CREATE INDEX IF NOT EXISTS forum_posts_user_id_idx ON public.forum_posts(user_id);
CREATE INDEX IF NOT EXISTS forum_posts_status_idx ON public.forum_posts(status);
CREATE INDEX IF NOT EXISTS forum_posts_board_idx ON public.forum_posts(board);
CREATE INDEX IF NOT EXISTS forum_posts_created_at_idx ON public.forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS forum_posts_last_activity_idx ON public.forum_posts(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS forum_posts_industry_idx ON public.forum_posts(industry);
CREATE INDEX IF NOT EXISTS forum_posts_business_model_idx ON public.forum_posts(business_model);

-- Full-text search index
CREATE INDEX IF NOT EXISTS forum_posts_search_idx ON public.forum_posts USING gin(to_tsvector('english', title || ' ' || content));

-- Enable Row Level Security
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_posts
CREATE POLICY "Anyone can view published posts"
  ON public.forum_posts
  FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own posts"
  ON public.forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.forum_posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.forum_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 2: FORUM REPLIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_reply_id uuid REFERENCES public.forum_replies(id) ON DELETE CASCADE, -- For nested replies
  
  -- Reply content
  content text NOT NULL,
  
  -- Status
  status text DEFAULT 'published' NOT NULL, -- 'published', 'deleted'
  
  -- Engagement metrics
  like_count integer DEFAULT 0 NOT NULL,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for forum_replies
CREATE INDEX IF NOT EXISTS forum_replies_post_id_idx ON public.forum_replies(post_id);
CREATE INDEX IF NOT EXISTS forum_replies_user_id_idx ON public.forum_replies(user_id);
CREATE INDEX IF NOT EXISTS forum_replies_parent_reply_id_idx ON public.forum_replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS forum_replies_created_at_idx ON public.forum_replies(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_replies
CREATE POLICY "Anyone can view published replies"
  ON public.forum_replies
  FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own replies"
  ON public.forum_replies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies"
  ON public.forum_replies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
  ON public.forum_replies
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 3: FORUM LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure user can only like a post OR reply, not both
  CONSTRAINT forum_likes_post_or_reply CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR
    (post_id IS NULL AND reply_id IS NOT NULL)
  ),
  
  -- Ensure user can only like once
  CONSTRAINT forum_likes_unique_user_post UNIQUE (user_id, post_id),
  CONSTRAINT forum_likes_unique_user_reply UNIQUE (user_id, reply_id)
);

-- Create indexes for forum_likes
CREATE INDEX IF NOT EXISTS forum_likes_user_id_idx ON public.forum_likes(user_id);
CREATE INDEX IF NOT EXISTS forum_likes_post_id_idx ON public.forum_likes(post_id);
CREATE INDEX IF NOT EXISTS forum_likes_reply_id_idx ON public.forum_likes(reply_id);

-- Enable Row Level Security
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_likes
CREATE POLICY "Users can view all likes"
  ON public.forum_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own likes"
  ON public.forum_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.forum_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 4: FORUM BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure user can only bookmark once
  CONSTRAINT forum_bookmarks_unique_user_post UNIQUE (user_id, post_id)
);

-- Create indexes for forum_bookmarks
CREATE INDEX IF NOT EXISTS forum_bookmarks_user_id_idx ON public.forum_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS forum_bookmarks_post_id_idx ON public.forum_bookmarks(post_id);

-- Enable Row Level Security
ALTER TABLE public.forum_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON public.forum_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON public.forum_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.forum_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 5: FORUM FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Prevent self-following
  CONSTRAINT forum_follows_no_self_follow CHECK (follower_id != following_id),
  
  -- Ensure unique follow relationship
  CONSTRAINT forum_follows_unique UNIQUE (follower_id, following_id)
);

-- Create indexes for forum_follows
CREATE INDEX IF NOT EXISTS forum_follows_follower_id_idx ON public.forum_follows(follower_id);
CREATE INDEX IF NOT EXISTS forum_follows_following_id_idx ON public.forum_follows(following_id);

-- Enable Row Level Security
ALTER TABLE public.forum_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_follows
CREATE POLICY "Users can view all follows"
  ON public.forum_follows
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own follows"
  ON public.forum_follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON public.forum_follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================
-- PART 6: FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update post reply_count when replies are added/deleted
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts
    SET reply_count = reply_count + 1,
        last_activity_at = NEW.created_at
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reply count
CREATE TRIGGER update_post_reply_count_trigger
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reply_count();

-- Function to update post/reply like_count when likes are added/deleted
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.forum_posts
      SET like_count = like_count + 1
      WHERE id = NEW.post_id;
    ELSIF NEW.reply_id IS NOT NULL THEN
      UPDATE public.forum_replies
      SET like_count = like_count + 1
      WHERE id = NEW.reply_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.forum_posts
      SET like_count = GREATEST(0, like_count - 1)
      WHERE id = OLD.post_id;
    ELSIF OLD.reply_id IS NOT NULL THEN
      UPDATE public.forum_replies
      SET like_count = GREATEST(0, like_count - 1)
      WHERE id = OLD.reply_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like count
CREATE TRIGGER update_like_count_trigger
  AFTER INSERT OR DELETE ON public.forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_like_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at
  BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

