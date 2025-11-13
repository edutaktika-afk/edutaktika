/**
 * Register Lottie element type with Polotno
 * 
 * Polotno uses a custom element rendering system. We'll register
 * our Lottie renderer so it can be used when elements of type 'lottie' are rendered.
 */

import { LottieElement } from './lottie-element';
import { LottieModel } from './lottie-model';

// Export for use in workspace rendering
export { LottieModel, LottieElement };

// Register custom renderer globally
// Polotno's Workspace component will check for custom renderers
if (typeof window !== 'undefined') {
  // Initialize renderer registry if it doesn't exist
  if (!window.__POLOTNO_RENDERERS__) {
    window.__POLOTNO_RENDERERS__ = {};
  }
  
  // Register Lottie renderer
  window.__POLOTNO_RENDERERS__['lottie'] = LottieElement;
  console.log('✅ Lottie element renderer registered globally');
}

