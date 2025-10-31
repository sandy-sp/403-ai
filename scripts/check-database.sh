#!/bin/bash

# Script to check database connection and setup before deployment
# Usage: ./scripts/check-database.sh

set -e

echo "🔍 Checking database connection..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "💡 Please set DATABASE_URL in your .env file or environment"
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Check if Prisma is installed
if ! command -v prisma &> /dev/null; then
    echo "❌ Prisma CLI not found. Installing..."
    npm install
fi

echo ""
echo "🔌 Testing database connection..."

# Try to connect to database using Prisma
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Cannot connect to database"
    echo "💡 Please check your DATABASE_URL and ensure the database server is running"
    exit 1
fi

echo ""
echo "📊 Checking database schema..."

# Check if migrations are applied
MIGRATION_STATUS=$(npx prisma migrate status 2>&1 || true)

if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo "✅ Database schema is up to date"
elif echo "$MIGRATION_STATUS" | grep -q "following migrations have not yet been applied"; then
    echo "⚠️  Pending migrations detected"
    echo ""
    echo "Would you like to apply migrations now? (y/n)"
    read -r APPLY_MIGRATIONS
    
    if [ "$APPLY_MIGRATIONS" = "y" ] || [ "$APPLY_MIGRATIONS" = "Y" ]; then
        echo "🔄 Applying migrations..."
        npx prisma migrate deploy
        echo "✅ Migrations applied successfully!"
    else
        echo "⚠️  Skipping migrations. Remember to apply them before deployment!"
    fi
else
    echo "⚠️  Cannot determine migration status. This might be a new database."
    echo ""
    echo "Would you like to initialize the database? (y/n)"
    read -r INIT_DB
    
    if [ "$INIT_DB" = "y" ] || [ "$INIT_DB" = "Y" ]; then
        echo "🔄 Initializing database..."
        npx prisma migrate deploy
        echo "✅ Database initialized successfully!"
    else
        echo "⚠️  Skipping database initialization"
    fi
fi

echo ""
echo "🔍 Checking if tables exist..."

# Check if User table exists (as a proxy for all tables)
if npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"users\" LIMIT 1;" > /dev/null 2>&1; then
    echo "✅ Database tables exist"
else
    echo "❌ Database tables do not exist"
    echo "💡 Running migrations to create tables..."
    npx prisma migrate deploy
    echo "✅ Database tables created successfully!"
fi

echo ""
echo "📈 Database statistics:"

# Get table counts
echo "  Users: $(npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM "users";' 2>/dev/null | tail -1 || echo '0')"
echo "  Posts: $(npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM "posts";' 2>/dev/null | tail -1 || echo '0')"
echo "  Comments: $(npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM "comments";' 2>/dev/null | tail -1 || echo '0')"
echo "  Categories: $(npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM "categories";' 2>/dev/null | tail -1 || echo '0')"

echo ""
echo "✅ Database check complete!"
echo ""
echo "🎉 Your database is ready for deployment!"
