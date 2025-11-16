/**
 * Load designs from Supabase Storage
 * Uses Supabase Storage API to list and fetch lesson files
 */

// Supabase Configuration
const SUPABASE_URL = 'https://liiwqyodlzivzzethyrj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaXdxeW9kbHppdnp6ZXRoeXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDY0MTYsImV4cCI6MjA3NzU4MjQxNn0.5sPzjw-DLvZ5bA7NlRF5YdunBD-nOsQ0GC8ALz03sFE';
const SUPABASE_BUCKET = 'LessonStorage'; // Main bucket for lessons

// Initialize Supabase client if available
let supabaseClient = null;

/**
 * Initialize Supabase client from CDN
 * The CDN version exposes supabase.createClient when loaded via script tag
 * @returns {Object|null} Supabase client or null
 */
async function initializeSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  // Try to use existing client from window or global scope (if loaded via script tag)
  if (typeof window !== 'undefined') {
    // When Supabase JS is loaded via CDN script tag, it exposes supabase.createClient globally
    // Check if supabase.createClient is available
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized from window.supabase.createClient');
        // Store in window for reuse
        window.supabaseClient = supabaseClient;
        return supabaseClient;
      } catch (error) {
        console.warn('Failed to create Supabase client from window.supabase.createClient:', error);
      }
    }
    
    // Check if already initialized and stored in window
    if (window.supabaseClient && window.supabaseClient.storage) {
      supabaseClient = window.supabaseClient;
      console.log('✅ Using existing Supabase client from window.supabaseClient');
      return supabaseClient;
    }
    
    // Check if already available globally (direct assignment)
    if (typeof supabase !== 'undefined' && supabase && supabase.storage) {
      supabaseClient = supabase;
      console.log('✅ Using existing Supabase client from global scope');
      return supabaseClient;
    }
    
    // Last resort: Try to load from CDN dynamically (if not loaded via script tag)
    try {
      const supabaseModule = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      if (supabaseModule && supabaseModule.createClient) {
        supabaseClient = supabaseModule.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Store in window for reuse
        window.supabaseClient = supabaseClient;
        console.log('✅ Supabase client initialized from CDN import');
        return supabaseClient;
      }
    } catch (error) {
      console.warn('Could not load Supabase from CDN import:', error);
      console.warn('💡 Make sure Supabase SDK is loaded via: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
    }
  }
  
  return null;
}

/**
 * Get or initialize Supabase client
 * @returns {Object|null} Supabase client or null
 */
function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  // Try to get from window first (may have been initialized by page)
  if (typeof window !== 'undefined' && window.supabaseClient) {
    supabaseClient = window.supabaseClient;
    return supabaseClient;
  }
  
  // Try to get from global supabase if available (loaded via script tag)
  if (typeof supabase !== 'undefined' && supabase && supabase.storage) {
    supabaseClient = supabase;
    return supabaseClient;
  }
  
  // Lazy initialization will happen on first use
  return null;
}

// Subject folder mapping
const SUBJECT_FOLDERS = {
  'math': 'MATH',
  'science': 'SCIENCE',
  'english': 'ENGLISH',
  'subject_math': 'MATH',
  'subject_science': 'SCIENCE',
  'subject_english': 'ENGLISH'
};

/**
 * Get Supabase public URL for a file
 * @param {string} key - File path (e.g., "MATH/grade5/quarter1/design.json")
 * @returns {string} Public URL
 */
