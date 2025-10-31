# 🚀 Quick Deploy - 403 AI

## One-Command Deployment

```bash
# Set your Vercel credentials (optional but recommended)
export VERCEL_TOKEN="your_vercel_token"
export VERCEL_PROJECT_ID="your_project_id"

# Set your database URL
export DATABASE_URL="your_database_url"

# Run automated setup
npm run deploy:setup

# Deploy
vercel --prod
```

---

## Manual 5-Minute Setup

### 1. Generate Secrets (30 seconds)

```bash
openssl rand -base64 32  # Copy for NEXTAUTH_SECRET
openssl rand -base64 32  # Copy for CRON_SECRET
```

### 2. Add to Vercel (2 minutes)

Go to Vercel → Your Project → Settings → Environment Variables

Add these 10 variables:
- `DATABASE_URL` - Your PostgreSQL URL
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Generated above
- `CRON_SECRET` - Generated above
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`

### 3. Deploy (2 minutes)

```bash
git push origin main
```

Or:

```bash
vercel --prod
```

### 4. Create Admin User (30 seconds)

Sign up at `/signup`, then run in your database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Verification Checklist

After deployment:

```bash
# Check your site
curl https://your-domain.vercel.app

# Test admin login
# Visit: https://your-domain.vercel.app/signin

# Create a test post
# Visit: https://your-domain.vercel.app/admin/posts/new
```

---

## Troubleshooting

### Build fails?
```bash
npm run type-check
npm run build
```

### Database issues?
```bash
npm run deploy:check-db
```

### Need full check?
```bash
npm run deploy:pre-check
```

---

## Get Help

- Full guide: `DEPLOYMENT_GUIDE.md`
- Audit report: `AUDIT_REPORT.md`
- Issues: Check Vercel logs

---

**Time to Deploy:** ~5 minutes  
**Difficulty:** Easy ⭐
