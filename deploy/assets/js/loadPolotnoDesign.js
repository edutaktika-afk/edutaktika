/**
 * Polotno JSON Load Helper for Supabase
 * 
 * This script loads and merges Polotno JSON files from Supabase Storage:
 * - Finds all parts of a design (e.g., design_123_part1.json, design_123_part2.json)
 * - Downloads each part from Supabase Storage
 * - Merges their pages/slides arrays into one complete JSON object
 * - Returns the merged design ready for Polotno
 * 
 * Usage:
 *   const { loadPolotnoDesign } = require('./loadPolotnoDesign.js');
 *   const design = await loadPolotnoDesign('design_123');
 * 
 * Or in browser:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="./loadPolotnoDesign.js"></script>
 *   const design = await loadPolotnoDesign('design_123');
 */

// ============================================================================
// CONFIGURATION - EDIT THESE VALUES
// ============================================================================
const SUPABASE_URL = 'https://liiwqyodlzivzzethyrj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaXdxeW9kbHppdnp6ZXRoeXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDY0MTYsImV4cCI6MjA3NzU4MjQxNn0.5sPzjw-DLvZ5bA7NlRF5YdunBD-nOsQ0GC8ALz03sFE';
const STORAGE_BUCKET = 'LessonStorage'; // Default bucket name

// ============================================================================
// DEPENDENCIES
// ============================================================================

// Check if we're in Node.js environment
const isNode = typeof require !== 'undefined' && typeof window === 'undefined';

let supabase;

if (isNode) {
  // Node.js environment
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  // Browser environment - expects supabase to be loaded globally
  if (typeof supabase === 'undefined' || typeof supabase.createClient === 'undefined') {
    console.error('Supabase SDK not loaded. Please include: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
  } else {
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Recursively list all files in a directory and subdirectories
 */
async function listAllFiles(path = '', bucket = STORAGE_BUCKET) {
  const allFiles = [];
  
  async function listRecursive(currentPath) {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list(currentPath, {
        limit: 1000,
        offset: 0,
      });

    if (error) {
      console.warn(`⚠️  Error listing ${currentPath}:`, error.message);
      return;
    }

    if (!files || files.length === 0) {
      return;
    }

    for (const file of files) {
      const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      
      if (file.id === null) {
        // It's a folder, recurse
        await listRecursive(fullPath);
      } else {
        // It's a file
        allFiles.push({
          name: file.name,
          path: fullPath,
          size: file.metadata?.size || 0
        });
      }
    }
  }

  await listRecursive(path);
  return allFiles;
}

/**
 * Find all JSON files matching a design ID pattern
 */
function findDesignFiles(files, designId) {
  // Match patterns like:
  // - design_123.json
  // - design_123_part1.json
  // - design_123_part2.json
  // - design_123_part_1.json (alternative format)
  const pattern = new RegExp(`^${designId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(_part\\d+)?\\.json$`, 'i');
  
  return files
    .filter(file => pattern.test(file.name))
    .sort((a, b) => {
      // Sort by part number if present
      const aMatch = a.name.match(/_part(\d+)/i);
      const bMatch = b.name.match(/_part(\d+)/i);
      
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      if (aMatch) return 1; // Parts come after main file
      if (bMatch) return -1;
      return 0; // No part number, maintain order
    });
}

/**
 * Download and parse a JSON file from Supabase Storage
 */
async function downloadJsonFile(filePath, bucket = STORAGE_BUCKET) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(filePath);

  if (error) {
    throw new Error(`Failed to download ${filePath}: ${error.message}`);
  }

  // Convert blob to text
  let text;
  if (isNode) {
    // In Node.js, Supabase returns a Blob, convert it to Buffer then to string
    const arrayBuffer = await data.arrayBuffer();
    text = Buffer.from(arrayBuffer).toString('utf8');
  } else {
    text = await data.text();
  }

  // Parse JSON
  try {
    return JSON.parse(text);
  } catch (parseError) {
    throw new Error(`Failed to parse JSON from ${filePath}: ${parseError.message}`);
  }
}

/**
 * Merge multiple Polotno design parts into one complete design
 */
function mergeDesignParts(parts) {
  if (parts.length === 0) {
    throw new Error('No design parts to merge');
  }

  if (parts.length === 1) {
    console.log('   Single file detected, no merging needed');
    return parts[0];
  }

  console.log(`   Merging ${parts.length} parts...`);

  // Start with the first part as the base
  const merged = { ...parts[0] };

  // Merge pages/slides arrays from all parts
  const pagesKey = merged.pages ? 'pages' : (merged.slides ? 'slides' : null);
  
  if (!pagesKey) {
    console.warn('⚠️  No pages or slides array found, returning first part as-is');
    return merged;
  }

  // Initialize merged array with first part's pages/slides
  merged[pagesKey] = [...(merged[pagesKey] || [])];

  // Merge pages/slides from remaining parts
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const partPages = part.pages || part.slides || [];
    
    if (Array.isArray(partPages) && partPages.length > 0) {
      merged[pagesKey].push(...partPages);
      console.log(`   Added ${partPages.length} ${pagesKey} from part ${i + 1}`);
    }
  }

  // Merge other arrays if they exist (fonts, audios, etc.)
  if (merged.fonts && Array.isArray(merged.fonts)) {
    const allFonts = new Set(merged.fonts.map(f => JSON.stringify(f)));
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].fonts && Array.isArray(parts[i].fonts)) {
        parts[i].fonts.forEach(font => {
          allFonts.add(JSON.stringify(font));
        });
      }
    }
    merged.fonts = Array.from(allFonts).map(f => JSON.parse(f));
  }

  if (merged.audios && Array.isArray(merged.audios)) {
    const allAudios = new Set(merged.audios.map(a => JSON.stringify(a)));
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].audios && Array.isArray(parts[i].audios)) {
        parts[i].audios.forEach(audio => {
          allAudios.add(JSON.stringify(audio));
        });
      }
    }
    merged.audios = Array.from(allAudios).map(a => JSON.parse(a));
  }

  console.log(`   ✅ Merged ${merged[pagesKey].length} total ${pagesKey}`);
  return merged;
}