function getSupabaseFileUrl(key) {
  // Try to get client, but don't block if not available
  const client = getSupabaseClient();
  
  if (client && client.storage) {
    try {
      const { data } = client.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(key);
      
      if (data && data.publicUrl) {
        return data.publicUrl;
      }
    } catch (error) {
      console.warn('Error getting Supabase public URL from client:', error);
    }
  }
  
  // Fallback to direct URL construction (always works even without client)
  // This is the standard Supabase Storage public URL format
  // Note: Key should be URL-encoded, but forward slashes should remain as path separators
  const parts = key.split('/');
  const encodedParts = parts.map(part => encodeURIComponent(part));
  const encodedKey = encodedParts.join('/');
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodedKey}`;
}

/**
 * Normalize grade level from Firebase format (grade=5) to Supabase format (Grade5)
 * Handles various formats: "grade=5", "grade5", "5", "Grade5", etc.
 * @param {string} gradeLevel - Grade level in various formats
 * @returns {string} Normalized grade (Grade5, Grade6, etc.)
 */
function normalizeGradeForSupabase(gradeLevel) {
  if (!gradeLevel) return null;
  
  let normalized = String(gradeLevel);
  
  // Handle Firebase format: "grade=5" or "grade=6"
  if (normalized.includes('=')) {
    const parts = normalized.split('=');
    if (parts.length === 2 && parts[0].toLowerCase().trim() === 'grade') {
      normalized = parts[1].trim();
    }
  }
  
  // Remove common suffixes like "th", "st", "nd", "rd"
  normalized = normalized.replace(/(\d+)(th|st|nd|rd)/i, '$1');
  
  // Remove "grade" prefix if present (case-insensitive)
  if (/^grade/i.test(normalized)) {
    normalized = normalized.replace(/^grade/i, '');
  }
  
  // Remove "Grade" prefix if present
  if (/^Grade/.test(normalized)) {
    normalized = normalized.replace(/^Grade/, '');
  }
  
  // Extract just the number if there's text before it
  const numberMatch = normalized.match(/(\d+)/);
  if (numberMatch) {
    normalized = numberMatch[1];
  }
  
  // Validate it's a number
  const gradeNum = parseInt(normalized, 10);
  if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
    console.warn(`⚠️ Invalid grade level: "${gradeLevel}"`);
    return null;
  }
  
  // Format as "Grade5", "Grade6", etc. (for Supabase storage)
  return `Grade${gradeNum}`;
}

/**
 * Load designs for a specific subject and quarter from Supabase Storage
 * @param {string} subject - Subject name (math, science, english or subject_math, etc.)
 * @param {string} quarter - Quarter number (1, 2, 3, 4)
 * @param {HTMLElement} container - Container element to render designs into (optional)
 * @param {boolean} isTeacher - Whether user is a teacher (can edit)
 * @param {string} gradeLevel - Grade level (grade=5, grade=6, etc.) - optional
 * @returns {Promise<Array>} Array of designs
 */
async function loadSupabaseDesignsForQuarter(subject, quarter, container = null, isTeacher = false, gradeLevel = null) {
  const subjectFolder = SUBJECT_FOLDERS[subject.toLowerCase()] || subject.toUpperCase();
  
  // Normalize subject name
  let normalizedSubject = subject.toLowerCase();
  if (normalizedSubject.startsWith('subject_')) {
    normalizedSubject = normalizedSubject.replace('subject_', '');
  }
  
  // Get grade level from Firebase if not provided
  // CRITICAL: Grade level is REQUIRED for grade-level isolation
  if (!gradeLevel) {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        const teacherSnap = await firebase.database().ref('teachers/' + user.uid).once('value');
        const teacher = teacherSnap.val();
        if (teacher) {
          // Check both 'grade' and 'gradelevel' fields (Firebase stores as 'grade')
          const gradeValue = teacher.grade || teacher.gradelevel;
          if (gradeValue) {
            // Normalize to Firebase format: grade=5, grade=6, etc.
            const grade = gradeValue.toString();
            if (grade.includes('=')) {
              gradeLevel = grade; // Already in correct format
            } else {
              const numberMatch = grade.match(/(\d+)/);
              if (numberMatch) {
                const gradeNum = parseInt(numberMatch[1], 10);
                if (!isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 12) {
                  gradeLevel = `grade=${gradeNum}`;
                } else {
                  gradeLevel = grade; // Keep as-is if invalid
                }
              } else {
                gradeLevel = grade; // Keep as-is if no number found
              }
            }
            console.log(`📚 Grade level from Firebase: ${gradeValue} → normalized: ${gradeLevel}`);
          } else {
            console.error('❌ No grade level found in teacher profile! Cannot load lessons.');
            if (container) {
              container.innerHTML = '<div style="text-align:center;padding:20px;color:#f44336;">⚠️ Grade level not found in your profile.<br>Please update your profile with your grade level.</div>';
            }
            return [];
          }
        } else {
          console.error('❌ Teacher profile not found! Cannot load lessons.');
          if (container) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:#f44336;">⚠️ Teacher profile not found.<br>Please ensure you are logged in correctly.</div>';
          }
          return [];
        }
      } else {
        console.error('❌ User not authenticated! Cannot load lessons.');
        if (container) {
          container.innerHTML = '<div style="text-align:center;padding:20px;color:#f44336;">⚠️ Please log in to view lessons.</div>';
        }
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching grade level:', error);
      if (container) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#f44336;">⚠️ Error loading grade level.<br>Please refresh the page.</div>';
      }
      return [];
    }
  }
  
  // Normalize grade format: "grade=5" -> "Grade5", "grade5" -> "Grade5", "5" -> "Grade5"
  const normalizedGrade = normalizeGradeForSupabase(gradeLevel);
  if (!normalizedGrade) {
    console.error('❌ Invalid grade level format:', gradeLevel);
    if (container) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#f44336;">⚠️ Invalid grade level format.<br>Please update your profile.</div>';
    }
    return [];
  }
  
  console.log(`🔄 [Supabase] Loading: ${subjectFolder}, quarter=${quarter}, grade=${normalizedGrade} (STRICT ISOLATION)`);

  try {
    /**
     * Helper function to extract design name from JSON file
     * Tries to fetch the JSON and extract the name property
     */
    async function fetchDesignNameFromJson(jsonUrl, designId) {
      try {
        // Fetch the full JSON file to properly extract name
        const response = await fetch(jsonUrl);
        
        if (response.ok) {
          const text = await response.text();
          
          try {
            const json = JSON.parse(text);
            
            // PRIORITY 1: Check for top-level name or title
            if (json.name && json.name.trim() !== '' && json.name !== designId) {
              console.log(`✅ Found name in JSON root for ${designId}: "${json.name}"`);
              return json.name;
            }
            if (json.title && json.title.trim() !== '' && json.title !== designId) {
              console.log(`✅ Found title in JSON root for ${designId}: "${json.title}"`);
              return json.title;
            }
            
            // PRIORITY 2: Check first page's name property
            if (json.pages && json.pages[0] && json.pages[0].name) {
              const pageName = json.pages[0].name;
              if (pageName.trim() !== '' && pageName !== designId) {
                console.log(`✅ Found name in first page for ${designId}: "${pageName}"`);
                return pageName;
              }
            }
            
            // PRIORITY 3: Extract from first large text element in first page (likely the title)
            if (json.pages && json.pages[0] && json.pages[0].children) {
              // Find text elements, sort by size (larger = more likely to be title)
              const textElements = json.pages[0].children.filter(child => 
                child.type === 'text' && child.text && child.text.trim() !== ''
              );
              
              if (textElements.length > 0) {
                // Sort by fontSize (descending) or y position (ascending - top of page)
                textElements.sort((a, b) => {
                  const sizeA = (a.fontSize || 0) * (a.scaleY || 1);
                  const sizeB = (b.fontSize || 0) * (b.scaleY || 1);
                  if (Math.abs(sizeA - sizeB) > 5) {
                    return sizeB - sizeA; // Larger font first
                  }
                  return (a.y || 0) - (b.y || 0); // Higher on page first
                });
                
                const titleText = textElements[0].text.trim();
                // Only use if it's meaningful (not just "image-1" or similar)
                if (titleText.length > 3 && titleText !== designId && !titleText.match(/^image[-_]?\d+$/i)) {
                  console.log(`✅ Extracted title from first page text for ${designId}: "${titleText}"`);
                  return titleText;
                }
              }
            }
            
            console.log(`⚠️ No valid name found in JSON for ${designId}`);
          } catch (parseError) {
            console.warn(`Could not parse JSON for ${designId}:`, parseError.message);
          }
        } else {
          console.warn(`Could not fetch JSON for ${designId}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`Error fetching name from JSON for ${designId}:`, error.message);
      }
      return null;
    }
    
    /**
     * Format design ID to be more readable
     * Converts "lesson-1-abc123" to "Lesson 1" or similar
     */
    function formatDesignId(id) {
      if (!id) return 'Untitled Lesson';
      
      // Remove common UUID/hash patterns
      let formatted = id
        .replace(/[-_]([a-f0-9]{8,})/gi, '') // Remove UUIDs
        .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
        .trim();
      
      // Capitalize first letter of each word
      formatted = formatted.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // If it's empty after formatting, use original ID with better formatting
      if (!formatted || formatted.length < 2) {
        formatted = id.split(/[-_]/)[0] || id;
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      }
      
      return formatted || 'Untitled Lesson';
    }
    
    // Show loading state with styled indicator
    if (container) {
      container.innerHTML = `
        <div class="lessons-loading">
          <div class="lessons-loading-spinner"></div>
          <div class="lessons-loading-text">Loading Lessons</div>
          <div class="lessons-loading-subtext">Fetching from Supabase...</div>
        </div>
      `;
    }

    // Build prefix matching Supabase bucket structure: GradeLevel/Subject/Quarter/
    // Example: Grade5/MATH/Quarter1/ or Grade6/SCIENCE/Quarter2/
    // CRITICAL: This ensures STRICT grade-level isolation - Grade 5 teachers can ONLY see Grade 5 lessons
    const quarterFolder = `Quarter${quarter}`;
    
    // ALWAYS require grade level - no fallback without grade (prevents cross-grade access)
    const prefix = `${normalizedGrade}/${subjectFolder}/${quarterFolder}/`;
    console.log(`🔒 Loading STRICTLY for grade: ${normalizedGrade} (prevents cross-grade access)`);
    
    console.log(`📂 [Supabase] Listing files with prefix: ${prefix}`);
    
    let files = [];
    
    // Initialize client for direct listing (always needed as fallback)
    let client = getSupabaseClient();
    if (!client) {
      client = await initializeSupabaseClient();
    }
    
    // Try to load design-ids.json first (faster and more efficient)
    const designIdsPath = `${prefix}design-ids.json`;
    const designIdsUrl = getSupabaseFileUrl(designIdsPath);
    console.log(`📦 [Supabase] Loading design IDs from: ${designIdsUrl}`);
    
    let designIdsFromFile = [];
    try {
      const idsResponse = await fetch(designIdsUrl);
      if (idsResponse.ok) {
        const idsData = await idsResponse.json();
        console.log(`✅ [Supabase] Loaded ${idsData.length} design IDs from file:`, idsData);
        designIdsFromFile = idsData;
      } else {
        console.log(`⚠️ [Supabase] Design IDs file not found (${idsResponse.status}), will use direct listing only`);
      }
    } catch (idsError) {
      console.log(`⚠️ [Supabase] Error loading design IDs file:`, idsError.message);
    }
    
    // ALWAYS do direct listing to ensure we get ALL files (design-ids.json might be outdated)
    let directListFiles = [];
    if (client && client.storage) {
      try {
        console.log(`📂 [Supabase] Listing files directly from storage with prefix: ${prefix}`);
        const { data, error } = await client.storage
          .from(SUPABASE_BUCKET)
          .list(prefix, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
          });
        
        if (error) {
          console.error('❌ Supabase list error:', error);
        } else if (data) {
          // Filter for JSON files and extract design info
          const jsonFiles = data.filter(file => file.name && file.name.endsWith('.json') && file.name !== 'design-ids.json');
          directListFiles = jsonFiles.map(file => {
            const id = file.name.replace('.json', '');
            return {
              key: `${prefix}${file.name}`,
              url: getSupabaseFileUrl(`${prefix}${file.name}`),
              isJson: true,
              thumbnailKey: `${prefix}${id}.jpg`,
              thumbnailUrl: getSupabaseFileUrl(`${prefix}${id}.jpg`),
              name: id, // Use ID as name initially
              id: id
            };
          });
          console.log(`✅ [Supabase] Listed ${directListFiles.length} designs directly from storage`);
        }
      } catch (listError) {
        console.error('❌ Error listing files from Supabase:', listError);
      }
    } else {
      console.warn('⚠️ Supabase client not available for direct listing');
    }
    
    // Merge results: Use design-ids.json names first, then fallback to JSON file extraction
    if (directListFiles.length > 0) {
      // Create a map of IDs to metadata from design-ids.json (PRIORITY 1)
      const metadataMap = {};
      designIdsFromFile.forEach(design => {
          metadataMap[design.id] = {
            name: design.name || design.id,
            isVisible: design.isVisible !== false, // Default to visible
            hasPasscode: design.hasPasscode === true,
            passcode: design.passcode || '',
            deleted: design.deleted === true,
            deletedAt: design.deletedAt || null
          };
      });
      
      // Use direct listing files, prioritize names from design-ids.json, fallback to JSON extraction
      files = await Promise.all(directListFiles.map(async (file) => {
        const metadata = metadataMap[file.id] || {};
        let name = null;
        
        console.log(`🔍 Processing design ${file.id}:`, {
          hasMetadata: !!metadata.name,
          metadataName: metadata.name,
          fileId: file.id,
          namesMatch: metadata.name === file.id
        });
        
        // PRIORITY 1: Use name from design-ids.json ONLY if it's different from the ID (meaningful name)
        if (metadata.name && metadata.name !== file.id && metadata.name.trim() !== '') {
          name = metadata.name;
          console.log(`✅ Using name from design-ids.json for ${file.id}: "${name}"`);
        } else {
          // PRIORITY 2: If design-ids.json name is missing or same as ID, try to fetch from JSON file
          console.log(`🔎 Fetching name from JSON file for ${file.id}...`);
          const fetchedName = await fetchDesignNameFromJson(file.url, file.id);
          if (fetchedName && fetchedName.trim() !== '') {
            name = fetchedName;
            console.log(`✅ Using name from JSON file for ${file.id}: "${name}"`);
          } else {
            // PRIORITY 3: If still no name, set to null to hide title
            name = null;
            console.log(`⚠️ No valid name found for ${file.id}, title will be hidden`);
          }
        }
        
            return {
              ...file,
              name: name,
              isVisible: metadata.isVisible !== false,
              hasPasscode: metadata.hasPasscode === true,
              passcode: metadata.passcode || '',
              deleted: metadata.deleted === true,
              deletedAt: metadata.deletedAt || null
            };
      }));
      
      console.log(`✅ [Supabase] Merged results: ${files.length} designs (${directListFiles.length} from direct listing, ${designIdsFromFile.length} names from design-ids.json)`);
    } else if (designIdsFromFile.length > 0) {
      // Fallback: If direct listing failed but design-ids.json exists, use it first, then try JSON
      files = await Promise.all(designIdsFromFile.map(async (design) => {
        const jsonUrl = getSupabaseFileUrl(`${prefix}${design.id}.json`);
        let name = null;
        
        console.log(`🔍 Processing design (fallback) ${design.id}:`, {
          hasName: !!design.name,
          designName: design.name,
          designId: design.id,
          namesMatch: design.name === design.id
        });
        
        // PRIORITY 1: Use name from design-ids.json ONLY if it's different from the ID (meaningful name)
        if (design.name && design.name !== design.id && design.name.trim() !== '') {
          name = design.name;
          console.log(`✅ Using name from design-ids.json (fallback) for ${design.id}: "${name}"`);
        } else {
          // PRIORITY 2: If design-ids.json name is missing or same as ID, try to fetch from JSON file
          console.log(`🔎 Fetching name from JSON file (fallback) for ${design.id}...`);
          const fetchedName = await fetchDesignNameFromJson(jsonUrl, design.id);
          if (fetchedName && fetchedName.trim() !== '') {
            name = fetchedName;
            console.log(`✅ Using name from JSON file (fallback) for ${design.id}: "${name}"`);
          } else {
            // PRIORITY 3: If still no name, set to null to hide title
            name = null;
            console.log(`⚠️ No valid name found (fallback) for ${design.id}, title will be hidden`);
          }
        }
        
            return {
              key: `${prefix}${design.id}.json`,
              url: jsonUrl,
              isJson: true,
              thumbnailKey: `${prefix}${design.id}.jpg`,
              thumbnailUrl: getSupabaseFileUrl(`${prefix}${design.id}.jpg`),
              name: name,
              id: design.id,
              isVisible: design.isVisible !== false, // Default to visible
              hasPasscode: design.hasPasscode === true,
              passcode: design.passcode || '',
              deleted: design.deleted === true,
              deletedAt: design.deletedAt || null
            };
      }));
      console.log(`✅ [Supabase] Using design-ids.json only (${files.length} designs) - direct listing unavailable`);
    }
    
    // Convert files to metadata format for compatibility
        const metadataList = files
          .filter(file => file.isJson)
          .map(file => {
            const id = file.id || file.key.split('/').pop().replace('.json', '');
            return {
              id: id,
              name: file.name || null, // Use name from design-ids.json or JSON file, null if not found
              subject: normalizedSubject,
              quarter: quarter,
              gradeLevel: gradeLevel,
              jsonUrl: file.url,
              thumbnailUrl: file.thumbnailUrl || getSupabaseFileUrl(file.key.replace('.json', '.jpg')),
              isVisible: file.isVisible !== false, // Default to visible if not specified
              hasPasscode: file.hasPasscode === true,
              passcode: file.passcode || '',
              deleted: file.deleted === true,
              deletedAt: file.deletedAt || null
            };
          });
    
    console.log(`📊 [Supabase] Found ${metadataList.length} designs`);

    if (metadataList.length === 0) {
      if (container) {
        container.innerHTML = ''; // Empty - no message shown
      }
      return [];
    }

        // Filter designs based on visibility and deleted status
        let filteredDesigns = metadataList;
        // Always filter out deleted lessons (for both teachers and students)
        filteredDesigns = metadataList.filter(design => design.deleted !== true);
        console.log(`🗑️ [Supabase] Filtered ${metadataList.length - filteredDesigns.length} deleted lessons`);
        
        if (!isTeacher) {
          // For students: also filter out hidden lessons
          const beforeVisibilityFilter = filteredDesigns.length;
          filteredDesigns = filteredDesigns.filter(design => design.isVisible !== false);
          console.log(`👁️ [Supabase] Filtered ${beforeVisibilityFilter - filteredDesigns.length} hidden lessons for student view`);
        }

    // URLs are already constructed, just format for display
    const designsWithUrls = filteredDesigns.map(design => {
      // Use name from design-ids.json (priority) or JSON file (fallback), null if neither has it
      const displayName = design.name || null;
      
      console.log(`🔗 [Supabase] Design ${displayName ? `"${displayName}"` : '(no name)'}:`, {
        jsonUrl: design.jsonUrl,
        thumbnailUrl: design.thumbnailUrl,
        name: design.name,
        id: design.id,
        isVisible: design.isVisible,
        hasPasscode: design.hasPasscode
      });
      
      return {
        id: design.id,
        name: displayName, // Name from design-ids.json (priority) or JSON file (fallback), null if neither
        jsonUrl: design.jsonUrl,
        thumbnail: design.thumbnailUrl,
        quarter: design.quarter || quarter,
        description: displayName ? `Lesson: ${displayName}` : '',
        source: 'supabase',
            isVisible: design.isVisible,
            hasPasscode: design.hasPasscode,
            passcode: design.passcode,
            deleted: design.deleted,
            deletedAt: design.deletedAt
          };
    });

    if (container) {
      renderDesigns(designsWithUrls, quarter, container, subject, isTeacher);
    }
    
    return designsWithUrls;

  } catch (error) {
    console.error('❌ Error loading designs from Supabase:', error);
    if (container) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#f44336;">Error loading designs. Please refresh the page.</div>';
    }
    return [];
  }
}

