/**
 * Test R2 Connection
 * 
 * This script tests your R2 configuration by:
 * 1. Checking environment variables are loaded
 * 2. Testing connection to R2
 * 3. Testing a simple upload/download
 * 
 * Run: node test-r2-connection.js
 */

// Load environment variables from .env file
const fs = require('fs');
const path = require('path');

// Simple .env parser
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

const env = loadEnv();

const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// R2 Configuration (from .env file)
const R2_ACCOUNT_ID = env.VITE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.VITE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.VITE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = env.VITE_R2_BUCKET_NAME;
const R2_ENDPOINT = R2_ACCOUNT_ID 
  ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : '';

console.log('🧪 Testing R2 Connection...\n');
console.log('='.repeat(60));

// Check configuration
console.log('📋 Configuration Check:');
console.log(`   Account ID: ${R2_ACCOUNT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   Access Key ID: ${R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   Secret Access Key: ${R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   Bucket Name: ${R2_BUCKET_NAME || '❌ Missing'}`);
console.log(`   Endpoint: ${R2_ENDPOINT || '❌ Missing'}`);

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.log('\n❌ Configuration incomplete! Please check your .env file.');
  process.exit(1);
}

// Initialize S3 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function testConnection() {
  try {
    console.log('\n🔌 Testing Connection...');
    
    // Test 1: List objects (this tests authentication)
    console.log('   Test 1: Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      MaxKeys: 1,
    });
    
    const listResponse = await r2Client.send(listCommand);
    console.log('   ✅ Connection successful!');
    console.log(`   📦 Objects in bucket: ${listResponse.KeyCount || 0}`);
    
    // Test 2: Upload a test file
    console.log('\n   Test 2: Uploading test file...');
    const testKey = `test-connection-${Date.now()}.txt`;
    const testContent = `R2 Connection Test - ${new Date().toISOString()}`;
    
    try {
      const putCommand = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain',
      });
      
      await r2Client.send(putCommand);
      console.log(`   ✅ Upload successful! File: ${testKey}`);
    } catch (uploadError) {
      console.log(`   ⚠️  Upload failed: ${uploadError.message}`);
      console.log('\n   💡 This might mean:');
      console.log('      - Your API token needs "Object Write" permission');
      console.log('      - Check your R2 API token permissions in Cloudflare dashboard');
      console.log('      - Go to: R2 → Manage R2 API Tokens → Edit your token');
      console.log('      - Make sure "Object Write" is enabled');
      throw uploadError;
    }
    
    // Test 3: Download the test file
    console.log('\n   Test 3: Downloading test file...');
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: testKey,
    });
    
    const getResponse = await r2Client.send(getCommand);
    const downloadedContent = await getResponse.Body.transformToString();
    
    if (downloadedContent === testContent) {
      console.log('   ✅ Download successful! Content matches.');
    } else {
      console.log('   ⚠️  Download successful but content mismatch.');
    }
    
    // Test 4: Check public URL
    console.log('\n   Test 4: Public URL format...');
    const publicUrl = `https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev/${R2_BUCKET_NAME}/${testKey}`;
    console.log(`   📍 Public URL: ${publicUrl}`);
    console.log('   ℹ️  Note: This URL will only work if public access is enabled on your bucket.');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests passed! Your R2 configuration is working correctly.');
    console.log('\n✅ Your R2 setup is ready to use!');
    console.log('   - Files will be uploaded to: lessonflarer2 bucket');
    console.log('   - Public URL: https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev');
    console.log(`   - Test file uploaded: ${testKey}`);
    console.log('\n💡 You can delete the test file from your R2 bucket if you want.');
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.error('❌ Test failed!');
    console.error('Error:', error.message);
    
    if (error.name === 'InvalidAccessKeyId' || error.name === 'SignatureDoesNotMatch') {
      console.error('\n💡 This usually means:');
      console.error('   - Your Access Key ID or Secret Access Key is incorrect');
      console.error('   - Check your .env file has the correct credentials');
    } else if (error.name === 'NoSuchBucket') {
      console.error('\n💡 This usually means:');
      console.error('   - Your bucket name is incorrect');
      console.error('   - Check that "lessonflarer2" exists in your R2 dashboard');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 This usually means:');
      console.error('   - Network connection issue');
      console.error('   - Check your internet connection');
      console.error('   - Verify the endpoint URL is correct');
    }
    
    process.exit(1);
  }
}

// Run tests
testConnection();

