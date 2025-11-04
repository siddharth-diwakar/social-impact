# Calendar Sync Fixes

This document explains the fixes for the calendar sync issues.

## Issue 1: Incorrect Dates (One Day Off)

**Problem:** Dates were showing one day earlier than expected (e.g., November 9th showed as November 8th).

**Root Cause:** When dates were stored in the database as UTC timestamps (e.g., `2024-11-09T00:00:00Z`), converting them to local time for calendar events could shift the date backward by one day in timezones behind UTC.

**Solution:** 
- Changed from using `dateTime` (timed events) to `date` (all-day events)
- Extract the date part directly from the ISO string (`YYYY-MM-DD`) without timezone conversion
- This ensures the date matches exactly what was stored in the database

**Code Changes:**
- Parse date string and extract date part: `deadline.expiration_date.split("T")[0]`
- Use `date` instead of `dateTime` in calendar event creation
- All-day events show the correct date regardless of timezone

## Issue 2: Duplicate Events on Re-sync

**Problem:** Each time the sync button was clicked, new events were created, resulting in duplicates.

**Root Cause:** The code didn't check if events already existed before creating new ones.

**Solution:**
- Added `calendar_event_id` column to the `documents` table to store Google Calendar event IDs
- Check if an event already exists before creating a new one
- If event exists, update it instead of creating a duplicate
- If event doesn't exist (was deleted), create a new one and store its ID

**Code Changes:**
1. **Database Migration:** Added `calendar_event_id` column to `documents` table
2. **Sync Logic:**
   - Fetch `calendar_event_id` from database for each document
   - If `calendar_event_id` exists, try to get the event from Google Calendar
   - If event exists, update it with current data
   - If event doesn't exist, create a new one and store its ID
   - Store the new event ID in the database for future syncs

## Database Migration Required

Run the following migration in your Supabase SQL Editor:

```sql
-- Add calendar_event_id column to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS calendar_event_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS documents_calendar_event_id_idx ON public.documents(calendar_event_id) WHERE calendar_event_id IS NOT NULL;
```

Or run the migration file: `supabase/migrations/006_add_calendar_event_id.sql`

## How It Works Now

1. **First Sync:**
   - Creates all-day events for documents with expiration dates
   - Stores Google Calendar event IDs in the database
   - Dates match exactly what was set in the UI

2. **Subsequent Syncs:**
   - Checks if events already exist using stored event IDs
   - Updates existing events if they exist
   - Creates new events only if old ones were deleted
   - No duplicates are created

3. **Date Handling:**
   - All events are created as all-day events
   - Dates are extracted directly from the database timestamp without timezone conversion
   - Dates display correctly regardless of user's timezone

## Testing

1. **Test Date Accuracy:**
   - Set a document expiration date to November 9th
   - Sync to calendar
   - Verify the event shows as November 9th (not November 8th)

2. **Test Duplicate Prevention:**
   - Sync calendar once
   - Sync calendar again
   - Verify no duplicate events are created
   - Verify existing events are updated (if dates changed)

