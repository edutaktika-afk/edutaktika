/**
 * Environment Detection and Configuration
 * Handles switching between local development and deployed environments
 */

// Detect if we're running locally vs deployed
export const isLocalDevelopment = () => {
  // Check if we're running on localhost or file:// protocol
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0' ||
    window.location.protocol === 'file:' ||
    window.location.hostname.includes('local')
  );
};

// Detect if we're in presentation mode
export const isPresentationMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('present') === 'true' || urlParams.get('view') === 'true';
};

// Detect if we're in view-only mode
export const isViewOnlyMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('view') === 'true' || urlParams.get('design');
};

// Get the appropriate editor URL based on environment
export const getEditorUrl = () => {
  if (isLocalDevelopment()) {
    return window.location.origin + '/Editor/index.html';
  } else {
    return window.location.origin + '/editor/index.html';
  }
};

// Get the appropriate assets path
export const getAssetsPath = () => {
  if (isLocalDevelopment()) {
    return './';
  } else {
    return './assets/';
  }
};

// Configuration object
export const config = {
  isLocal: isLocalDevelopment(),
  isPresentation: isPresentationMode(),
  isViewOnly: isViewOnlyMode(),
  editorUrl: getEditorUrl(),
  assetsPath: getAssetsPath(),
  
  // Animation settings
  animations: {
    enabled: true,
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    presentationDuration: 500,
  },
  
  // Presentation settings
  presentation: {
    autoHideControls: true,
    hideLicenseBanner: true,
    fullscreenMode: true,
    transitionDuration: 500,
  },
  
  // License banner settings
  license: {
    hideInPresentation: true,
    hideInViewOnly: true,
    customOverlay: true,
  }
};

// Utility function to add environment classes to body
export const addEnvironmentClasses = () => {
  const body = document.body;
  
  if (config.isLocal) {
    body.classList.add('env-local');
  } else {
    body.classList.add('env-deployed');
  }
  
  if (config.isPresentation) {
    body.classList.add('env-presentation');
  }
  
  if (config.isViewOnly) {
    body.classList.add('env-view-only');
  }
};

// Initialize environment detection
export const initializeEnvironment = () => {
  addEnvironmentClasses();
  
  // Expose config globally for other modules
  window.edutaktikaConfig = config;
  
  // Log environment info in development
  if (config.isLocal) {
    console.log('🎨 Edutaktika Editor - Local Development Mode');
    console.log('Environment:', config);
  }
  
  return config;
};

export default config;
