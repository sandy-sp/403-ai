# Deployment Checklist

## Pre-Deployment

- [ ] All environment variables are configured
- [ ] Database is set up and seeded
- [ ] Cloudinary account is configured
- [ ] Default admin password has been changed
- [ ] All features have been tested locally
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)

## Vercel Deployment

### 1. Environment Variables

Set these in Vercel dashboard:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Database Setup

- [ ] Production database created
- [ ] DATABASE_URL updated in Vercel
- [ ] Migrations run: `npx prisma db push`
- [ ] Database seeded: `npx prisma db seed`

### 3. Domain Configuration

- [ ] Custom domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] NEXTAUTH_URL updated to production domain
- [ ] NEXT_PUBLIC_APP_URL updated to production domain

### 4. Post-Deployment

- [ ] Test sign-in functionality
- [ ] Test admin dashboard access
- [ ] Create a test blog post
- [ ] Upload a test image
- [ ] Verify public blog pages load correctly
- [ ] Test SEO meta tags (use Twitter Card Validator, Facebook Debugger)
- [ ] Check sitemap.xml is accessible
- [ ] Verify robots.txt is correct
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit (target: >90 score)

## Security Checklist

- [ ] Change default admin password
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] Cloudinary API keys are not exposed
- [ ] HTTPS is enforced
- [ ] CSP headers are configured
- [ ] Rate limiting is enabled (if applicable)

## Performance Checklist

- [ ] Images are optimized via Cloudinary
- [ ] Static pages are generated correctly
- [ ] ISR is working for blog posts
- [ ] Page load time < 2 seconds
- [ ] Lighthouse Performance score > 90
- [ ] No console errors in production

## SEO Checklist

- [ ] Meta tags are present on all pages
- [ ] Open Graph tags are configured
- [ ] Twitter Card tags are configured
- [ ] Sitemap is accessible at /sitemap.xml
- [ ] Robots.txt is accessible at /robots.txt
- [ ] Structured data (JSON-LD) is present on blog posts
- [ ] All images have alt text
- [ ] Lighthouse SEO score > 90

## Monitoring

- [ ] Set up error tracking (optional: Sentry)
- [ ] Set up analytics (optional: Google Analytics, Plausible)
- [ ] Monitor database performance
- [ ] Monitor API response times
- [ ] Set up uptime monitoring

## Backup Strategy

- [ ] Database backups are configured
- [ ] Cloudinary has backup/versioning enabled
- [ ] Code is backed up in Git repository

## Launch

- [ ] All checklist items completed
- [ ] Final testing on production
- [ ] Announce launch
- [ ] Monitor for issues

## Post-Launch

- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Gather user feedback
- [ ] Plan future improvements

---

## Quick Deploy Commands

```bash
# Build and test locally
npm run build
npm run start

# Deploy to Vercel (if using Vercel CLI)
vercel --prod

# Run database migrations on production
npx prisma db push

# Seed production database (only once!)
npx prisma db seed
```

## Rollback Plan

If issues occur:

1. Revert to previous deployment in Vercel dashboard
2. Check error logs in Vercel
3. Verify environment variables
4. Test database connection
5. Check Cloudinary configuration

## Support Resources

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- Cloudinary Documentation: https://cloudinary.com/documentation

---

**Ready to deploy? Let's go! 🚀**
