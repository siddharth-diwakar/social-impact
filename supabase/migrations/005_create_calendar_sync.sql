-- Create calendar_sync table to store Google Calendar OAuth tokens
CREATE TABLE IF NOT EXISTS public.calendar_sync (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  access_token text NOT NULL,
  refresh_token text,
  token_expiry timestamp with time zone,
  calendar_id text,
  calendar_name text,
  synced_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.calendar_sync ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own calendar sync
CREATE POLICY "Users can view their own calendar sync" ON public.calendar_sync
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own calendar sync
CREATE POLICY "Users can insert their own calendar sync" ON public.calendar_sync
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own calendar sync
CREATE POLICY "Users can update their own calendar sync" ON public.calendar_sync
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own calendar sync
CREATE POLICY "Users can delete their own calendar sync" ON public.calendar_sync
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS calendar_sync_user_id_idx ON public.calendar_sync(user_id);

