# Pre-Deployment Setup Guide

Complete these steps BEFORE deploying to Vercel.

## 1. Set Up External Services

### Cloudinary (Image Storage)

1. **Create Account**
   - Go to: https://cloudinary.com/users/register/free
   - Sign up for free account
   - Verify your email

2. **Get Credentials**
   - Go to Dashboard: https://cloudinary.com/console
   - Copy these values:
     - Cloud Name: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
     - API Key: `CLOUDINARY_API_KEY`
     - API Secret: `CLOUDINARY_API_SECRET`

3. **Configure Upload Preset (Optional)**
   - Go to Settings → Upload
   - Create unsigned upload preset
   - Set folder: `403-ai`

### Resend (Email Service)

1. **Create Account**
   - Go to: https://resend.com/signup
   - Sign up for free account
   - Verify your email

2. **Get API Key**
   - Go to: https://resend.com/api-keys
   - Click "Create API Key"
   - Name it: `403-ai-production`
   - Copy the key: `RESEND_API_KEY`
   - **Save it immediately** (you can't see it again!)

3. **Verify Domain (Important!)**
   - Go to: https://resend.com/domains
   - Click "Add Domain"
   - Enter: `403-ai.com`
   - Follow DNS verification steps
   - Add these records to Squarespace DNS:
     ```
     Type: TXT
     Host: @
     Value: [provided by Resend]
     
     Type: MX
     Host: @
     Value: [provided by Resend]
     ```
   - Wait for verification (can take up to 48 hours)

4. **Set From Email**
   - Once domain is verified, you can use: `noreply@403-ai.com`
   - Or any email like: `hello@403-ai.com`

### GitHub Repository

1. **Create Repository**
   - Go to: https://github.com/new
   - Repository name: `403-ai`
   - Description: "403 AI - Forbidden AI Blog Platform"
   - Visibility: Private (recommended) or Public
   - Don't initialize with README
   - Click "Create repository"

2. **Push Your Code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 403 AI blog platform with password reset"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/403-ai.git
   git push -u origin main
   ```

## 2. Generate Secrets

You need to generate secure random strings for:

### NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and save it as `NEXTAUTH_SECRET`

### CRON_SECRET

```bash
openssl rand -base64 32
```

Copy the output and save it as `CRON_SECRET`

## 3. Prepare Environment Variables

Create a file called `production-env-vars.txt` (don't commit this!) with all your values:

```env
# Database (will get from Vercel Postgres)
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_URL=https://www.403-ai.com
NEXTAUTH_SECRET=[paste generated secret]

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=[your cloud name]
CLOUDINARY_API_KEY=[your api key]
CLOUDINARY_API_SECRET=[your api secret]

# Application
NEXT_PUBLIC_APP_URL=https://www.403-ai.com

# Email (Resend)
RESEND_API_KEY=[your resend api key]
EMAIL_FROM=noreply@403-ai.com

# Cron Secret
CRON_SECRET=[paste generated secret]
```

## 4. Test Locally First

Before deploying, make sure everything works locally:

### 4.1 Install Dependencies

```bash
npm install
```

### 4.2 Set Up Local Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:push

# Seed database
npm run db:seed
```

### 4.3 Start Development Server

```bash
npm run dev
```

### 4.4 Test Key Features

- [ ] Homepage loads: http://localhost:3000
- [ ] Sign in works: http://localhost:3000/signin
  - Email: `admin@403-ai.com`
  - Password: `admin123`
- [ ] Admin dashboard accessible: http://localhost:3000/admin
- [ ] Can create a blog post
- [ ] Can upload an image
- [ ] Blog list page works: http://localhost:3000/blog
- [ ] Static pages load:
  - http://localhost:3000/about
  - http://localhost:3000/privacy
  - http://localhost:3000/terms
- [ ] Password reset pages load:
  - http://localhost:3000/forgot-password
  - http://localhost:3000/reset-password

### 4.5 Run Type Check

```bash
npm run type-check
```

Fix any TypeScript errors before deploying.

### 4.6 Run Build

```bash
npm run build
```

Make sure the build completes successfully.

## 5. Squarespace Domain Preparation

### 5.1 Verify Domain Ownership

1. Log in to Squarespace
2. Go to Settings → Domains
3. Verify you own `403-ai.com`

### 5.2 Prepare for DNS Changes

**Important:** DNS changes can take 24-48 hours to propagate. Plan accordingly!

You'll be adding these records:
- CNAME record for `www` → Vercel
- TXT records for Resend email verification
- MX records for Resend email

## 6. Create Vercel Account

1. **Sign Up**
   - Go to: https://vercel.com/signup
   - Sign up with GitHub (recommended)
   - This will automatically connect your GitHub account

2. **Verify Email**
   - Check your email and verify your account

3. **Complete Profile**
   - Add your name
   - Optionally add a team name

## 7. Pre-Deployment Checklist

Before proceeding to deployment, verify:

- [ ] GitHub repository created and code pushed
- [ ] Cloudinary account created and credentials saved
- [ ] Resend account created and API key saved
- [ ] Resend domain verification started (can complete later)
- [ ] `NEXTAUTH_SECRET` generated and saved
- [ ] `CRON_SECRET` generated and saved
- [ ] All environment variables documented in `production-env-vars.txt`
- [ ] Local testing completed successfully
- [ ] Build passes without errors
- [ ] TypeScript check passes
- [ ] Squarespace domain ownership verified
- [ ] Vercel account created

## 8. What's Next?

Once you've completed all the above steps, you're ready to deploy!

Follow the **DEPLOYMENT_GUIDE.md** for step-by-step deployment instructions.

## Common Issues & Solutions

### Issue: Can't generate secrets

**Solution:**
If you don't have `openssl`, use this Node.js command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Issue: Cloudinary images not working locally

**Solution:**
- Check your `.env` file has correct Cloudinary credentials
- Restart your dev server after adding env vars
- Check Cloudinary dashboard for upload errors

### Issue: Resend emails not sending

**Solution:**
- Verify API key is correct
- Check Resend dashboard for error logs
- Domain verification must be complete for production
- For testing, you can use any email as sender

### Issue: Database connection error

**Solution:**
- Check `DATABASE_URL` in `.env`
- Make sure PostgreSQL is running
- Try: `npx prisma db push` to sync schema

### Issue: Build fails

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Try build again
npm run build
```

## Need Help?

- Check the main **DEPLOYMENT_GUIDE.md**
- Review **DEPLOYMENT_CHECKLIST.md**
- Check Vercel documentation: https://vercel.com/docs
- Check Next.js deployment docs: https://nextjs.org/docs/deployment

---

**Ready to deploy?** Proceed to **DEPLOYMENT_GUIDE.md**
