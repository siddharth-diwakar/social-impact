-- Migration: Add notification system for deadline reminders and weekly digests
-- Creates tables for notification preferences and tracking sent notifications

-- ============================================
-- PART 1: NOTIFICATION PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  -- Email settings
  email_enabled boolean DEFAULT true NOT NULL,
  email_address text, -- Override default email if needed
  
  -- SMS settings
  sms_enabled boolean DEFAULT false NOT NULL,
  phone_number text, -- Phone number for SMS (E.164 format)
  
  -- Reminder preferences
  reminder_30_days boolean DEFAULT true NOT NULL,
  reminder_14_days boolean DEFAULT true NOT NULL,
  reminder_7_days boolean DEFAULT true NOT NULL,
  reminder_1_day boolean DEFAULT true NOT NULL,
  
  -- Weekly digest settings
  weekly_digest_enabled boolean DEFAULT true NOT NULL,
  weekly_digest_day integer DEFAULT 1, -- 0 = Sunday, 1 = Monday, etc.
  weekly_digest_time time DEFAULT '09:00:00' NOT NULL, -- Default 9 AM
  
  -- Notification channels for reminders
  reminder_channels text[] DEFAULT ARRAY['email']::text[], -- Array: 'email', 'sms', or both
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS notification_preferences_user_id_idx ON public.notification_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 2: NOTIFICATION HISTORY TABLE
-- ============================================
-- Tracks sent notifications to prevent duplicates and for audit purposes
CREATE TABLE IF NOT EXISTS public.notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL, -- 'deadline_reminder', 'weekly_digest'
  channel text NOT NULL, -- 'email', 'sms'
  recipient text NOT NULL, -- email or phone number
  subject text, -- For emails
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL, -- For deadline reminders
  deadline_date timestamp with time zone, -- The deadline being reminded about
  reminder_days_before integer, -- 30, 14, 7, or 1
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  status text DEFAULT 'sent' NOT NULL, -- 'sent', 'failed', 'pending'
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb -- Additional data about the notification
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS notification_history_user_id_idx ON public.notification_history(user_id);
CREATE INDEX IF NOT EXISTS notification_history_type_idx ON public.notification_history(notification_type);
CREATE INDEX IF NOT EXISTS notification_history_sent_at_idx ON public.notification_history(sent_at);
CREATE INDEX IF NOT EXISTS notification_history_document_id_idx ON public.notification_history(document_id);
CREATE INDEX IF NOT EXISTS notification_history_deadline_date_idx ON public.notification_history(deadline_date);

-- Enable Row Level Security
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_history
CREATE POLICY "Users can view their own notification history"
  ON public.notification_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- PART 3: FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

