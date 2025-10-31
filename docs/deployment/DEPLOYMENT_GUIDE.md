# 403 AI - Deployment Guide

Complete guide for deploying 403 AI to Vercel with automated setup.

## 🚀 Quick Start (Automated)

### Option 1: Fully Automated Setup (Recommended)

If you have Vercel API access:

```bash
# Set Vercel credentials
export VERCEL_TOKEN="your_vercel_token"
export VERCEL_PROJECT_ID="your_project_id"

# Run automated setup (generates secrets, checks DB, builds)
npm run deploy:setup
```

This will:
- ✅ Generate `NEXTAUTH_SECRET` and `CRON_SECRET`
- ✅ Automatically add them to Vercel
- ✅ Check database connection
- ✅ Verify migrations
- ✅ Run production build

### Option 2: Semi-Automated (No Vercel API)

```bash
# Generate secrets and run checks
npm run deploy:setup
```

The script will generate secrets and display them. You'll need to add them to Vercel manually.

### Option 3: Manual Setup

Follow the step-by-step guide below.

---

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon, Supabase, or any PostgreSQL provider)
- Vercel account
- Cloudinary account (for image uploads)
- Resend account (for emails)

---

## 🔧 Step-by-Step Deployment

### Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd 403-ai
npm install
```

### Step 2: Set Up Database

#### Option A: Using Neon (Recommended)

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to Vercel environment variables as `DATABASE_URL`

#### Option B: Using Supabase

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use "Connection pooling" for production)
5. Add to Vercel environment variables as `DATABASE_URL`

#### Check Database Connection

```bash
# Set DATABASE_URL in your environment
export DATABASE_URL="your_database_url"

# Run database check
npm run deploy:check-db
```

### Step 3: Generate Secrets

#### Automated (Recommended)

```bash
npm run deploy:setup
```

#### Manual

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CRON_SECRET
openssl rand -base64 32
```

### Step 4: Configure Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

#### Required Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `DATABASE_URL` | PostgreSQL connection string | From Neon/Supabase |
| `NEXTAUTH_URL` | Your app URL | `https://your-domain.vercel.app` |
| `NEXTAUTH_SECRET` | Auth secret | Generated in Step 3 |
| `CRON_SECRET` | Cron job secret | Generated in Step 3 |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `https://your-domain.vercel.app` |
| `RESEND_API_KEY` | Resend API key | From Resend dashboard |
| `EMAIL_FROM` | Sender email | `noreply@your-domain.com` |

#### Automated Setup (with Vercel CLI)

```bash
# Install Vercel CLI
npm install -g vercel

# Link your project
vercel link

# Add secrets automatically
npm run deploy:vercel-env
```

### Step 5: Run Pre-Deployment Checks

```bash
npm run deploy:pre-check
```

This will verify:
- ✅ Node.js version
- ✅ Dependencies installed
- ✅ TypeScript compiles
- ✅ Environment variables set
- ✅ Database connection
- ✅ Migrations status
- ✅ Production build
- ✅ Security vulnerabilities

### Step 6: Deploy to Vercel

#### Option A: Via Vercel CLI

```bash
# Deploy to production
vercel --prod
```

#### Option B: Via Git Integration

1. Push to your main branch
2. Vercel will automatically deploy

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 7: Post-Deployment Setup

#### 1. Run Database Migrations

Vercel will automatically run migrations during build, but you can also run them manually:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

#### 2. Create Admin User

You have two options:

**Option A: Via Database**

```sql
-- Connect to your database and run:
INSERT INTO users (id, email, "password_hash", name, role, "created_at", "updated_at")
VALUES (
  gen_random_uuid(),
  'admin@403-ai.com',
  '$2a$10$YourHashedPasswordHere',  -- Use bcrypt to hash your password
  'Admin',
  'ADMIN',
  NOW(),
  NOW()
);
```

**Option B: Via Signup + Database Update**

1. Sign up normally at `/signup`
2. Update the user role in database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

#### 3. Test Core Functionality

- ✅ Sign in as admin
- ✅ Create a test blog post
- ✅ Upload an image
- ✅ Publish the post
- ✅ View post on frontend
- ✅ Test comment submission
- ✅ Test newsletter subscription

---

## 🔄 Automated Deployment Scripts

### Available Scripts

```bash
# Full automated setup (generates secrets, checks DB, builds)
npm run deploy:setup

# Check database connection and migrations
npm run deploy:check-db

# Run all pre-deployment checks
npm run deploy:pre-check

# Setup Vercel environment variables (requires Vercel CLI)
npm run deploy:vercel-env
```

