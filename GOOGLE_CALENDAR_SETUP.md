# Google Calendar Sync Setup Guide

This guide will help you set up Google Calendar integration for your application.

## Prerequisites

1. A Google Cloud Platform (GCP) project
2. Google Calendar API enabled
3. OAuth 2.0 credentials configured

## Step 1: Enable Google Calendar API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google Calendar API"
5. Click on it and click **Enable**

## Step 2: Create OAuth 2.0 Credentials

1. In the Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for testing) or **Internal** (for G Suite)
   - App name: Your app name
   - User support email: Your email
   - Developer contact information: Your email
   - Click **Save and Continue**
   - Add scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
   - Click **Save and Continue**
4. **IMPORTANT: Add Test Users** (if using External user type):
   - After configuring scopes, you'll see a "Test users" section
   - Click **"Add Users"** or **"+ ADD USERS"**
   - Add your Google account email(s) that will use the app (e.g., `Ved.Puranik@gmail.com`)
   - Click **Add**
   - Click **Save and Continue**
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Your app name (e.g., "Compl.io Calendar Sync")
   - Authorized JavaScript origins:
     - `http://localhost:3001` (or your dev URL)
     - `https://yourdomain.com` (your production URL)
   - Authorized redirect URIs:
     - `http://localhost:3001/api/calendar/callback` (or your dev URL)
     - `https://yourdomain.com/api/calendar/callback` (your production URL)
   - Click **Create**
5. Copy the **Client ID** and **Client Secret**

## Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Google Calendar OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# App URL (for OAuth redirect)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

For production, also update `NEXT_PUBLIC_APP_URL` to your production domain.

## Step 4: Run Database Migration

Run the migration to create the `calendar_sync` table:

```sql
-- Run this in your Supabase SQL Editor or via migration
-- File: supabase/migrations/005_create_calendar_sync.sql
```

Or run the SQL directly in Supabase Dashboard > SQL Editor.

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your homepage
3. In the "Upcoming deadlines" card, click **Sync with calendar**
4. You'll be redirected to Google to authorize the app
5. After authorization, you'll be redirected back
6. You should see "Connected to Primary Calendar"
7. Click **Sync deadlines** to sync your deadlines to Google Calendar

## How It Works

1. **Connection**: When a user clicks "Sync with calendar", they're redirected to Google OAuth
2. **Authorization**: User authorizes the app to access their Google Calendar
3. **Token Storage**: OAuth tokens are securely stored in the `calendar_sync` table
4. **Sync**: When syncing, the app:
   - Fetches upcoming deadlines from your `documents` table
   - Creates calendar events for each deadline
   - Sets reminders (1 day before via email, 1 hour before via popup)

## Security Notes

- OAuth tokens are stored encrypted in the database
- Row Level Security (RLS) ensures users can only access their own tokens
- Tokens are automatically refreshed when expired
- Users can disconnect their calendar at any time

## Troubleshooting

### "Bucket not found" error
- This is unrelated to calendar sync - it's about the avatars storage bucket
- Run the avatar bucket migration: `supabase/migrations/004_create_avatars_bucket.sql`

### OAuth redirect errors
- Ensure redirect URIs in Google Cloud Console match exactly (including trailing slashes)
- Check that `NEXT_PUBLIC_APP_URL` matches your actual URL

### Token refresh errors
- If tokens fail to refresh, users need to reconnect their calendar
- This can happen if the refresh token is revoked or expires

### Calendar events not appearing
- Check that the user has write access to the calendar
- Verify that deadlines have valid `expiration_date` values
- Check browser console and server logs for errors

## API Endpoints

- `GET /api/calendar/auth?action=connect` - Initiate OAuth flow
- `GET /api/calendar/auth?action=disconnect` - Disconnect calendar
- `GET /api/calendar/callback` - OAuth callback handler
- `GET /api/calendar/status` - Get calendar connection status
- `POST /api/calendar/sync` - Sync deadlines to calendar

