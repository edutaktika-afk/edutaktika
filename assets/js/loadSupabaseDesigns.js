/**
 * Load designs from Cloudflare R2 Storage
 * Simple approach: List files directly from R2 using a backend API or fetch files directly
 */

// R2 Configuration
const R2_PUBLIC_URL = 'https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev';
const R2_BUCKET_NAME = 'lessonflarer2';
const R2_API_ENDPOINT = '/api/list-r2-files'; // Backend API endpoint (optional)

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
 * Get R2 public URL for a file
 * @param {string} key - File path (e.g., "MATH/grade5/quarter1/design.json")
 * @returns {string} Public URL
 */
function getR2FileUrl(key) {
  // R2 public URL format: https://pub-xxx.r2.dev/bucket-name/path
  // If R2_PUBLIC_URL already includes bucket, don't add it again
  const baseUrl = R2_PUBLIC_URL.endsWith(`/${R2_BUCKET_NAME}`) 
    ? R2_PUBLIC_URL 
    : `${R2_PUBLIC_URL}/${R2_BUCKET_NAME}`;
  return `${baseUrl}/${key}`;
}

/**
 * Load designs for a specific subject and quarter from R2
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
  if (!gradeLevel) {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        const teacherSnap = await firebase.database().ref('teachers/' + user.uid).once('value');
        const teacher = teacherSnap.val();
        if (teacher && teacher.gradelevel) {
          const grade = teacher.gradelevel.toString();
          gradeLevel = grade.startsWith('grade') ? grade : `grade${grade}`;
          console.log(`📚 Grade level: ${gradeLevel}`);
        }
      }
    } catch (error) {
      console.warn('Could not fetch grade level:', error);
    }
  }
  
  console.log(`🔄 [R2] Loading: ${subjectFolder}, quarter=${quarter}, grade=${gradeLevel || 'all'}`);

  try {
    // Show loading state
    if (container) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;"><i class="fa fa-spinner fa-spin"></i> Loading lessons from Cloudflare R2...</div>';
    }

    // Build prefix for file listing: MATH/grade5/quarter1/
    const quarterFolder = `quarter${quarter}`;
    let prefix = `${subjectFolder}/`;
    if (gradeLevel) {
      const normalizedGrade = String(gradeLevel).startsWith('grade') ? gradeLevel : `grade${gradeLevel}`;
      prefix = `${subjectFolder}/${normalizedGrade}/${quarterFolder}/`;
    } else {
      prefix = `${subjectFolder}/${quarterFolder}/`;
    }
    
    console.log(`📂 [R2] Listing files with prefix: ${prefix}`);
    
    let files = [];
    
    // Try to list files via backend API first (if available)
    try {
      const apiUrl = `${R2_API_ENDPOINT}?prefix=${encodeURIComponent(prefix)}`;
      console.log(`🔌 [R2] Trying backend API: ${apiUrl}`);
      const apiResponse = await fetch(apiUrl);
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        files = apiData.files || [];
        console.log(`✅ [R2] Backend API returned ${files.length} files`);
      } else {
        console.log(`⚠️ [R2] Backend API not available (${apiResponse.status}), trying direct fetch...`);
      }
    } catch (apiError) {
      console.log(`⚠️ [R2] Backend API error:`, apiError.message);
      console.log(`💡 [R2] Backend API not configured, will try direct file access...`);
    }
    
    // If no backend API, try to load a simple design IDs list (SIMPLEST APPROACH)
    if (files.length === 0) {
      const designIdsUrl = getR2FileUrl(`${prefix}design-ids.json`);
      console.log(`📦 [R2] Loading design IDs from: ${designIdsUrl}`);
      
      try {
        const idsResponse = await fetch(designIdsUrl);
        if (idsResponse.ok) {
          const idsData = await idsResponse.json();
          console.log(`✅ [R2] Loaded design IDs:`, idsData);
          
          // Convert IDs to file objects
          files = idsData.map(design => ({
            key: `${prefix}${design.id}.json`,
            url: getR2FileUrl(`${prefix}${design.id}.json`),
            isJson: true,
            thumbnailKey: `${prefix}${design.id}.jpg`,
            thumbnailUrl: getR2FileUrl(`${prefix}${design.id}.jpg`),
            name: design.name || design.id,
            id: design.id
          }));
          console.log(`✅ [R2] Converted to ${files.length} file objects`);
        } else {
          console.log(`⚠️ [R2] Design IDs file not found (${idsResponse.status})`);
        }
      } catch (idsError) {
        console.log(`⚠️ [R2] Error loading design IDs:`, idsError.message);
      }
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
          thumbnailUrl: file.thumbnailUrl || getR2FileUrl(file.key.replace('.json', '.jpg')),
        };
      });
    
    console.log(`📊 [R2] Found ${metadataList.length} designs`);

    if (metadataList.length === 0) {
      if (container) {
        container.innerHTML = `
          <div style="text-align:center;padding:20px;color:#666;">
            <p>No lessons found.</p>
            <p style="font-size:0.9rem;color:#999;margin-top:10px;">
              Click <strong>"Create Lesson"</strong> to save your first lesson.
            </p>
            <p style="font-size:0.8rem;color:#999;margin-top:10px;">
              Looking in: <code style="background:#f0f0f0;padding:2px 4px;border-radius:3px;">${prefix}</code>
            </p>
          </div>
        `;
      }
      return [];
    }

    // No filtering needed - design-ids.json is already folder-specific
    const filteredDesigns = metadataList;

    // URLs are already constructed from design-ids.json, just format for display
    const designsWithUrls = filteredDesigns.map(design => {
      console.log(`🔗 [R2] Design "${design.name}":`, {
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
        source: 'r2'
      };
    });

    if (container) {
      renderDesigns(designsWithUrls, quarter, container, subject, isTeacher);
    }
    
    return designsWithUrls;

  } catch (error) {
    console.error('❌ Error loading designs from R2:', error);
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
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">No designs found.<br><small>Click "Create Lesson" to get started!</small></div>';
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
          <div style="display: flex; gap: 8px;">
            <button onclick="event.stopPropagation(); openDesignViewer('${design.id}', '${subject}', '${design.name.replace(/'/g, "\\'")}', '${design.quarter || '1'}')" 
                    style="background: #2196F3; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; cursor: pointer; flex: 1; font-weight: 600;">
              <i class="fas fa-eye" style="margin-right: 6px;"></i>View
            </button>
            ${isTeacher ? `
            <button onclick="event.stopPropagation(); openDesignEditor('${design.id}', '${subject}', '${design.name.replace(/'/g, "\\'")}', '${design.quarter || '1'}')" 
                    style="background: #FF9800; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; cursor: pointer; flex: 1; font-weight: 600;">
              <i class="fas fa-edit" style="margin-right: 6px;"></i>Edit
            </button>
            ` : ''}
          </div>
          <div style="font-size: 0.8rem; color: #888; margin-top: 8px;">Storage: Cloudflare R2</div>
        </div>
      </div>
    `;
  });
  
  cardsHTML += '</div>';
  container.innerHTML = cardsHTML;
  
  console.log(`✅ Rendered ${designs.length} lessons from R2`);
}

/**
 * Open design viewer (students can only view)
 */
