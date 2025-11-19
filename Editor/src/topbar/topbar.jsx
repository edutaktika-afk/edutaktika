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

// Store the escape handler reference for cleanup
let escapeHandler = null;

export async function presentSlideshow(store) {
  // Hide license banners before presentation
  const currentConfig = window.edutaktikaConfig || config;
  if (currentConfig && currentConfig.license && currentConfig.license.hideInPresentation) {
    licenseHandler.hideBanner();
  }
  
  // Toggle presentation mode in the current window
  const body = document.body;
  const isPresenting = body.classList.toggle('presentation-mode');
  
  // Remove existing escape handler if any
  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    escapeHandler = null;
  }
  
  if (isPresenting) {
    // Enter presentation mode - hide UI except navbar and pages timeline
    console.log('🎬 Entering presentation mode');
    
    // Directly hide navbar elements as a fallback (in case CSS doesn't catch them)
    setTimeout(() => {
      const navbars = document.querySelectorAll('.bp5-navbar.topbar, .topbar, [class*="bp5-navbar"][class*="topbar"], [class*="topbar"][class*="bp5-navbar"]');
      navbars.forEach(nav => {
        if (nav) {
          nav.style.display = 'none';
          nav.style.visibility = 'hidden';
          nav.style.opacity = '0';
          nav.style.height = '0';
          nav.style.overflow = 'hidden';
          nav.style.pointerEvents = 'none';
        }
      });
  
      // Also hide NavbarContainer if it exists
      const navbarContainers = document.querySelectorAll('[class*="NavbarContainer"], [class*="NavInner"]');
      navbarContainers.forEach(container => {
        if (container) {
          container.style.display = 'none';
          container.style.visibility = 'hidden';
        }
      });
    }, 50);
    
    // Trigger animations on current page
    const activePage = store.activePage;
    if (activePage && activePage.children) {
      const animatedElements = [];
      activePage.children.forEach(child => {
        if (child.animations && child.animations.length > 0) {
          const enabledAnims = child.animations.filter(a => a.enabled !== false);
          if (enabledAnims.length > 0) {
            animatedElements.push(child.id);
          }
        }
      });
      
      if (animatedElements.length > 0) {
        if (store.isPlaying) {
          store.stop();
        }
        store.play({
          animatedElementsIds: animatedElements,
          currentTime: activePage.startTime || 0
        });
      }
    }
  } else {
    // Exit presentation mode
    console.log('🎬 Exiting presentation mode');
    if (store.isPlaying) {
      store.stop();
    }
    
    // Restore navbar visibility when exiting presentation mode
    setTimeout(() => {
      const navbars = document.querySelectorAll('.bp5-navbar.topbar, .topbar, [class*="bp5-navbar"][class*="topbar"], [class*="topbar"][class*="bp5-navbar"]');
      navbars.forEach(nav => {
        if (nav) {
          nav.style.display = '';
          nav.style.visibility = '';
          nav.style.opacity = '';
          nav.style.height = '';
          nav.style.overflow = '';
          nav.style.pointerEvents = '';
        }
      });
      
      // Also restore NavbarContainer if it exists
      const navbarContainers = document.querySelectorAll('[class*="NavbarContainer"], [class*="NavInner"]');
      navbarContainers.forEach(container => {
        if (container) {
          container.style.display = '';
          container.style.visibility = '';
        }
      });
    }, 50);
  }
  
  // Inject CSS for presentation mode if not already present
  if (!document.getElementById('presentation-mode-styles')) {
    const style = document.createElement('style');
    style.id = 'presentation-mode-styles';
    style.textContent = `
      /* Presentation mode - hide all UI except navbar and pages timeline */
      body.presentation-mode .polotno-side-tabs-container,
      body.presentation-mode .polotno-panel-container,
      body.presentation-mode .polotno-toolbar,
      body.presentation-mode .polotno-toolbar-container,
      body.presentation-mode .polotno-toolbar-wrapper,
      body.presentation-mode .polotno-zoom-buttons,
      body.presentation-mode .floating-animation-panel,
      body.presentation-mode .bp5-popover-target,
      body.presentation-mode [aria-label*="Move"],
      body.presentation-mode [aria-label*="move"],
      body.presentation-mode .bp5-button[aria-label*="Move"],
      body.presentation-mode .bp5-button[aria-label*="move"],
      body.presentation-mode .bp5-icon-chevron-up,
      body.presentation-mode .bp5-icon-chevron-down,
      body.presentation-mode button[aria-label*="Move up"],
      body.presentation-mode button[aria-label*="Move down"],
      body.presentation-mode button[aria-label*="Duplicate"],
      body.presentation-mode button[aria-label*="Delete"],
      body.presentation-mode button[aria-label*="Add"],
      body.presentation-mode .polotno-toolbar button,
      body.presentation-mode .polotno-toolbar .bp5-button,
      body.presentation-mode .polotno-toolbar .bp5-popover-target {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }
    
      /* Hide navbar in presentation mode - catch all variations including dynamic class names */
      /* But exclude pages timeline from these rules */
      body.presentation-mode .bp5-navbar.topbar:not(.polotno-pages-timeline),
      body.presentation-mode .topbar:not(.polotno-pages-timeline),
      body.presentation-mode .bp5-navbar:not(.polotno-pages-timeline):not([class*="pages-timeline"]),
      body.presentation-mode [class*="bp5-navbar"]:not(.polotno-pages-timeline):not([class*="pages-timeline"]),
      body.presentation-mode [class*="topbar"]:not(.polotno-pages-timeline):not([class*="pages-timeline"]),
      body.presentation-mode [class*="go"][class*="bp5-navbar"]:not(.polotno-pages-timeline):not([class*="pages-timeline"]),
      body.presentation-mode [class*="go"][class*="topbar"]:not(.polotno-pages-timeline):not([class*="pages-timeline"]) {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
    }
    
      /* Specifically target the navbar container and any element with both go* and bp5-navbar classes */
      /* But exclude pages timeline */
      body.presentation-mode .NavbarContainer:not(.polotno-pages-timeline),
      body.presentation-mode .NavInner:not(.polotno-pages-timeline),
      body.presentation-mode [class*="go"][class*="bp5-navbar"][class*="topbar"]:not(.polotno-pages-timeline):not([class*="pages-timeline"]),
      body.presentation-mode [class*="go"][class*="topbar"][class*="bp5-navbar"]:not(.polotno-pages-timeline):not([class*="pages-timeline"]) {
      display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
    }
    
      /* Nuclear option: hide any element that contains both "bp5-navbar" and "topbar" in its class list */
      /* But exclude pages timeline */
      body.presentation-mode *[class*="bp5-navbar"][class*="topbar"]:not(.polotno-pages-timeline):not([class*="pages-timeline"]),
      body.presentation-mode *[class*="topbar"][class*="bp5-navbar"]:not(.polotno-pages-timeline):not([class*="pages-timeline"]) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -9999px !important;
      }
      
      /* Keep pages timeline visible and functional */
      body.presentation-mode .polotno-pages-timeline {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        height: auto !important;
        overflow: visible !important;
        pointer-events: auto !important;
        position: relative !important;
        left: auto !important;
    }
      
      /* Make workspace fill entire screen (only account for pages timeline now) */
      body.presentation-mode .polotno-workspace {
        width: 100vw !important;
        height: calc(100vh - 60px) !important; /* Account for pages timeline only */
        max-width: 100vw !important;
      }
      
      body.presentation-mode .polotno-workspace-container {
        width: 100vw !important;
        height: calc(100vh - 60px) !important;
        max-width: 100vw !important;
    }
      
      body.presentation-mode .polotno-workspace-wrap {
        width: 100vw !important;
        height: calc(100vh - 60px) !important;
      }
      
      
      /* Hide any remaining toolbar elements */
      body.presentation-mode .polotno-toolbar-container,
      body.presentation-mode .polotno-toolbar-wrapper {
        display: none !important;
    }
      
      /* Hide all buttons and controls in the workspace area (except pages timeline) */
      body.presentation-mode .polotno-workspace-wrap .bp5-button,
      body.presentation-mode .polotno-workspace-wrap button,
      body.presentation-mode .polotno-workspace-wrap .bp5-popover,
      body.presentation-mode .polotno-workspace-wrap .bp5-popover-target,
      body.presentation-mode .polotno-workspace-container .bp5-button,
      body.presentation-mode .polotno-workspace-container button,
      body.presentation-mode .polotno-workspace-container .bp5-popover,
      body.presentation-mode .polotno-workspace-container .bp5-popover-target {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      
      /* Specifically target toolbar buttons by their parent container */
      body.presentation-mode [class*="toolbar"] button,
      body.presentation-mode [class*="Toolbar"] button,
      body.presentation-mode [class*="toolbar"] .bp5-button,
      body.presentation-mode [class*="Toolbar"] .bp5-button {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Enter fullscreen when entering presentation mode
  if (isPresenting) {
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed:', err);
      });
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
    
    // Add ESC key listener to exit presentation mode and fullscreen
    escapeHandler = (e) => {
      if ((e.key === 'Escape' || e.keyCode === 27) && body.classList.contains('presentation-mode')) {
        // Prevent default browser behavior
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        
        // Exit presentation mode immediately
        body.classList.remove('presentation-mode');
        if (store.isPlaying) {
          store.stop();
        }
        
        // Restore navbar visibility
        setTimeout(() => {
          const navbars = document.querySelectorAll('.bp5-navbar.topbar, .topbar, [class*="bp5-navbar"][class*="topbar"], [class*="topbar"][class*="bp5-navbar"]');
          navbars.forEach(nav => {
            if (nav && !nav.classList.contains('polotno-pages-timeline')) {
              nav.style.display = '';
              nav.style.visibility = '';
              nav.style.opacity = '';
              nav.style.height = '';
              nav.style.overflow = '';
              nav.style.pointerEvents = '';
              nav.style.position = '';
              nav.style.left = '';
            }
          });
      
          // Also restore NavbarContainer if it exists
          const navbarContainers = document.querySelectorAll('[class*="NavbarContainer"], [class*="NavInner"]');
          navbarContainers.forEach(container => {
            if (container && !container.classList.contains('polotno-pages-timeline')) {
              container.style.display = '';
              container.style.visibility = '';
              container.style.opacity = '';
              container.style.height = '';
              container.style.position = '';
              container.style.left = '';
            }
          });
        }, 50);
      }
    };
    
    // Add the event listener with capture phase to intercept before browser default
    document.addEventListener('keydown', escapeHandler, true);
    
    // Also listen for fullscreen change events as a backup
    const fullscreenChangeHandler = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && 
          !document.mozFullScreenElement && !document.msFullscreenElement) {
        // Fullscreen was exited, make sure presentation mode is also exited
        if (body.classList.contains('presentation-mode')) {
          body.classList.remove('presentation-mode');
          if (store.isPlaying) {
            store.stop();
          }
          
          // Restore navbar visibility
          setTimeout(() => {
            const navbars = document.querySelectorAll('.bp5-navbar.topbar, .topbar, [class*="bp5-navbar"][class*="topbar"], [class*="topbar"][class*="bp5-navbar"]');
            navbars.forEach(nav => {
              if (nav && !nav.classList.contains('polotno-pages-timeline')) {
                nav.style.display = '';
                nav.style.visibility = '';
                nav.style.opacity = '';
                nav.style.height = '';
                nav.style.overflow = '';
                nav.style.pointerEvents = '';
                nav.style.position = '';
                nav.style.left = '';
                }
              });
            
            const navbarContainers = document.querySelectorAll('[class*="NavbarContainer"], [class*="NavInner"]');
            navbarContainers.forEach(container => {
              if (container && !container.classList.contains('polotno-pages-timeline')) {
                container.style.display = '';
                container.style.visibility = '';
                container.style.opacity = '';
                container.style.height = '';
                container.style.position = '';
                container.style.left = '';
              }
            });
          }, 50);
      }
      }
    };
    
    // Store the fullscreen change handler for cleanup
    window._presentationFullscreenHandler = fullscreenChangeHandler;
    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
  } else {
    // Exit fullscreen when exiting presentation mode
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.log('Fullscreen exit failed:', err);
      });
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    
    // Clean up escape handler
    if (escapeHandler) {
      document.removeEventListener('keydown', escapeHandler, true);
      escapeHandler = null;
        }
    
    // Clean up fullscreen change handler
    if (window._presentationFullscreenHandler) {
      document.removeEventListener('fullscreenchange', window._presentationFullscreenHandler);
      document.removeEventListener('webkitfullscreenchange', window._presentationFullscreenHandler);
      document.removeEventListener('mozfullscreenchange', window._presentationFullscreenHandler);
      document.removeEventListener('MSFullscreenChange', window._presentationFullscreenHandler);
      window._presentationFullscreenHandler = null;
    }
  }
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
