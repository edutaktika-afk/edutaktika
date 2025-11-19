import React, { lazy, Suspense } from 'react';
import { observer } from 'mobx-react-lite';
import { Spinner } from '@blueprintjs/core';

import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { SectionTab } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { PagesTimeline } from 'polotno/pages-timeline';
import { setTranslations } from 'polotno/config';

import { loadFile } from './file';

import { ShapesSection } from './sections/shapes-section';
import { StableDiffusionSection } from './sections/stable-diffusion-section';
import { MyDesignsSection } from './sections/my-designs-section';
// import { PhotosSection } from './sections/photos-section'; // REMOVED - Photos tab disabled
import { BackgroundsSection } from './sections/backgrounds-section';
import { EducationalTemplatesSection } from './sections/science-templates/science-templates-section';
import { TextSection } from './sections/text-section';
import { MaterialIconsSection } from './sections/material-icons-section';
import { AnimationSection, FloatingAnimationPanel } from './sections/animation-section';

import { useProject } from './project';

// Only load the default translation initially - others can be loaded on demand
import en from './translations/en';
// Lazy load other translations (not needed for initial render)
// import fr from './translations/fr';
// import id from './translations/id';
// import ru from './translations/ru';
// import ptBr from './translations/pt-br';
// import zhCh from './translations/zh-ch';

import Topbar from './topbar/topbar';
import { presentSlideshow } from './topbar/topbar';
// Lazy load Tutorial component (not critical for initial render)
const Tutorial = lazy(() => import('./components/Tutorial'));
import { ToolbarAnimationButton } from './components/ToolbarAnimationButton';
import { StudentAnimationControls } from './components/StudentAnimationControls';

// load default translations
setTranslations(en);

// Helper to detect any section related to videos
const isVideoSection = (sec) => {
  const s = sec || {};
  const name = String(s.name || '').toLowerCase();
  const tabName = String(s.Tab?.name || s.Tab?.displayName || '').toLowerCase();
  const panelName = String(s.Panel?.name || s.Panel?.displayName || '').toLowerCase();
  return name.includes('video') || tabName.includes('video') || panelName.includes('video');
};

// Helper to detect background sections
const isBackgroundSection = (sec) => {
  const s = sec || {};
  const name = String(s.name || '').toLowerCase();
  return name === 'background' || name === 'backgrounds';
};

// Helper to detect photos sections
const isPhotosSection = (sec) => {
  const s = sec || {};
  const name = String(s.name || '').toLowerCase();
  const tabName = String(s.Tab?.name || s.Tab?.displayName || '').toLowerCase();
  const panelName = String(s.Panel?.name || s.Panel?.displayName || '').toLowerCase();
  return name.includes('photo') || tabName.includes('photo') || panelName.includes('photo');
};

// Helper to detect icons sections
const isIconsSection = (sec) => {
  const s = sec || {};
  const name = String(s.name || '').toLowerCase();
  const tabName = String(s.Tab?.name || s.Tab?.displayName || '').toLowerCase();
  const panelName = String(s.Panel?.name || s.Panel?.displayName || '').toLowerCase();
  return name.includes('icon') || tabName.includes('icon') || panelName.includes('icon');
};

// Helper to detect default text sections
// We'll remove ALL text sections first, then add our custom one back
const isDefaultTextSection = (sec) => {
  const s = sec || {};
  const name = String(s.name || '').toLowerCase();
  return name === 'text';
};

// Helper to detect elements sections (duplicate with shapes)
const isElementsSection = (sec) => {
  const s = sec || {};
  const name = String(s.name || '').toLowerCase();
  return name === 'elements';
};

// Helper to detect templates section (we want to preserve the default polotno templates)
const isTemplatesSection = (sec) => {
  const s = sec || {};
  const name = String(s.name || '').toLowerCase();
  return name === 'templates';
};

