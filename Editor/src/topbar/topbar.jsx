import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Navbar,
  Alignment,
  AnchorButton,
  NavbarDivider,
  EditableText,
  Popover,
  Icon,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import FaGithub from '@meronex/icons/fa/FaGithub';
import FaDiscord from '@meronex/icons/fa/FaDiscord';
import FaTwitter from '@meronex/icons/fa/FaTwitter';
import BiCodeBlock from '@meronex/icons/bi/BiCodeBlock';
import MdcCloudAlert from '@meronex/icons/mdc/MdcCloudAlert';
import MdcCloudCheck from '@meronex/icons/mdc/MdcCloudCheck';
import MdcCloudSync from '@meronex/icons/mdc/MdcCloudSync';
import styled from 'polotno/utils/styled';

import { useProject } from '../project';
import { config } from '../utils/environment';
import licenseHandler from '../utils/licenseHandler';
import { getStoreKey } from '../utils/polotno-keys';

import { FileMenu } from './file-menu';
import { DownloadButton } from './download-button';
import { PostProcessButton } from './post-process-button';
// Firebase save button removed - using Supabase instead
// import { FirebaseSaveButton } from './firebase-save-button';
import { SupabaseSaveButton } from './supabase-save-button';
import { UserMenu } from './user-menu';
import { CloudWarning } from '../cloud-warning';
import EnvironmentSwitcher from '../components/EnvironmentSwitcher';

const NavbarContainer = styled('div')`
  white-space: nowrap;

  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled('div')`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;

const Status = observer(({ project }) => {
  const Icon = !project.cloudEnabled
    ? MdcCloudAlert
    : project.status === 'saved'
    ? MdcCloudCheck
    : MdcCloudSync;
  return (
    <Popover
      content={
        <div style={{ padding: '10px', maxWidth: '300px' }}>
          {!project.cloudEnabled && (
            <CloudWarning style={{ padding: '10px' }} />
          )}
          {project.cloudEnabled && project.status === 'saved' && (
            <>
              You data is saved with{' '}
              <a href="https://puter.com" target="_blank">
                Puter.com
              </a>
            </>
          )}
          {project.cloudEnabled &&
            (project.status === 'saving' || project.status === 'has-changes') &&
            'Saving...'}
        </div>
      }
      interactionKind="hover"
    >
      <div style={{ padding: '0 5px' }}>
        <Icon className="bp5-icon" style={{ fontSize: '25px', opacity: 0.8 }} />
      </div>
    </Popover>
  );
});

// Helpers for fullscreen and presentation
function enterFullscreen() {
  const el = document.getElementById('root'); // Vite root (wraps the editor)
  if (!el) return;
  if (el.requestFullscreen) el.requestFullscreen();
  // Don't add 'presenting' class - that's for slideshow mode, not fullscreen
  // Fullscreen should keep all UI elements visible
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
  // Don't remove 'presenting' class here - it's only for slideshow mode
}

