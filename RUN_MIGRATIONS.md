# Running Database Migrations on Vercel

Your website is deployed but the database tables don't exist yet. Follow these steps:

## Quick Fix (5 minutes)

### Step 1: Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### Step 2: Link Your Project

```bash
vercel link
```

Follow the prompts to link to your Vercel project.

### Step 3: Pull Environment Variables

```bash
vercel env pull .env.production
```

This downloads your production environment variables (including DATABASE_URL).

### Step 4: Run Migrations

```bash
# Load the production environment
export $(cat .env.production | xargs)

# Run migrations
npx prisma migrate deploy
```

### Step 5: Verify Tables Created

```bash
npx prisma studio
```

This opens Prisma Studio where you can see all your tables.

---

## Alternative: Run Migrations via Vercel Dashboard

### Option A: Add Build Command

1. Go to Vercel Dashboard → Your Project → Settings → General
2. Find "Build & Development Settings"
3. Override Build Command with:
   ```bash
   prisma generate && prisma migrate deploy && next build
   ```
4. Redeploy

### Option B: Use Vercel Postgres Dashboard

1. Go to Vercel Dashboard → Storage → Your Postgres Database
2. Click "Query" tab
3. You can run SQL directly, but migrations are better

---

## What Migrations Do

Migrations will create these tables:
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

## After Migrations

### Create Admin User

Once tables exist, create an admin user:

**Option 1: Via Signup + Database Update**
1. Go to your site: `/signup`
2. Create an account
3. In Vercel Postgres Query tab, run:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
   ```

**Option 2: Direct SQL Insert**
```sql
-- First, hash your password using bcrypt (cost 10)
-- You can use: https://bcrypt-generator.com/

INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@403-ai.com',
  '$2a$10$YOUR_HASHED_PASSWORD_HERE',
  'Admin',
  'ADMIN',
  NOW(),
  NOW()
);
```

---

## Troubleshooting

### Error: "relation 'users' does not exist"
**Solution:** Migrations haven't run. Follow Step 4 above.

### Error: "Can't reach database server"
**Solution:** Check DATABASE_URL is correct in Vercel environment variables.

### Error: "Migration failed"
**Solution:** 
1. Check database permissions
2. Ensure DATABASE_URL has `?sslmode=require` at the end
3. Try: `npx prisma db push` (for development)

---

## Verify Everything Works

After migrations:

1. ✅ Go to `/signin` - Should load without errors
2. ✅ Go to `/blog` - Should show empty blog (no errors)
3. ✅ Sign in as admin
4. ✅ Go to `/admin/posts/new` - Create a test post
5. ✅ Publish the post
6. ✅ View it on `/blog`

---

## Quick Commands Reference

```bash
# Pull production env vars
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Open database viewer
npx prisma studio

# Check migration status
npx prisma migrate status

# Generate Prisma client
npx prisma generate
```

---

**Status:** 🔄 Migrations Pending  
**Next Step:** Run migrations using Step 4 above
