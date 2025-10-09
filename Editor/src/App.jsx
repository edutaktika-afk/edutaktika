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
import { IconsSection } from './sections/icons-section';
import { ShapesSection } from './sections/shapes-section';
import { StableDiffusionSection } from './sections/stable-diffusion-section';
import { MyDesignsSection } from './sections/my-designs-section';
import { PhotosSection } from './sections/photos-section';
import { BackgroundsSection } from './sections/backgrounds-section';
import { EducationalTemplatesSection } from './sections/science-templates/science-templates-section';

import { useProject } from './project';

import fr from './translations/fr';
import en from './translations/en';
import id from './translations/id';
import ru from './translations/ru';
import ptBr from './translations/pt-br';
import zhCh from './translations/zh-ch';

import Topbar from './topbar/topbar';

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

// Remove any built-in video sections immediately
for (let i = DEFAULT_SECTIONS.length - 1; i >= 0; i--) {
  const sec = DEFAULT_SECTIONS[i];
  if (isVideoSection(sec)) {
    DEFAULT_SECTIONS.splice(i, 1);
  }
}

// Guard against future insertions of video sections
const _push = DEFAULT_SECTIONS.push.bind(DEFAULT_SECTIONS);
DEFAULT_SECTIONS.push = (...items) => _push(...items.filter((s) => !isVideoSection(s)));
const _unshift = DEFAULT_SECTIONS.unshift.bind(DEFAULT_SECTIONS);
DEFAULT_SECTIONS.unshift = (...items) => _unshift(...items.filter((s) => !isVideoSection(s)));
const _splice = DEFAULT_SECTIONS.splice.bind(DEFAULT_SECTIONS);
DEFAULT_SECTIONS.splice = (start, deleteCount, ...items) =>
  _splice(start, deleteCount, ...items.filter((s) => !isVideoSection(s)));

// replace elements section with just shapes
DEFAULT_SECTIONS.splice(3, 1, ShapesSection);
// add icons
DEFAULT_SECTIONS.splice(3, 0, IconsSection);
// add photos and backgrounds sections
DEFAULT_SECTIONS.splice(4, 0, PhotosSection, BackgroundsSection);

// Find and replace the default templates section with our Educational Templates
const templatesIndex = DEFAULT_SECTIONS.findIndex(section => section.name === 'templates');
if (templatesIndex !== -1) {
  DEFAULT_SECTIONS.splice(templatesIndex, 1, EducationalTemplatesSection);
} else {
  // If no templates section found, add it at position 5
  DEFAULT_SECTIONS.splice(5, 0, EducationalTemplatesSection);
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

  // Runtime safeguard: if upstream injects a Videos tab, remove it from DOM
  React.useEffect(() => {
    const hideVideoTabs = () => {
      const tabs = document.querySelectorAll('.polotno-side-panel-tab');
      tabs.forEach((tab) => {
        const text = (tab.textContent || '').trim().toLowerCase();
        if (text === 'videos' || text === 'video' || text.includes('videos')) {
          tab.remove();
        }
      });
    };
    hideVideoTabs();
    const mo = new MutationObserver(() => hideVideoTabs());
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
              sections={DEFAULT_SECTIONS.filter((s) => !isVideoSection(s))}
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
