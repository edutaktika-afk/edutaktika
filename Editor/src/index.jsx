import React from 'react';
import ReactDOM from 'react-dom/client';

import { createStore } from 'polotno/model/store';
import { unstable_setAnimationsEnabled } from 'polotno/config';
import { createProject, ProjectContext } from './project';

import './index.css';
import './animations.css';
import App from './App';
import './logger';
import { ErrorBoundary } from 'react-error-boundary';

// Import environment detection and license handler
import { initializeEnvironment } from './utils/environment';
import licenseHandler from './utils/licenseHandler';
import './utils/animationManager'; // Load animation manager
import './utils/polotno-animations'; // Load custom Polotno animations (Wiggle, Blur, Pan, Rise)
import { getStoreKey, getKeyDebugInfo } from './utils/polotno-keys';
import './utils/verify-polotno-key'; // Load verification utility
import './elements/lottie-register'; // Register Lottie element type

// Initialize environment detection
const config = initializeEnvironment();

// Debug: Verify Polotno API key source (safe - only shows partial info)
const keyDebug = getKeyDebugInfo();
if (window.location.host !== 'studio.polotno.com') {
  console.log(
    `%cWelcome to Edutaktika Editor! 🎨
This is a customized educational design editor based on Polotno SDK.
Environment: ${config.isLocal ? 'Local Development' : 'Deployed'}
Mode: ${config.isPresentation ? 'Presentation' : config.isViewOnly ? 'View-Only' : 'Editor'}
License banners are ${config.license.hideInPresentation ? 'hidden' : 'visible'} in presentation mode.
Polotno Key Source: ${keyDebug.source} (Length: ${keyDebug.keyLength})`,
    'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px; border-radius: 5px;'
  );
  
  // Additional debug info in development only
  if (config.isLocal || import.meta.env.DEV) {
    console.log('🔑 Polotno API Key Debug Info:', keyDebug);
  }
}

// Enable animations with enhanced settings
unstable_setAnimationsEnabled(true);

const store = createStore({ key: getStoreKey() });
window.store = store;

// Check if we're in view-only mode
const urlParams = new URLSearchParams(window.location.search);
const designUrl = urlParams.get('design');
const isViewOnly = urlParams.get('view') === 'true' || designUrl;

if (isViewOnly && designUrl) {
  console.log('🎨 Loading design in view-only mode:', designUrl);
  // Add a default page first to prevent null activePage errors
  store.addPage();
} else {
  store.addPage();
}

const project = createProject({ store });
window.project = project;

const root = ReactDOM.createRoot(document.getElementById('root'));

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ textAlign: 'center', paddingTop: '40px' }}>
        <p>Something went wrong in the app.</p>
        <p>Try to reload the page.</p>
        <p>If it does not work, clear cache and reload.</p>
        <button
          onClick={async () => {
            await project.clear();
            window.location.reload();
          }}
        >
          Clear cache and reload
        </button>
      </div>
    </div>
  );
}

root.render(
  <ErrorBoundary
    FallbackComponent={Fallback}
    onReset={(details) => {
      // Reset the state of your app so the error doesn't happen again
    }}
    onError={(e) => {
      if (window.Sentry) {
        window.Sentry.captureException(e);
      }
    }}
  >
    <ProjectContext.Provider value={project}>
      <App store={store} />
    </ProjectContext.Provider>
  </ErrorBoundary>
);
