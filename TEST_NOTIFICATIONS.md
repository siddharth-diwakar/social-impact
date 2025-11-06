# Testing Email Notifications

## Issue Found

The cron endpoint `/api/cron/deadline-reminders` is returning a 404. This is likely because:

1. **Next.js dev server needs restart** - New API routes sometimes require a server restart
2. **Route file exists** - The file is at `app/api/cron/deadline-reminders/route.ts` ✅

## Solution

### Step 1: Restart the Dev Server

1. Stop the current dev server (Ctrl+C in the terminal running `npm run dev`)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 2: Verify Database Migration

Make sure you've run the database migration:
- Go to Supabase Dashboard → SQL Editor
- Run `supabase/migrations/008_add_notification_system.sql`

### Step 3: Test the Endpoint

Once the server is restarted, test the endpoint:

**Using PowerShell:**
```powershell
$headers = @{ "Authorization" = "Bearer bc8f441c0a540720419376b96ec9c3a53a21201e76fa3cb4a24eb5d9735176bc" }
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/deadline-reminders" -Method GET -Headers $headers
```

**Using curl (if available):**
```bash
curl -X GET "http://localhost:3000/api/cron/deadline-reminders" \
  -H "Authorization: Bearer bc8f441c0a540720419376b96ec9c3a53a21201e76fa3cb4a24eb5d9735176bc"
```

### Step 4: Check for Test Data

For the cron to send emails, you need:
1. A document with an `expiration_date` set
2. User notification preferences configured
3. The expiration date should be within 30, 14, 7, or 1 day from now

### Alternative: Test via Browser

You can also test by visiting the endpoint directly in your browser (after restarting the server):
- http://localhost:3000/api/cron/deadline-reminders?auth=bc8f441c0a540720419376b96ec9c3a53a21201e76fa3cb4a24eb5d9735176bc

**Note:** The route expects the Authorization header, so browser testing might not work. Use the PowerShell command above instead.

## Expected Response

When working correctly, you should see:
```json
{
  "success": true,
  "totalSent": 0,
  "errors": []
}
```

If there are documents with expiration dates, `totalSent` will show how many notifications were sent.

## Troubleshooting

1. **404 Error**: Server needs restart
2. **401 Unauthorized**: Check CRON_SECRET in .env.local matches
3. **500 Error**: Check server logs for details
4. **No emails sent**: 
   - Verify RESEND_API_KEY is set
   - Check notification preferences are enabled
   - Ensure documents have expiration_date set
   - Check notification_history table in Supabase

