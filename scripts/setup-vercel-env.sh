#!/bin/bash

# Script to generate and add environment variables to Vercel
# Usage: ./scripts/setup-vercel-env.sh

set -e

echo "🔐 Generating secrets for Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Generate secrets
echo "📝 Generating NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "📝 Generating CRON_SECRET..."
CRON_SECRET=$(openssl rand -base64 32)

echo ""
echo "✅ Secrets generated successfully!"
echo ""
echo "🚀 Adding secrets to Vercel..."

# Add to Vercel (production)
vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET"
vercel env add CRON_SECRET production <<< "$CRON_SECRET"

# Add to Vercel (preview)
vercel env add NEXTAUTH_SECRET preview <<< "$NEXTAUTH_SECRET"
vercel env add CRON_SECRET preview <<< "$CRON_SECRET"

# Add to Vercel (development)
vercel env add NEXTAUTH_SECRET development <<< "$NEXTAUTH_SECRET"
vercel env add CRON_SECRET development <<< "$CRON_SECRET"

echo ""
echo "✅ Secrets added to Vercel successfully!"
echo ""
echo "📋 Summary:"
echo "  NEXTAUTH_SECRET: ✅ Added to all environments"
echo "  CRON_SECRET: ✅ Added to all environments"
echo ""
echo "🎉 Setup complete! You can now deploy to Vercel."
echo ""
echo "💡 To deploy, run: vercel --prod"
