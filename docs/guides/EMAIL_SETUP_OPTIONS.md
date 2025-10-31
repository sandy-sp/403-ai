# Email Setup Options for 403 AI

## The Email Question

You need to send emails for:
- Password reset links
- Newsletter confirmations (future feature)
- Comment notifications (future feature)
- Welcome emails (future feature)

But you don't have an email address at 403-ai.com yet. Here are your options:

## ✅ Option 1: Resend Sandbox Mode (Recommended for Initial Deployment)

**Best for:** Getting started quickly, testing

### Setup (5 minutes)

1. **Sign up for Resend**
   - Go to: https://resend.com/signup
   - Create free account
   - Verify your email

2. **Get API Key**
   - Go to: https://resend.com/api-keys
   - Click "Create API Key"
   - Name: `403-ai-production`
   - Copy the key (save it immediately!)

3. **Add Verified Email**
   - Go to: https://resend.com/emails
   - Click "Add Email"
   - Enter YOUR personal email (where you want to receive test emails)
   - Verify it

4. **Environment Variables**
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   EMAIL_FROM=onboarding@resend.dev
   ```

### How It Works

- Emails will be sent from `onboarding@resend.dev`
- You can only send to verified email addresses
- Perfect for testing password reset
- Free tier: 100 emails/day, 3,000/month

### Limitations

- ❌ Emails show "from onboarding@resend.dev" (not your domain)
- ❌ Can only send to emails you verify in Resend dashboard
- ✅ Works immediately, no DNS setup needed
- ✅ Perfect for testing and initial deployment

### When to Use

- ✅ Initial deployment and testing
- ✅ Development environment
- ✅ When you want to get site live quickly
- ✅ Before setting up custom domain email

---

## 🎯 Option 2: Resend with Domain Verification (Recommended for Production)

**Best for:** Production use with custom domain

### Setup (30 minutes + 24-48 hours DNS propagation)

1. **Complete Option 1 first** (get Resend account and API key)

2. **Add Domain in Resend**
   - Go to: https://resend.com/domains
   - Click "Add Domain"
   - Enter: `403-ai.com`

3. **Get DNS Records**
   Resend will show you DNS records to add. Example:
   ```
   Type: TXT
   Name: _resend
   Value: resend-verify=abc123...
   
   Type: MX
   Name: @
   Value: mx.resend.com
   Priority: 10
   ```

4. **Add DNS Records in Squarespace**
   - Login to Squarespace
   - Go to: Settings → Domains → 403-ai.com
   - Click "DNS Settings"
   - Add each record shown by Resend
   - Save

5. **Wait for Verification**
   - DNS propagation: 5 minutes - 48 hours (usually ~2 hours)
   - Check status in Resend dashboard
   - You'll see "Verified" when ready

6. **Update Environment Variable**
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   EMAIL_FROM=noreply@403-ai.com
   ```

7. **Redeploy**
   - In Vercel, update `EMAIL_FROM` environment variable
   - Redeploy your site

### How It Works

- Emails sent from `noreply@403-ai.com` (your domain!)
- Can send to any email address
- Professional appearance
- Full production capability

### Benefits

- ✅ Emails from your domain
- ✅ Send to anyone
- ✅ Professional appearance
- ✅ No limitations

### When to Use

- ✅ After initial deployment is working
- ✅ When you're ready for production
- ✅ When you want professional emails

---

## 🔄 Option 3: Gmail SMTP (Alternative)

**Best for:** If you have a Gmail account and want simple setup

### Setup (10 minutes)

1. **Enable 2-Factor Authentication on Gmail**
   - Go to: https://myaccount.google.com/security
   - Enable 2FA

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Name: `403 AI`
   - Copy the 16-character password

3. **Update Email Service Code**
   
   You'll need to modify `lib/services/email.service.ts` to use nodemailer instead of Resend.

4. **Environment Variables**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

### Limitations

- ❌ Emails from your Gmail (not 403-ai.com)
- ❌ Gmail sending limits (500 emails/day)
- ❌ Requires code changes
- ✅ No DNS setup needed
- ✅ Works immediately

### When to Use

- ✅ If you prefer Gmail
- ✅ Low email volume
- ✅ Don't want to set up DNS

---

## 📊 Comparison

| Feature | Option 1: Resend Sandbox | Option 2: Resend Verified | Option 3: Gmail |
|---------|-------------------------|--------------------------|-----------------|
| **Setup Time** | 5 minutes | 30 min + DNS wait | 10 minutes |
| **DNS Required** | ❌ No | ✅ Yes | ❌ No |
| **From Address** | onboarding@resend.dev | noreply@403-ai.com | your@gmail.com |
| **Send to Anyone** | ❌ No (verified only) | ✅ Yes | ✅ Yes |
| **Email Limit** | 3,000/month | 3,000/month | 500/day |
| **Professional** | ⚠️ Okay | ✅ Yes | ⚠️ Okay |
| **Code Changes** | ❌ No | ❌ No | ✅ Yes |
| **Best For** | Testing, Initial Deploy | Production | Gmail users |

---

## 🎯 Recommended Path

### For Your Initial Deployment:

**Use Option 1 (Resend Sandbox)**

1. Sign up for Resend
2. Get API key
3. Add your personal email as verified
4. Use `EMAIL_FROM=onboarding@resend.dev`
5. Deploy and test password reset
6. Site goes live! ✅

### After Site is Live:

**Upgrade to Option 2 (Domain Verification)**

1. Add DNS records in Squarespace
2. Wait for verification (24-48 hours)
3. Change `EMAIL_FROM=noreply@403-ai.com`
4. Redeploy
5. Professional emails! ✅

---

## 🚀 Quick Start for Deployment

**Right now, to deploy:**

```env
# Use these environment variables:
RESEND_API_KEY=re_your_actual_api_key
EMAIL_FROM=onboarding@resend.dev
```

**That's it!** You can deploy immediately.

**Later, upgrade to:**

```env
# After DNS verification:
RESEND_API_KEY=re_your_actual_api_key
EMAIL_FROM=noreply@403-ai.com
```

---

## ❓ FAQ

### Q: Can I deploy without email at all?

**A:** Yes! Email is only needed for:
- Password reset (users can still sign in if they remember password)
- Newsletter (future feature, not implemented yet)
- Comments (future feature, not implemented yet)

You could deploy without email service and add it later. Just leave `RESEND_API_KEY` empty.

### Q: Will password reset work with sandbox mode?

**A:** Yes! As long as you add your email as verified in Resend dashboard, you can test password reset.

### Q: How much does Resend cost?

**A:** Free tier: 3,000 emails/month, 100 emails/day. More than enough for a blog!

### Q: Can I change email service later?

**A:** Yes! You can switch between options anytime by updating environment variables and redeploying.

### Q: Do I need to set up email forwarding in Squarespace?

**A:** No, not required. Resend handles sending emails. Forwarding is only if you want to receive replies.

---

## 📝 Summary

**For deployment TODAY:**
- Use Resend sandbox mode (Option 1)
- Takes 5 minutes to set up
- Works immediately
- Perfect for testing

**For production LATER:**
- Verify domain (Option 2)
- Takes 24-48 hours for DNS
- Professional emails from your domain
- Upgrade when ready

**Start with Option 1, upgrade to Option 2 later!**

---

Need help? Check the deployment guides or ask questions!