// ============================================================================
// MAIN LOAD FUNCTION
// ============================================================================

/**
 * Load a Polotno design from Supabase Storage
 * 
 * @param {string} designId - Design ID to load (e.g., 'design_123' or 'my_design_1234567890')
 * @param {Object} options - Optional configuration
 * @param {string} options.searchPath - Specific path to search in (e.g., 'SCIENCE/quarter1')
 * @param {string} options.subject - Subject folder to search (MATH, SCIENCE, ENGLISH)
 * @param {string} options.quarter - Quarter folder to search (quarter1, quarter2, etc.)
 * @param {string} options.gradeLevel - Grade level folder to search (grade5, grade6, etc.)
 * @returns {Promise<Object>} Complete merged Polotno design JSON
 */
async function loadPolotnoDesign(designId, options = {}) {
  const {
    searchPath = '',
    subject = '',
    quarter = '',
    gradeLevel = ''
  } = options;

  console.log('🔍 Fetching design parts...');
  console.log(`   Design ID: ${designId}`);

  // Validate configuration
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('YOUR_SUPABASE') || SUPABASE_KEY.includes('YOUR_SUPABASE')) {
    throw new Error('❌ Please configure SUPABASE_URL and SUPABASE_KEY at the top of loadPolotnoDesign.js');
  }

  // Build search paths
  const searchPaths = [];
  
  if (searchPath) {
    // Use explicit search path
    searchPaths.push(searchPath);
  } else if (subject) {
    // Build path from subject/quarter/gradeLevel
    const subjectFolder = subject.toUpperCase();
    let path = subjectFolder;
    
    if (gradeLevel) {
      path += `/${gradeLevel}`;
    }
    if (quarter) {
      path += `/${quarter}`;
    }
    
    searchPaths.push(path);
  } else {
    // Search common locations
    const subjects = ['SCIENCE', 'MATH', 'ENGLISH'];
    const quarters = quarter ? [quarter] : ['quarter1', 'quarter2', 'quarter3', 'quarter4'];
    const grades = gradeLevel ? [gradeLevel] : ['grade5', 'grade6', 'grade7', 'grade8'];
    
    // Try root first
    searchPaths.push('');
    
    // Then try subject folders
    for (const subj of subjects) {
      searchPaths.push(subj);
      
      // Try with quarters
      for (const q of quarters) {
        searchPaths.push(`${subj}/${q}`);
        
        // Try with grades
        for (const grade of grades) {
          searchPaths.push(`${subj}/${grade}/${q}`);
          searchPaths.push(`${subj}/${grade}`);
        }
      }
    }
  }

  // Search for design files
  let designFiles = [];
  let foundPath = '';

  for (const path of searchPaths) {
    console.log(`   Searching in: ${path || '(root)'}`);
    
    try {
      const allFiles = await listAllFiles(path, STORAGE_BUCKET);
      const matchingFiles = findDesignFiles(allFiles, designId);
      
      if (matchingFiles.length > 0) {
        designFiles = matchingFiles;
        foundPath = path;
        console.log(`   ✅ Found ${matchingFiles.length} file(s) in ${path || '(root)'}`);
        break;
      }
    } catch (error) {
      console.warn(`   ⚠️  Error searching ${path}:`, error.message);
      continue;
    }
  }

  if (designFiles.length === 0) {
    throw new Error(`❌ No design files found matching ID: ${designId}`);
  }

  // Download all parts
  console.log('📥 Downloading design parts...');
  const parts = [];
  
  for (let i = 0; i < designFiles.length; i++) {
    const file = designFiles[i];
    console.log(`   Downloading part ${i + 1}/${designFiles.length}: ${file.name}`);
    
    try {
      const jsonData = await downloadJsonFile(file.path, STORAGE_BUCKET);
      parts.push(jsonData);
      console.log(`   ✅ Downloaded: ${file.name}`);
    } catch (error) {
      console.error(`   ❌ Error downloading ${file.name}:`, error.message);
      throw error;
    }
  }

  // Merge parts
  console.log('🔗 Merging slides...');
  const mergedDesign = mergeDesignParts(parts);

  console.log('✅ Design loaded successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Parts found: ${designFiles.length}`);
  console.log(`   - Total pages/slides: ${mergedDesign.pages?.length || mergedDesign.slides?.length || 0}`);
  console.log(`   - Design dimensions: ${mergedDesign.width || 'N/A'}x${mergedDesign.height || 'N/A'}`);

  return mergedDesign;
}

// ============================================================================
// EXPORTS
// ============================================================================

if (isNode) {
  // Node.js: CommonJS export
  module.exports = { loadPolotnoDesign };
} else {
  // Browser: Global export
  window.loadPolotnoDesign = loadPolotnoDesign;
}

