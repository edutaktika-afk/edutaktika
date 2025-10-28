/**
 * Animation Effects Manager
 * Provides utilities for managing and applying animation effects
 */

class AnimationManager {
  constructor() {
    this.availableAnimations = {
      // Basic Animations
      slideUp: { duration: 0.5, easing: 'ease-out', category: 'basic' },
      slideDown: { duration: 0.5, easing: 'ease-out', category: 'basic' },
      slideLeft: { duration: 0.5, easing: 'ease-out', category: 'basic' },
      slideRight: { duration: 0.5, easing: 'ease-out', category: 'basic' },
      scaleIn: { duration: 0.4, easing: 'ease-out', category: 'basic' },
      scaleOut: { duration: 0.4, easing: 'ease-out', category: 'basic' },
      rotateIn: { duration: 0.6, easing: 'ease-out', category: 'basic' },
      rotateOut: { duration: 0.6, easing: 'ease-out', category: 'basic' },

      // Advanced Animations
      flipInX: { duration: 0.6, easing: 'ease-out', category: 'advanced' },
      flipInY: { duration: 0.6, easing: 'ease-out', category: 'advanced' },
      flipOutX: { duration: 0.6, easing: 'ease-out', category: 'advanced' },
      flipOutY: { duration: 0.6, easing: 'ease-out', category: 'advanced' },
      rollIn: { duration: 0.6, easing: 'ease-out', category: 'advanced' },
      rollOut: { duration: 0.6, easing: 'ease-out', category: 'advanced' },
      jackInTheBox: { duration: 0.8, easing: 'ease-out', category: 'advanced' },
      jello: { duration: 0.9, easing: 'ease-in-out', category: 'advanced' },
      heartBeat: { duration: 1.3, easing: 'ease-in-out', category: 'advanced' },
      rubberBand: { duration: 1.0, easing: 'ease-in-out', category: 'advanced' },
      swing: { duration: 1.0, easing: 'ease-in-out', category: 'advanced' },
      tada: { duration: 1.0, easing: 'ease-in-out', category: 'advanced' },

      // Visual Effects
      flash: { duration: 1.0, easing: 'ease-in-out', category: 'visual' },
      glow: { duration: 2.0, easing: 'ease-in-out', category: 'visual' },
      float: { duration: 3.0, easing: 'ease-in-out', category: 'visual' },
      sink: { duration: 3.0, easing: 'ease-in-out', category: 'visual' },
      drift: { duration: 4.0, easing: 'ease-in-out', category: 'visual' },
      wiggle: { duration: 1.0, easing: 'ease-in-out', category: 'visual' },
      squash: { duration: 0.6, easing: 'ease-in-out', category: 'visual' },
      stretch: { duration: 0.6, easing: 'ease-in-out', category: 'visual' },
      squeeze: { duration: 0.6, easing: 'ease-in-out', category: 'visual' },
      expand: { duration: 0.6, easing: 'ease-in-out', category: 'visual' },
      morph: { duration: 2.0, easing: 'ease-in-out', category: 'visual' },
      colorShift: { duration: 3.0, easing: 'linear', category: 'visual' },
      rainbow: { duration: 2.0, easing: 'linear', category: 'visual' },
      sparkle: { duration: 1.5, easing: 'ease-in-out', category: 'visual' },
      twinkle: { duration: 2.0, easing: 'ease-in-out', category: 'visual' },
      shimmer: { duration: 2.0, easing: 'ease-in-out', category: 'visual' },
      gradientShift: { duration: 4.0, easing: 'ease', category: 'visual' },

      // Special Effects
      particle: { duration: 2.0, easing: 'ease-out', category: 'special' },
      wave: { duration: 2.0, easing: 'ease-in-out', category: 'special' },
      ripple: { duration: 0.6, easing: 'ease-out', category: 'special' },
      magnetic: { duration: 0.3, easing: 'ease-in-out', category: 'special' },
      elastic: { duration: 0.6, easing: 'ease-out', category: 'special' }
    };

    this.animationQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Apply animation to an element
   * @param {HTMLElement} element - The element to animate
   * @param {string} animationName - Name of the animation
   * @param {Object} options - Animation options
   */
  applyAnimation(element, animationName, options = {}) {
    if (!this.availableAnimations[animationName]) {
      console.warn(`Animation "${animationName}" not found`);
      return;
    }

    const animation = this.availableAnimations[animationName];
    const {
      duration = animation.duration,
      easing = animation.easing,
      delay = 0,
      iterationCount = 1,
      fillMode = 'both',
      onComplete = null,
      onStart = null
    } = options;

    // Remove any existing animations
    this.removeAnimation(element);

    // Add animation class
    element.classList.add(`animate-${animationName}`);

    // Set custom properties
    element.style.animationDuration = `${duration}s`;
    element.style.animationTimingFunction = easing;
    element.style.animationDelay = `${delay}s`;
    element.style.animationIterationCount = iterationCount;
    element.style.animationFillMode = fillMode;

    // Event listeners
    const handleAnimationStart = () => {
      if (onStart) onStart(element, animationName);
    };

    const handleAnimationEnd = () => {
      element.removeEventListener('animationstart', handleAnimationStart);
      element.removeEventListener('animationend', handleAnimationEnd);
      if (onComplete) onComplete(element, animationName);
    };

    element.addEventListener('animationstart', handleAnimationStart);
    element.addEventListener('animationend', handleAnimationEnd);

    return {
      element,
      animationName,
      duration,
      easing,
      delay,
      iterationCount
    };
  }

  /**
   * Remove animation from an element
   * @param {HTMLElement} element - The element to remove animation from
   */
  removeAnimation(element) {
    // Remove all animation classes
    Object.keys(this.availableAnimations).forEach(animationName => {
      element.classList.remove(`animate-${animationName}`);
    });

    // Reset animation properties
    element.style.animationDuration = '';
    element.style.animationTimingFunction = '';
    element.style.animationDelay = '';
    element.style.animationIterationCount = '';
    element.style.animationFillMode = '';
  }

  /**
   * Queue multiple animations
   * @param {Array} animations - Array of animation objects
   */
  queueAnimations(animations) {
    this.animationQueue.push(...animations);
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  /**
   * Process the animation queue
   */
  async processQueue() {
    this.isProcessingQueue = true;

    while (this.animationQueue.length > 0) {
      const animation = this.animationQueue.shift();
      const { element, animationName, options = {} } = animation;

      if (element && element.parentNode) {
        await this.applyAnimationAsync(element, animationName, options);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Apply animation asynchronously
   * @param {HTMLElement} element - The element to animate
   * @param {string} animationName - Name of the animation
   * @param {Object} options - Animation options
   */
  applyAnimationAsync(element, animationName, options = {}) {
    return new Promise((resolve) => {
      const animation = this.applyAnimation(element, animationName, {
        ...options,
        onComplete: (el, name) => {
          if (options.onComplete) options.onComplete(el, name);
          resolve();
        }
      });
    });
  }

  /**
   * Get animations by category
   * @param {string} category - Animation category
   * @returns {Array} Array of animation names
   */
  getAnimationsByCategory(category) {
    return Object.keys(this.availableAnimations).filter(
      name => this.availableAnimations[name].category === category
    );
  }

  /**
   * Get all available animations
   * @returns {Object} Object containing all animations
   */
  getAllAnimations() {
    return { ...this.availableAnimations };
  }

  /**
   * Create a staggered animation effect
   * @param {Array} elements - Array of elements to animate
   * @param {string} animationName - Name of the animation
   * @param {Object} options - Animation options
   */
  createStaggeredAnimation(elements, animationName, options = {}) {
    const {
      staggerDelay = 0.1,
      startDelay = 0,
      ...animationOptions
    } = options;

    elements.forEach((element, index) => {
      const delay = startDelay + (index * staggerDelay);
      this.applyAnimation(element, animationName, {
        ...animationOptions,
        delay
      });
    });
  }

  /**
   * Create a sequence of animations
   * @param {Array} sequence - Array of animation objects
   */
  createAnimationSequence(sequence) {
    sequence.forEach((animation, index) => {
      const { element, animationName, options = {} } = animation;
      const delay = options.delay || 0;
      
      setTimeout(() => {
        this.applyAnimation(element, animationName, options);
      }, delay);
    });
  }

  /**
   * Preview animation on element
   * @param {HTMLElement} element - The element to preview
   * @param {string} animationName - Name of the animation
   * @param {Object} options - Animation options
   */
  previewAnimation(element, animationName, options = {}) {
    // Store original state
    const originalClasses = element.className;
    const originalStyle = element.style.cssText;

    // Apply animation
    this.applyAnimation(element, animationName, {
      ...options,
      onComplete: () => {
        // Restore original state
        element.className = originalClasses;
        element.style.cssText = originalStyle;
      }
    });
  }

  /**
   * Check if element has animation
   * @param {HTMLElement} element - The element to check
   * @returns {boolean} True if element has animation
   */
  hasAnimation(element) {
    return Object.keys(this.availableAnimations).some(animationName =>
      element.classList.contains(`animate-${animationName}`)
    );
  }

  /**
   * Get current animation of element
   * @param {HTMLElement} element - The element to check
   * @returns {string|null} Current animation name or null
   */
  getCurrentAnimation(element) {
    for (const animationName of Object.keys(this.availableAnimations)) {
      if (element.classList.contains(`animate-${animationName}`)) {
        return animationName;
      }
    }
    return null;
  }

  /**
   * Pause all animations
   */
  pauseAllAnimations() {
    document.querySelectorAll('*').forEach(element => {
      if (this.hasAnimation(element)) {
        element.style.animationPlayState = 'paused';
      }
    });
  }

  /**
   * Resume all animations
   */
  resumeAllAnimations() {
    document.querySelectorAll('*').forEach(element => {
      if (this.hasAnimation(element)) {
        element.style.animationPlayState = 'running';
      }
    });
  }

  /**
   * Stop all animations
   */
  stopAllAnimations() {
    document.querySelectorAll('*').forEach(element => {
      this.removeAnimation(element);
    });
  }
}

// Create global instance
window.animationManager = new AnimationManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationManager;
}

// Usage examples:
/*
// Basic usage
animationManager.applyAnimation(element, 'slideUp');

// With options
animationManager.applyAnimation(element, 'bounce', {
  duration: 1.5,
  iterationCount: 3,
  onComplete: (el) => console.log('Animation completed!')
});

// Staggered animation
animationManager.createStaggeredAnimation(
  document.querySelectorAll('.card'),
  'slideUp',
  { staggerDelay: 0.2 }
);

// Animation sequence
animationManager.createAnimationSequence([
  { element: title, animationName: 'slideDown', options: { delay: 0 } },
  { element: subtitle, animationName: 'fadeIn', options: { delay: 500 } },
  { element: button, animationName: 'bounce', options: { delay: 1000 } }
]);

// Preview animation
animationManager.previewAnimation(element, 'tada');
*/
