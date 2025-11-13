/**
 * Quick test script for a single Polotno JSON file
 * 
 * Usage:
 *   node test-single-file.js [filename]
 * 
 * Example:
 *   node test-single-file.js "docs/mvUH_7HdaG.json"
 *   node test-single-file.js "docs/GKFvFOv4_c(1).json"
 */

const { uploadPolotno } = require('./uploadPolotno.js');
const { loadPolotnoDesign } = require('./loadPolotnoDesign.js');
const path = require('path');
const fs = require('fs');

// Get file path from command line or use default
const filePath = process.argv[2] || path.join(__dirname, 'docs', 'mvUH_7HdaG.json');

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  console.error('\nUsage: node test-single-file.js [path-to-json-file]');
  process.exit(1);
}

async function testSingleFile() {
  console.log('🧪 Testing Single Polotno JSON File');
  console.log('='.repeat(70));
  console.log(`📄 File: ${filePath}`);
  
  // Get file size
  const stats = fs.statSync(filePath);
  const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`📊 Size: ${fileSizeMB} MB`);
  console.log('='.repeat(70));

  try {
    // Step 1: Upload
    console.log('\n📤 Uploading...');
    const fileName = path.basename(filePath, '.json');
    const designName = `test-${fileName}-${Date.now()}`;
    
    const uploadResult = await uploadPolotno(filePath, {
      designName: designName,
      subject: 'SCIENCE',
      quarter: 'quarter1',
      gradeLevel: 'grade5'
    });

    console.log('\n✅ Upload complete!');
    console.log(`   Design ID: ${uploadResult.designId}`);
    console.log(`   Images uploaded: ${uploadResult.imagesUploaded}`);
    console.log(`   Parts: ${uploadResult.parts.length}`);
    console.log(`   Optimized size: ${(uploadResult.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Size savings: ${uploadResult.savings}`);

    // Step 2: Wait
    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Load
    console.log('\n📥 Loading back...');
    const loadedDesign = await loadPolotnoDesign(uploadResult.designId, {
      subject: 'SCIENCE',
      quarter: 'quarter1',
      gradeLevel: 'grade5'
    });

    console.log('\n✅ Load complete!');
    console.log(`   Pages: ${loadedDesign.pages?.length || loadedDesign.slides?.length || 0}`);
    console.log(`   Dimensions: ${loadedDesign.width}x${loadedDesign.height}`);

    // Check images
    let imageCount = 0;
    let urlCount = 0;
    if (loadedDesign.pages) {
      loadedDesign.pages.forEach(page => {
        if (page.children) {
          page.children.forEach(child => {
            if (child.type === 'image' && child.src) {
              imageCount++;
              if (child.src.startsWith('http')) urlCount++;
            }
          });
        }
      });
    }

    console.log(`   Images: ${urlCount}/${imageCount} converted to URLs`);

    console.log('\n🎉 SUCCESS! ✅');
    console.log(`\n💡 Design ID saved: ${uploadResult.designId}`);
    console.log('   You can use this ID to load the design later!');

    return { success: true, designId: uploadResult.designId };

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.message.includes('YOUR_SUPABASE')) {
      console.error('\n💡 Make sure to configure SUPABASE_URL and SUPABASE_KEY');
      console.error('   in both uploadPolotno.js and loadPolotnoDesign.js');
    }
    throw error;
  }
}

testSingleFile()
  .then(result => {
    process.exit(0);
  })
  .catch(error => {
    process.exit(1);
  });

