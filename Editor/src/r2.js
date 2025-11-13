/**
 * Cloudflare R2 Storage Configuration
 * 
 * R2 is used for storing actual files (JSON designs, images, media)
 * Supabase is kept for metadata (thumbnails, references, design lists)
 * 
 * Setup Required:
 * 1. Create a Cloudflare R2 bucket at https://dash.cloudflare.com
 * 2. Generate API tokens (Access Key ID and Secret Access Key)
 * 3. Get your Account ID from Cloudflare dashboard
 * 4. Add environment variables to your .env file:
 *    VITE_R2_ACCOUNT_ID=your_account_id
 *    VITE_R2_ACCESS_KEY_ID=your_access_key_id
 *    VITE_R2_SECRET_ACCESS_KEY=your_secret_access_key
 *    VITE_R2_BUCKET_NAME=your_bucket_name
 *    VITE_R2_PUBLIC_URL=your_public_url (optional, if using custom domain)
 */

import { S3Client } from '@aws-sdk/client-s3';

// R2 Configuration from environment variables
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || 'edutaktika-storage';
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || ''; // Optional custom domain

// R2 endpoint format: https://<account_id>.r2.cloudflarestorage.com
const R2_ENDPOINT = R2_ACCOUNT_ID 
  ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : '';

// Initialize S3 client for R2 (R2 is S3-compatible)
// Note: AWS SDK v3 works in browsers but requires proper CORS configuration on R2 bucket
let r2Client = null;

if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  try {
    r2Client = new S3Client({
      region: 'auto', // R2 uses 'auto' as region
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
      // Force path style for R2 compatibility
      forcePathStyle: true,
    });
    console.log('✅ R2 client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize R2 client:', error);
    r2Client = null;
  }
}

export { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL };

// Check if R2 is properly configured
export const shouldUseR2 = () => {
  return R2_ACCOUNT_ID && 
         R2_ACCESS_KEY_ID && 
         R2_SECRET_ACCESS_KEY && 
         R2_BUCKET_NAME &&
         R2_ACCOUNT_ID !== 'YOUR_R2_ACCOUNT_ID' &&
         R2_ACCESS_KEY_ID !== 'YOUR_R2_ACCESS_KEY_ID' &&
         R2_SECRET_ACCESS_KEY !== 'YOUR_R2_SECRET_ACCESS_KEY';
};

// Subject folder mapping (same as Supabase)
export const FOLDER_SCIENCE = 'SCIENCE';
export const FOLDER_ENGLISH = 'ENGLISH';
export const FOLDER_MATH = 'MATH';

// Subject folder mapping helper
export const getSubjectFolder = (subject) => {
  if (!subject) return '';
  
  // Normalize subject name - handle both "math" and "subject_math" formats
  let normalized = subject.toLowerCase();
  if (normalized.startsWith('subject_')) {
    normalized = normalized.replace('subject_', '');
  }
  
  const folders = {
    science: FOLDER_SCIENCE,
    english: FOLDER_ENGLISH,
    math: FOLDER_MATH
  };
  
  const folder = folders[normalized];
  console.log(`📁 getSubjectFolder: "${subject}" → normalized: "${normalized}" → folder: "${folder}"`);
  return folder || '';
};

/**
 * Get public URL for an R2 object
 * If R2_PUBLIC_URL is set (custom domain or public R2 URL), use that
 * Otherwise, use the R2 public URL format
 */
export const getR2PublicUrl = (key) => {
  if (R2_PUBLIC_URL) {
    // Public URL configured (custom domain or public R2 URL)
    // If the public URL already includes the bucket name, use it as-is
    // Otherwise, append the key to the public URL
    if (R2_PUBLIC_URL.includes(R2_BUCKET_NAME)) {
      // Public URL already includes bucket name
      return `${R2_PUBLIC_URL}/${key}`;
    } else {
      // Public URL is just the domain, need to add bucket and key
      return `${R2_PUBLIC_URL}/${R2_BUCKET_NAME}/${key}`;
    }
  }
  
  // Default R2 public URL format (fallback if no public URL configured)
  // Note: R2 buckets are private by default. You need to:
  // 1. Enable public access on the bucket, OR
  // 2. Use presigned URLs, OR
  // 3. Set up a custom domain with public access
  if (R2_ACCOUNT_ID) {
    return `https://pub-${R2_ACCOUNT_ID}.r2.dev/${R2_BUCKET_NAME}/${key}`;
  }
  
  return null;
};

