import React from 'react';
import { observer } from 'mobx-react-lite';
import { Spinner } from '@blueprintjs/core';

import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
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

import { useProject } from './project';

import fr from './translations/fr';
import en from './translations/en';
import id from './translations/id';
import ru from './translations/ru';
import ptBr from './translations/pt-br';
import zhCh from './translations/zh-ch';

import Topbar from './topbar/topbar';
import Tutorial from './components/Tutorial';

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

// Helper to detect default text sections (but not our custom TextSection)
const isDefaultTextSection = (sec) => {
  const s = sec || {};
  const name = String(s.name || '').toLowerCase();
  // Only filter out default Polotno text sections, not our custom TextSection
  return name === 'text' && !s.Tab; // Our custom TextSection has a Tab property
};

// Helper to detect elements sections (duplicate with shapes)
const isElementsSection = (sec) => {
  const s = sec || {};
  const name = String(s.name || '').toLowerCase();
  return name === 'elements';
};

// Remove any built-in video, background, photos, icons, default text, and elements sections immediately
for (let i = DEFAULT_SECTIONS.length - 1; i >= 0; i--) {
  const sec = DEFAULT_SECTIONS[i];
  if (isVideoSection(sec) || isBackgroundSection(sec) || isPhotosSection(sec) || isIconsSection(sec) || isDefaultTextSection(sec) || isElementsSection(sec)) {
    DEFAULT_SECTIONS.splice(i, 1);
  }
}

// Guard against future insertions of video, background, photos, icons, default text, and elements sections
const _push = DEFAULT_SECTIONS.push.bind(DEFAULT_SECTIONS);
DEFAULT_SECTIONS.push = (...items) => _push(...items.filter((s) => !isVideoSection(s) && !isBackgroundSection(s) && !isPhotosSection(s) && !isIconsSection(s) && !isDefaultTextSection(s) && !isElementsSection(s)));
const _unshift = DEFAULT_SECTIONS.unshift.bind(DEFAULT_SECTIONS);
DEFAULT_SECTIONS.unshift = (...items) => _unshift(...items.filter((s) => !isVideoSection(s) && !isBackgroundSection(s) && !isPhotosSection(s) && !isIconsSection(s) && !isDefaultTextSection(s) && !isElementsSection(s)));
const _splice = DEFAULT_SECTIONS.splice.bind(DEFAULT_SECTIONS);
DEFAULT_SECTIONS.splice = (start, deleteCount, ...items) =>
  _splice(start, deleteCount, ...items.filter((s) => !isVideoSection(s) && !isBackgroundSection(s) && !isPhotosSection(s) && !isIconsSection(s) && !isDefaultTextSection(s) && !isElementsSection(s)));

// add backgrounds section (Photos and Icons removed)
DEFAULT_SECTIONS.splice(3, 0, BackgroundsSection);

// Add shapes section back (was removed when we removed elements)
DEFAULT_SECTIONS.splice(4, 0, ShapesSection);

// Add Material Icons section
DEFAULT_SECTIONS.splice(5, 0, MaterialIconsSection);

// Find and replace the default templates section with our Educational Templates
const templatesIndex = DEFAULT_SECTIONS.findIndex(section => section.name === 'templates');
if (templatesIndex !== -1) {
  DEFAULT_SECTIONS.splice(templatesIndex, 1, EducationalTemplatesSection);
} else {
  // If no templates section found, add it at position 5
  DEFAULT_SECTIONS.splice(5, 0, EducationalTemplatesSection);
}

// Add our custom text section with Google Fonts after templates
const textTemplatesIndex = DEFAULT_SECTIONS.findIndex(section => section.name === 'templates');
if (textTemplatesIndex !== -1) {
  DEFAULT_SECTIONS.splice(textTemplatesIndex + 1, 0, TextSection);
} else {
  // If no templates section found, add text section at position 1
  DEFAULT_SECTIONS.splice(1, 0, TextSection);
}
// add two more sections
// DEFAULT_SECTIONS.push(QuotesSection, QrSection); // REMOVED - Quotes and QR code sections
// DEFAULT_SECTIONS.unshift(UploadSection);
DEFAULT_SECTIONS.unshift(MyDesignsSection);