async function openDesignViewer(designId, subject, designName = 'Design', quarter = '1') {
  console.log('🎨 Opening lesson viewer:', designId, subject, designName, quarter);
  
  try {
    const subjectFolder = SUBJECT_FOLDERS[subject.toLowerCase()] || subject.toUpperCase();
    
    // Get grade level
    let gradeLevel = null;
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        const teacherSnap = await firebase.database().ref('teachers/' + user.uid).once('value');
        const teacher = teacherSnap.val();
        if (teacher && teacher.gradelevel) {
          const grade = teacher.gradelevel.toString();
          gradeLevel = grade.startsWith('grade') ? grade : `grade${grade}`;
        }
      }
    } catch (error) {
      console.warn('Could not fetch grade level:', error);
    }
    
    // Build R2 URL for JSON file
    const quarterFolder = `quarter${quarter}`;
    let jsonPath;
    if (gradeLevel) {
      jsonPath = `${subjectFolder}/${gradeLevel}/${quarterFolder}/${designId}.json`;
    } else {
      jsonPath = `${subjectFolder}/${quarterFolder}/${designId}.json`;
    }
    
    const jsonUrl = getR2FileUrl(jsonPath);
    console.log(`📥 [R2] Loading JSON from: ${jsonUrl}`);
    
    // Fetch JSON from R2
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to load design: ${response.status}`);
    }
    
    const designJSON = await response.json();
    
    // Store in session storage for editor
    sessionStorage.setItem('supabase-design-to-load', JSON.stringify(designJSON));
    sessionStorage.setItem('supabase-design-id', designId);
    sessionStorage.setItem('supabase-design-subject', subject);
    sessionStorage.setItem('supabase-design-name', designName);
    sessionStorage.setItem('supabase-design-quarter', quarter);
    sessionStorage.setItem('supabase-design-grade', gradeLevel || '');

    // Open in viewer mode
    let editorBaseUrl = '/editor/index.html';
    if (typeof getEditorBaseUrl === 'function') {
      editorBaseUrl = getEditorBaseUrl();
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      editorBaseUrl = 'http://localhost:5173/';
    }
    
    const params = new URLSearchParams();
    params.set('supabaseDesign', designId);
    params.set('subject', subject);
    params.set('quarter', quarter);
    if (gradeLevel) params.set('grade', gradeLevel);
    params.set('view', 'true');
    
    const editorUrl = editorBaseUrl + (editorBaseUrl.includes('?') ? '&' : '?') + params.toString();
    console.log('🔗 Opening viewer:', editorUrl);
    window.open(editorUrl, '_blank', 'width=1400,height=900');

  } catch (error) {
    console.error('Error opening design viewer:', error);
    alert('Error loading design: ' + error.message);
  }
}

/**
 * Open design editor (teachers can edit)
 */
async function openDesignEditor(designId, subject, designName = 'Design', quarter = '1') {
  console.log('✏️ Opening lesson editor:', designId, subject, designName, quarter);
  
  try {
    const subjectFolder = SUBJECT_FOLDERS[subject.toLowerCase()] || subject.toUpperCase();
    
    // Get grade level
    let gradeLevel = null;
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        const teacherSnap = await firebase.database().ref('teachers/' + user.uid).once('value');
        const teacher = teacherSnap.val();
        if (teacher && teacher.gradelevel) {
          const grade = teacher.gradelevel.toString();
          gradeLevel = grade.startsWith('grade') ? grade : `grade${grade}`;
        }
      }
    } catch (error) {
      console.warn('Could not fetch grade level:', error);
    }
    
    // Build R2 URL for JSON file
    const quarterFolder = `quarter${quarter}`;
    let jsonPath;
    if (gradeLevel) {
      jsonPath = `${subjectFolder}/${gradeLevel}/${quarterFolder}/${designId}.json`;
    } else {
      jsonPath = `${subjectFolder}/${quarterFolder}/${designId}.json`;
    }
    
    const jsonUrl = getR2FileUrl(jsonPath);
    console.log(`📥 [R2] Loading JSON from: ${jsonUrl}`);
    
    // Fetch JSON from R2
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to load design: ${response.status}`);
    }
    
    const designJSON = await response.json();
    
    // Store in session storage for editor
    sessionStorage.setItem('supabase-design-to-load', JSON.stringify(designJSON));
    sessionStorage.setItem('supabase-design-id', designId);
    sessionStorage.setItem('supabase-design-subject', subject);
    sessionStorage.setItem('supabase-design-name', designName);
    sessionStorage.setItem('supabase-design-quarter', quarter);
    sessionStorage.setItem('supabase-design-grade', gradeLevel || '');

    // Open in editor mode
    let editorBaseUrl = '/editor/index.html';
    if (typeof getEditorBaseUrl === 'function') {
      editorBaseUrl = getEditorBaseUrl();
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      editorBaseUrl = 'http://localhost:5173/';
    }
    
    const params = new URLSearchParams();
    params.set('supabaseDesign', designId);
    params.set('subject', subject);
    params.set('quarter', quarter);
    if (gradeLevel) params.set('grade', gradeLevel);
    
    const editorUrl = editorBaseUrl + (editorBaseUrl.includes('?') ? '&' : '?') + params.toString();
    console.log('🔗 Opening editor:', editorUrl);
    window.open(editorUrl, '_blank', 'width=1400,height=900');

  } catch (error) {
    console.error('Error opening design editor:', error);
    alert('Error loading design: ' + error.message);
  }
}

// Export for use in HTML pages
window.loadSupabaseDesignsForQuarter = loadSupabaseDesignsForQuarter;
window.openDesignViewer = openDesignViewer;
window.openSupabaseDesignViewer = openDesignViewer; // Alias for backward compatibility
window.openDesignEditor = openDesignEditor;
window.openSupabaseDesignEditor = openDesignEditor; // Alias for backward compatibility

// Log that functions are available
console.log('✅ [R2 Loader] Functions loaded:', {
  loadSupabaseDesignsForQuarter: typeof window.loadSupabaseDesignsForQuarter,
  openDesignViewer: typeof window.openDesignViewer,
  openDesignEditor: typeof window.openDesignEditor
});
