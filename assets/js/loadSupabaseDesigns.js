/**
 * Load Supabase designs for subject pages
 * This file loads lesson designs from Supabase Storage and displays them
 * Editable by teachers, viewable by students
 */

// Supabase configuration - YOUR CREDENTIALS
const SUPABASE_CONFIG = {
  url: 'https://liiwqyodlzivzzethyrj.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaXdxeW9kbHppdnp6ZXRoeXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDY0MTYsImV4cCI6MjA3NzU4MjQxNn0.5sPzjw-DLvZ5bA7NlRF5YdunBD-nOsQ0GC8ALz03sFE'
};

// Initialize Supabase client
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
} else {
  console.warn('Supabase SDK not loaded. Please add: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
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

const BUCKET_NAME = 'LessonStorage';

/**
 * Load Supabase designs for a specific subject and quarter
 * @param {string} subject - Subject name (math, science, english or subject_math, etc.)
 * @param {string} quarter - Quarter number (1, 2, 3, 4)
 * @param {HTMLElement} container - Container element to render designs into (optional, if null returns array)
 * @param {boolean} isTeacher - Whether user is a teacher (can edit)
 * @param {string} gradeLevel - Grade level (grade5, grade6, etc.) - optional, will be fetched if not provided
 * @returns {Promise<Array>} Array of designs if container is null
 */
async function loadSupabaseDesignsForQuarter(subject, quarter, container = null, isTeacher = false, gradeLevel = null) {
  if (!supabaseClient) {
    console.error('Supabase client not initialized');
    if (container) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">Supabase not configured</div>';
    }
    return [];
  }

  // Get subject folder
  const subjectFolder = SUBJECT_FOLDERS[subject.toLowerCase()] || subject.toUpperCase();
  
  // If grade level not provided and user is logged in, fetch it from Firebase
  if (!gradeLevel) {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        const teacherSnap = await firebase.database().ref('teachers/' + user.uid).once('value');
        const teacher = teacherSnap.val();
        if (teacher && teacher.gradelevel) {
          // Normalize grade level to match folder naming (e.g., "5" -> "grade5", "grade5" -> "grade5")
          const grade = teacher.gradelevel.toString();
          gradeLevel = grade.startsWith('grade') ? grade : `grade${grade}`;
          console.log(`📚 Found teacher grade level: ${teacher.gradelevel} → normalized: ${gradeLevel}`);
        }
      }
    } catch (error) {
      console.warn('Could not fetch grade level:', error);
    }
  }
  
  console.log(`🔄 Loading Supabase designs: subject=${subjectFolder}, quarter=${quarter}, grade=${gradeLevel || 'all'}`);

  try {
    // Show loading state
    if (container) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;"><i class="fa fa-spinner fa-spin"></i> Loading Supabase designs...</div>';
    }

    // Load metadata from designs-list (use maybeSingle to avoid errors if table doesn't exist)
    const { data: kvData, error: kvError } = await supabaseClient
      .from('designs_metadata')
      .select('value')
      .eq('key', 'designs-list')
      .maybeSingle();
    
    if (kvError) {
      // PGRST116 = not found (expected if key doesn't exist)
      // PGRST205 = table doesn't exist (table not created yet)
      if (kvError.code === 'PGRST205') {
        console.log('⚠️ designs_metadata table not found - will list files directly instead');
      } else if (kvError.code !== 'PGRST116') {
        console.warn('Error loading metadata:', kvError);
      }
    }

    if (!kvData || !kvData.value) {
      console.log('No metadata found, listing files directly...');
      // Build paths with grade-aware structure
      const quarterFolder = `quarter${quarter}`;
      
      // IMPORTANT: Only use grade-specific paths when gradeLevel is provided
      // This prevents Grade 5 lessons from loading when looking for Grade 6
      const pathsToTry = [];
      if (gradeLevel) {
        // Grade-specific paths only - no fallback to non-grade paths
        pathsToTry.push(`${subjectFolder}/${gradeLevel}/${quarterFolder}`); // Primary: subject/grade/quarter
        pathsToTry.push(`${subjectFolder}/${gradeLevel}`); // Fallback: subject/grade (all quarters)
        console.log(`📚 Using grade-specific paths for: ${gradeLevel}`);
      } else {
        // Only use non-grade paths if no grade level is specified
        console.warn(`⚠️ No grade level provided! This may load lessons from wrong grade.`);
        pathsToTry.push(`${subjectFolder}/${quarterFolder}`); // Just quarter
        pathsToTry.push(subjectFolder); // Fallback: root
      }
      
      let files, error, fullPath;
      
      // Try each path in priority order
      for (const path of pathsToTry) {
        console.log(`📁 Trying to list: ${path}`);
        ({ data: files, error } = await supabaseClient.storage
          .from(BUCKET_NAME)
          .list(path, {
            limit: 100,
            offset: 0,
          }));
        
        if (!error && files && files.length > 0) {
          fullPath = path;
          console.log(`✅ Successfully listed files from: ${fullPath} (${files.length} items)`);
          break;
        } else {
          if (error) {
            console.log(`⚠️ Path failed (${error.message})`);
          } else {
            console.log(`⚠️ Path exists but is empty`);
          }
        }
      }

      if (error || !files || files.length === 0) {
        const errorMsg = gradeLevel 
          ? `No lessons found for ${gradeLevel} in ${subjectFolder}/${quarterFolder}. Make sure lessons are saved with the correct grade level.`
          : 'Error loading designs from Supabase.';
        console.error(`❌ ${errorMsg}`);
        if (container) {
          container.innerHTML = `<div style="text-align:center;padding:20px;color:#666;">${errorMsg}</div>`;
        }
        return [];
      }
      
      console.log(`📁 Found ${files.length} total files in ${fullPath}`);

      // Filter JSON files only
      const jsonFiles = files.filter(file => file.name.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        if (container) {
          container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">No designs found.<br><small>Click "Create Lesson" to get started!</small></div>';
        }
        return [];
      }

      // Load each file to get metadata
      const designs = [];
      for (const file of jsonFiles) {
        const fileId = file.name.replace('.json', '');
        const { data } = supabaseClient.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${fullPath}/${fileId}.jpg`);
        
        designs.push({
          id: fileId,
          name: fileId, // Will use ID as name if no metadata
          thumbnail: data.publicUrl,
          source: 'supabase',
          quarter: quarter // Store the quarter so it can be passed to editor
        });
      }

      if (container) {
        renderSupabaseDesigns(designs, quarter, container, subject, isTeacher);
      }
      return designs;
    }

    // Parse the metadata
    const allDesigns = kvData.value;
    
    console.log(`📦 Total designs in metadata: ${allDesigns.length}`);
    
    // Normalize subject name for comparison
    let normalizedSubject = subject.toLowerCase();
    if (normalizedSubject.startsWith('subject_')) {
      normalizedSubject = normalizedSubject.replace('subject_', '');
    }
    
    // Filter by subject and quarter
    const filteredDesigns = allDesigns.filter(design => {
      const matchesSubject = design.subject === normalizedSubject || 
                            design.subject === SUBJECT_FOLDERS[normalizedSubject] ||
                            design.subject === subject.toLowerCase() ||
                            design.subject === SUBJECT_FOLDERS[subject.toLowerCase()];
      // Convert both to strings for reliable comparison
      const matchesQuarter = !quarter || String(design.quarter) === String(quarter);
      
      if (!matchesSubject) {
        console.log(`🚫 Filtered out design "${design.name}": subject "${design.subject}" doesn't match "${normalizedSubject}"`);
      } else if (!matchesQuarter) {
        console.log(`🚫 Filtered out design "${design.name}": quarter "${design.quarter}" doesn't match "${quarter}"`);
      }
      
      return matchesSubject && matchesQuarter;
    });

    console.log(`📊 Found ${filteredDesigns.length} designs for ${subjectFolder} Quarter ${quarter}`);

    if (filteredDesigns.length === 0) {
      if (container) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">No designs found.<br><small>Click "Create Lesson" to get started!</small></div>';
      }
      return [];
    }

    // Get public URLs for thumbnails
    const quarterFolder = `quarter${quarter}`;
    const designsWithUrls = filteredDesigns.map(design => {
      // Build path with grade if available
      let thumbnailPath;
      if (gradeLevel) {
        thumbnailPath = `${SUBJECT_FOLDERS[subject.toLowerCase()]}/${gradeLevel}/${quarterFolder}/${design.id}.jpg`;
      } else {
        thumbnailPath = `${SUBJECT_FOLDERS[subject.toLowerCase()]}/${quarterFolder}/${design.id}.jpg`;
      }
      
      const { data } = supabaseClient.storage
        .from(BUCKET_NAME)
        .getPublicUrl(thumbnailPath);
      
      return {
        ...design,
        thumbnail: data.publicUrl,
        source: 'supabase'
      };
    });

    if (container) {
      renderSupabaseDesigns(designsWithUrls, quarter, container, subject, isTeacher);
    }
    
    return designsWithUrls;

  } catch (error) {
    console.error('❌ Error loading Supabase designs:', error);
    if (container) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#f44336;">Error loading designs. Please refresh the page.</div>';
    }
    return [];
  }
}