// Preserve the default polotno templates section before removing others
let defaultTemplatesSection = null;
for (let i = DEFAULT_SECTIONS.length - 1; i >= 0; i--) {
  const sec = DEFAULT_SECTIONS[i];
  if (isTemplatesSection(sec)) {
    defaultTemplatesSection = sec;
    // Remove it now, we'll add it back later with a new name
    DEFAULT_SECTIONS.splice(i, 1);
    continue;
  }
  if (isVideoSection(sec) || isBackgroundSection(sec) || isPhotosSection(sec) || isIconsSection(sec) || isDefaultTextSection(sec) || isElementsSection(sec)) {
    DEFAULT_SECTIONS.splice(i, 1);
  }
}

// Guard against future insertions of video, background, photos, icons, default text, and elements sections
// But allow our custom TextSection (it has a Tab property)
const _push = DEFAULT_SECTIONS.push.bind(DEFAULT_SECTIONS);
DEFAULT_SECTIONS.push = (...items) => _push(...items.filter((s) => !isVideoSection(s) && !isBackgroundSection(s) && !isPhotosSection(s) && !isIconsSection(s) && !(isDefaultTextSection(s) && !s.Tab) && !isElementsSection(s)));
const _unshift = DEFAULT_SECTIONS.unshift.bind(DEFAULT_SECTIONS);
DEFAULT_SECTIONS.unshift = (...items) => _unshift(...items.filter((s) => !isVideoSection(s) && !isBackgroundSection(s) && !isPhotosSection(s) && !isIconsSection(s) && !(isDefaultTextSection(s) && !s.Tab) && !isElementsSection(s)));
const _splice = DEFAULT_SECTIONS.splice.bind(DEFAULT_SECTIONS);
DEFAULT_SECTIONS.splice = (start, deleteCount, ...items) =>
  _splice(start, deleteCount, ...items.filter((s) => !isVideoSection(s) && !isBackgroundSection(s) && !isPhotosSection(s) && !isIconsSection(s) && !(isDefaultTextSection(s) && !s.Tab) && !isElementsSection(s)));

// add two more sections
// DEFAULT_SECTIONS.push(QuotesSection, QrSection); // REMOVED - Quotes and QR code sections
// DEFAULT_SECTIONS.unshift(UploadSection);
DEFAULT_SECTIONS.unshift(MyDesignsSection);

// Add our Educational Templates section right after My Designs (position 1)
DEFAULT_SECTIONS.splice(1, 0, EducationalTemplatesSection);

// Add the default polotno templates section (if it exists) - this is the original Polotno templates
// Rename it to "Online designs" to distinguish from our educational templates
// Place it right after Templates (position 2)
if (defaultTemplatesSection) {
  // Create a modified version with custom name
  const onlineDesignsSection = {
    ...defaultTemplatesSection,
    name: 'online-designs',
    Tab: observer((props) => {
      // Use SectionTab with custom name, but try to preserve the original icon
      const OriginalTab = defaultTemplatesSection.Tab;
      let icon = null;
      
      // Try to render the original tab to extract its icon
      if (OriginalTab) {
        try {
          const originalElement = React.createElement(OriginalTab, props);
          if (originalElement && originalElement.props && originalElement.props.children) {
            icon = originalElement.props.children;
          }
        } catch (e) {
          // If that fails, use a default icon
        }
      }
      
      // If we couldn't extract the icon, use a default one
      if (!icon) {
        icon = <span style={{ fontSize: '20px' }}>🌐</span>;
      }
      
      return (
        <SectionTab name="Online designs" {...props}>
          {icon}
        </SectionTab>
      );
    })
  };
  DEFAULT_SECTIONS.splice(2, 0, onlineDesignsSection);
}

// Add TextSection after Online designs (position 3)
// First check if a text section already exists (shouldn't, but be safe)
const existingTextIndex = DEFAULT_SECTIONS.findIndex(section => section.name === 'text');
if (existingTextIndex === -1) {
  // Insert TextSection at position 3 (after MyDesignsSection[0], Templates[1], Online designs[2])
  DEFAULT_SECTIONS.splice(3, 0, TextSection);
}

