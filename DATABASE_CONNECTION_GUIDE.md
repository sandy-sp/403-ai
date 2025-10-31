# 🔌 Database Connection Guide

Your app is deployed but not connecting to the database. Here's how to fix it:

## The Issue

Your Vercel app has:
- ✅ Database created (Vercel Postgres)
- ✅ Environment variables set (DATABASE_URL, etc.)
- ❌ **No tables in the database** (migrations not run)

## Solution: Run Migrations

### Method 1: Via Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI (if not installed)
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link your project
vercel link

# 4. Pull production environment variables
vercel env pull .env.production

# 5. Run migrations
npx prisma migrate deploy
```

### Method 2: Via Vercel Dashboard

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. Find **Build & Development Settings**
3. Override **Build Command** with:
   ```bash
   prisma generate && prisma migrate deploy && next build
   ```
4. Click **Save**
5. Go to **Deployments** → Click **...** → **Redeploy**

### Method 3: Via Vercel Postgres Dashboard

1. Go to **Vercel Dashboard** → **Storage** → Your Postgres Database
2. Click **Data** tab → **Query**
3. Run this SQL to check if tables exist:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```
4. If no tables, you need to run migrations (use Method 1 or 2)

---

## Verify Database Connection

### Check Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Required variables:
- ✅ `DATABASE_URL` or `POSTGRES_URL`
- ✅ `NEXTAUTH_URL` (your site URL)
- ✅ `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)

### Test Connection Locally

```bash
# Pull production env
vercel env pull .env.production

# Test connection
npx prisma db execute --stdin <<< "SELECT 1;"
```

If this works, your DATABASE_URL is correct!

---

## After Migrations: Create Admin User

### Step 1: Sign Up

Go to your site and sign up:
```
https://your-site.vercel.app/signup
```

### Step 2: Make Yourself Admin

**Option A: Via Vercel Postgres Query**

1. Go to Vercel Dashboard → Storage → Your Postgres → Query
2. Run:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
   ```

**Option B: Via Prisma Studio**

```bash
# Pull env vars
vercel env pull .env.production

# Open Prisma Studio
npx prisma studio

# Find your user and change role to 'ADMIN'
```

### Step 3: Sign In and Test

1. Go to `/signin`
2. Sign in with your credentials
3. Go to `/admin/posts/new`
4. Create a test post
5. Publish it
6. View it at `/blog`

---

## Troubleshooting

### "Cannot connect to database"

**Check 1: DATABASE_URL format**

Should look like:
```
postgresql://user:password@host:5432/database?sslmode=require
```

Make sure it has `?sslmode=require` at the end!

**Check 2: Environment variables in Vercel**

Go to Vercel → Settings → Environment Variables

Make sure DATABASE_URL is set for:
- ✅ Production
- ✅ Preview
- ✅ Development

**Check 3: Redeploy after adding env vars**

If you just added environment variables, redeploy:
```bash
vercel --prod
```

### "Table does not exist"

This means migrations haven't run. Use Method 1 or 2 above.

### "Migration failed"

Try pushing schema directly (development only):
```bash
npx prisma db push
```

### Middleware Warning

The warning about middleware is just informational:
```
⚠ The "middleware" file convention is deprecated
```

This won't affect your app. It's a Next.js 16 change we'll migrate later.

---

## Quick Commands Reference

```bash
# Check if tables exist
npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"

# Run migrations
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Open database viewer
npx prisma studio

# Generate Prisma client
npx prisma generate

# Push schema (dev only)
npx prisma db push
```

---

## What Tables Should Exist

After migrations, you should have:

- ✅ users
- ✅ posts
- ✅ categories
- ✅ tags
- ✅ post_categories
- ✅ post_tags
- ✅ comments
- ✅ newsletter_subscribers
- ✅ password_reset_tokens
- ✅ site_settings
- ✅ media

---

## Still Not Working?

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Click **Functions** tab
4. Look for errors

### Check Database Logs

1. Go to Vercel Dashboard → Storage → Your Postgres
2. Click **Logs** tab
3. Look for connection errors

### Need Help?

Share the error message you're seeing:
- From Vercel deployment logs
- From your browser console (F12)
- From running migrations locally

---

**Status:** 🔄 Database Connection Pending  
**Next Step:** Run migrations using Method 1 or 2  
**Time Needed:** 5 minutes
