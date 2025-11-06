# Notification System Setup Guide

This guide will help you set up the deadline reminder and weekly digest notification system.

## Overview

The notification system provides:
- **Deadline Reminders**: Email/SMS reminders 30 days, 14 days, 7 days, and 1 day before document expiration dates
- **Weekly Digests**: Personalized weekly email summaries with upcoming deadlines and compliance updates

## Prerequisites

1. **Database Migration**: Run the notification system migration
2. **Email Service**: Set up Resend (or another email service)
3. **SMS Service**: Set up Twilio (optional, for SMS notifications)
4. **Cron Jobs**: Configure scheduled tasks to run daily and weekly

---

## Step 1: Database Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Open `supabase/migrations/008_add_notification_system.sql`
4. Copy and paste the entire contents into the SQL Editor
5. Click **Run**

This will create:
- `notification_preferences` table - Stores user notification settings
- `notification_history` table - Tracks sent notifications
- RLS policies for security

---

## Step 2: Email Service Setup (Resend)

1. **Create a Resend account**
   - Go to [Resend](https://resend.com)
   - Sign up for a free account
   - Verify your email address

2. **Get your API key**
   - Go to **API Keys** in the Resend dashboard
   - Click **Create API Key**
   - Name it (e.g., "compl.io Production")
   - Copy the API key

3. **Configure domain (for production)**
   - Add your domain in Resend dashboard
   - Follow DNS verification steps
   - For development, you can use the default sender

4. **Add to environment variables**
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```

---

## Step 3: SMS Service Setup (Twilio - Optional)

1. **Create a Twilio account**
   - Go to [Twilio](https://www.twilio.com)
   - Sign up for a free account (includes $15.50 credit)

2. **Get your credentials**
   - Go to **Console** → **Account** → **API Keys & Tokens**
   - Copy your **Account SID** and **Auth Token**
   - Go to **Phone Numbers** → **Manage** → **Buy a number**
   - Purchase a phone number (or use a trial number for testing)

3. **Add to environment variables**
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number in E.164 format
   ```

**Note**: SMS is optional. The system works fine with email only.

---

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Email Service (Required)
RESEND_API_KEY=re_your_api_key_here

# SMS Service (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cron Job Security
CRON_SECRET=your_random_secret_string_here  # Generate a strong random string

# App URL (Required)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Use your production URL in production
```

**Generate CRON_SECRET**:
```bash
# On Linux/Mac
openssl rand -hex 32

# Or use any random string generator
```

---

## Step 5: Set Up Cron Jobs

### Option A: Vercel Cron Jobs (Recommended)

If you're deploying on Vercel, create a `vercel.json` file in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/deadline-reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

This sets:
- **Deadline reminders**: Daily at 9 AM UTC
- **Weekly digest**: Every Monday at 9 AM UTC

**Important**: Add the `CRON_SECRET` to your Vercel environment variables.

### Option B: External Cron Service

If you're not using Vercel, use an external cron service:

1. **Cron-job.org** or **EasyCron**
   - Create a new cron job
   - Set URL: `https://yourdomain.com/api/cron/deadline-reminders`
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: Daily at your preferred time

2. **GitHub Actions** (if using GitHub)
   - Create `.github/workflows/cron.yml`
   - Use `schedule` trigger

3. **Supabase Edge Functions** (Alternative)
   - Create Supabase Edge Functions
   - Schedule with pg_cron

---

## Step 6: Test the System

### Test Deadline Reminders

1. **Create a test document with expiration date**
   - Go to `/Documents`
   - Upload a test document
   - Set expiration date to tomorrow (or 1 day, 7 days, 14 days, or 30 days from now)

2. **Configure notification preferences**
   - Go to `/Profile`
   - Scroll to Notification Preferences
   - Enable email notifications
   - Enable the reminder timeframes you want to test

3. **Trigger the cron job manually** (for testing)
   ```bash
   curl -X GET "http://localhost:3000/api/cron/deadline-reminders" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### Test Weekly Digest

1. **Configure weekly digest preferences**
   - Go to `/Profile`
   - Enable weekly digest
   - Set your preferred day and time

2. **Trigger the cron job manually**
   ```bash
   curl -X GET "http://localhost:3000/api/cron/weekly-digest" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

---

## Step 7: Add Notification Preferences to Profile Page

Update your Profile page to include the notification preferences component:

```tsx
import { NotificationPreferences } from "@/components/notification-preferences";

// In your Profile page component:
<NotificationPreferences 
  userEmail={user.email} 
  userPhone={userMetadata?.phone} 
/>
```

---

## Troubleshooting

### Emails not sending

1. **Check Resend API key**
   - Verify `RESEND_API_KEY` is set correctly
   - Check Resend dashboard for errors

2. **Check domain verification** (for production)
   - Ensure domain is verified in Resend
   - Check DNS records

3. **Check logs**
   - Look for errors in server logs
   - Check notification_history table for failed sends

### SMS not sending

1. **Check Twilio credentials**
   - Verify all three environment variables are set
   - Check Twilio dashboard for account status

2. **Check phone number format**
   - Must be in E.164 format: +1234567890
   - Include country code

3. **Check Twilio balance**
   - Ensure account has sufficient credits

### Cron jobs not running

1. **Check CRON_SECRET**
   - Verify it matches in both cron service and environment variables
   - Check authorization header

2. **Check cron schedule**
   - Verify cron schedule syntax
   - Check timezone settings

3. **Check logs**
   - Look for cron job execution logs
   - Check for errors in API routes

### Users not receiving notifications

1. **Check notification preferences**
   - Verify user has enabled notifications
   - Check email/SMS addresses are correct

2. **Check document expiration dates**
   - Ensure documents have expiration_date set
   - Verify dates are in the future

3. **Check notification history**
   - Query `notification_history` table
   - Look for failed notifications

---

## API Endpoints

### Notification Preferences
- `GET /api/notifications/preferences` - Get user preferences
- `POST /api/notifications/preferences` - Update preferences

### Cron Jobs (Protected)
- `GET /api/cron/deadline-reminders` - Send deadline reminders
- `GET /api/cron/weekly-digest` - Send weekly digests

Both cron endpoints require `Authorization: Bearer CRON_SECRET` header.

---

## Security Notes

1. **Cron Secret**: Never commit `CRON_SECRET` to version control
2. **RLS Policies**: Ensure Row Level Security is enabled on all tables
3. **Rate Limiting**: Consider adding rate limiting to cron endpoints
4. **Email Validation**: Validate email addresses before sending
5. **Phone Validation**: Validate phone numbers (E.164 format) before sending SMS

---

## Next Steps

1. Customize email templates in `lib/email-service.ts`
2. Add more compliance update sources for weekly digests
3. Add notification preferences UI to onboarding flow
4. Add notification history viewing in profile
5. Add unsubscribe functionality
6. Add notification analytics

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs
3. Check notification_history table for errors
4. Verify all environment variables are set correctly

