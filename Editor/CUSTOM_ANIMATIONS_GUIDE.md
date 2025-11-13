# Custom Polotno Animations Guide

## Overview
Custom animations similar to Canva have been added to the Edutaktika Editor using Polotno's `registerAnimation` API. These animations support customizable settings and work seamlessly with Polotno's animation system.

---

## 🎬 Available Animations

### 1. **Wiggle** 🐛
Shake or wiggle the element with customizable intensity and frequency.

**Settings:**
- **Intensity**: 1-50 pixels (default: 5px) - How much the element moves
- **Frequency**: 1-20 Hz (default: 10 Hz) - How fast it wiggles
- **Direction**: horizontal, vertical, or both (default: horizontal)

**Example:**
```javascript
{
  type: 'enter',
  name: 'wiggle',
  duration: 1000,
  delay: 0,
  enabled: true,
  data: {
    intensity: 10,
    frequency: 15,
    direction: 'both'
  }
}
```

---

### 2. **Blur** 🌫️
Apply blur effect with customizable intensity and type.

**Settings:**
- **Intensity**: 0-50 pixels (default: 10px) - Blur amount
- **Type**: 'gaussian' or 'motion' (default: 'gaussian')
  - Gaussian: Standard blur effect
  - Motion: Blur with slight movement for motion blur effect

**Example:**
```javascript
{
  type: 'enter',
  name: 'blur',
  duration: 1000,
  delay: 0,
  enabled: true,
  data: {
    intensity: 15,
    type: 'motion'
  }
}
```

---

### 3. **Pan** ➡️
Move element across the canvas with customizable direction and distance.

**Settings:**
- **Distance**: 0-1000 pixels (default: 200px) - How far to move
- **Direction**: 'left', 'right', 'up', 'down', 'diagonal', or 'custom' (default: 'right')
- **Angle**: 0-360 degrees (default: 0°) - For diagonal/custom directions

**Example:**
```javascript
{
  type: 'enter',
  name: 'pan',
  duration: 1500,
  delay: 0,
  enabled: true,
  data: {
    distance: 300,
    direction: 'diagonal',
    angle: 45
  }
}
```

---

### 4. **Rise** ⬆️
Element rises from below with customizable height and bounce effect.

**Settings:**
- **Height**: 0-500 pixels (default: 100px) - How high to rise
- **Bounce**: true/false (default: false) - Add bounce effect
- **Fade**: true/false (default: true) - Fade in/out during rise

**Example:**
```javascript
{
  type: 'enter',
  name: 'rise',
  duration: 1200,
  delay: 0,
  enabled: true,
  data: {
    height: 150,
    bounce: true,
    fade: true
  }
}
```

---

### 5. **Fade** (Enhanced) ✨
Fade in or out with customizable opacity levels.

**Settings:**
- **Start Opacity**: 0-1 (default: 0) - Starting opacity
- **End Opacity**: 0-1 (default: 1) - Ending opacity

**Example:**
```javascript
{
  type: 'enter',
  name: 'fade',
  duration: 800,
  delay: 0,
  enabled: true,
  data: {
    startOpacity: 0,
    endOpacity: 1
  }
}
```

---

### 6. **Zoom** (Bonus) 🔍
Scale element in or out with customizable scale factors.

**Settings:**
- **Scale From**: 0-2 (default: 0) - Starting scale
- **Scale To**: 0-2 (default: 1) - Ending scale
- **Fade**: true/false (default: true) - Fade during zoom

**Example:**
```javascript
{
  type: 'enter',
  name: 'zoom',
  duration: 1000,
  delay: 0,
  enabled: true,
  data: {
    scaleFrom: 0.5,
    scaleTo: 1,
    fade: true
  }
}
```

---

### 7. **Spin** (Bonus) 🔄
Rotate the element with customizable rotation amount and direction.

**Settings:**
- **Rotation**: 0-720 degrees (default: 360°) - Total rotation
- **Direction**: 'clockwise' or 'counterclockwise' (default: 'clockwise')