/**
 * Render Supabase designs in cards
 */
function renderSupabaseDesigns(designs, quarter, container, subject, isTeacher) {
  if (!container) return;

  if (designs.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">No designs found.<br><small>Click "Create Lesson" to get started!</small></div>';
    return;
  }

  // Build cards HTML
  let cardsHTML = '<div class="gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin: 20px 0;">';
  
  designs.forEach(design => {
    const description = design.description || 'No description available';
    const subjectFolder = SUBJECT_FOLDERS[subject.toLowerCase()];
    
    cardsHTML += `
      <div class="card" style="background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; transition: all 0.3s ease; cursor: pointer; position: relative;" 
           onclick="openSupabaseDesignViewer('${design.id}', '${subject}', '${design.name.replace(/'/g, "\\'")}', '${design.quarter || '1'}')"
           onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'">
        <img 
          class="card-image" 
          src="${design.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'%3E%3Crect fill=\'%234CAF50\' width=\'300\' height=\'200\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'20\' fill=\'white\'%3E${design.name}%3C/text%3E%3C/svg%3E'}" 
          alt="${design.name}"
          style="width: 100%; height: 160px; object-fit: cover;"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'%3E%3Crect fill=\'%23e3f2fd\' width=\'300\' height=\'200\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'20\' fill=\'%231976d2\'%3E${design.name}%3C/text%3E%3C/svg%3E'"
        >
        <div class="card-content" style="padding: 16px;">
          <div class="card-title" style="font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 8px;">${design.name}</div>
          <div class="card-description" style="font-size: 0.9rem; color: #666; margin-bottom: 12px;">${description}</div>
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <button onclick="event.stopPropagation(); openSupabaseDesignViewer('${design.id}', '${subject}', '${design.name.replace(/'/g, "\\'")}', '${design.quarter || '1'}')" 
                    style="background: #2196F3; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; cursor: pointer; flex: 1; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);"
                    onmouseover="this.style.background='#1976D2'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(33, 150, 243, 0.4)'"
                    onmouseout="this.style.background='#2196F3'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(33, 150, 243, 0.3)'">
              <i class="fas fa-eye" style="margin-right: 6px;"></i>View Design
            </button>
            ${isTeacher ? `
            <button onclick="event.stopPropagation(); openSupabaseDesignEditor('${design.id}', '${subject}', '${design.name.replace(/'/g, "\\'")}', '${design.quarter || '1'}')" 
                    style="background: #FF9800; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; cursor: pointer; flex: 1; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);"
                    onmouseover="this.style.background='#F57C00'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(255, 152, 0, 0.4)'"
                    onmouseout="this.style.background='#FF9800'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(255, 152, 0, 0.3)'">
              <i class="fas fa-edit" style="margin-right: 6px;"></i>Edit Design
            </button>
            ` : ''}
          </div>
          <div style="font-size: 0.8rem; color: #888;">Supabase: ${subjectFolder}</div>
        </div>
      </div>
    `;
  });
  
  cardsHTML += '</div>';
  
  container.innerHTML = cardsHTML;
  
  console.log(`✅ Rendered ${designs.length} Supabase designs`);
}

