#!/bin/bash

# Script to run database migrations on Vercel production database
# Usage: ./scripts/deploy-migrations.sh

set -e

echo "🚀 Deploying Database Migrations to Vercel"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "1️⃣  Pulling production environment variables..."
vercel env pull .env.production

if [ ! -f .env.production ]; then
    echo "❌ Failed to pull environment variables"
    echo "💡 Make sure you're logged in: vercel login"
    echo "💡 Make sure project is linked: vercel link"
    exit 1
fi

echo "✅ Environment variables pulled"
echo ""

echo "2️⃣  Loading environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in environment variables"
    exit 1
fi

echo "✅ DATABASE_URL loaded"
echo ""

echo "3️⃣  Checking database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Cannot connect to database"
    echo "💡 Check your DATABASE_URL in Vercel environment variables"
    exit 1
fi

echo ""
echo "4️⃣  Running migrations..."
npx prisma migrate deploy

echo ""
echo "5️⃣  Checking migration status..."
npx prisma migrate status

echo ""
echo "6️⃣  Verifying tables exist..."

# Check if tables exist
TABLES=$(npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null | grep -E 'users|posts|categories' | wc -l)

if [ "$TABLES" -gt 0 ]; then
    echo "✅ Database tables created successfully!"
    echo ""
    echo "📊 Tables in database:"
    npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>/dev/null | grep -v "^$"
else
    echo "⚠️  Could not verify tables"
fi

echo ""
echo "=========================================="
echo "✅ Migrations Deployed Successfully!"
echo "=========================================="
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Create an admin user:"
echo "   - Go to your site: /signup"
echo "   - Create an account"
echo "   - Run in Vercel Postgres Query:"
echo "     UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
echo ""
echo "2. Test your site:"
echo "   - Sign in at /signin"
echo "   - Go to /admin/posts/new"
echo "   - Create and publish a test post"
echo "   - View it at /blog"
echo ""
echo "3. Open Prisma Studio to view data:"
echo "   npx prisma studio"
echo ""
echo "🎉 Your database is ready!"
