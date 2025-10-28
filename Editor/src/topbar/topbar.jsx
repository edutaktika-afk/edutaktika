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

import { FileMenu } from './file-menu';
import { DownloadButton } from './download-button';
import { PostProcessButton } from './post-process-button';
import { FirebaseSaveButton } from './firebase-save-button';
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
  document.body.classList.add('presenting');
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
  document.body.classList.remove('presenting');
}

async function presentSlideshow(store) {
  // Hide license banners before presentation
  const currentConfig = window.edutaktikaConfig || config;
  if (currentConfig && currentConfig.license && currentConfig.license.hideInPresentation) {
    licenseHandler.hideBanner();
  }
  
  // Export all pages as data URLs then open enhanced slideshow window
  const win = window.open('', '_blank', 'fullscreen=yes');
  if (!win) return;
  
  const html = `
<html>
<head>
  <title>Presentation Mode - Edutaktika</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      margin: 0; 
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      overflow: hidden;
      transition: background 0.5s ease;
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
    }
    img { 
      max-width: 95vw; 
      max-height: 95vh; 
      display: none; 
      box-shadow: 0 0 40px rgba(255, 255, 255, 0.1); 
      border-radius: 8px;
      transition: opacity 0.5s ease, transform 0.5s ease;
      opacity: 0;
      transform: scale(0.95);
    }
    img.active { 
      display: block !important;
      opacity: 1;
      transform: scale(1);
    }
    img.slide-in { animation: slideIn 0.5s ease-out; }
    img.fade { animation: fade 0.5s ease-out; }
    img.zoom { animation: zoomIn 0.5s ease-out; }
    @keyframes slideIn { 
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fade { 
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes zoomIn { 
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
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
      z-index: 1000;
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
      z-index: 1001;
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
      z-index: 1000;
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
      <div>Loading slides...</div>
    </div>
  </div>
  <div id="controls">
    <div class="control-icon" id="prevBtn" title="Previous (←)">◀</div>
    <button id="playBtn" title="Play/Pause (Space)">⏸</button>
    <div id="slide-info">1 / 1</div>
    <button id="nextBtn" title="Next (→)">⏭</button>
    <div class="control-icon" id="fullscreenBtn" title="Toggle Fullscreen (F)">⛶</div>
  </div>
</body>
</html>`;
  
  win.document.write(html);
  win.document.close();
  
  const imgs = [];
  let i = 0;
  let autoplay = false;
  let autoplayInterval = null;
  const slideDuration = 5000; // 5 seconds per slide
  
  // Load images
  for (const page of store.pages) {
    const url = await store.toDataURL({ pageId: page.id });
    const img = win.document.createElement('img');
    img.src = url;
    img.classList.add('slide');
    win.document.querySelector('#presentation-container').appendChild(img);
    imgs.push(img);
  }
  
  // Remove loading indicator
  win.document.querySelector('.loading').remove();
  
  // Update slide info
  function updateSlideInfo() {
    win.document.getElementById('slide-info').textContent = `${i + 1} / ${imgs.length}`;
    const progress = ((i + 1) / imgs.length) * 100;
    win.document.getElementById('progress-bar').style.width = progress + '%';
  }
  
  // Show slide with animation
  function show(idx, animation = 'fade') {
    imgs.forEach(im => im.classList.remove('active', 'slide-in', 'fade', 'zoom'));
    imgs[idx].classList.add('active', animation);
    updateSlideInfo();
  }
  
  // Auto-hide controls
  let hideControlsTimeout;
  function showControls() {
    win.document.getElementById('controls').classList.remove('hidden');
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
      win.document.getElementById('controls').classList.add('hidden');
    }, 3000);
  }
  
  // Initialize
  show(0);
  showControls();
  
  // Event listeners
  win.document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { 
      i = (i + 1) % imgs.length; 
      show(i, 'slide-in'); 
      showControls();
    }
    if (e.key === 'ArrowLeft') { 
      i = (i - 1 + imgs.length) % imgs.length; 
      show(i, 'slide-in'); 
      showControls();
    }
    if (e.key === ' ') { // Spacebar for play/pause
      e.preventDefault();
      win.document.getElementById('playBtn').click();
    }
    if (e.key.toLowerCase() === 'f') { 
      if (win.document.documentElement.requestFullscreen) {
        if (!win.document.fullscreenElement) {
          win.document.documentElement.requestFullscreen();
        } else {
          win.document.exitFullscreen();
        }
      }
    }
    if (e.key === 'Escape') { win.close(); }
  });
  
  win.document.getElementById('prevBtn').onclick = () => {
    i = (i - 1 + imgs.length) % imgs.length;
    show(i, 'fade');
    showControls();
  };
  
  win.document.getElementById('nextBtn').onclick = () => {
    i = (i + 1) % imgs.length;
    show(i, 'fade');
    showControls();
  };
  
  win.document.getElementById('playBtn').onclick = () => {
    autoplay = !autoplay;
    const btn = win.document.getElementById('playBtn');
    btn.textContent = autoplay ? '⏸' : '▶';
    
    if (autoplay) {
      autoplayInterval = setInterval(() => {
        i = (i + 1) % imgs.length;
        show(i, 'zoom');
      }, slideDuration);
    } else {
      clearInterval(autoplayInterval);
    }
    showControls();
  };
  
  win.document.getElementById('fullscreenBtn').onclick = () => {
    if (win.document.documentElement.requestFullscreen) {
      if (!win.document.fullscreenElement) {
        win.document.documentElement.requestFullscreen();
      } else {
        win.document.exitFullscreen();
      }
    }
  };
  
  // Mouse movement to show controls
  win.document.addEventListener('mousemove', showControls);
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
                {/* Present (slideshow) */}
                <AnchorButton
                  minimal
                  onClick={() => presentSlideshow(store)}
                >
                  Present
                </AnchorButton>
                <PostProcessButton store={store} />
                <DownloadButton store={store} />
                <FirebaseSaveButton store={store} />
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
