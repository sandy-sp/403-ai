# Quick Start: Deploy to Vercel in 30 Minutes

This is the fastest path to get your site live at <www.403-ai.com>

## Prerequisites (5 minutes)

1. **GitHub Account** - <https://github.com/signup>
2. **Vercel Account** - <https://vercel.com/signup> (sign up with GitHub)
3. **Cloudinary Account** - <https://cloudinary.com/users/register/free>
4. **Resend Account** - <https://resend.com/signup>

## Step 1: Push to GitHub (2 minutes)

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create repo at https://github.com/new then:
git remote add origin https://github.com/YOUR_USERNAME/403-ai.git
git push -u origin main
```

## Step 2: Deploy to Vercel (10 minutes)

1. Go to <https://vercel.com/new>
2. Import your `403-ai` repository
3. Add environment variables (click "Environment Variables"):

```env
DATABASE_URL=                    # Leave empty for now
NEXTAUTH_URL=https://www.403-ai.com
NEXTAUTH_SECRET=                 # Generate: openssl rand -base64 32
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=  # From Cloudinary dashboard
CLOUDINARY_API_KEY=              # From Cloudinary dashboard
CLOUDINARY_API_SECRET=           # From Cloudinary dashboard
NEXT_PUBLIC_APP_URL=https://www.403-ai.com
RESEND_API_KEY=                  # From Resend dashboard
EMAIL_FROM=onboarding@resend.dev # Use Resend's sandbox (no domain needed!)
CRON_SECRET=                     # Generate: openssl rand -base64 32
```

4. Click "Deploy"
5. Wait 2-3 minutes

## Step 3: Set Up Database (5 minutes)

1. In Vercel Dashboard, go to "Storage" tab
2. Click "Create Database" → "Postgres"
3. Name: `403-ai-db`
4. Click "Create"
5. Go to ".env.local" tab
6. Copy `POSTGRES_PRISMA_URL`
7. Go back to your project → Settings → Environment Variables
8. Edit `DATABASE_URL` and paste the Postgres URL
9. Click "Save"
10. Redeploy: Deployments → Click "..." → "Redeploy"

## Step 4: Run Migrations (3 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
export DATABASE_URL="<paste your production database url>"
npx prisma migrate deploy
npx prisma db seed
```

## Step 5: Connect Domain (10 minutes)

### In Vercel

1. Go to Settings → Domains
2. Add: `www.403-ai.com`
3. Copy the CNAME record shown

### In Squarespace

1. Login → Settings → Domains → 403-ai.com
2. Click "DNS Settings"
3. Add CNAME record:
   - Type: `CNAME`
   - Host: `www`
   - Value: `cname.vercel-dns.com`
4. Save

### Wait & Verify

1. Wait 5-10 minutes
2. In Vercel, click "Refresh" next to domain
3. Once verified, set as "Primary Domain"

## Step 6: Test Your Site (5 minutes)

Visit: <https://www.403-ai.com>

Test these:

- [ ] Homepage loads
- [ ] Sign in: <admin@403-ai.com> / admin123
- [ ] Admin dashboard works
- [ ] Blog page loads
- [ ] About page loads
- [ ] Password reset page loads

## Done! 🎉

Your site is now live at **<www.403-ai.com>**

## Important Next Steps

1. **Change admin password immediately!**
2. **Verify Resend domain** for email to work (can take 24-48 hours)
3. **Upload your content**

## Troubleshooting

**Domain not working?**

- Wait 24-48 hours for DNS propagation
- Check DNS: `dig www.403-ai.com`

**Database error?**

- Make sure you ran migrations
- Check DATABASE_URL is set correctly

**Build failing?**

- Check build logs in Vercel
- Make sure all env vars are set

## Auto-Deploy Updates

Now when you push to GitHub, Vercel automatically deploys:

```bash
git add .
git commit -m "Your changes"
git push
```

Check deployment status at: <https://vercel.com/dashboard>

---

**Need detailed instructions?** See **DEPLOYMENT_GUIDE.md**

**Having issues?** See **PRE_DEPLOYMENT_SETUP.md**
