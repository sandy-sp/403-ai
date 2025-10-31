# 403 AI - Quick Deployment Checklist

Use this checklist to deploy your site to Vercel and connect your Squarespace domain.

## Pre-Deployment

- [ ] Code is committed to Git
- [ ] All tests pass locally
- [ ] Environment variables documented in `.env.example`
- [ ] Database schema is finalized
- [ ] Cloudinary account created and configured
- [ ] Resend account created and API key obtained

## GitHub Setup

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Repository is public or Vercel has access

## Vercel Setup

- [ ] Create Vercel account
- [ ] Create Vercel Postgres database
- [ ] Copy database connection string
- [ ] Import GitHub repository to Vercel
- [ ] Configure all environment variables:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_URL` (https://www.403-ai.com)
  - [ ] `NEXTAUTH_SECRET` (generate new)
  - [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `NEXT_PUBLIC_APP_URL` (https://www.403-ai.com)
  - [ ] `RESEND_API_KEY`
  - [ ] `EMAIL_FROM`
  - [ ] `CRON_SECRET` (generate new)
- [ ] Deploy project
- [ ] Deployment successful (check logs)

## Database Setup

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Link project: `vercel link`
- [ ] Pull env vars: `vercel env pull`
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed database: `npx prisma db seed`
- [ ] Verify data in Vercel Postgres dashboard

## Domain Configuration

### In Vercel:
- [ ] Go to Settings → Domains
- [ ] Add domain: `www.403-ai.com`
- [ ] Copy DNS records shown

### In Squarespace:
- [ ] Login to Squarespace
- [ ] Go to Settings → Domains → 403-ai.com
- [ ] Click DNS Settings
- [ ] Add CNAME record:
  - Type: `CNAME`
  - Host: `www`
  - Value: `cname.vercel-dns.com`
- [ ] Save changes

### Back in Vercel:
- [ ] Wait 5-10 minutes for DNS propagation
- [ ] Click "Refresh" to verify domain
- [ ] Set `www.403-ai.com` as primary domain
- [ ] Wait for SSL certificate (automatic)

## Testing

- [ ] Visit https://www.403-ai.com (homepage loads)
- [ ] Test sign in with default credentials
- [ ] Test password reset flow
- [ ] Check static pages (About, Privacy, Terms)
- [ ] View blog list page
- [ ] View sample blog post
- [ ] Test admin dashboard access
- [ ] Upload test image in admin
- [ ] Create test blog post

## Post-Deployment

- [ ] Change default admin password
- [ ] Delete test content
- [ ] Update About page with real content
- [ ] Configure email sender domain in Resend
- [ ] Set up deployment notifications
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up error monitoring (optional)

## Security

- [ ] Default admin password changed
- [ ] All secrets are unique (not from .env.example)
- [ ] 2FA enabled on Vercel account
- [ ] 2FA enabled on GitHub account
- [ ] API keys are production keys (not test keys)

## Monitoring

- [ ] Bookmark Vercel Dashboard
- [ ] Bookmark Vercel Postgres Dashboard
- [ ] Bookmark Resend Dashboard
- [ ] Bookmark Cloudinary Dashboard
- [ ] Set up email alerts for deployment failures

---

## Quick Commands Reference

```bash
# Deploy manually
vercel --prod

# View logs
vercel logs

# Check environment variables
vercel env ls

# Run migrations on production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Troubleshooting Quick Fixes

**Domain not working?**
```bash
# Check DNS
dig www.403-ai.com

# Wait 24-48 hours for full propagation
```

**Database error?**
```bash
# Verify connection
npx prisma db push

# Re-run migrations
npx prisma migrate deploy
```

**Build failing?**
```bash
# Test locally
npm run build

# Check types
npm run type-check

# Check for errors
npm run lint
```

---

## Support Contacts

- **Vercel Support:** https://vercel.com/support
- **Squarespace Support:** https://support.squarespace.com
- **Resend Support:** https://resend.com/support
- **Cloudinary Support:** https://support.cloudinary.com

---

**Status:** Ready to deploy! Follow the detailed guide in `DEPLOYMENT_GUIDE.md`
