# 403 AI - Vercel Deployment Guide

This guide will walk you through deploying your 403 AI blog to Vercel and connecting it to your Squarespace domain (www.403-ai.com).

## Prerequisites

- [x] GitHub account
- [x] Vercel account (sign up at https://vercel.com)
- [x] Squarespace domain (www.403-ai.com)
- [x] PostgreSQL database (we'll set up Vercel Postgres)
- [x] Cloudinary account for images
- [x] Resend account for emails

## Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - 403 AI blog platform"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `403-ai`
3. Don't initialize with README (we already have one)
4. Click "Create repository"

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/403-ai.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Vercel Postgres Database

### 2.1 Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your GitHub account

### 2.2 Create Postgres Database

1. Go to https://vercel.com/dashboard
2. Click on "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Name it: `403-ai-db`
6. Select region closest to your users
7. Click "Create"

### 2.3 Get Database Connection String

1. Once created, click on your database
2. Go to ".env.local" tab
3. Copy the `POSTGRES_PRISMA_URL` value
4. Save it for later (you'll need it in Step 4)

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `403-ai` repository
4. Click "Import"

### 3.2 Configure Project

**Framework Preset:** Next.js (should be auto-detected)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### 3.3 Configure Environment Variables

Click "Environment Variables" and add the following:

#### Required Variables:

```env
# Database
DATABASE_URL=<paste your POSTGRES_PRISMA_URL from Step 2.3>

# Authentication
NEXTAUTH_URL=https://www.403-ai.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application
NEXT_PUBLIC_APP_URL=https://www.403-ai.com

# Email (Resend)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@403-ai.com

# Cron Secret
CRON_SECRET=<generate with: openssl rand -base64 32>
```

**Important Notes:**
- For `NEXTAUTH_SECRET` and `CRON_SECRET`, generate secure random strings using: `openssl rand -base64 32`
- Get Cloudinary credentials from: https://cloudinary.com/console
- Get Resend API key from: https://resend.com/api-keys
- Make sure to use `https://www.403-ai.com` (not http) for production URLs

### 3.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (2-5 minutes)
3. You'll get a temporary URL like: `https://403-ai-xyz.vercel.app`

## Step 4: Run Database Migrations

### 4.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 4.2 Login to Vercel

```bash
vercel login
```

### 4.3 Link Your Project

```bash
vercel link
```

Select your project when prompted.

### 4.4 Pull Environment Variables

```bash
vercel env pull .env.production
```

This downloads your production environment variables.

### 4.5 Run Migrations

```bash
# Set the production database URL
export DATABASE_URL="<your-production-database-url>"

# Run migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

**Alternative: Use Vercel Dashboard**

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Functions"
3. Add a one-time deployment script or use the Vercel CLI as shown above

## Step 5: Connect Squarespace Domain

### 5.1 Get Vercel DNS Records

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter: `www.403-ai.com`
5. Click "Add"

Vercel will show you DNS records to add. You'll see something like:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.2 Configure Squarespace DNS

1. Log in to Squarespace
2. Go to Settings → Domains
3. Click on `403-ai.com`
4. Click "DNS Settings"
5. Click "Add Record"

**Add CNAME Record:**
- Type: `CNAME`
- Host: `www`
- Data: `cname.vercel-dns.com`
- TTL: `3600` (or default)

**Add A Record for root domain (optional):**
- Type: `A`
- Host: `@`
- Data: `76.76.21.21` (Vercel's IP)
- TTL: `3600`

6. Click "Save"

### 5.3 Verify Domain in Vercel

1. Go back to Vercel Dashboard
2. Wait 5-10 minutes for DNS propagation
3. Click "Refresh" next to your domain
4. Once verified, you'll see a green checkmark

### 5.4 Set Primary Domain

1. In Vercel, click the three dots next to `www.403-ai.com`
2. Click "Set as Primary Domain"
3. This ensures all traffic redirects to www.403-ai.com

## Step 6: Configure SSL Certificate

Vercel automatically provisions SSL certificates for your domain. This usually takes 1-5 minutes after domain verification.

You'll see "Certificate Active" when ready.

## Step 7: Test Your Deployment

### 7.1 Check Homepage

Visit: https://www.403-ai.com

You should see your 403 AI homepage.

### 7.2 Test Authentication

1. Go to: https://www.403-ai.com/signin
2. Use default credentials:
   - Email: `admin@403-ai.com`
   - Password: `admin123`
3. You should be redirected to the admin dashboard

**⚠️ IMPORTANT: Change the default password immediately!**

### 7.3 Test Password Reset

1. Go to: https://www.403-ai.com/forgot-password
2. Enter your email
3. Check if the email is sent (check Resend dashboard)

### 7.4 Test Static Pages

- About: https://www.403-ai.com/about
- Privacy: https://www.403-ai.com/privacy
- Terms: https://www.403-ai.com/terms

### 7.5 Test Blog

- Blog List: https://www.403-ai.com/blog
- Sample Post: Check if the seeded post appears

## Step 8: Set Up Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build your project
3. Deploy to production
4. Update www.403-ai.com

## Step 9: Monitor Your Deployment

### 9.1 Vercel Dashboard

- View deployment logs
- Monitor performance
- Check analytics
- View error logs

### 9.2 Set Up Alerts (Optional)

1. Go to Project Settings → Notifications
2. Enable email notifications for:
   - Deployment failures
   - Performance issues
   - Error spikes

## Troubleshooting

### Issue: Domain Not Verifying

**Solution:**
- Wait 24-48 hours for DNS propagation
- Check DNS records in Squarespace are correct
- Use `dig www.403-ai.com` to verify DNS
- Contact Squarespace support if needed

### Issue: Database Connection Error

**Solution:**
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Check if database is accessible
- Run migrations again: `npx prisma migrate deploy`

### Issue: Build Fails

**Solution:**
- Check build logs in Vercel Dashboard
- Verify all dependencies are in `package.json`
- Check for TypeScript errors locally: `npm run type-check`
- Ensure environment variables are set

### Issue: Email Not Sending

**Solution:**
- Verify Resend API key is correct
- Check Resend dashboard for errors
- Verify `EMAIL_FROM` domain is verified in Resend
- Check email logs in Vercel Functions

### Issue: Images Not Loading

**Solution:**
- Verify Cloudinary credentials
- Check `next.config.js` has correct image domains
- Test image upload in admin panel

## Post-Deployment Checklist

- [ ] Domain is accessible at www.403-ai.com
- [ ] SSL certificate is active (https works)
- [ ] Can sign in to admin dashboard
- [ ] Database is seeded with sample data
- [ ] Password reset emails are working
- [ ] Static pages are accessible
- [ ] Blog posts are visible
- [ ] Images are loading correctly
- [ ] Changed default admin password
- [ ] Set up monitoring/alerts

## Next Steps

Once deployment is successful:

1. **Change Admin Password**
   - Sign in to admin dashboard
   - Go to profile settings (when implemented)
   - Change password from default

2. **Create Your First Post**
   - Go to Admin → Posts → New Post
   - Write and publish your first article

3. **Customize Content**
   - Update About page with your information
   - Add your social media links
   - Upload your logo/branding

4. **Continue Development**
   - Implement remaining features (newsletter, comments, etc.)
   - Push changes to GitHub
   - Vercel will auto-deploy

## Useful Commands

```bash
# View deployment logs
vercel logs

# View production environment variables
vercel env ls

# Add new environment variable
vercel env add VARIABLE_NAME

# Redeploy without changes
vercel --prod

# Check deployment status
vercel inspect <deployment-url>
```

## Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Squarespace DNS Help:** https://support.squarespace.com/hc/en-us/articles/205812378
- **Next.js Deployment:** https://nextjs.org/docs/deployment

## Security Recommendations

1. **Rotate Secrets Regularly**
   - Change `NEXTAUTH_SECRET` every 90 days
   - Rotate API keys periodically

2. **Monitor Access Logs**
   - Check Vercel analytics for suspicious activity
   - Review admin access logs

3. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm update
   ```

4. **Enable 2FA**
   - Enable 2FA on Vercel account
   - Enable 2FA on GitHub account
   - Enable 2FA on Cloudinary account

---

**Congratulations! Your 403 AI blog is now live at www.403-ai.com! 🎉**

For questions or issues, refer to the troubleshooting section or check the project documentation.
