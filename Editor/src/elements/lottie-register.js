/**
 * Register Lottie element type with Polotno
 * 
 * Polotno uses a custom element rendering system. We'll register
 * our Lottie renderer so it can be used when elements of type 'lottie' are rendered.
 * 
 * Note: Polotno doesn't require a custom model - elements with type 'lottie'
 * will be handled by our custom renderer component.
 */

import { LottieElement } from './lottie-element';

// Export for use in workspace rendering
export { LottieElement };

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