/**
 * Render designs in cards
 */
function renderDesigns(designs, quarter, container, subject, isTeacher) {
  if (!container) return;

  if (designs.length === 0) {
    container.innerHTML = ''; // Empty - no message shown
    return;
  }

  // Render directly as lesson-item cards (no gallery wrapper) to use parent grid
  let cardsHTML = '';
  
  designs.forEach(design => {
    const safeName = design.name ? design.name.replace(/'/g, "\\'") : 'Design';
    const titleHTML = design.name ? `<h3>${design.name}</h3>` : '';
    const descriptionHTML = design.description ? `<p>${design.description}</p>` : '';
    
    cardsHTML += `
      <div class="lesson-item" data-presentation="${design.name || design.id}">
        <div class="lesson-thumbnail" style="background-image: url('${design.thumbnail || ''}'); background-size: cover; background-position: center;"></div>
        <div class="lesson-title">
          ${titleHTML}
          ${descriptionHTML}
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;">
            <button class="lesson-badge" onclick="openDesignViewer('${design.id}', '${subject}', '${safeName}', '${design.quarter || '1'}')" style="cursor:pointer; background: #2196F3; color: white; border: none; padding: 7px 18px; border-radius: 6px; font-size: 1rem; font-weight: 600;">
              View
            </button>
            ${isTeacher ? `
            <button class="lesson-badge" onclick="openDesignEditor('${design.id}', '${subject}', '${safeName}', '${design.quarter || '1'}')" style="cursor:pointer; background: #FF9800; color: white; border: none; padding: 7px 18px; border-radius: 6px; font-size: 1rem; font-weight: 600;">
              Edit
            </button>
            ${design.name ? `
            <button class="lesson-badge" onclick="event.stopPropagation(); (async function() { try { if(typeof window.renameDesign === 'function') { await window.renameDesign('${design.id}', '${subject}', '${safeName}', '${design.quarter || '1'}', '${design.gradeLevel || ''}'); } else { alert('Rename function not loaded. Please refresh the page.'); console.error('window.renameDesign:', typeof window.renameDesign); } } catch(err) { console.error('Error calling renameDesign:', err); alert('Error: ' + err.message); } })();" style="cursor:pointer; background: #9C27B0; color: white; border: none; padding: 7px 18px; border-radius: 6px; font-size: 1rem; font-weight: 600;">
              Rename
            </button>
            ` : ''}
            ` : ''}
          </div>
          ${design.created && design.created !== 'Unknown' ? `<div style="font-size: 0.8rem; color: #888; margin-top: 8px;">Created: ${design.created} | SUPABASE</div>` : '<div style="font-size: 0.8rem; color: #888; margin-top: 8px;">Storage: Supabase</div>'}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = cardsHTML;
  
  console.log(`✅ Rendered ${designs.length} lessons from Supabase`);
}

/**
 * Open design viewer (students can only view)
 */
async function openDesignViewer(designId, subject, designName = 'Design', quarter = '1') {
  console.log('🎨 Opening lesson viewer:', designId, subject, designName, quarter);
  
  // Show loading overlay
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.id = 'lesson-loading-overlay';
  loadingOverlay.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-graduation-cap"></i>
      </div>
      <div class="loading-text">Loading Lesson</div>
      <div class="loading-subtext">${designName}</div>
      <div class="loading-progress-container">
        <div class="loading-progress-bar"></div>
      </div>
    </div>
  `;
  document.body.appendChild(loadingOverlay);
  
  try {
    const subjectFolder = SUBJECT_FOLDERS[subject.toLowerCase()] || subject.toUpperCase();
    
    // Get grade level
    // CRITICAL: Get grade level from Firebase - REQUIRED for grade-level isolation
    // Supports both teachers and students
    let gradeLevel = null;
    let isTeacher = false;
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        // Try teacher profile first
        const teacherSnap = await firebase.database().ref('teachers/' + user.uid).once('value');
        const teacher = teacherSnap.val();
        if (teacher) {
          isTeacher = true;
          // Check both 'grade' and 'gradelevel' fields (Firebase stores as 'grade')
          const gradeValue = teacher.grade || teacher.gradelevel;
          if (gradeValue) {
            // Normalize to Firebase format: grade=5, grade=6, etc.
            const grade = gradeValue.toString();
            if (grade.includes('=')) {
              gradeLevel = grade; // Already in correct format
            } else {
              const numberMatch = grade.match(/(\d+)/);
              if (numberMatch) {
                const gradeNum = parseInt(numberMatch[1], 10);
                if (!isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 12) {
                  gradeLevel = `grade=${gradeNum}`;
                } else {
                  gradeLevel = grade; // Keep as-is if invalid
                }
              } else {
                gradeLevel = grade; // Keep as-is if no number found
              }
            }
            console.log(`📚 Teacher grade level for viewer: ${gradeValue} → normalized: ${gradeLevel}`);
          } else {
            throw new Error('Grade level not found in teacher profile. Cannot open lesson.');
          }
        } else {
          // Try student profile
          const studentSnap = await firebase.database().ref('students/' + user.uid).once('value');
          const student = studentSnap.val();
          if (student) {
            isTeacher = false;
            const gradeValue = student.grade || student.gradelevel;
            if (gradeValue) {
              // Normalize to Firebase format: grade=5, grade=6, etc.
              const grade = gradeValue.toString();
              if (grade.includes('=')) {
                gradeLevel = grade; // Already in correct format
              } else {
                const numberMatch = grade.match(/(\d+)/);
                if (numberMatch) {
                  const gradeNum = parseInt(numberMatch[1], 10);
                  if (!isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 12) {
                    gradeLevel = `grade=${gradeNum}`;
                  } else {
                    gradeLevel = grade; // Keep as-is if invalid
                  }
                } else {
                  gradeLevel = grade; // Keep as-is if no number found
                }
              }
              console.log(`📚 Student grade level for viewer: ${gradeValue} → normalized: ${gradeLevel}`);
            } else {
              throw new Error('Grade level not found in student profile. Cannot open lesson.');
            }
          } else {
            throw new Error('User profile not found. Cannot open lesson.');
          }
        }
      } else {
        throw new Error('User not authenticated. Cannot open lesson.');
      }
    } catch (error) {
      console.error('❌ Error fetching grade level:', error);
      alert(`Error: ${error.message}`);
      return;
    }
    
    // Normalize grade format: "grade=5" -> "Grade5", "grade5" -> "Grade5", "5" -> "Grade5"
    const normalizedGrade = normalizeGradeForSupabase(gradeLevel);
    if (!normalizedGrade) {
      console.error('❌ Invalid grade level format:', gradeLevel);
      alert(`Error: Invalid grade level format: ${gradeLevel}`);
      return;
    }
    
    // Build Supabase URL matching bucket structure: GradeLevel/Subject/Quarter/id.json
    // CRITICAL: This ensures Grade 5 teachers can ONLY access Grade 5 lessons
    const quarterFolder = `Quarter${quarter}`;
    const jsonPath = `${normalizedGrade}/${subjectFolder}/${quarterFolder}/${designId}.json`;
    console.log(`🔒 Opening lesson STRICTLY for grade: ${normalizedGrade} (prevents cross-grade access)`);
    
    // Check for passcode (for students only)
    const designIdsPath = `${normalizedGrade}/${subjectFolder}/${quarterFolder}/design-ids.json`;
    const designIdsUrl = getSupabaseFileUrl(designIdsPath);
    
    try {
      const idsResponse = await fetch(designIdsUrl);
      if (idsResponse.ok) {
        const designIds = await idsResponse.json();
        const designMetadata = designIds.find(d => d.id === designId);
        if (designMetadata && designMetadata.hasPasscode === true && designMetadata.passcode) {
          // Only prompt students for passcode (teachers can bypass)
          if (!isTeacher) {
            // Prompt for passcode
            const enteredPasscode = prompt(`This lesson is protected by a passcode.\n\nPlease enter the passcode to view "${designName}":`);
            if (enteredPasscode === null) {
              // User cancelled
              if (loadingOverlay && loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
              }
              return;
            }
            if (enteredPasscode.trim() !== designMetadata.passcode) {
              alert('❌ Incorrect passcode. Access denied.');
              if (loadingOverlay && loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
              }
              return;
            }
            // Passcode correct, continue
            console.log('✅ Passcode verified');
          } else {
            console.log('✅ Teacher access - passcode bypassed');
          }
        }
      }
    } catch (passcodeError) {
      console.warn('⚠️ Could not check passcode (continuing anyway):', passcodeError);
      // Continue even if passcode check fails (might be a teacher or design-ids.json doesn't exist)
    }
    
    const jsonUrl = getSupabaseFileUrl(jsonPath);
    console.log(`📥 [Supabase] Loading JSON from: ${jsonUrl}`);
    
    // Fetch JSON from Supabase
    const response = await fetch(jsonUrl);
    
    // Get response text first to check for quota errors
    const responseText = await response.text();
    
    // Check if response contains quota error message
    if (responseText.includes('quota has been exceeded') || responseText.includes('quota exceeded') || responseText.includes('Quota')) {
      throw new Error(`Supabase Quota Exceeded: Your Supabase project has exceeded its quota. This could be:\n\n` +
        `• Storage bandwidth quota (downloads/uploads)\n` +
        `• API requests quota\n` +
        `• Storage size quota\n\n` +
        `Please check your Supabase dashboard at https://app.supabase.com for quota limits and upgrade your plan if needed.`);
    }
    
    // Check if response is OK
    if (!response.ok) {
      // Try to parse error as JSON
      let errorMessage = `Failed to load design: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.message || errorJson.error) {
          errorMessage = errorJson.message || errorJson.error;
        }
      } catch {
        // If not JSON, use the response text if it's a meaningful error
        if (responseText && responseText.length < 500) {
          errorMessage = responseText;
        }
      }
      throw new Error(errorMessage);
    }
    
    // Parse JSON
    let designJSON;
    try {
      designJSON = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response from Supabase: ${e.message}`);
    }
    
    // Update loading text
    const loadingText = loadingOverlay.querySelector('.loading-text');
    if (loadingText) loadingText.textContent = 'Opening Viewer...';
    
    // Don't store large JSON in sessionStorage (it can exceed browser quota)
    // Instead, pass the JSON URL as a parameter and let the editor fetch it directly
    // Store only small metadata items
    try {
      sessionStorage.setItem('supabase-design-id', designId);
      sessionStorage.setItem('supabase-design-subject', subject);
      sessionStorage.setItem('supabase-design-name', designName);
      sessionStorage.setItem('supabase-design-quarter', quarter);
      sessionStorage.setItem('supabase-design-grade', gradeLevel || '');
    } catch (storageError) {
      // If sessionStorage quota exceeded, continue anyway - we'll use URL params
      console.warn('⚠️ Could not store metadata in sessionStorage:', storageError);
    }

    // Open in viewer mode - pass JSON URL as parameter instead of storing in sessionStorage
    let editorBaseUrl = '/editor/index.html';
    
    // Check for environment-specific editor path function
    if (typeof getEditorBase === 'function') {
      editorBaseUrl = getEditorBase();
    } else if (typeof getEditorBaseUrl === 'function') {
      editorBaseUrl = getEditorBaseUrl();
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      editorBaseUrl = 'http://localhost:5173/';
    } else {
      // For Netlify deployments, check if we're in the deploy folder structure
      // If current path includes /deploy/, use /deploy/editor/index.html
      // Otherwise, use /editor/index.html
      const currentPath = window.location.pathname;
      if (currentPath.includes('/deploy/') || currentPath.startsWith('/deploy/')) {
        editorBaseUrl = '/deploy/editor/index.html';
      } else {
        editorBaseUrl = '/editor/index.html';
      }
    }
    
    const params = new URLSearchParams();
    params.set('supabaseDesign', designId);
    params.set('subject', subject);
    params.set('quarter', quarter);
    if (gradeLevel) params.set('grade', gradeLevel);
    params.set('view', 'true');
    // Pass the JSON URL so editor can fetch directly (avoid sessionStorage quota)
    params.set('jsonUrl', jsonUrl);
    
    const editorUrl = editorBaseUrl + (editorBaseUrl.includes('?') ? '&' : '?') + params.toString();
    console.log('🔗 Opening viewer:', editorUrl);
    
    // Update loading text before opening
    if (loadingText) loadingText.textContent = 'Launching Viewer...';
    
    window.open(editorUrl, '_blank', 'width=1400,height=900');
    
    // Remove loading overlay after a short delay (allows window to open)
    setTimeout(() => {
      if (loadingOverlay && loadingOverlay.parentNode) {
        loadingOverlay.remove();
      }
    }, 500);

  } catch (error) {
    console.error('Error opening design viewer:', error);
    // Remove loading overlay on error
    const overlay = document.getElementById('lesson-loading-overlay');
    if (overlay) overlay.remove();
    alert('Error loading design: ' + error.message);
  }
}