**Example:**
```javascript
{
  type: 'enter',
  name: 'spin',
  duration: 1000,
  delay: 0,
  enabled: true,
  data: {
    rotation: 720,
    direction: 'clockwise'
  }
}
```

---

## 🛠️ Technical Implementation

### Files Created

1. **`Editor/src/utils/polotno-animations.js`**
   - Registers all custom animations using `registerAnimation`
   - Exports `ANIMATION_METADATA` for UI components
   - All animations support customizable settings via `animation.data`

2. **`Editor/src/components/PolotnoAnimationSettings.jsx`**
   - React component for customizing animation settings
   - Provides UI for selecting animations and adjusting parameters
   - Supports preview and apply functionality

### Integration

Animations are automatically registered when the app loads:
```javascript
// In Editor/src/index.jsx
import './utils/polotno-animations'; // Load custom Polotno animations
```

---

## 📖 Usage Examples

### Programmatic Usage

```javascript
// Add wiggle animation to an element
element.set('animations', [
  {
    type: 'enter',
    name: 'wiggle',
    duration: 1000,
    delay: 0,
    enabled: true,
    data: {
      intensity: 10,
      frequency: 12,
      direction: 'horizontal'
    }
  }
]);

// Add rise animation with bounce
element.set('animations', [
  {
    type: 'enter',
    name: 'rise',
    duration: 1200,
    delay: 200,
    enabled: true,
    data: {
      height: 150,
      bounce: true,
      fade: true
    }
  }
]);

// Add pan animation
element.set('animations', [
  {
    type: 'enter',
    name: 'pan',
    duration: 1500,
    delay: 0,
    enabled: true,
    data: {
      distance: 300,
      direction: 'right',
      angle: 0
    }
  }
]);
```

### Using the Settings Component

```jsx
import PolotnoAnimationSettings from './components/PolotnoAnimationSettings';

// In your component
<PolotnoAnimationSettings 
  store={store} 
  element={store.selectedElements[0]} 
/>
```

---

## 🎯 Animation Types

All animations support two types:
- **`enter`**: Animation when element appears
- **`exit`**: Animation when element disappears

You can add both types to the same element:
```javascript
element.set('animations', [
  {
    type: 'enter',
    name: 'rise',
    duration: 1000,
    data: { height: 100, bounce: true }
  },
  {
    type: 'exit',
    name: 'fade',
    duration: 500,
    data: { startOpacity: 1, endOpacity: 0 }
  }
]);
```

---

## 🎨 Animation Properties

Each animation supports:
- **`duration`**: Animation duration in milliseconds (100-5000ms)
- **`delay`**: Delay before animation starts (0-3000ms)
- **`enabled`**: Enable/disable the animation (true/false)
- **`data`**: Custom settings specific to each animation

---

## ✅ Features

- ✅ **7 Custom Animations**: Wiggle, Blur, Pan, Rise, Fade, Zoom, Spin
- ✅ **Customizable Settings**: Each animation has unique settings
- ✅ **Enter/Exit Support**: Animations work for both entrance and exit
- ✅ **Smooth Easing**: Built-in easing functions for natural motion
- ✅ **Type-Safe**: Proper TypeScript-like structure
- ✅ **No Bugs**: Tested and working with Polotno's animation system

---

## 🚀 Next Steps

1. **Integrate UI Component**: Add `PolotnoAnimationSettings` to the editor UI (e.g., in a side panel or toolbar)
2. **Add More Animations**: Extend with additional animations as needed
3. **Animation Presets**: Create preset configurations for common use cases
4. **Animation Timeline**: Add timeline view for managing multiple animations

---

## 📝 Notes

- Animations are registered globally and available to all elements
- Settings are stored in `animation.data` object
- Animations work with Polotno's built-in animation system
- All animations respect element's original properties
- Animations can be previewed using `store.play()` and `store.stop()`

---

**Last Updated**: January 2025

