/**
 * New Animation Effects for Polotno Editor
 * Additional animations that play once (no looping)
 */

import { registerAnimation } from 'polotno/utils/animations';

// Helper functions
const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const easeOut = (t) => t * (2 - t);
const easeIn = (t) => t * t;
const easeOutBounce = (t) => {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  } else {
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  }
};

/**
 * FLIP Animation
 * Flips element with 3D rotation effect
 */
registerAnimation('flip', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  const axis = animation.data?.axis || 'x'; // 'x', 'y', 'both'
  const direction = animation.data?.direction || 'forward'; // 'forward', 'backward'
  
  const rotation = direction === 'backward' ? -180 : 180;
  
  if (animation.type === 'enter') {
    const progress = easeOut(delta);
    const result = {};
    
    if (axis === 'x' || axis === 'both') {
      result.rotationX = rotation * (1 - progress);
    }
    if (axis === 'y' || axis === 'both') {
      result.rotationY = rotation * (1 - progress);
    }
    
    return result;
  } else {
    const progress = easeIn(delta);
    const result = {};
    
    if (axis === 'x' || axis === 'both') {
      result.rotationX = rotation * progress;
    }
    if (axis === 'y' || axis === 'both') {
      result.rotationY = rotation * progress;
    }
    
    return result;
  }
});

/**
 * ELASTIC Animation
 * Bouncy elastic effect
 */
registerAnimation('elastic', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  const intensity = animation.data?.intensity || 1.5;
  
  if (animation.type === 'enter') {
    const progress = easeOutBounce(delta);
    const scale = 1 + (intensity - 1) * (1 - progress);
    
    return {
      scaleX: scale,
      scaleY: scale,
    };
  } else {
    const progress = easeIn(delta);
    const scale = 1 + (intensity - 1) * progress;
    
    return {
      scaleX: scale,
      scaleY: scale,
    };
  }
});

/**
 * SWING Animation
 * Swings like a pendulum
 */
registerAnimation('swing', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  const angle = animation.data?.angle || 30; // degrees
  
  if (animation.type === 'enter') {
    const progress = easeOut(delta);
    // Pendulum swing effect
    const swingProgress = Math.sin(progress * Math.PI);
    return {
      rotation: angle * swingProgress * (1 - progress),
    };
  } else {
    const progress = easeIn(delta);
    const swingProgress = Math.sin(progress * Math.PI);
    return {
      rotation: angle * swingProgress * progress,
    };
  }
});

/**
 * TADA Animation
 * Celebration effect with rotation and scale
 */
registerAnimation('tada', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  if (animation.type === 'enter') {
    const progress = easeOut(delta);
    // Tada effect: scale and rotate
    const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1 * (1 - progress);
    const rotation = Math.sin(progress * Math.PI * 3) * 10 * (1 - progress);
    
    return {
      scaleX: scale,
      scaleY: scale,
      rotation: rotation,
    };
  } else {
    const progress = easeIn(delta);
    const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1 * progress;
    const rotation = Math.sin(progress * Math.PI * 3) * 10 * progress;
    
    return {
      scaleX: scale,
      scaleY: scale,
      rotation: rotation,
    };
  }
});

/**
 * FLASH Animation
 * Quick flash/brightness effect
 */
registerAnimation('flash', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  const intensity = animation.data?.intensity || 1.5;
  
  if (animation.type === 'enter') {
    const progress = delta;
    // Flash effect using opacity
    const flash = Math.sin(progress * Math.PI * 6) * 0.3 * (1 - progress) + 1;
    return {
      opacity: Math.min(flash, 1),
    };
  } else {
    const progress = delta;
    const flash = Math.sin(progress * Math.PI * 6) * 0.3 * progress + (1 - progress);
    return {
      opacity: Math.min(flash, 1),
    };
  }
});

/**
 * RUBBER BAND Animation
 * Stretches and bounces back
 */
registerAnimation('rubberBand', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  if (animation.type === 'enter') {
    const progress = easeOutBounce(delta);
    // Rubber band effect
    let scaleX = 1;
    let scaleY = 1;
    
    if (progress < 0.3) {
      scaleX = 1.25;
      scaleY = 0.8;
    } else if (progress < 0.6) {
      scaleX = 0.8;
      scaleY = 1.25;
    } else {
      scaleX = 1;
      scaleY = 1;
    }
    
    return {
      scaleX: scaleX,
      scaleY: scaleY,
    };
  } else {
    const progress = easeIn(delta);
    let scaleX = 1;
    let scaleY = 1;
    
    if (progress < 0.3) {
      scaleX = 0.8;
      scaleY = 1.25;
    } else if (progress < 0.6) {
      scaleX = 1.25;
      scaleY = 0.8;
    }
    
    return {
      scaleX: scaleX,
      scaleY: scaleY,
    };
  }
});