/**
 * Open design editor (teachers can edit)
 */
async function openDesignEditor(designId, subject, designName = 'Design', quarter = '1') {
  console.log('✏️ Opening lesson editor:', designId, subject, designName, quarter);
  
  // Show loading overlay
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.id = 'lesson-loading-overlay';
  loadingOverlay.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-graduation-cap"></i>
      </div>
      <div class="loading-text">Loading Editor</div>
      <div class="loading-subtext">${designName}</div>
      <div class="loading-progress-container">
        <div class="loading-progress-bar"></div>
      </div>
    </div>
  `;
  document.body.appendChild(loadingOverlay);
  
  try {
    const subjectFolder = SUBJECT_FOLDERS[subject.toLowerCase()] || subject.toUpperCase();
    
    // Get grade level
    // CRITICAL: Get grade level from Firebase - REQUIRED for grade-level isolation
    let gradeLevel = null;
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        const teacherSnap = await firebase.database().ref('teachers/' + user.uid).once('value');
        const teacher = teacherSnap.val();
        if (teacher) {
          // Check both 'grade' and 'gradelevel' fields (Firebase stores as 'grade')
          const gradeValue = teacher.grade || teacher.gradelevel;
          if (gradeValue) {
            // Normalize to Firebase format: grade=5, grade=6, etc.
            const grade = gradeValue.toString();
            if (grade.includes('=')) {
              gradeLevel = grade; // Already in correct format
            } else {
              const numberMatch = grade.match(/(\d+)/);
              if (numberMatch) {
                const gradeNum = parseInt(numberMatch[1], 10);
                if (!isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 12) {
                  gradeLevel = `grade=${gradeNum}`;
                } else {
                  gradeLevel = grade; // Keep as-is if invalid
                }
              } else {
                gradeLevel = grade; // Keep as-is if no number found
              }
            }
            console.log(`📚 Grade level for viewer: ${gradeValue} → normalized: ${gradeLevel}`);
          } else {
            throw new Error('Grade level not found in teacher profile. Cannot open lesson.');
          }
        } else {
          throw new Error('Teacher profile not found. Cannot open lesson.');
        }
      } else {
        throw new Error('User not authenticated. Cannot open lesson.');
      }
    } catch (error) {
      console.error('❌ Error fetching grade level:', error);
      alert(`Error: ${error.message}`);
      return;
    }
    
    // Normalize grade format: "grade=5" -> "Grade5", "grade5" -> "Grade5", "5" -> "Grade5"
    const normalizedGrade = normalizeGradeForSupabase(gradeLevel);
    if (!normalizedGrade) {
      console.error('❌ Invalid grade level format:', gradeLevel);
      alert(`Error: Invalid grade level format: ${gradeLevel}`);
      return;
    }
    
    // Build Supabase URL matching bucket structure: GradeLevel/Subject/Quarter/id.json
    // CRITICAL: This ensures Grade 5 teachers can ONLY access Grade 5 lessons
    const quarterFolder = `Quarter${quarter}`;
    const jsonPath = `${normalizedGrade}/${subjectFolder}/${quarterFolder}/${designId}.json`;
    console.log(`🔒 Opening lesson STRICTLY for grade: ${normalizedGrade} (prevents cross-grade access)`);
    
    const jsonUrl = getSupabaseFileUrl(jsonPath);
    console.log(`📥 [Supabase] Loading JSON from: ${jsonUrl}`);
    
    // Fetch JSON from Supabase
    const response = await fetch(jsonUrl);
    
    // Get response text first to check for quota errors
    const responseText = await response.text();
    
    // Check if response contains quota error message
    if (responseText.includes('quota has been exceeded') || responseText.includes('quota exceeded') || responseText.includes('Quota')) {
      throw new Error(`Supabase Quota Exceeded: Your Supabase project has exceeded its quota. This could be:\n\n` +
        `• Storage bandwidth quota (downloads/uploads)\n` +
        `• API requests quota\n` +
        `• Storage size quota\n\n` +
        `Please check your Supabase dashboard at https://app.supabase.com for quota limits and upgrade your plan if needed.`);
    }
    
    // Check if response is OK
    if (!response.ok) {
      // Try to parse error as JSON
      let errorMessage = `Failed to load design: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.message || errorJson.error) {
          errorMessage = errorJson.message || errorJson.error;
        }
      } catch {
        // If not JSON, use the response text if it's a meaningful error
        if (responseText && responseText.length < 500) {
          errorMessage = responseText;
        }
      }
      throw new Error(errorMessage);
    }
    
    // Parse JSON
    let designJSON;
    try {
      designJSON = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response from Supabase: ${e.message}`);
    }
    
    // Update loading text
    const loadingText = loadingOverlay.querySelector('.loading-text');
    if (loadingText) loadingText.textContent = 'Opening Editor...';
    
    // Don't store large JSON in sessionStorage (it can exceed browser quota)
    // Instead, pass the JSON URL as a parameter and let the editor fetch it directly
    // Store only small metadata items
    try {
      sessionStorage.setItem('supabase-design-id', designId);
      sessionStorage.setItem('supabase-design-subject', subject);
      sessionStorage.setItem('supabase-design-name', designName);
      sessionStorage.setItem('supabase-design-quarter', quarter);
      sessionStorage.setItem('supabase-design-grade', gradeLevel || '');
    } catch (storageError) {
      // If sessionStorage quota exceeded, continue anyway - we'll use URL params
      console.warn('⚠️ Could not store metadata in sessionStorage:', storageError);
    }

    // Open in editor mode - pass JSON URL as parameter instead of storing in sessionStorage
    let editorBaseUrl = '/editor/index.html';
    
    // Check for environment-specific editor path function
    if (typeof getEditorBase === 'function') {
      editorBaseUrl = getEditorBase();
    } else if (typeof getEditorBaseUrl === 'function') {
      editorBaseUrl = getEditorBaseUrl();
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      editorBaseUrl = 'http://localhost:5173/';
    } else {
      // For Netlify deployments, check if we're in the deploy folder structure
      // If current path includes /deploy/, use /deploy/editor/index.html
      // Otherwise, use /editor/index.html
      const currentPath = window.location.pathname;
      if (currentPath.includes('/deploy/') || currentPath.startsWith('/deploy/')) {
        editorBaseUrl = '/deploy/editor/index.html';
      } else {
        editorBaseUrl = '/editor/index.html';
      }
    }
    
    const params = new URLSearchParams();
    params.set('supabaseDesign', designId);
    params.set('subject', subject);
    params.set('quarter', quarter);
    if (gradeLevel) params.set('grade', gradeLevel);
    // Pass the JSON URL so editor can fetch directly (avoid sessionStorage quota)
    params.set('jsonUrl', jsonUrl);
    
    const editorUrl = editorBaseUrl + (editorBaseUrl.includes('?') ? '&' : '?') + params.toString();
    console.log('🔗 Opening editor:', editorUrl);
    
    // Update loading text before opening
    if (loadingText) loadingText.textContent = 'Launching Editor...';
    
    window.open(editorUrl, '_blank', 'width=1400,height=900');
    
    // Remove loading overlay after a short delay (allows window to open)
    setTimeout(() => {
      if (loadingOverlay && loadingOverlay.parentNode) {
        loadingOverlay.remove();
      }
    }, 500);

  } catch (error) {
    console.error('Error opening design editor:', error);
    // Remove loading overlay on error
    const overlay = document.getElementById('lesson-loading-overlay');
    if (overlay) overlay.remove();
    alert('Error loading design: ' + error.message);
  }
}

