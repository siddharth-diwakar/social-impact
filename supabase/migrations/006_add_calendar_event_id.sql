-- Add calendar_event_id column to documents table
-- This stores the Google Calendar event ID for each document deadline
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS calendar_event_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS documents_calendar_event_id_idx ON public.documents(calendar_event_id) WHERE calendar_event_id IS NOT NULL;

