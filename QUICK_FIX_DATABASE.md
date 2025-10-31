# 🔧 Quick Fix: Connect Database

Your website is live but needs database tables! Here's the 2-minute fix:

## The Problem

✅ Website deployed  
✅ Database created  
✅ Environment variables set  
❌ **Database tables don't exist yet**

## The Solution

Run migrations to create tables!

### Quick Fix (2 minutes)

```bash
# 1. Run the automated migration script
npm run deploy:migrations
```

That's it! The script will:
1. Pull your production environment variables
2. Connect to your database
3. Run all migrations
4. Create all tables
5. Verify everything works

### Manual Fix (5 minutes)

If the automated script doesn't work:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Link project
vercel link

# 3. Pull environment variables
vercel env pull .env.production

# 4. Run migrations
set -a
source .env.production
set +a
npx prisma migrate deploy
```

---

## After Migrations

### Create Admin User

**Step 1:** Sign up at your website
```
https://your-site.vercel.app/signup
```

**Step 2:** Make yourself admin

Go to Vercel Dashboard → Storage → Your Postgres → Query tab:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

**Step 3:** Sign in and create content!
```
https://your-site.vercel.app/signin
```

---

## Verify It Works

1. ✅ Go to `/blog` - Should load (empty, no errors)
2. ✅ Go to `/signin` - Should load
3. ✅ Sign in as admin
4. ✅ Go to `/admin/posts/new`
5. ✅ Create and publish a post
6. ✅ View it on `/blog`

---

## Troubleshooting

### "Command not found: vercel"
```bash
npm install -g vercel
```

### "Cannot connect to database"
Check DATABASE_URL in Vercel environment variables includes `?sslmode=require`

### "Migration failed"
Try:
```bash
npx prisma db push
```

---

## What Gets Created

After migrations, your database will have:

- ✅ users
- ✅ posts  
- ✅ categories
- ✅ tags
- ✅ comments
- ✅ newsletter_subscribers
- ✅ password_reset_tokens
- ✅ site_settings
- ✅ media

---

**Time to Fix:** 2 minutes  
**Difficulty:** Easy ⭐  
**Command:** `npm run deploy:migrations`