/**
 * Rename a design/lesson
 * Updates the name in design-ids.json and global metadata
 */
async function renameDesign(designId, subject, currentName, quarter, gradeLevel = null) {
  console.log('🔄 Rename function called:', { designId, subject, currentName, quarter, gradeLevel });
  
  try {
    // Show a more user-friendly prompt
    const promptMessage = `Rename Lesson\n\n` +
      `Current Name: "${currentName}"\n\n` +
      `Enter the new name for this lesson:`;
    
    const newName = prompt(promptMessage, currentName);
    
    if (!newName) {
      console.log('❌ User cancelled rename');
      return; // User cancelled
    }
    
    const trimmedName = newName.trim();
    
    if (trimmedName === '') {
      alert('❌ Lesson name cannot be empty. Please enter a valid name.');
      return;
    }
    
    if (trimmedName === currentName) {
      console.log('ℹ️ Name unchanged, no update needed');
      // User didn't change the name, but that's okay - just return silently
      return;
    }
    
    console.log(`📝 Renaming: "${currentName}" → "${trimmedName}"`);
    // Get grade level if not provided
    if (!gradeLevel) {
      const user = firebase.auth().currentUser;
      if (user) {
        const teacherSnap = await firebase.database().ref('teachers/' + user.uid).once('value');
        const teacher = teacherSnap.val();
        if (teacher) {
          const gradeValue = teacher.grade || teacher.gradelevel;
          if (gradeValue) {
            gradeLevel = gradeValue.toString();
          }
        }
      }
    }
    
    // Normalize grade format
    let normalizedGrade = null;
    if (gradeLevel) {
      normalizedGrade = String(gradeLevel);
      if (!normalizedGrade.startsWith('Grade') && !normalizedGrade.startsWith('grade')) {
        normalizedGrade = `Grade${normalizedGrade}`;
      } else if (normalizedGrade.startsWith('grade')) {
        normalizedGrade = `Grade${normalizedGrade.substring(5)}`;
      }
    }
    
    // Normalize subject
    const subjectFolder = SUBJECT_FOLDERS[subject.toLowerCase()] || subject.toUpperCase();
    let normalizedSubject = subject.toLowerCase();
    if (normalizedSubject.startsWith('subject_')) {
      normalizedSubject = normalizedSubject.replace('subject_', '');
    }
    
    // Build prefix path
    const quarterFolder = `Quarter${quarter}`;
    const prefix = normalizedGrade ? `${normalizedGrade}/${subjectFolder}/${quarterFolder}/` : `${subjectFolder}/${quarterFolder}/`;
    
    // Get Supabase client
    let client = getSupabaseClient();
    if (!client) {
      console.log('⚠️ Supabase client not found, initializing...');
      client = await initializeSupabaseClient();
    }
    
    if (!client || !client.storage) {
      console.error('❌ Supabase client not available:', { client, hasStorage: client?.storage });
      alert('Error: Supabase client not available. Please refresh the page and make sure Supabase SDK is loaded.');
      return;
    }
    
    console.log('✅ Supabase client ready');
    
    // Load current design-ids.json
    const designIdsPath = `${prefix}design-ids.json`;
    const designIdsUrl = getSupabaseFileUrl(designIdsPath);
    
    let designIds = [];
    try {
      const response = await fetch(designIdsUrl);
      if (response.ok) {
        designIds = await response.json();
      }
    } catch (error) {
      console.log('design-ids.json not found or error loading, will create new one');
    }
    
    // Update the name in the design IDs array
    const designIndex = designIds.findIndex(d => d.id === designId);
    if (designIndex >= 0) {
      designIds[designIndex].name = trimmedName;
    } else {
      // If not found, add it
      designIds.push({ id: designId, name: trimmedName });
    }
    
    // Save updated design-ids.json
    const designIdsJSON = JSON.stringify(designIds, null, 2);
    console.log(`💾 Saving design-ids.json to: ${designIdsPath}`);
    
    const { error: uploadError } = await client.storage
      .from(SUPABASE_BUCKET)
      .update(designIdsPath, new Blob([designIdsJSON], { type: 'application/json' }), {
        contentType: 'application/json',
        upsert: true
      });
    
    if (uploadError) {
      console.log(`⚠️ Update failed, trying upload instead: ${uploadError.message}`);
      // Try upload if update fails (file might not exist)
      const { error: uploadError2 } = await client.storage
        .from(SUPABASE_BUCKET)
        .upload(designIdsPath, new Blob([designIdsJSON], { type: 'application/json' }), {
          contentType: 'application/json',
          upsert: true
        });
      
      if (uploadError2) {
        console.error('❌ Upload also failed:', uploadError2);
        throw new Error(`Failed to save design-ids.json: ${uploadError2.message}`);
      } else {
        console.log('✅ Successfully uploaded design-ids.json');
      }
    } else {
      console.log('✅ Successfully updated design-ids.json');
    }
    
    // Also update global metadata if available (using Supabase Database)
    // Note: This is optional - the design-ids.json file is the primary source
    try {
      if (client && typeof client.from === 'function') {
        const { data: kvData, error: kvError } = await client
          .from('designs_metadata')
          .select('value')
          .eq('key', 'designs-list')
          .maybeSingle();
        
        if (!kvError && kvData && kvData.value) {
          let globalList = kvData.value;
          const globalIndex = globalList.findIndex(d => d.id === designId);
          if (globalIndex >= 0) {
            globalList[globalIndex].name = trimmedName;
            // Update in database
            await client
              .from('designs_metadata')
              .upsert({ key: 'designs-list', value: globalList }, { onConflict: 'key' });
            console.log('✅ Updated global metadata');
          }
        }
      }
    } catch (error) {
      console.warn('Could not update global metadata (this is optional):', error);
    }
    
    console.log(`✅ Lesson renamed: "${currentName}" → "${trimmedName}"`);
    
    // Show success message with option to refresh
    const shouldRefresh = confirm(
      `✅ Lesson renamed successfully!\n\n` +
      `"${currentName}" → "${trimmedName}"\n\n` +
      `Click OK to refresh the page and see the updated name.\n` +
      `Click Cancel to stay on this page.`
    );
    
    if (shouldRefresh) {
      window.location.reload();
    }
    
  } catch (error) {
    console.error('Error renaming design:', error);
    alert(`Error renaming lesson: ${error.message}`);
  }
}

// Export for use in HTML pages
window.loadSupabaseDesignsForQuarter = loadSupabaseDesignsForQuarter;
window.openDesignViewer = openDesignViewer;
window.openSupabaseDesignViewer = openDesignViewer; // Alias for backward compatibility
window.openDesignEditor = openDesignEditor;
window.openSupabaseDesignEditor = openDesignEditor; // Alias for backward compatibility
window.renameDesign = renameDesign;

// Log that functions are available
console.log('✅ [Supabase Loader] Functions loaded:', {
  loadSupabaseDesignsForQuarter: typeof window.loadSupabaseDesignsForQuarter,
  openDesignViewer: typeof window.openDesignViewer,
  openDesignEditor: typeof window.openDesignEditor,
  renameDesign: typeof window.renameDesign
});