/**
 * Open design viewer (students can only view)
 */
async function openSupabaseDesignViewer(designId, subject, designName = 'Design', quarter = '1') {
  console.log('🎨 Opening Supabase design viewer:', designId, subject, designName, quarter);
  
  try {
    if (!supabaseClient) {
      alert('Supabase not configured');
      return;
    }

    const subjectFolder = SUBJECT_FOLDERS[subject.toLowerCase()] || subject.toUpperCase();
    
    // Try to get teacher's grade level
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
    
    // Build paths to try in priority order: grade+quarter > quarter > grade > root
    const quarterFolder = `quarter${quarter}`;
    const pathsToTry = [];
    if (gradeLevel) {
      pathsToTry.push(`${subjectFolder}/${gradeLevel}/${quarterFolder}/${designId}.json`);
      pathsToTry.push(`${subjectFolder}/${gradeLevel}/${designId}.json`);
    }
    pathsToTry.push(`${subjectFolder}/${quarterFolder}/${designId}.json`);
    pathsToTry.push(`${subjectFolder}/${designId}.json`);
    
    console.log(`📁 Trying paths in order: ${pathsToTry.join(', ')}`);
    
    // Download the design JSON - try each path
    let data, error;
    for (const path of pathsToTry) {
      console.log(`📁 Trying: ${path}`);
      ({ data, error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .download(path));
      
      if (!error) {
        console.log(`✅ Successfully downloaded from: ${path}`);
        break;
      }
    }

    if (error) {
      console.error('Error downloading design from all locations:', error);
      alert('Error loading design: ' + error.message);
      return;
    }

    // Read the JSON
    const text = await data.text();
    const designJSON = JSON.parse(text);

    // Store in session storage for the editor (for same-tab scenarios)
    sessionStorage.setItem('supabase-design-to-load', text);
    sessionStorage.setItem('supabase-design-id', designId);
    sessionStorage.setItem('supabase-design-subject', subject);
    sessionStorage.setItem('supabase-design-name', designName);
    sessionStorage.setItem('supabase-design-quarter', quarter);
    sessionStorage.setItem('supabase-design-grade', gradeLevel || '');

    // Open in fullscreen viewer - use environment-aware editor URL
    // IMPORTANT: Pass grade level in URL params since new window/tab has separate sessionStorage
    let editorBaseUrl = '/editor/index.html'; // Default for production deployment
    if (typeof getEditorBase === 'function') {
      editorBaseUrl = getEditorBase();
    } else if (typeof getEditorBaseUrl === 'function') {
      editorBaseUrl = getEditorBaseUrl();
    } else if (typeof window.location !== 'undefined') {
      // Fallback: detect environment from hostname
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      editorBaseUrl = isLocal ? 'http://localhost:5173/' : '/editor/index.html';
    }
    
    // Build URL with parameters
    let viewerUrl = editorBaseUrl;
    const params = new URLSearchParams();
    params.set('supabaseDesign', designId);
    params.set('subject', subject);
    params.set('quarter', quarter);
    if (gradeLevel) {
      params.set('grade', gradeLevel);
    }
    viewerUrl += (viewerUrl.includes('?') ? '&' : '?') + params.toString();
    
    console.log('🔗 Opening viewer with URL:', viewerUrl);
    window.open(viewerUrl, '_blank', 'width=1400,height=900');

  } catch (error) {
    console.error('Error opening design viewer:', error);
    alert('Error opening design: ' + error.message);
  }
}

/**
 * Open design editor (teachers can edit)
 */
async function openSupabaseDesignEditor(designId, subject, designName = 'Design', quarter = '1') {
  console.log('✏️ Opening Supabase design editor:', designId, subject, designName, quarter);
  
  try {
    if (!supabaseClient) {
      alert('Supabase not configured');
      return;
    }

    const subjectFolder = SUBJECT_FOLDERS[subject.toLowerCase()] || subject.toUpperCase();
    
    // Try to get teacher's grade level
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
    
    // Build paths to try in priority order: grade+quarter > quarter > grade > root
    const quarterFolder = `quarter${quarter}`;
    const pathsToTry = [];
    if (gradeLevel) {
      pathsToTry.push(`${subjectFolder}/${gradeLevel}/${quarterFolder}/${designId}.json`);
      pathsToTry.push(`${subjectFolder}/${gradeLevel}/${designId}.json`);
    }
    pathsToTry.push(`${subjectFolder}/${quarterFolder}/${designId}.json`);
    pathsToTry.push(`${subjectFolder}/${designId}.json`);
    
    console.log(`📁 Trying paths in order: ${pathsToTry.join(', ')}`);
    
    // Download the design JSON - try each path
    let data, error;
    for (const path of pathsToTry) {
      console.log(`📁 Trying: ${path}`);
      ({ data, error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .download(path));
      
      if (!error) {
        console.log(`✅ Successfully downloaded from: ${path}`);
        break;
      }
    }

    if (error) {
      console.error('Error downloading design from all locations:', error);
      alert('Error loading design: ' + error.message);
      return;
    }

    // Read the JSON
    const text = await data.text();
    const designJSON = JSON.parse(text);

    // Store in session storage for the editor (for same-tab scenarios)
    sessionStorage.setItem('supabase-design-to-load', text);
    sessionStorage.setItem('supabase-design-id', designId);
    sessionStorage.setItem('supabase-design-subject', subject);
    sessionStorage.setItem('supabase-design-name', designName);
    sessionStorage.setItem('supabase-design-quarter', quarter);
    sessionStorage.setItem('supabase-design-grade', gradeLevel || '');

    // Open in editor mode - use environment-aware editor URL
    // IMPORTANT: Pass grade level in URL params since new window/tab has separate sessionStorage
    let editorBaseUrl = '/editor/index.html'; // Default for production deployment
    if (typeof getEditorBase === 'function') {
      editorBaseUrl = getEditorBase();
    } else if (typeof getEditorBaseUrl === 'function') {
      editorBaseUrl = getEditorBaseUrl();
    } else if (typeof window.location !== 'undefined') {
      // Fallback: detect environment from hostname
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      editorBaseUrl = isLocal ? 'http://localhost:5173/' : '/editor/index.html';
    }
    
    // Build URL with parameters
    let editorUrl = editorBaseUrl;
    const params = new URLSearchParams();
    params.set('supabaseDesign', designId);
    params.set('subject', subject);
    params.set('quarter', quarter);
    if (gradeLevel) {
      params.set('grade', gradeLevel);
    }
    params.set('view', 'true');
    editorUrl += (editorUrl.includes('?') ? '&' : '?') + params.toString();
    
    console.log('🔗 Opening editor with URL:', editorUrl);
    window.open(editorUrl, '_blank', 'width=1400,height=900');

  } catch (error) {
    console.error('Error opening design editor:', error);
    alert('Error opening design: ' + error.message);
  }
}

// Export for use in HTML pages
window.loadSupabaseDesignsForQuarter = loadSupabaseDesignsForQuarter;
window.openSupabaseDesignViewer = openSupabaseDesignViewer;
window.openSupabaseDesignEditor = openSupabaseDesignEditor;

