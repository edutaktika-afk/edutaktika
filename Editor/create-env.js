/**
 * Script to create .env file with R2 credentials
 * Run: node create-env.js
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Polotno API Key Configuration
VITE_POLOTNO_API_KEY=KZiuYryOVcs9sz8q8A1l

# Cloudflare R2 Storage Configuration
# Account ID (from Cloudflare dashboard)
VITE_R2_ACCOUNT_ID=87001b07874e84e7839c624361f60a3d

# R2 API Token Credentials
# Access Key ID (from R2 API Tokens)
# ⚠️ NEVER COMMIT THESE VALUES! Get them from Cloudflare R2 dashboard
VITE_R2_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID_HERE

# Secret Access Key (from R2 API Tokens)
# ⚠️ NEVER COMMIT THESE VALUES! Get them from Cloudflare R2 dashboard
VITE_R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY_HERE

# R2 Bucket Name
VITE_R2_BUCKET_NAME=lessonflarer2

# Public URL for accessing files (your R2 public domain)
VITE_R2_PUBLIC_URL=https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev

# Optional: Supabase credentials (if using Supabase for metadata)
# Uncomment and fill in if needed:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
`;

const envPath = path.join(__dirname, '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('Backing up to .env.backup...');
    fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
  }

  // Write .env file
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ .env file created successfully!');
  console.log('📁 Location:', envPath);
  console.log('\n🔐 Your R2 credentials have been configured:');
  console.log('   - Account ID: 87001b07874e84e7839c624361f60a3d');
  console.log('   - Access Key ID: [REDACTED - check your Cloudflare dashboard]');
  console.log('   - Bucket: lessonflarer2');
  console.log('   - Public URL: https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev');
  console.log('\n⚠️  IMPORTANT: Restart your development server for changes to take effect!');
  console.log('   Run: npm run dev (or your start command)');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

