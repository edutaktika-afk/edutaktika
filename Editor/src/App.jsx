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

import { QrSection } from './sections/qr-section';
import { QuotesSection } from './sections/quotes-section';
// import { IconsSection } from './sections/icons-section'; // REMOVED - Icons tab disabled
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
DEFAULT_SECTIONS.push(QuotesSection, QrSection);
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
    project.firstLoad();
  }, []);

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
      <Topbar store={store} />
      <div style={{ height: 'calc(100% - 50px)' }}>
        <PolotnoContainer className="polotno-app-container">
          <SidePanelWrap>
            <SidePanel
              store={store}
              sections={DEFAULT_SECTIONS.filter((s) => !isVideoSection(s) && !isPhotosSection(s) && !isIconsSection(s))}
            />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar store={store} />
            <Workspace store={store} />
            <ZoomButtons store={store} />
            <PagesTimeline store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
      <Tutorial store={store} />
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
