# Custom Animations Usage Guide

## Overview

Your custom animations are **already registered** with Polotno's animation system and are fully functional. They work seamlessly with Polotno's built-in animation panel.

## How It Works

1. **Animations are registered** when the app loads (via `Editor/src/utils/polotno-animations.js` and `Editor/src/utils/polotno-animations-new.js`)
2. **Polotno's built-in "Animate" button** opens the standard animation panel (Move, Fade, Zoom, Rotate, Blink, Bounce)
3. **Your custom animations** are available programmatically and can be applied to elements

## Available Custom Animations

### From `polotno-animations.js`:
- **wiggle** - Shake/wiggle effect
- **blur** - Blur effect
- **pan** - Pan movement
- **rise** - Rise from below
- **fade** - Custom fade (overrides Polotno's)
- **zoom** - Custom zoom (overrides Polotno's)
- **spin** - Spin rotation

### From `polotno-animations-new.js`:
- **flip** - Flip animation
- **elastic** - Elastic bounce
- **swing** - Swing motion
- **tada** - Celebration animation
- **flash** - Flash effect
- **rubberBand** - Rubber band effect
- **jackInTheBox** - Jack-in-the-box animation
- **heartbeat** - Heartbeat pulse
- **jello** - Jello wobble

## Using Custom Animations

### Method 1: Programmatically (JavaScript)

```javascript
// Get the selected element
const element = store.selectedElements[0];

// Apply a custom animation
element.setAnimation('enter', {
  name: 'wiggle',
  enabled: true,
  duration: 1000,
  delay: 0,
  data: {
    intensity: 10,
    frequency: 15,
    direction: 'both'
  }
});

// Apply multiple animations
element.setAnimation('enter', {
  name: 'rise',
  enabled: true,
  duration: 1200,
  delay: 200,
  data: {
    height: 150,
    bounce: true,
    fade: true
  }
});
```

### Method 2: Using the Animation Settings Component

If you have the `PolotnoAnimationSettings` component, you can use it:

```jsx
import PolotnoAnimationSettings from './components/PolotnoAnimationSettings';

// In your component
<PolotnoAnimationSettings 
  store={store} 
  element={store.selectedElements[0]} 
/>
```

### Method 3: Direct Animation Array

```javascript
const element = store.selectedElements[0];

element.set({
  animations: [
    {
      type: 'enter',
      name: 'flip',
      enabled: true,
      duration: 1000,
      delay: 0,
      data: {}
    },
    {
      type: 'loop',
      name: 'spin',
      enabled: true,
      duration: 2000,
      data: {
        speed: 1
      }
    }
  ]
});
```

## Integration with Polotno's Panel

When you click the **"Animate" button** in Polotno's toolbar:
- ✅ Polotno's built-in panel opens (Move, Fade, Zoom, Rotate, Blink, Bounce)
- ✅ Your custom animations are registered and ready to use
- ✅ You can apply custom animations programmatically while the panel is open
- ⚠️ Custom animations don't appear as buttons in Polotno's UI (by design - Polotno only shows built-in animations)

## Example: Adding a Custom Animation Button

If you want to add UI buttons for your custom animations, you can create a helper function:

```javascript
// Helper function to apply custom animations
function applyCustomAnimation(store, animationName, config = {}) {
  const elements = store.selectedElements;
  if (elements.length === 0) {
    alert('Please select an element first');
    return;
  }

  store.history.transaction(() => {
    elements.forEach(element => {
      element.setAnimation('enter', {
        name: animationName,
        enabled: true,
        duration: config.duration || 1000,
        delay: config.delay || 0,
        data: config.data || {}
      });
    });
  });

  // Preview the animation
  const activePage = store.activePage;
  store.play({
    animatedElementsIds: elements.map(el => el.id),
    currentTime: elements[0].page.startTime
  });
  setTimeout(() => {
    store.stop();
    if (activePage) store.selectPage(activePage.id);
  }, 2000);
}

// Usage
applyCustomAnimation(store, 'wiggle', {
  duration: 1000,
  data: { intensity: 10, frequency: 15, direction: 'both' }
});
```

## Animation Types

All animations support:
- **`enter`** - Animation when element appears
- **`exit`** - Animation when element disappears  
- **`loop`** - Continuous looping animation (for some animations like `spin`, `rotate`, `blink`)

## Testing Your Animations

1. Open the editor
2. Select an element
3. Open browser console (F12)
4. Run:
```javascript
const el = window.store.selectedElements[0];
el.setAnimation('enter', {
  name: 'wiggle',
  enabled: true,
  duration: 1000,
  data: { intensity: 10, frequency: 15 }
});
window.store.play({ animatedElementsIds: [el.id] });
```

## Notes

- Custom animations are **fully integrated** with Polotno's animation system
- They work with Polotno's preview, export, and playback features
- Animation data is saved with your designs
- All animations support customizable parameters via the `data` property