/**
 * JACK IN THE BOX Animation
 * Pops up with rotation
 */
registerAnimation('jackInTheBox', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  if (animation.type === 'enter') {
    const progress = easeOut(delta);
    const scale = progress < 0.5 ? 0.1 : easeOut((progress - 0.5) * 2);
    const rotation = 30 * (1 - progress);
    
    return {
      scaleX: scale,
      scaleY: scale,
      rotation: rotation,
    };
  } else {
    const progress = easeIn(delta);
    const scale = progress > 0.5 ? 0.1 : 1 - (progress * 2);
    const rotation = 30 * progress;
    
    return {
      scaleX: scale,
      scaleY: scale,
      rotation: rotation,
    };
  }
});

/**
 * HEARTBEAT Animation
 * Pulsing heartbeat effect (plays once, not infinite)
 */
registerAnimation('heartbeat', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  if (animation.type === 'enter') {
    const progress = delta;
    // Heartbeat: two quick beats then settle
    let scale = 1;
    if (progress < 0.2) {
      scale = 1 + Math.sin(progress * Math.PI * 10) * 0.15;
    } else if (progress < 0.4) {
      scale = 1 + Math.sin((progress - 0.2) * Math.PI * 10) * 0.1;
    } else {
      scale = 1;
    }
    
    return {
      scaleX: scale,
      scaleY: scale,
    };
  } else {
    const progress = delta;
    let scale = 1;
    if (progress < 0.2) {
      scale = 1 + Math.sin(progress * Math.PI * 10) * 0.15;
    } else if (progress < 0.4) {
      scale = 1 + Math.sin((progress - 0.2) * Math.PI * 10) * 0.1;
    } else {
      scale = 0.5 * (1 - progress);
    }
    
    return {
      scaleX: scale,
      scaleY: scale,
    };
  }
});

/**
 * JELLO Animation
 * Wobbly jello effect
 */
registerAnimation('jello', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  if (animation.type === 'enter') {
    const progress = easeOut(delta);
    // Jello wobble
    const skewX = Math.sin(progress * Math.PI * 2) * 12.5 * (1 - progress);
    const skewY = Math.sin(progress * Math.PI * 2.5) * 12.5 * (1 - progress);
    
    return {
      skewX: skewX,
      skewY: skewY,
    };
  } else {
    const progress = easeIn(delta);
    const skewX = Math.sin(progress * Math.PI * 2) * 12.5 * progress;
    const skewY = Math.sin(progress * Math.PI * 2.5) * 12.5 * progress;
    
    return {
      skewX: skewX,
      skewY: skewY,
    };
  }
});

// Export metadata
export const NEW_ANIMATION_METADATA = {
  flip: {
    name: 'Flip',
    description: '3D flip effect',
    settings: [
      { key: 'axis', label: 'Axis', type: 'select', options: ['x', 'y', 'both'], default: 'x' },
      { key: 'direction', label: 'Direction', type: 'select', options: ['forward', 'backward'], default: 'forward' },
    ],
  },
  elastic: {
    name: 'Elastic',
    description: 'Bouncy elastic effect',
    settings: [
      { key: 'intensity', label: 'Intensity', type: 'number', min: 1, max: 3, default: 1.5, step: 0.1 },
    ],
  },
  swing: {
    name: 'Swing',
    description: 'Pendulum swing effect',
    settings: [
      { key: 'angle', label: 'Swing Angle', type: 'number', min: 10, max: 90, default: 30, unit: '°' },
    ],
  },
  tada: {
    name: 'Tada',
    description: 'Celebration effect',
    settings: [],
  },
  flash: {
    name: 'Flash',
    description: 'Quick flash effect',
    settings: [
      { key: 'intensity', label: 'Intensity', type: 'number', min: 1, max: 3, default: 1.5, step: 0.1 },
    ],
  },
  rubberBand: {
    name: 'Rubber Band',
    description: 'Stretch and bounce',
    settings: [],
  },
  jackInTheBox: {
    name: 'Jack in the Box',
    description: 'Pop up with rotation',
    settings: [],
  },
  heartbeat: {
    name: 'Heartbeat',
    description: 'Pulsing heartbeat (plays once)',
    settings: [],
  },
  jello: {
    name: 'Jello',
    description: 'Wobbly jello effect',
    settings: [],
  },
};

console.log('✅ New animation effects registered:', Object.keys(NEW_ANIMATION_METADATA).join(', '));

