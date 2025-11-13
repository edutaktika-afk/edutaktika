/**
 * Register Lottie element type with Polotno
 * 
 * Note: Polotno doesn't have a direct registerRenderer API.
 * Instead, we'll use a custom renderer component that gets loaded
 * when elements of type 'lottie' are rendered.
 */

import { LottieElement } from './lottie-element';
import { LottieModel } from './lottie-model';

// Export for use in workspace rendering
export { LottieModel, LottieElement };

// Register custom renderer using Polotno's workspace system
// This will be used by the Workspace component to render lottie elements
if (typeof window !== 'undefined') {
  // Store the renderer globally so Workspace can access it
  window.__POLOTNO_LOTTIE_RENDERER__ = LottieElement;
  console.log('✅ Lottie element renderer registered');
}