export async function presentSlideshow(store) {
  // Hide license banners before presentation
  const currentConfig = window.edutaktikaConfig || config;
  if (currentConfig && currentConfig.license && currentConfig.license.hideInPresentation) {
    licenseHandler.hideBanner();
  }
  
  // Serialize store data to pass to presentation window
  const storeJSON = JSON.stringify(store.toJSON());
  const pages = store.pages.map((page, idx) => ({
    id: page.id,
    index: idx
  }));
  const polotnoKey = getStoreKey();
  
  // Store data in sessionStorage to avoid URL length limits
  const presentationId = 'presentation_' + Date.now();
  sessionStorage.setItem(presentationId, JSON.stringify({
    storeData: storeJSON,
    pages: pages,
    key: polotnoKey
  }));
  
  // Open presentation window with embedded Polotno
  const win = window.open('', '_blank', 'fullscreen=yes');
  if (!win) return;
    
    const html = `
<html>
<head>
  <title>Presentation Mode - Edutaktika</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/polotno@1.0.0/dist/polotno.bundle.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      margin: 0; 
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); 
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
    }
    
    /* Hide any license banners or watermarks */
    [class*="license"], [class*="banner"], [class*="watermark"], 
    .bp5-toast, .bp5-overlay, [data-testid*="license"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
    }
    
    #presentation-container { 
      position: relative; 
      width: 100vw; 
      height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      overflow: hidden;
    }
    
    #polotno-canvas {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Hide Polotno UI elements in presentation */
    #polotno-canvas .polotno-side-tabs-container,
    #polotno-canvas .polotno-panel-container,
    #polotno-canvas .bp5-navbar,
    #polotno-canvas .topbar,
    #polotno-canvas .polotno-pages-timeline,
    #polotno-canvas .polotno-toolbar {
      display: none !important;
    }
    
    #polotno-canvas .polotno-workspace {
      width: 100vw !important;
      height: 100vh !important;
      background: transparent !important;
    }
    
    #controls {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      padding: 15px 25px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: opacity 0.3s ease;
      z-index: 10000;
    }
    #controls.hidden { opacity: 0; pointer-events: none; }
    button { 
      background: rgba(255, 255, 255, 0.2); 
      color: #fff; 
      border: 1px solid rgba(255, 255, 255, 0.3); 
      padding: 10px 18px; 
      border-radius: 8px; 
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
    }
    button:hover { 
      background: rgba(255, 255, 255, 0.3); 
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    button:active { transform: translateY(0); }
    .control-icon { 
      cursor: pointer; 
      padding: 10px 15px; 
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      transition: all 0.2s ease;
      font-size: 20px;
      color: #fff;
      user-select: none;
    }
    .control-icon:hover { 
      background: rgba(255, 255, 255, 0.2); 
      transform: scale(1.1);
    }
    #slide-info {
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      min-width: 80px;
      text-align: center;
    }
    #progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #1976d2, #42a5f5);
      transition: width 0.3s ease;
      z-index: 10001;
    }
    #hint {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.7); 
      font-size: 12px;
      background: rgba(0, 0, 0, 0.5);
      padding: 8px 15px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      animation: fadeIn 1s ease-out;
      z-index: 10000;
      pointer-events: none;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 18px;
      z-index: 9999;
      text-align: center;
    }
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid #1976d2;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="progress-bar"></div>
  <div id="hint">🎨 Presentation Mode • Use Arrow Keys • F for Fullscreen • Esc to Exit</div>
  <div id="presentation-container">
    <div class="loading">
      <div class="spinner"></div>
      <div>Loading presentation...</div>
    </div>
    <div id="polotno-canvas"></div>
  </div>
  <div id="controls">
    <div class="control-icon" id="prevBtn" title="Previous (←)">◀</div>
    <button id="playBtn" title="Play/Pause (Space)">⏸</button>
    <div id="slide-info">1 / 1</div>
    <button id="nextBtn" title="Next (→)">⏭</button>
    <div class="control-icon" id="fullscreenBtn" title="Toggle Fullscreen (F)">⛶</div>
  </div>
  <script>
    (async function() {
      const { createStore } = polotno.store;
      const { unstable_setAnimationsEnabled } = polotno.config;
      
      // Enable animations
      unstable_setAnimationsEnabled(true);
      
      // Get store data from sessionStorage
      const presentationId = '${presentationId}';
      const storedData = JSON.parse(sessionStorage.getItem(presentationId) || '{}');
      const storeData = storedData.storeData;
      const pagesData = storedData.pages || [];
      const polotnoKey = storedData.key || '${polotnoKey}';
      
      if (!storeData) {
        document.querySelector('.loading').innerHTML = '<div class="spinner"></div><div>Error: Could not load presentation data</div>';
        return;
      }
      
      // Create store from data
      const presentationStore = createStore({
        key: polotnoKey,
        showCredit: false
      });
      
      // Load store data
      await presentationStore.loadJSON(storeData);
      
      // Render workspace
      const { Workspace } = polotno;
      const React = polotno.React;
      const ReactDOM = polotno.ReactDOM;
      
      const root = ReactDOM.createRoot(document.getElementById('polotno-canvas'));
      root.render(React.createElement(Workspace, { store: presentationStore }));
      
      // Remove loading indicator
      document.querySelector('.loading').remove();
      
      // Presentation controls
      let currentPageIndex = 0;
      const totalPages = pagesData.length;
      
      function updateSlideInfo() {
        document.getElementById('slide-info').textContent = \`\${currentPageIndex + 1} / \${totalPages}\`;
        const progress = ((currentPageIndex + 1) / totalPages) * 100;
        document.getElementById('progress-bar').style.width = progress + '%';
        
        // Switch to the current page
        if (pagesData[currentPageIndex]) {
          presentationStore.setActivePage(pagesData[currentPageIndex].id);
          
          // Trigger animations by briefly hiding and showing elements
          // This will cause Polotno to replay enter animations
          setTimeout(() => {
            const page = presentationStore.pages.find(p => p.id === pagesData[currentPageIndex].id);
            if (page) {
              // Force animation replay by updating elements
              page.children.forEach(child => {
                if (child.animations && child.animations.length > 0) {
                  // Trigger animation by temporarily disabling and re-enabling
                  const anims = child.animations;
                  child.set('animations', []);
                  setTimeout(() => {
                    child.set('animations', anims);
                  }, 50);
                }
              });
            }
          }, 100);
        }
      }
      
      // Auto-hide controls
      let hideControlsTimeout;
      function showControls() {
        document.getElementById('controls').classList.remove('hidden');
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
          document.getElementById('controls').classList.add('hidden');
        }, 3000);
      }
      
      // Navigation functions
      function nextSlide() {
        currentPageIndex = (currentPageIndex + 1) % totalPages;
        updateSlideInfo();
        showControls();
      }
      
      function prevSlide() {
        currentPageIndex = (currentPageIndex - 1 + totalPages) % totalPages;
        updateSlideInfo();
        showControls();
      }
      
      // Initialize
      updateSlideInfo();
      showControls();
      
      // Event listeners
      document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { 
          nextSlide();
        }
        if (e.key === 'ArrowLeft') { 
          prevSlide();
        }
        if (e.key === ' ') { // Spacebar for play/pause
          e.preventDefault();
          document.getElementById('playBtn').click();
        }
        if (e.key.toLowerCase() === 'f') { 
          if (document.documentElement.requestFullscreen) {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
        }
        if (e.key === 'Escape') { window.close(); }
      });
      
      document.getElementById('prevBtn').onclick = prevSlide;
      document.getElementById('nextBtn').onclick = nextSlide;
      
      let autoplay = false;
      let autoplayInterval = null;
      const slideDuration = 5000; // 5 seconds per slide
      
      document.getElementById('playBtn').onclick = () => {
        autoplay = !autoplay;
        const btn = document.getElementById('playBtn');
        btn.textContent = autoplay ? '⏸' : '▶';
        
        if (autoplay) {
          autoplayInterval = setInterval(() => {
            nextSlide();
          }, slideDuration);
        } else {
          clearInterval(autoplayInterval);
        }
        showControls();
      };
      
      document.getElementById('fullscreenBtn').onclick = () => {
        if (document.documentElement.requestFullscreen) {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }
      };
      
      // Mouse movement to show controls
      document.addEventListener('mousemove', showControls);
    })();
  </script>
</body>
</html>`;
  
  win.document.write(html);
  win.document.close();
  
  // Clean up sessionStorage after a delay (in case user closes window)
  setTimeout(() => {
    try {
      sessionStorage.removeItem(presentationId);
    } catch (e) {
      // Ignore errors
    }
  }, 60000); // Clean up after 1 minute
}