### Script Details

#### `deploy:setup` (Recommended)

Runs the complete automated setup:

```bash
npm run deploy:setup
```

**What it does:**
1. Generates `NEXTAUTH_SECRET` and `CRON_SECRET`
2. Adds them to Vercel (if credentials provided)
3. Checks database connection
4. Verifies migrations
5. Runs production build

**Requirements:**
- Optional: `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` for auto-adding to Vercel
- Required: `DATABASE_URL` for database checks

#### `deploy:check-db`

Comprehensive database check:

```bash
npm run deploy:check-db
```

**What it does:**
1. Verifies `DATABASE_URL` is set
2. Tests database connection
3. Checks migration status
4. Offers to apply pending migrations
5. Verifies tables exist
6. Shows database statistics

#### `deploy:pre-check`

Complete pre-deployment validation:

```bash
npm run deploy:pre-check
```

**What it does:**
1. Checks Node.js version
2. Verifies dependencies
3. Runs TypeScript type check
4. Validates environment variables
5. Tests database connection
6. Checks Prisma schema
7. Verifies migrations
8. Runs production build
9. Checks for security vulnerabilities

**Exit codes:**
- `0` - All checks passed
- `1` - Errors found (blocks deployment)

---

## 🔐 Getting Vercel API Credentials

To use automated Vercel environment variable setup:

### 1. Get Vercel Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it "403-AI-Deployment"
4. Copy the token

```bash
export VERCEL_TOKEN="your_token_here"
```

### 2. Get Project ID

```bash
# Install Vercel CLI
npm install -g vercel

# Link your project
vercel link

# Get project ID
vercel project ls
```

Or find it in Vercel dashboard → Project Settings → General

```bash
export VERCEL_PROJECT_ID="your_project_id"
```

### 3. Run Automated Setup

```bash
npm run deploy:setup
```

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Type error: Property 'params' is missing`

**Solution:** This was fixed in the Next.js 16 upgrade. Make sure you've pulled the latest code.

### Database Connection Fails

**Error:** `Cannot connect to database`

**Solutions:**
1. Check `DATABASE_URL` is correct
2. Ensure database server is running
3. Check firewall/network settings
4. Verify SSL settings (add `?sslmode=require` if needed)

### Migrations Fail

**Error:** `Migration failed to apply`

**Solutions:**
1. Check database permissions
2. Ensure no conflicting migrations
3. Try: `npx prisma migrate reset` (⚠️ deletes data)
4. Or: `npx prisma db push` for development

### Environment Variables Not Working

**Error:** `NEXTAUTH_SECRET is not defined`

**Solutions:**
1. Verify variables are set in Vercel
2. Check variable names match exactly
3. Redeploy after adding variables
4. Check environment (production/preview/development)

### Images Not Uploading

**Error:** `Cloudinary upload failed`

**Solutions:**
1. Verify Cloudinary credentials
2. Check API key permissions
3. Ensure cloud name is correct
4. Check upload preset settings

### Emails Not Sending

**Error:** `Resend API error`

**Solutions:**
1. Verify `RESEND_API_KEY` is correct
2. Check `EMAIL_FROM` domain is verified in Resend
3. Check Resend dashboard for errors
4. Verify API key permissions

---

## 📊 Monitoring

### Vercel Analytics

Enable in Vercel dashboard → Analytics

### Error Tracking

Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay

### Database Monitoring

- Neon: Built-in monitoring dashboard
- Supabase: Database → Reports

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

### Pre-Deployment Checks in CI/CD

Add to your `.github/workflows/deploy.yml`:

```yaml
name: Deploy Checks
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run type-check
      - run: npm run build
```

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Site loads at your domain
- [ ] Can sign in as admin
- [ ] Can create and publish posts
- [ ] Images upload successfully
- [ ] Comments work
- [ ] Newsletter subscription works
- [ ] Password reset works
- [ ] Email notifications work
- [ ] Mobile responsive
- [ ] No console errors

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review `AUDIT_REPORT.md` for known issues
3. Check Vercel deployment logs
4. Review database logs

---

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update Next.js specifically
npm install next@latest react@latest react-dom@latest

# Test after updates
npm run type-check
npm run build
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply to production
npx prisma migrate deploy
```

---

**Last Updated:** October 31, 2025  
**Next.js Version:** 16.0.1  
**Node.js Required:** 18+