DEFAULT_SECTIONS.push(StableDiffusionSection);
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
    const viewMode = urlParams.get('view') === 'true' || designUrl || supabaseDesign;
    const presentMode = urlParams.get('present') === 'true';
    
    // Handle Supabase designs
    if (supabaseDesign) {
      setIsViewOnly(viewMode && urlParams.get('view') === 'true');
      loadSupabaseDesign(supabaseDesign, urlParams.get('subject'));
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
    } else {
      project.firstLoad();
    }
  }, []);

  const loadSupabaseDesign = async (designId, subject) => {
    setIsLoading(true);
    try {
      console.log('🎨 Loading Supabase design:', designId, subject);
      
      // Try sessionStorage first (works if opened from same tab)
      let designJSONString = sessionStorage.getItem('supabase-design-to-load');
      let designData;
      
      if (designJSONString) {
        console.log('✅ Found design in sessionStorage');
        designData = JSON.parse(designJSONString);
      } else {
        // Fallback: download directly from Supabase
        console.log('📥 Downloading design directly from Supabase');
        
        const { supabase } = await import('./supabase');
        const { getSubjectFolder } = await import('./supabase');
        
        const subjectFolder = getSubjectFolder(subject);
        console.log(`📁 Subject: "${subject}" → Folder: "${subjectFolder}"`);
        
        // Get quarter from URL params or sessionStorage
        const urlParams = new URLSearchParams(window.location.search);
        const quarter = urlParams.get('quarter') || sessionStorage.getItem('supabase-design-quarter') || '1';
        const quarterFolder = `quarter${quarter}`;
        const fullPath = `${subjectFolder}/${quarterFolder}/${designId}.json`;
        console.log(`📁 Downloading from folder: ${fullPath}`);
        
        if (!subjectFolder) {
          throw new Error(`Invalid subject: "${subject}". Cannot determine folder.`);
        }
        
        const { data, error } = await supabase.storage
          .from('LessonStorage')
          .download(fullPath);

        console.log('Download result:', { hasData: !!data, error });
        
        if (error) {
          console.error('Download error details:', JSON.stringify(error, null, 2));
          throw new Error(`Failed to download design: ${error.message || JSON.stringify(error)}`);
        }
        
        if (!data) {
          throw new Error('No data returned from Supabase storage');
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
      
      // Set project ID and name for overwriting capability
      const designName = sessionStorage.getItem('supabase-design-name') || 'Design';
      const quarter = sessionStorage.getItem('supabase-design-quarter') || '1';
      project.id = designId;
      project.name = designName;
      project.status = 'saved';
      
      console.log(`📌 Loaded design: "${designName}" (ID: ${designId}, Subject: ${subject}, Quarter: ${quarter})`);
      
      // Store design metadata in session storage for later retrieval
      const designMetadata = {
        id: designId,
        subject: subject,
        quarter: quarter,
        name: designName
      };
      sessionStorage.setItem('current-supabase-design', JSON.stringify(designMetadata));
      
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
      <Topbar store={store} isViewOnly={isViewOnly} />
      <div style={{ height: 'calc(100% - 50px)' }}>
        <PolotnoContainer className="polotno-app-container">
          {!isViewOnly && (
            <SidePanelWrap>
              <SidePanel
                store={store}
                sections={DEFAULT_SECTIONS.filter((s) => !isVideoSection(s) && !isPhotosSection(s) && !isIconsSection(s))}
              />
            </SidePanelWrap>
          )}
          <WorkspaceWrap>
            {!isViewOnly && <Toolbar store={store} />}
            <Workspace store={store} />
            {!isViewOnly && <ZoomButtons store={store} />}
            {!isViewOnly && <PagesTimeline store={store} />}
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
      {!isViewOnly && <Tutorial store={store} />}
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
