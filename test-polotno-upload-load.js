/**
 * Test script for uploadPolotno and loadPolotnoDesign
 * 
 * This script tests the complete upload and load workflow:
 * 1. Creates a test Polotno JSON with embedded base64 images
 * 2. Uploads it using uploadPolotno
 * 3. Loads it back using loadPolotnoDesign
 * 4. Verifies the data integrity
 * 
 * Usage:
 *   node test-polotno-upload-load.js
 * 
 * Make sure to configure SUPABASE_URL, SUPABASE_KEY, and STORAGE_BUCKET
 * in both uploadPolotno.js and loadPolotnoDesign.js before running!
 */

const { uploadPolotno } = require('./uploadPolotno.js');
const { loadPolotnoDesign } = require('./loadPolotnoDesign.js');
const fs = require('fs').promises;
const path = require('path');

// Create a test Polotno JSON with embedded base64 images
async function createTestPolotnoJson() {
  console.log('📝 Creating test Polotno JSON file...');
  
  // Small 1x1 red pixel PNG as base64 (for testing image upload)
  const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  const testPolotnoJson = {
    width: 1920,
    height: 1080,
    unit: 'px',
    dpi: 72,
    schemaVersion: 2,
    fonts: [],
    pages: [
      {
        id: 'page-1',
        children: [
          {
            type: 'text',
            id: 'text-1',
            text: 'Test Design - Page 1',
            x: 100,
            y: 100,
            width: 500,
            height: 100,
            fontSize: 48,
            fill: '#000000'
          },
          {
            type: 'image',
            id: 'image-1',
            src: testImageBase64, // This will be uploaded and replaced
            x: 100,
            y: 250,
            width: 200,
            height: 200
          }
        ],
        background: '#ffffff'
      },
      {
        id: 'page-2',
        children: [
          {
            type: 'text',
            id: 'text-2',
            text: 'Test Design - Page 2',
            x: 100,
            y: 100,
            width: 500,
            height: 100,
            fontSize: 48,
            fill: '#000000'
          },
          {
            type: 'image',
            id: 'image-2',
            src: testImageBase64, // Another image to test
            x: 100,
            y: 250,
            width: 200,
            height: 200
          }
        ],
        background: '#f0f0f0'
      }
    ],
    audios: []
  };

  // Save to a temporary file
  const testFilePath = path.join(__dirname, 'test-polotno-design.json');
  await fs.writeFile(testFilePath, JSON.stringify(testPolotnoJson, null, 2));
  console.log(`✅ Created test file: ${testFilePath}`);
  
  return { testFilePath, testPolotnoJson };
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Polotno Upload/Load Test\n');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Create test JSON
    const { testFilePath, testPolotnoJson } = await createTestPolotnoJson();
    
    // Step 2: Upload the design
    console.log('\n📤 STEP 1: Testing uploadPolotno...');
    console.log('-'.repeat(60));
    
    const designName = `test-design-${Date.now()}`;
    const uploadResult = await uploadPolotno(testFilePath, {
      designName: designName,
      subject: 'SCIENCE',
      quarter: 'quarter1',
      gradeLevel: 'grade5'
    });
    
    console.log('\n✅ Upload successful!');
    console.log('Upload result:', JSON.stringify(uploadResult, null, 2));
    
    // Extract design ID from upload result
    const designId = uploadResult.designId;
    console.log(`\n📋 Design ID: ${designId}`);
    
    // Step 3: Wait a moment for Supabase to process
    console.log('\n⏳ Waiting 2 seconds for Supabase to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Load the design back
    console.log('\n📥 STEP 2: Testing loadPolotnoDesign...');
    console.log('-'.repeat(60));
    
    const loadedDesign = await loadPolotnoDesign(designId, {
      subject: 'SCIENCE',
      quarter: 'quarter1',
      gradeLevel: 'grade5'
    });
    
    console.log('\n✅ Load successful!');
    
    // Step 5: Verify the data
    console.log('\n🔍 STEP 3: Verifying data integrity...');
    console.log('-'.repeat(60));
    
    const verificationResults = {
      pagesCount: loadedDesign.pages?.length || 0,
      originalPagesCount: testPolotnoJson.pages.length,
      pagesMatch: (loadedDesign.pages?.length || 0) === testPolotnoJson.pages.length,
      hasImages: false,
      imagesAreUrls: false,
      widthMatch: loadedDesign.width === testPolotnoJson.width,
      heightMatch: loadedDesign.height === testPolotnoJson.height
    };
    
    // Check if images were replaced with URLs
    if (loadedDesign.pages && loadedDesign.pages.length > 0) {
      const firstPage = loadedDesign.pages[0];
      const images = firstPage.children?.filter(child => child.type === 'image') || [];
      
      if (images.length > 0) {
        verificationResults.hasImages = true;
        verificationResults.imagesAreUrls = images.every(img => 
          img.src && 
          img.src.startsWith('http') && 
          !img.src.startsWith('data:')
        );
      }
    }
    
    console.log('\n📊 Verification Results:');
    console.log(`   Pages: ${verificationResults.pagesCount} (expected: ${verificationResults.originalPagesCount}) ${verificationResults.pagesMatch ? '✅' : '❌'}`);
    console.log(`   Width: ${loadedDesign.width} (expected: ${testPolotnoJson.width}) ${verificationResults.widthMatch ? '✅' : '❌'}`);
    console.log(`   Height: ${loadedDesign.height} (expected: ${testPolotnoJson.height}) ${verificationResults.heightMatch ? '✅' : '❌'}`);
    console.log(`   Images found: ${verificationResults.hasImages ? '✅' : '❌'}`);
    console.log(`   Images converted to URLs: ${verificationResults.imagesAreUrls ? '✅' : '❌'}`);
    
    // Overall result
    const allTestsPassed = 
      verificationResults.pagesMatch &&
      verificationResults.widthMatch &&
      verificationResults.heightMatch &&
      verificationResults.hasImages &&
      verificationResults.imagesAreUrls;
    
    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! ✅');
      console.log('\nThe upload and load system is working correctly!');
    } else {
      console.log('⚠️  SOME TESTS FAILED');
      console.log('Please check the verification results above.');
    }
    console.log('='.repeat(60));
    
    // Cleanup: Delete test file
    try {
      await fs.unlink(testFilePath);
      console.log(`\n🧹 Cleaned up test file: ${testFilePath}`);
    } catch (error) {
      console.warn(`⚠️  Could not delete test file: ${error.message}`);
    }
    
    return {
      success: allTestsPassed,
      uploadResult,
      loadedDesign,
      verificationResults
    };
    
  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error);
    console.error('\nStack trace:', error.stack);
    
    // Check if it's a configuration error
    if (error.message.includes('YOUR_SUPABASE_URL_HERE') || 
        error.message.includes('YOUR_SUPABASE_ANON_KEY_HERE')) {
      console.error('\n💡 TIP: Make sure to configure SUPABASE_URL and SUPABASE_KEY');
      console.error('   in both uploadPolotno.js and loadPolotnoDesign.js');
    }
    
    throw error;
  }
}

// Run the tests
if (require.main === module) {
  runTests()
    .then(result => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      process.exit(1);
    });
}

module.exports = { runTests, createTestPolotnoJson };

