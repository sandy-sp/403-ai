# Vercel Deployment Fix - Cron Jobs

## Issue
Vercel Hobby accounts are limited to daily cron jobs, but the original configuration had a cron job running every minute (`* * * * *`).

## Solution
Combined both cron jobs into a single daily maintenance job:

### Before (2 cron jobs)
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "* * * * *"  // Every minute - NOT ALLOWED on Hobby
    },
    {
      "path": "/api/cron/cleanup-tokens", 
      "schedule": "0 0 * * *"  // Daily at midnight
    }
  ]
}
```

### After (1 cron job)
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-maintenance",
      "schedule": "0 0 * * *"  // Daily at midnight
    }
  ]
}
```

## What Changed

1. **Combined Functionality**: The new `/api/cron/daily-maintenance` endpoint handles both:
   - Publishing scheduled posts
   - Cleaning up expired password reset tokens

2. **Scheduling Impact**: 
   - **Before**: Posts could be published every minute
   - **After**: Posts are published once daily at midnight
   - **Impact**: For most blogs, daily publishing is sufficient. If you need more frequent publishing, consider upgrading to Vercel Pro.

3. **Benefits**:
   - ✅ Compatible with Vercel Hobby accounts
   - ✅ Reduced server load
   - ✅ Simplified maintenance
   - ✅ Combined error handling

## Environment Variables
Make sure you have the `CRON_SECRET` environment variable set in your Vercel deployment for security.

## Testing
You can test the cron job locally by calling:
```bash
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/daily-maintenance
```

## Alternative Solutions
If you need more frequent scheduled publishing:

1. **Upgrade to Vercel Pro**: Allows more frequent cron jobs
2. **Use External Cron**: Set up an external service to call your API
3. **Manual Publishing**: Use the admin interface to publish posts manually
4. **Client-Side Scheduling**: Implement browser-based scheduling (less reliable)