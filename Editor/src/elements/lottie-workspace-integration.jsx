/**
 * Workspace integration for Lottie elements
 * This hooks into Polotno's Workspace rendering to inject custom Lottie renderer
 */

import React, { useEffect } from 'react';
import { LottieElement } from './lottie-element';

// This component wraps the Workspace and injects custom rendering
export const LottieWorkspaceWrapper = ({ children, store }) => {
  useEffect(() => {
    // Try to hook into Polotno's element rendering system
    // Polotno uses a global registry for custom renderers
    if (typeof window !== 'undefined' && window.__POLOTNO_RENDERERS__) {
      window.__POLOTNO_RENDERERS__['lottie'] = LottieElement;
      console.log('✅ Registered Lottie renderer in Polotno registry');
    }
  }, []);

  return children;
};

