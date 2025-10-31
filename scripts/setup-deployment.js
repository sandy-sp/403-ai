#!/usr/bin/env node

/**
 * Automated deployment setup script
 * - Generates secrets (NEXTAUTH_SECRET, CRON_SECRET)
 * - Adds them to Vercel via API
 * - Checks database connection
 * - Runs pre-deployment checks
 */

const { execSync } = require('child_process');
const crypto = require('crypto');
const https = require('https');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

async function addVercelEnvVar(projectId, token, key, value, target = ['production', 'preview', 'development']) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      key,
      value,
      type: 'encrypted',
      target,
    });

    const options = {
      hostname: 'api.vercel.com',
      path: `/v10/projects/${projectId}/env`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Failed to add env var: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function checkDatabase() {
  log('\n🔍 Checking database connection...', 'cyan');
  
  if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL not set', 'red');
    return false;
  }

  try {
    execSync('npx prisma db execute --stdin <<< "SELECT 1;"', { 
      stdio: 'pipe',
      encoding: 'utf-8' 
    });
    log('✅ Database connection successful', 'green');
    return true;
  } catch (error) {
    log('❌ Cannot connect to database', 'red');
    log('💡 Please check your DATABASE_URL', 'yellow');
    return false;
  }
}

async function checkMigrations() {
  log('\n📊 Checking database migrations...', 'cyan');
  
  try {
    const output = execSync('npx prisma migrate status', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    if (output.includes('Database schema is up to date')) {
      log('✅ Database schema is up to date', 'green');
      return true;
    } else if (output.includes('following migrations have not yet been applied')) {
      log('⚠️  Pending migrations detected', 'yellow');
      log('💡 Run: npx prisma migrate deploy', 'yellow');
      return false;
    }
  } catch (error) {
    log('⚠️  Could not check migration status', 'yellow');
    return false;
  }
}

async function runBuild() {
  log('\n🔨 Running production build...', 'cyan');
  
  try {
    execSync('npm run build', { 
      stdio: 'inherit',
      encoding: 'utf-8' 
    });
    log('✅ Build successful', 'green');
    return true;
  } catch (error) {
    log('❌ Build failed', 'red');
    return false;
  }
}

async function main() {
  log('🚀 403 AI - Automated Deployment Setup', 'cyan');
  log('========================================\n', 'cyan');

  // Step 1: Generate secrets
  log('1️⃣  Generating secrets...', 'blue');
  const NEXTAUTH_SECRET = generateSecret();
  const CRON_SECRET = generateSecret();
  log('✅ Secrets generated', 'green');

  // Step 2: Check for Vercel token and project ID
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

  if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
    log('\n2️⃣  Adding secrets to Vercel...', 'blue');
    
    try {
      await addVercelEnvVar(VERCEL_PROJECT_ID, VERCEL_TOKEN, 'NEXTAUTH_SECRET', NEXTAUTH_SECRET);
      log('✅ NEXTAUTH_SECRET added to Vercel', 'green');
      
      await addVercelEnvVar(VERCEL_PROJECT_ID, VERCEL_TOKEN, 'CRON_SECRET', CRON_SECRET);
      log('✅ CRON_SECRET added to Vercel', 'green');
    } catch (error) {
      log(`❌ Failed to add secrets to Vercel: ${error.message}`, 'red');
      log('💡 You can add them manually in Vercel dashboard', 'yellow');
    }
  } else {
    log('\n2️⃣  Vercel credentials not found', 'yellow');
    log('💡 To auto-add secrets to Vercel, set these environment variables:', 'yellow');
    log('   VERCEL_TOKEN=your_vercel_token', 'yellow');
    log('   VERCEL_PROJECT_ID=your_project_id', 'yellow');
    log('\n📋 Generated secrets (add these to Vercel manually):', 'cyan');
    log(`   NEXTAUTH_SECRET=${NEXTAUTH_SECRET}`, 'cyan');
    log(`   CRON_SECRET=${CRON_SECRET}`, 'cyan');
  }

  // Step 3: Check database
  const dbConnected = await checkDatabase();
  
  if (dbConnected) {
    await checkMigrations();
  }

  // Step 4: Run build
  const buildSuccess = await runBuild();

  // Summary
  log('\n========================================', 'cyan');
  log('📊 Setup Summary', 'cyan');
  log('========================================\n', 'cyan');

  if (buildSuccess && dbConnected) {
    log('✅ All checks passed! Ready to deploy.', 'green');
    log('\n🚀 To deploy to Vercel, run:', 'cyan');
    log('   vercel --prod', 'cyan');
  } else {
    log('⚠️  Some checks failed. Review above.', 'yellow');
    if (!dbConnected) {
      log('💡 Fix database connection before deploying', 'yellow');
    }
    if (!buildSuccess) {
      log('💡 Fix build errors before deploying', 'yellow');
    }
  }

  log('');
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { generateSecret, addVercelEnvVar, checkDatabase, checkMigrations };
