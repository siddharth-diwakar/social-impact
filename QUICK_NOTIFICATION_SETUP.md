# Quick Notification Setup Guide

## ⚡ 5-Minute Setup

### Step 1: Run Database Migration (1 minute)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"SQL Editor"** → **"New query"**
4. Open `supabase/migrations/008_add_notification_system.sql`
5. Copy **entire contents** → Paste → Click **"Run"**
6. ✅ Done! You should see "Success. No rows returned"

### Step 2: Set Up Email Service - Resend (2 minutes)

1. Go to [Resend](https://resend.com) and sign up (free)
2. Verify your email
3. Go to **API Keys** → **Create API Key**
4. Copy the API key (starts with `re_`)
5. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```

### Step 3: Generate Cron Secret (30 seconds)

The cron secret is already generated for you in `.env.example`:
```env
CRON_SECRET=dfd3ae4fd828b3f7a7ea67892d5bf7c9c48f809d7e6ae3ba6e9984550e5fd2ee
```

Just copy this to your `.env.local` file.

Or run the setup script:
```bash
node scripts/setup-notifications.js
```

### Step 4: Update .env.local (1 minute)

Copy `.env.example` to `.env.local` (if you haven't already):
```bash
cp .env.example .env.local
```

Then update these values:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `RESEND_API_KEY` - From Step 2
- `CRON_SECRET` - From Step 3 (already in .env.example)
- `NEXT_PUBLIC_APP_URL` - Your app URL (http://localhost:3000 for dev)

### Step 5: Test It! (30 seconds)

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to `/Profile` → **Preferences** tab

3. Configure notification preferences:
   - Enable email notifications
   - Set your email address
   - Choose reminder timing (30, 14, 7, 1 days)
   - Save preferences

4. Create a test document with expiration date set to tomorrow

5. Test the cron job manually:
   ```bash
   curl -X GET "http://localhost:3000/api/cron/deadline-reminders" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

6. Check your email inbox! 📧

---

## ✅ That's It!

The notification system is now set up! 

- **Deadline reminders** will be sent automatically (30, 14, 7, 1 days before)
- **Weekly digests** will be sent every Monday at 9 AM UTC
- Users can configure preferences in their Profile

---

## 📱 Optional: SMS Notifications

If you want SMS notifications too:

1. Sign up at [Twilio](https://www.twilio.com) (free $15.50 credit)
2. Get your Account SID and Auth Token
3. Buy a phone number (or use trial number for testing)
4. Add to `.env.local`:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

5. Enable SMS in user notification preferences!

---

## 🚀 Deploy to Vercel

If deploying to Vercel:

1. Add all environment variables to Vercel dashboard
2. `vercel.json` is already configured with cron jobs
3. Cron jobs will run automatically:
   - Daily at 9 AM UTC (deadline reminders)
   - Every Monday at 9 AM UTC (weekly digest)

---

## 🆘 Troubleshooting

**Emails not sending?**
- Check `RESEND_API_KEY` is correct
- Check Resend dashboard for errors
- Verify email address in notification preferences

**Cron jobs not running?**
- Check `CRON_SECRET` matches in environment variables
- Verify cron schedule in `vercel.json`
- Check server logs for errors

**Need help?**
- See `NOTIFICATION_SETUP.md` for detailed instructions
- Check `NOTIFICATION_FEATURE_SUMMARY.md` for feature overview

---

**Total time: ~5 minutes** ⏱️