export default observer(({ store, isViewOnly = false }) => {
  const project = useProject();
  const [showEnvironmentSwitcher, setShowEnvironmentSwitcher] = React.useState(false);

  return (
    <>
      <NavbarContainer className="bp5-navbar topbar">
        <NavInner>
          <Navbar.Group align={Alignment.LEFT}>
            {!isViewOnly && <FileMenu store={store} project={project} />}
            <div
              style={{
                paddingLeft: isViewOnly ? '0' : '20px',
                maxWidth: '200px',
              }}
            >
              {isViewOnly ? (
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1976d2' }}>
                  🎨 Design Viewer
                </div>
              ) : (
                <EditableText
                  value={window.project.name}
                  placeholder="Design name"
                  onChange={(name) => {
                    window.project.name = name;
                    window.project.requestSave();
                  }}
                />
              )}
            </div>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            {isViewOnly ? (
              <>
                {/* View-only mode controls */}
                <AnchorButton
                  minimal
                  onClick={() => {
                    if (document.fullscreenElement) exitFullscreen(); else enterFullscreen();
                  }}
                >
                  {document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen'}
                </AnchorButton>
                <AnchorButton
                  minimal
                  onClick={() => presentSlideshow(store)}
                >
                  Present
                </AnchorButton>
                <DownloadButton store={store} />
                <NavbarDivider />
                <AnchorButton
                  minimal
                  href="gallery.html"
                  style={{ color: '#1976d2', fontWeight: '500' }}
                >
                  ← Back to Gallery
                </AnchorButton>
              </>
            ) : (
              <>
                {/* <Status project={project} /> */}
                <NavbarDivider />
                {/* Environment Switcher */}
                <AnchorButton
                  minimal
                  onClick={() => setShowEnvironmentSwitcher(true)}
                  title={`Switch between ${config?.isLocal ? 'deployed' : 'local'} environment`}
                  style={{ 
                    color: config?.isLocal ? '#f29d49' : '#137cbd',
                    fontWeight: '500'
                  }}
                >
                  {config?.isLocal ? '🛠️ Local' : '🚀 Deployed'}
                </AnchorButton>
                {/* Fullscreen toggle */}
                <AnchorButton
                  minimal
                  onClick={() => {
                    if (document.fullscreenElement) exitFullscreen(); else enterFullscreen();
                  }}
                >
                  {document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen'}
                </AnchorButton>
                {/* Duplicate Page */}
                <AnchorButton
                  minimal
                  icon={<Icon icon={IconNames.DUPLICATE} />}
                  onClick={() => {
                    const activePage = store.activePage;
                    if (activePage) {
                      try {
                        // Get current page's children
                        const children = activePage.children;
                        // Create new page
                        const newPage = store.addPage();
                        // Copy each element to the new page
                        children.forEach((child) => {
                          const elementJSON = child.toJSON();
                          // Create new element from JSON
                          newPage.addElement(elementJSON);
                        });
                        // Select the new page
                        store.setActivePage(newPage.id);
                        console.log('✅ Page duplicated successfully');
                      } catch (error) {
                        console.error('❌ Error duplicating page:', error);
                        alert('Error duplicating page: ' + error.message);
                      }
                    }
                  }}
                  title="Duplicate Current Page"
                >
                  Duplicate Page
                </AnchorButton>
                {/* Present (slideshow) */}
                <AnchorButton
                  minimal
                  onClick={() => presentSlideshow(store)}
                >
                  Present
                </AnchorButton>
                <PostProcessButton store={store} />
                <DownloadButton store={store} />
                <SupabaseSaveButton store={store} project={project} />
                <NavbarDivider />
                <AnchorButton
                  minimal
                  icon={<Icon icon={IconNames.HELP} />}
                  onClick={() => {
                    // Trigger tutorial
                    const tutorialButton = document.querySelector('[data-tutorial-trigger]');
                    if (tutorialButton) {
                      tutorialButton.click();
                    }
                  }}
                  title="Start Interactive Tutorial"
                  style={{
                    backgroundColor: '#137cbd',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    margin: '0 4px'
                  }}
                >
                  Tutorial
                </AnchorButton>
                <UserMenu store={store} project={project} />
              </>
            )}
          </Navbar.Group>
        </NavInner>
      </NavbarContainer>
      
      {/* Environment Switcher Dialog */}
      <EnvironmentSwitcher 
        isOpen={showEnvironmentSwitcher}
        onClose={() => setShowEnvironmentSwitcher(false)}
      />
    </>
  );
});