// add backgrounds section (Photos and Icons removed)
// Position adjusted to account for new order
DEFAULT_SECTIONS.splice(4, 0, BackgroundsSection);

// Add shapes section back (was removed when we removed elements)
DEFAULT_SECTIONS.splice(5, 0, ShapesSection);

// Add Material Icons section
DEFAULT_SECTIONS.splice(6, 0, MaterialIconsSection);

DEFAULT_SECTIONS.push(StableDiffusionSection);
DEFAULT_SECTIONS.push(AnimationSection); // Custom animation section with all animations
// DEFAULT_SECTIONS.push(VideosSection);

const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone
  );
};

const getOffsetHeight = () => {
  let safeAreaInsetBottom = 0;

  if (isStandalone()) {
    // Try to get the safe area inset using env() variables
    const safeAreaInsetBottomString = getComputedStyle(
      document.documentElement
    ).getPropertyValue('env(safe-area-inset-bottom)');
    if (safeAreaInsetBottomString) {
      safeAreaInsetBottom = parseFloat(safeAreaInsetBottomString);
    }

    // Fallback values for specific devices if env() is not supported
    if (!safeAreaInsetBottom) {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      if (/iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream) {
        // This is an approximation; you might need to adjust this value based on testing
        safeAreaInsetBottom = 20; // Example fallback value for iPhone
      }
    }
  }

  return window.innerHeight - safeAreaInsetBottom;
};

const useHeight = () => {
  const [height, setHeight] = React.useState(getOffsetHeight());
  React.useEffect(() => {
    window.addEventListener('resize', () => {
      setHeight(getOffsetHeight());
    });
  }, []);
  return height;
};

