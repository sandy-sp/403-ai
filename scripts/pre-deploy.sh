#!/bin/bash

# Pre-deployment script - runs all checks before deploying
# Usage: ./scripts/pre-deploy.sh

set -e

echo "🚀 403 AI - Pre-Deployment Checks"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# 1. Check Node.js version
echo "1️⃣  Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    print_status 0 "Node.js version: $(node -v)"
else
    print_status 1 "Node.js version too old. Required: 18+, Found: $(node -v)"
fi
echo ""

# 2. Check if dependencies are installed
echo "2️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    print_status 0 "Dependencies installed"
else
    echo "Installing dependencies..."
    npm install
    print_status $? "Dependencies installation"
fi
echo ""

# 3. Run TypeScript type check
echo "3️⃣  Running TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
    print_status 0 "TypeScript compilation"
else
    print_status 1 "TypeScript compilation failed"
    echo "Run 'npm run type-check' to see errors"
fi
echo ""

# 4. Check environment variables
echo "4️⃣  Checking environment variables..."
REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
    "CLOUDINARY_API_KEY"
    "CLOUDINARY_API_SECRET"
    "RESEND_API_KEY"
    "EMAIL_FROM"
    "CRON_SECRET"
)

MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    print_status 0 "All required environment variables set"
else
    print_status 1 "Missing environment variables: ${MISSING_VARS[*]}"
    echo "💡 Run './scripts/setup-vercel-env.sh' to generate secrets"
fi
echo ""

# 5. Check database connection
echo "5️⃣  Checking database connection..."
if [ -n "$DATABASE_URL" ]; then
    if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        print_status 0 "Database connection"
    else
        print_status 1 "Cannot connect to database"
        echo "💡 Run './scripts/check-database.sh' for detailed diagnostics"
    fi
else
    print_warning "DATABASE_URL not set, skipping database check"
fi
echo ""

# 6. Validate Prisma schema
echo "6️⃣  Validating Prisma schema..."
if npx prisma validate > /dev/null 2>&1; then
    print_status 0 "Prisma schema validation"
else
    print_status 1 "Prisma schema validation failed"
fi
echo ""

# 7. Check migration status
echo "7️⃣  Checking database migrations..."
if [ -n "$DATABASE_URL" ]; then
    MIGRATION_STATUS=$(npx prisma migrate status 2>&1 || true)
    if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
        print_status 0 "Database migrations"
    else
        print_warning "Pending migrations detected"
        echo "💡 Run 'npx prisma migrate deploy' to apply migrations"
    fi
else
    print_warning "DATABASE_URL not set, skipping migration check"
fi
echo ""

# 8. Run build
echo "8️⃣  Running production build..."
if npm run build > /tmp/build.log 2>&1; then
    print_status 0 "Production build"
else
    print_status 1 "Production build failed"
    echo "Last 20 lines of build log:"
    tail -20 /tmp/build.log
fi
echo ""

# 9. Check for security vulnerabilities
echo "9️⃣  Checking for security vulnerabilities..."
AUDIT_OUTPUT=$(npm audit --audit-level=high 2>&1 || true)
if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    print_status 0 "No high/critical vulnerabilities"
elif echo "$AUDIT_OUTPUT" | grep -q "found.*vulnerabilities"; then
    print_warning "Security vulnerabilities found"
    echo "Run 'npm audit' for details"
else
    print_status 0 "Security check complete"
fi
echo ""

# Summary
echo "=================================="
echo "📊 Pre-Deployment Summary"
echo "=================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
    echo ""
    echo "🚀 To deploy to Vercel, run:"
    echo "   vercel --prod"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found. Review before deploying.${NC}"
    echo ""
    echo "You can still deploy, but consider fixing warnings first."
    echo ""
    echo "🚀 To deploy to Vercel, run:"
    echo "   vercel --prod"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found. Fix before deploying.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) also found.${NC}"
    fi
    echo ""
    echo "Please fix the errors above before deploying."
    exit 1
fi
