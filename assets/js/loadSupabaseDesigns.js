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
 * Load designs for a specific subject and quarter from Supabase Storage
 * @param {string} subject - Subject name (math, science, english or subject_math, etc.)
 * @param {string} quarter - Quarter number (1, 2, 3, 4)
 * @param {HTMLElement} container - Container element to render designs into (optional)
 * @param {boolean} isTeacher - Whether user is a teacher (can edit)
 * @param {string} gradeLevel - Grade level (grade5, grade6, etc.) - optional
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
            gradeLevel = gradeValue.toString();
            console.log(`📚 Grade level from Firebase: ${gradeLevel}`);
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
  
  // Normalize grade format: "5" -> "Grade5", "grade5" -> "Grade5"
  let normalizedGrade = String(gradeLevel);
  if (!normalizedGrade.startsWith('Grade') && !normalizedGrade.startsWith('grade')) {
    // If it's just a number like "5", convert to "Grade5"
    normalizedGrade = `Grade${normalizedGrade}`;
  } else if (normalizedGrade.startsWith('grade')) {
    // Convert "grade5" -> "Grade5"
    normalizedGrade = `Grade${normalizedGrade.substring(5)}`;
  }
  
  console.log(`🔄 [Supabase] Loading: ${subjectFolder}, quarter=${quarter}, grade=${normalizedGrade} (STRICT ISOLATION)`);

  try {
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
    
    // Merge results: Use direct listing as source of truth, but use names from design-ids.json if available
    if (directListFiles.length > 0) {
      // Create a map of IDs to names from design-ids.json
      const nameMap = {};
      designIdsFromFile.forEach(design => {
        nameMap[design.id] = design.name || design.id;
      });
      
      // Use direct listing files, but update names from design-ids.json if available
      files = directListFiles.map(file => ({
        ...file,
        name: nameMap[file.id] || file.name || file.id
      }));
      
      console.log(`✅ [Supabase] Merged results: ${files.length} designs (${directListFiles.length} from direct listing, ${designIdsFromFile.length} names from design-ids.json)`);
    } else if (designIdsFromFile.length > 0) {
      // Fallback: If direct listing failed but design-ids.json exists, use it
      files = designIdsFromFile.map(design => ({
        key: `${prefix}${design.id}.json`,
        url: getSupabaseFileUrl(`${prefix}${design.id}.json`),
        isJson: true,
        thumbnailKey: `${prefix}${design.id}.jpg`,
        thumbnailUrl: getSupabaseFileUrl(`${prefix}${design.id}.jpg`),
        name: design.name || design.id,
        id: design.id
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
          name: file.name || id, // Use name from design-ids.json if available
          subject: normalizedSubject,
          quarter: quarter,
          gradeLevel: gradeLevel,
          jsonUrl: file.url,
          thumbnailUrl: file.thumbnailUrl || getSupabaseFileUrl(file.key.replace('.json', '.jpg')),
        };
      });
    
    console.log(`📊 [Supabase] Found ${metadataList.length} designs`);

    if (metadataList.length === 0) {
      if (container) {
        container.innerHTML = ''; // Empty - no message shown
      }
      return [];
    }

    // No filtering needed - design-ids.json is already folder-specific
    const filteredDesigns = metadataList;

    // URLs are already constructed, just format for display
    const designsWithUrls = filteredDesigns.map(design => {
      console.log(`🔗 [Supabase] Design "${design.name}":`, {
        jsonUrl: design.jsonUrl,
        thumbnailUrl: design.thumbnailUrl
      });
      
      return {
        id: design.id,
        name: design.name || design.id,
        jsonUrl: design.jsonUrl,
        thumbnail: design.thumbnailUrl,
        quarter: design.quarter || quarter,
        description: `Lesson: ${design.name || design.id}`,
        source: 'supabase'
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

  let cardsHTML = '<div class="gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin: 20px 0;">';
  
  designs.forEach(design => {
    cardsHTML += `
      <div class="card" style="background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; transition: all 0.3s ease; cursor: pointer; position: relative;" 
           onclick="openDesignViewer('${design.id}', '${subject}', '${design.name.replace(/'/g, "\\'")}', '${design.quarter || '1'}')"
           onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'">
        <img 
          class="card-image" 
          src="${design.thumbnail}" 
          alt="${design.name}"
          style="width: 100%; height: 160px; object-fit: cover;"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'%3E%3Crect fill=\'%23e3f2fd\' width=\'300\' height=\'200\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'20\' fill=\'%231976d2\'%3E${design.name}%3C/text%3E%3C/svg%3E'"
        >
        <div class="card-content" style="padding: 16px;">
          <div class="card-title" style="font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 8px;">${design.name}</div>
          <div class="card-description" style="font-size: 0.9rem; color: #666; margin-bottom: 12px;">${design.description}</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button onclick="event.stopPropagation(); openDesignViewer('${design.id}', '${subject}', '${design.name.replace(/'/g, "\\'")}', '${design.quarter || '1'}')" 
                    style="background: #2196F3; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; cursor: pointer; flex: 1; min-width: 100px; font-weight: 600;">
              <i class="fas fa-eye" style="margin-right: 6px;"></i>View
            </button>
            ${isTeacher ? `
            <button onclick="event.stopPropagation(); openDesignEditor('${design.id}', '${subject}', '${design.name.replace(/'/g, "\\'")}', '${design.quarter || '1'}')" 
                    style="background: #FF9800; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; cursor: pointer; flex: 1; min-width: 100px; font-weight: 600;">
              <i class="fas fa-edit" style="margin-right: 6px;"></i>Edit
            </button>
            <button onclick="event.stopPropagation(); (async function() { try { if(typeof window.renameDesign === 'function') { await window.renameDesign('${design.id}', '${subject}', '${design.name.replace(/'/g, "\\'")}', '${design.quarter || '1'}', '${design.gradeLevel || ''}'); } else { alert('Rename function not loaded. Please refresh the page.'); console.error('window.renameDesign:', typeof window.renameDesign); } } catch(err) { console.error('Error calling renameDesign:', err); alert('Error: ' + err.message); } })();" 
                    style="background: #9C27B0; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; cursor: pointer; flex: 1; min-width: 100px; font-weight: 600;">
              <i class="fas fa-tag" style="margin-right: 6px;"></i>Rename
            </button>
            ` : ''}
          </div>
          <div style="font-size: 0.8rem; color: #888; margin-top: 8px;">Storage: Supabase</div>
        </div>
      </div>
    `;
  });
  
  cardsHTML += '</div>';
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
            gradeLevel = gradeValue.toString();
            console.log(`📚 Grade level for viewer: ${gradeLevel}`);
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
    
    // Normalize grade format: "5" -> "Grade5", "grade5" -> "Grade5"
    let normalizedGrade = String(gradeLevel);
    if (!normalizedGrade.startsWith('Grade') && !normalizedGrade.startsWith('grade')) {
      normalizedGrade = `Grade${normalizedGrade}`;
    } else if (normalizedGrade.startsWith('grade')) {
      normalizedGrade = `Grade${normalizedGrade.substring(5)}`;
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
            gradeLevel = gradeValue.toString();
            console.log(`📚 Grade level for viewer: ${gradeLevel}`);
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
    
    // Normalize grade format: "5" -> "Grade5", "grade5" -> "Grade5"
    let normalizedGrade = String(gradeLevel);
    if (!normalizedGrade.startsWith('Grade') && !normalizedGrade.startsWith('grade')) {
      normalizedGrade = `Grade${normalizedGrade}`;
    } else if (normalizedGrade.startsWith('grade')) {
      normalizedGrade = `Grade${normalizedGrade.substring(5)}`;
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