const App = observer(({ store }) => {
  const project = useProject();
  const height = useHeight();
  const [isViewOnly, setIsViewOnly] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Add/remove view-only-mode class to body for CSS styling
  React.useEffect(() => {
    if (isViewOnly) {
      document.body.classList.add('view-only-mode');
    } else {
      document.body.classList.remove('view-only-mode');
    }
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('view-only-mode');
    };
  }, [isViewOnly]);

  React.useEffect(() => {
    if (project.language.startsWith('fr')) {
      setTranslations(fr, { validate: true });
    } else if (project.language.startsWith('id')) {
      setTranslations(id, { validate: true });
    } else if (project.language.startsWith('ru')) {
      setTranslations(ru, { validate: true });
    } else if (project.language.startsWith('pt')) {
      setTranslations(ptBr, { validate: true });
    } else if (project.language.startsWith('zh')) {
      setTranslations(zhCh, { validate: true });
    } else {
      setTranslations(en, { validate: true });
    }
  }, [project.language]);

  React.useEffect(() => {
    // Check for view-only mode
    const urlParams = new URLSearchParams(window.location.search);
    const designUrl = urlParams.get('design');
    const supabaseDesign = urlParams.get('supabaseDesign');
    const isNew = urlParams.get('new') === 'true' || urlParams.get('mode') === 'create';
    const viewMode = urlParams.get('view') === 'true' || designUrl || supabaseDesign;
    const presentMode = urlParams.get('present') === 'true';
    
    // Handle Supabase designs
    if (supabaseDesign) {
      setIsViewOnly(viewMode && urlParams.get('view') === 'true');
      loadSupabaseDesign(supabaseDesign, urlParams.get('subject')).then(() => {
        // Auto-trigger presentation mode if present=true
        if (presentMode) {
          setTimeout(() => {
            // Directly call presentSlideshow function
            if (typeof presentSlideshow === 'function') {
              console.log('🎬 Auto-triggering presentation mode...');
              presentSlideshow(store);
            } else {
              // Fallback: try to find and click the present button
              const presentButton = document.querySelector('[title*="Present"], [title*="present"], button:contains("Present")');
              if (presentButton) {
                presentButton.click();
              } else {
                // Fallback: try to find by text content
                const buttons = document.querySelectorAll('button, .bp5-button');
                buttons.forEach(button => {
                  if (button.textContent && (button.textContent.includes('Present') || button.textContent.includes('present'))) {
                    button.click();
                  }
                });
              }
            }
          }, 2000); // Wait 2 seconds for the design to load
        }
      });
      return;
    }
    
    if (viewMode && designUrl) {
      setIsViewOnly(true);
      loadDesignForViewing(designUrl);
      
      // Auto-trigger presentation mode if present=true
      if (presentMode) {
        setTimeout(() => {
          // Find and click the present button
          const presentButton = document.querySelector('[title*="Present"], [title*="present"], button:contains("Present")');
          if (presentButton) {
            presentButton.click();
          } else {
            // Fallback: try to find by text content
            const buttons = document.querySelectorAll('button, .bp5-button');
            buttons.forEach(button => {
              if (button.textContent.includes('Present') || button.textContent.includes('present')) {
                button.click();
              }
            });
          }
        }, 2000); // Wait 2 seconds for the design to load
      }
    } else if (isNew) {
      // Skip loading old design when creating a new one
      console.log('🎨 Creating new design - skipping auto-load');
      // Clear any remaining storage keys just to be sure
      if (typeof window !== 'undefined' && window.storage) {
        window.storage.removeItem('polotno-last-design-id').catch(() => {});
        window.storage.removeItem('polotno-state').catch(() => {});
      }
      // Store will already have a blank page from index.jsx
    } else {
      project.firstLoad();
    }
  }, []);

  const loadSupabaseDesign = async (designId, subject) => {
    setIsLoading(true);
    try {
      console.log('🎨 Loading Supabase design:', designId, subject);
      
      // Check if JSON URL was provided as parameter (avoids sessionStorage quota issues)
      const urlParams = new URLSearchParams(window.location.search);
      const jsonUrl = urlParams.get('jsonUrl');
      let designData;
      
      if (jsonUrl) {
        // Fetch directly from provided URL (no sessionStorage needed - avoids quota issues)
        console.log('📥 Fetching design from provided JSON URL:', jsonUrl);
        try {
          const response = await fetch(jsonUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch design: ${response.status} ${response.statusText}`);
          }
          const responseText = await response.text();
          
          // Check for quota errors
          if (responseText.includes('quota has been exceeded') || responseText.includes('quota exceeded') || responseText.includes('Quota')) {
            throw new Error('Supabase Quota Exceeded: Please check your Supabase dashboard for quota limits.');
          }
          
          designData = JSON.parse(responseText);
          console.log('✅ Downloaded design from provided JSON URL');
        } catch (fetchError) {
          console.error('❌ Failed to fetch from jsonUrl:', fetchError);
          throw fetchError; // Don't fall through - jsonUrl should always work if provided
        }
      }
      
      // OLD METHOD REMOVED: No longer using sessionStorage for large JSON data
      // This prevents quota exceeded errors and conflicts between old/new save methods
      
      // Final fallback: download directly from Supabase
      if (!designData) {
        console.log('📥 Downloading design directly from Supabase');
        
        const { supabase } = await import('./supabase');
        const { getSubjectFolder } = await import('./supabase');
        
        const subjectFolder = getSubjectFolder(subject);
        console.log(`📁 Subject: "${subject}" → Folder: "${subjectFolder}"`);
        
        // Get quarter and grade from URL params or sessionStorage
        const urlParams = new URLSearchParams(window.location.search);
        const quarter = urlParams.get('quarter') || sessionStorage.getItem('supabase-design-quarter') || '1';
        const gradeFromUrl = urlParams.get('grade'); // Get grade from URL params (new window/tab)
        
        if (!subjectFolder) {
          throw new Error(`Invalid subject: "${subject}". Cannot determine folder.`);
        }
        
        // Get teacher's grade level using utility function (Firebase > sessionStorage > URL params)
        const { getUserGradeLevelWithFallback } = await import('./utils/getUserGradeLevel');
        const gradeLevel = await getUserGradeLevelWithFallback();
        
        // Build paths matching Supabase bucket structure: GradeLevel/Subject/Quarter/id.json
        // Example: Grade5/MATH/Quarter1/design.json or Grade6/SCIENCE/Quarter2/design.json
        // IMPORTANT: Only use grade-specific paths when gradeLevel is provided
        // This prevents Grade 5 lessons from loading when looking for Grade 6
        const quarterFolder = `Quarter${quarter}`;
        const pathsToTry = [];
        
        if (gradeLevel) {
          // Normalize grade format (ensure it starts with uppercase "Grade")
          let normalizedGrade = String(gradeLevel);
          if (!normalizedGrade.startsWith('Grade') && !normalizedGrade.startsWith('grade')) {
            normalizedGrade = `Grade${normalizedGrade}`;
          } else if (normalizedGrade.startsWith('grade')) {
            // Convert grade5 -> Grade5, grade6 -> Grade6
            normalizedGrade = `Grade${normalizedGrade.substring(5)}`;
          }
          
          // Use structure: GradeLevel/Subject/Quarter/ (matches your bucket setup)
          // This ensures grade-level isolation - Grade 5 can ONLY see Grade 5 lessons
          pathsToTry.push(`${normalizedGrade}/${subjectFolder}/${quarterFolder}/${designId}.json`);
          // Fallback: try without quarter (in case it's saved in grade/subject folder)
          pathsToTry.push(`${normalizedGrade}/${subjectFolder}/${designId}.json`);
          console.log(`📚 Using grade-specific paths for loading: ${normalizedGrade} (prevents cross-grade access)`);
        } else {
          // Only use non-grade paths if no grade level is specified (shouldn't happen)
          console.warn(`⚠️ No grade level provided when loading design! This may load wrong grade's lesson.`);
          pathsToTry.push(`${subjectFolder}/quarter${quarter}/${designId}.json`);
          pathsToTry.push(`${subjectFolder}/${designId}.json`);
        }
        
        console.log(`📁 Trying paths in order: ${pathsToTry.join(', ')}`);
        
        // Try each path in priority order
        let data, error, lastError;
        let foundPath = null;
        for (const path of pathsToTry) {
          console.log(`📁 Trying: ${path}`);
          ({ data, error } = await supabase.storage
            .from('LessonStorage')
            .download(path));
          
          if (!error && data) {
            console.log(`✅ Successfully downloaded from: ${path}`);
            foundPath = path;
            break;
          } else {
            lastError = error;
            // Log the specific error for this path (but continue trying)
            if (error && error.message) {
              console.log(`   ⚠️ ${path}: ${error.message}`);
            }
          }
        }

        console.log('Download result:', { hasData: !!data, foundPath, error: lastError });
        
        if (!data || error) {
          const errorMsg = lastError?.message || 'Unknown error';
          const errorDetails = `Design ID: ${designId}, Subject: ${subject}, Quarter: ${quarter}, Grade: ${gradeLevel || 'none'}`;
          console.error('❌ Failed to find design in Supabase storage.');
          console.error('   Tried paths:', pathsToTry);
          console.error('   Error:', errorMsg);
          console.error('   Details:', errorDetails);
          throw new Error(`Design not found in Supabase storage. Tried ${pathsToTry.length} paths. Last error: ${errorMsg}. ${errorDetails}`);
        }
        
        const text = await data.text();
        console.log('Downloaded text length:', text.length);
        designData = JSON.parse(text);
        console.log('✅ Downloaded design from Supabase');
      }
      
      // Ensure we have at least one page before loading the design
      if (store.pages.length === 0) {
        store.addPage();
      }
      
      // Get metadata from URL params first (new method), then fallback to sessionStorage (old method)
      // Reuse urlParams declared at the start of the function
      const designName = urlParams.get('name') || 
                        sessionStorage.getItem('supabase-design-name') || 
                        'Design';
      const quarter = urlParams.get('quarter') || 
                     sessionStorage.getItem('supabase-design-quarter') || 
                     '1';
      const gradeLevel = urlParams.get('grade') || 
                        sessionStorage.getItem('supabase-design-grade') || 
                        '';
      
      project.id = designId;
      project.name = designName;
      project.status = 'saved';
      
      console.log(`📌 Loaded design: "${designName}" (ID: ${designId}, Subject: ${subject}, Quarter: ${quarter}, Grade: ${gradeLevel || 'none'})`);
      
      // Store design metadata in session storage for later retrieval (small data only - no JSON)
      // This is safe and won't cause quota issues
      try {
        const designMetadata = {
          id: designId,
          subject: subject,
          quarter: quarter,
          name: designName,
          gradeLevel: gradeLevel
        };
        sessionStorage.setItem('current-supabase-design', JSON.stringify(designMetadata));
        
        // Also store individual items for backward compatibility (small strings only)
        sessionStorage.setItem('supabase-design-id', designId);
        sessionStorage.setItem('supabase-design-subject', subject);
        sessionStorage.setItem('supabase-design-name', designName);
        sessionStorage.setItem('supabase-design-quarter', quarter);
        if (gradeLevel) sessionStorage.setItem('supabase-design-grade', gradeLevel);
        
        // Clean up old large JSON storage keys that might cause conflicts
        try {
          sessionStorage.removeItem('supabase-design-to-load');
        } catch (e) {
          // Ignore if already removed or quota issue
        }
      } catch (storageError) {
        // If sessionStorage quota exceeded, continue anyway - metadata is optional
        console.warn('⚠️ Could not store metadata in sessionStorage (quota may be exceeded):', storageError);
      }
      
      // Load the design into the store
      store.loadJSON(designData);
      console.log('✅ Design loaded into store successfully');
      
    } catch (error) {
      console.error('❌ Error loading Supabase design:', error);
      alert('Error loading design: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDesignForViewing = async (designUrl) => {
    setIsLoading(true);
    try {
      console.log('Loading design for viewing:', designUrl);
      
      // Try to fetch the design
      let designData;
      try {
        const response = await fetch(designUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch design (HTTP ${response.status})`);
        }
        const data = await response.json();
        designData = data.json || data;
      } catch (fetchError) {
        console.log('Direct fetch failed, trying Firebase SDK...', fetchError);
        
        // Try Firebase SDK method - designUrl is now just the design ID
        const designId = designUrl;
        
        // Firebase configuration
        const firebaseConfig = {
          apiKey: "AIzaSyB5BbeLLvPX8l1c4Lq0f-CmIUml4hQOQlE",
          authDomain: "edutaktika.firebaseapp.com",
          databaseURL: "https://edutaktika-default-rtdb.firebaseio.com",
          projectId: "edutaktika",
          storageBucket: "edutaktika.appspot.com",
          messagingSenderId: "676848575316",
          appId: "1:676848575316:web:f78f8c0f83bf3d9dfb5ec1",
          measurementId: "G-X3GT5TNN87"
        };

        // Initialize Firebase if not already initialized
        if (!firebase.apps || firebase.apps.length === 0) {
          firebase.initializeApp(firebaseConfig);
        }
        
        const db = firebase.database();
        const snapshot = await db.ref(`designs/${designId}`).once('value');
        const data = snapshot.val();
        
        if (!data) {
          throw new Error('Design not found in database');
        }
        
        designData = data.json;
      }

      if (!designData) {
        throw new Error('No design data found');
      }

      console.log('Design data loaded, applying to store:', designData);
      
      // Ensure we have at least one page before loading the design
      if (store.pages.length === 0) {
        store.addPage();
      }
      
      // Load the design into the store
      store.loadJSON(designData);
      
      // Ensure we still have at least one page after loading
      if (store.pages.length === 0) {
        store.addPage();
      }
      
      console.log('Design loaded successfully in view-only mode');
    } catch (error) {
      console.error('Error loading design for viewing:', error);
      
      // Ensure we have at least one page even if design loading fails
      if (store.pages.length === 0) {
        store.addPage();
      }
      
      alert(`Failed to load design: ${error.message}\n\nA blank page has been created. You can still use the Editor normally.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Runtime safeguard: if upstream injects unwanted tabs, remove them from DOM
  React.useEffect(() => {
    const hideUnwantedTabs = () => {
      const tabs = document.querySelectorAll('.polotno-side-panel-tab');
      const seenTabs = new Set();
      
      tabs.forEach((tab) => {
        const text = (tab.textContent || '').trim().toLowerCase();
        
        // Remove videos, photos, icons, and elements tabs
        if (text === 'videos' || text === 'video' || text.includes('videos') ||
            text === 'photos' || text === 'photo' || text.includes('photos') ||
            text === 'icons' || text === 'icon' || text.includes('icons') ||
            text === 'elements' || text === 'element' || text.includes('elements')) {
          tab.remove();
          return;
        }
        
        // Remove duplicate tabs
        if (seenTabs.has(text)) {
          tab.remove();
          return;
        }
        
        seenTabs.add(text);
      });
    };
    
    hideUnwantedTabs();
    const mo = new MutationObserver(() => hideUnwantedTabs());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  const handleDrop = (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    // skip the case if we dropped DOM element from side panel
    // in that case Safari will have more data in "items"
    if (ev.dataTransfer.files.length !== ev.dataTransfer.items.length) {
      return;
    }
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      loadFile(ev.dataTransfer.files[i], store);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa'
      }}>
        <Spinner />
        <div style={{ marginTop: '20px', color: '#666' }}>Loading design...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: height + 'px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onDrop={handleDrop}
    >
      {!isViewOnly && <Topbar store={store} isViewOnly={isViewOnly} />}
      <div style={{ height: isViewOnly ? '100%' : 'calc(100% - 50px)' }}>
        <PolotnoContainer className="polotno-app-container">
          {!isViewOnly && (
            <SidePanelWrap>
              <SidePanel
                store={store}
                sections={(() => {
                  // Filter out unwanted sections and deduplicate by name
                  const filtered = DEFAULT_SECTIONS.filter((s) => {
                    const name = String(s?.name || '').toLowerCase();
                    // Temporarily keep Polotno's built-in animation section to inspect it
                    // if (name === 'animate' || name === 'animations' || name === 'animation') {
                    //   console.log('🚫 Removing Polotno built-in animation section:', s.name);
                    //   return false;
                    // }
                    return !isVideoSection(s) && !isPhotosSection(s) && !isIconsSection(s);
                  });
                  // Deduplicate sections by name to prevent React key warnings
                  const seen = new Set();
                  return filtered.filter((section) => {
                    const name = section?.name || '';
                    if (seen.has(name)) {
                      return false; // Skip duplicate
                    }
                    seen.add(name);
                    return true;
                  });
                })()}
              />
            </SidePanelWrap>
          )}
          <WorkspaceWrap>
            {!isViewOnly && <Toolbar store={store} />}
            {!isViewOnly && <ToolbarAnimationButton store={store} />}
              <Workspace store={store} />
            {!isViewOnly && <ZoomButtons store={store} />}
            <PagesTimeline store={store} />
            {/* Student animation controls - only visible in view-only mode */}
            <StudentAnimationControls store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
      {!isViewOnly && (
        <>
          <Suspense fallback={null}>
            <Tutorial store={store} />
          </Suspense>
          <FloatingAnimationPanel store={store} />
        </>
      )}
      {project.status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
            }}
          >
            <Spinner />
          </div>
        </div>
      )}
    </div>
  );
});

export default App;
