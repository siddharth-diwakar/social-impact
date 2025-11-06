-- Migration: Add onboarding tracking
-- Create onboarding table to store user onboarding progress and preferences

CREATE TABLE IF NOT EXISTS public.onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  completed boolean DEFAULT false NOT NULL,
  current_step integer DEFAULT 0 NOT NULL,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own onboarding data
CREATE POLICY "Users can view their own onboarding" ON public.onboarding
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own onboarding data
CREATE POLICY "Users can insert their own onboarding" ON public.onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own onboarding data
CREATE POLICY "Users can update their own onboarding" ON public.onboarding
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS onboarding_user_id_idx ON public.onboarding(user_id);
CREATE INDEX IF NOT EXISTS onboarding_completed_idx ON public.onboarding(completed);

