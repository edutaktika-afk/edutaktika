/**
 * Test script using real Polotno JSON files from docs folder
 * 
 * This will test uploadPolotno and loadPolotnoDesign with your actual design files.
 * 
 * Usage:
 *   node test-with-real-files.js
 */

const { uploadPolotno } = require('./uploadPolotno.js');
const { loadPolotnoDesign } = require('./loadPolotnoDesign.js');
const path = require('path');

// Test files from docs folder
const testFiles = [
  {
    name: 'mvUH_7HdaG.json',
    path: path.join(__dirname, 'docs', 'mvUH_7HdaG.json'),
    description: 'Smaller test file (362KB)'
  },
  {
    name: 'GKFvFOv4_c(1).json',
    path: path.join(__dirname, 'docs', 'GKFvFOv4_c(1).json'),
    description: 'Large test file (13MB) - will test splitting if needed'
  }
];

async function testFile(fileInfo) {
  console.log('\n' + '='.repeat(70));
  console.log(`📄 Testing: ${fileInfo.name}`);
  console.log(`   ${fileInfo.description}`);
  console.log('='.repeat(70));

  try {
    // Step 1: Upload
    console.log('\n📤 STEP 1: Uploading...');
    const designName = `test-${path.basename(fileInfo.name, '.json')}-${Date.now()}`;
    
    const uploadResult = await uploadPolotno(fileInfo.path, {
      designName: designName,
      subject: 'SCIENCE',
      quarter: 'quarter1',
      gradeLevel: 'grade5'
    });

    console.log('\n✅ Upload successful!');
    console.log(`   Design ID: ${uploadResult.designId}`);
    console.log(`   Images uploaded: ${uploadResult.imagesUploaded}`);
    console.log(`   Parts uploaded: ${uploadResult.parts.length}`);
    console.log(`   Total size: ${(uploadResult.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Original size: ${(uploadResult.originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Size reduction: ${uploadResult.savings}`);

    // Step 2: Wait for Supabase to process
    console.log('\n⏳ Waiting 3 seconds for Supabase to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Load back
    console.log('\n📥 STEP 2: Loading design back...');
    const loadedDesign = await loadPolotnoDesign(uploadResult.designId, {
      subject: 'SCIENCE',
      quarter: 'quarter1',
      gradeLevel: 'grade5'
    });

    console.log('\n✅ Load successful!');
    console.log(`   Pages found: ${loadedDesign.pages?.length || loadedDesign.slides?.length || 0}`);
    console.log(`   Dimensions: ${loadedDesign.width}x${loadedDesign.height}`);
    console.log(`   Schema version: ${loadedDesign.schemaVersion || 'N/A'}`);

    // Step 4: Verify
    console.log('\n🔍 STEP 3: Verification...');
    
    // Check if images were converted to URLs
    let imageCount = 0;
    let urlImageCount = 0;
    let base64ImageCount = 0;

    if (loadedDesign.pages) {
      loadedDesign.pages.forEach(page => {
        if (page.children) {
          page.children.forEach(child => {
            if (child.type === 'image' && child.src) {
              imageCount++;
              if (child.src.startsWith('http')) {
                urlImageCount++;
              } else if (child.src.startsWith('data:')) {
                base64ImageCount++;
              }
            }
          });
        }
      });
    }

    console.log(`   Images found: ${imageCount}`);
    console.log(`   Images as URLs: ${urlImageCount} ${urlImageCount === imageCount ? '✅' : '⚠️'}`);
    console.log(`   Images still base64: ${base64ImageCount} ${base64ImageCount === 0 ? '✅' : '⚠️'}`);

    // Overall result
    const success = 
      (loadedDesign.pages?.length || loadedDesign.slides?.length || 0) > 0 &&
      urlImageCount === imageCount &&
      base64ImageCount === 0;

    if (success) {
      console.log('\n🎉 TEST PASSED for ' + fileInfo.name + ' ✅');
    } else {
      console.log('\n⚠️  TEST HAD ISSUES for ' + fileInfo.name);
    }

    return {
      success,
      fileInfo,
      uploadResult,
      loadedDesign,
      imageCount,
      urlImageCount,
      base64ImageCount
    };

  } catch (error) {
    console.error('\n❌ TEST FAILED for ' + fileInfo.name);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return {
      success: false,
      fileInfo,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('🧪 Testing with Real Polotno JSON Files');
  console.log('='.repeat(70));
  console.log(`\nFound ${testFiles.length} test file(s) to process\n`);

  const results = [];

  for (const fileInfo of testFiles) {
    const result = await testFile(fileInfo);
    results.push(result);
    
    // Wait a bit between tests
    if (fileInfo !== testFiles[testFiles.length - 1]) {
      console.log('\n⏸️  Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`\n${status}: ${result.fileInfo.name}`);
    if (result.success) {
      console.log(`   - Images: ${result.urlImageCount}/${result.imageCount} converted to URLs`);
      console.log(`   - Parts: ${result.uploadResult.parts.length}`);
      console.log(`   - Size: ${(result.uploadResult.totalSize / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.log(`   - Error: ${result.error || 'Unknown error'}`);
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log(`Total: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(70));

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! ✅');
    console.log('Your upload and load system is working perfectly with real files!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }

  return results;
}

// Run tests
if (require.main === module) {
  runAllTests()
    .then(results => {
      const allPassed = results.every(r => r.success);
      process.exit(allPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testFile };

