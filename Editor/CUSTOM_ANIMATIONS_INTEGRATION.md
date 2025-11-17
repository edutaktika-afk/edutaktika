# Custom Animations Panel Integration Guide

## Overview

This guide explains how to replace Polotno's built-in animation panel with a custom version that includes placeholder animation buttons.

## Files Created

1. **`Editor/src/sections/custom-animations-panel.jsx`** - Full recreation of Polotno's AnimationsPanel with custom buttons
2. **`Editor/src/sections/custom-animations-section.jsx`** - Section definition wrapper

## Limitations & Workarounds

### 1. **Polotno Source is Minified**
- **Problem**: Polotno's source code is minified, making it difficult to extend directly
- **Solution**: We recreate the entire component from the minified code structure
- **Risk**: If Polotno updates their internal APIs, this component may break

### 2. **Internal Section Registration**
- **Problem**: The animation section is registered as an `INTERNAL_SECTION` in Polotno, not `DEFAULT_SECTIONS`
- **Solution**: We override it by providing a section with the same name (`'animation'`) in the `sections` prop
- **How it works**: Polotno's `SidePanel` component merges `INTERNAL_SECTIONS` with provided sections, and sections with the same name override each other

### 3. **No Direct Store Methods**
- **Problem**: Polotno doesn't expose `store.removeSidebarSection()` or `store.addSidebarSection()` methods
- **Solution**: We control sections via the `sections` prop passed to `<SidePanel>`

## Integration Code

### Option 1: Replace in App.jsx (Recommended)

Add this to your `Editor/src/App.jsx`:

```jsx
// At the top with other imports
import { CustomAnimationsSection } from './sections/custom-animations-section';

// In your component, modify the SidePanel sections prop:
<SidePanel
  store={store}
  sections={(() => {
    // Filter out unwanted sections
    const filtered = DEFAULT_SECTIONS.filter((s) => {
      const name = String(s?.name || '').toLowerCase();
      return !isVideoSection(s) && !isPhotosSection(s) && !isIconsSection(s);
    });
    
    // Deduplicate sections by name
    const seen = new Set();
    const unique = filtered.filter((section) => {
      const name = section?.name || '';
      if (seen.has(name)) {
        return false;
      }
      seen.add(name);
      return true;
    });
    
    // Add our custom animation section (will override Polotno's internal one)
    // Check if animation section already exists, if so replace it
    const withoutAnimation = unique.filter(s => s.name !== 'animation');
    return [...withoutAnimation, CustomAnimationsSection];
  })()}
/>
```

### Option 2: Remove Default and Add Custom (Explicit)

If you want to be more explicit about removing the default:

```jsx
import { CustomAnimationsSection } from './sections/custom-animations-section';
import { DEFAULT_SECTIONS } from 'polotno/side-panel';

// In your component:
<SidePanel
  store={store}
  sections={(() => {
    // Start with filtered DEFAULT_SECTIONS
    const filtered = DEFAULT_SECTIONS.filter((s) => {
      const name = String(s?.name || '').toLowerCase();
      return !isVideoSection(s) && !isPhotosSection(s) && !isIconsSection(s);
    });
    
    // Remove any existing animation section
    const withoutAnimation = filtered.filter(s => {
      const name = String(s?.name || '').toLowerCase();
      return name !== 'animation' && name !== 'animate' && name !== 'animations';
    });
    
    // Add our custom animation section
    return [...withoutAnimation, CustomAnimationsSection];
  })()}
/>
```

### Option 3: Using Store Methods (If Available)

**NOTE**: Polotno doesn't expose these methods, but if they did, it would look like:

```jsx
// This code is theoretical - these methods don't exist in Polotno
// But this shows what the API would look like if it did

useEffect(() => {
  // Remove default animation section
  store.removeSidebarSection('animation');
  
  // Add custom animation section
  store.addSidebarSection(CustomAnimationsSection);
  
  return () => {
    // Cleanup on unmount
    store.removeSidebarSection('animation');
  };
}, [store]);
```

## How It Works

1. **Section Name Override**: Polotno's `SidePanel` component merges sections by name. When you provide a section with `name: 'animation'`, it overrides Polotno's internal animation section.

2. **Internal Sections**: Polotno automatically adds `INTERNAL_SECTIONS` (including the default animation section) to the sections list. Our custom section with the same name takes precedence.

3. **Toolbar Integration**: The animation panel is opened via the toolbar's "Animate" button, which calls `store.openSidePanel('animation')`. Since our section has `name: 'animation'`, it will be opened correctly.

## Testing

1. Open the editor
2. Select an element
3. Click the "Animate" button in the toolbar
4. You should see:
   - Original Move, Fade, Zoom buttons
   - All original controls (Enter/Exit/Both, Direction, Strength, Duration, etc.)
   - Effects section (Rotate, Blink, Bounce)
   - **NEW**: "Coming Soon" section with placeholder buttons (Shimmer, Pulse, Glow, Shake, Slide)

## Customization

To add more placeholder animations, edit `Editor/src/sections/custom-animations-panel.jsx`:

```jsx
// In the "Coming Soon" section, add to the array:
{[
  { name: 'shimmer', label: 'Shimmer', icon: <ShimmerIcon /> },
  { name: 'pulse', label: 'Pulse', icon: <PulseIcon /> },
  // Add more here:
  { name: 'spin', label: 'Spin', icon: <SpinIcon /> },
  // etc.
].map((anim) => (
  // ... button rendering
))}
```

## Troubleshooting

### Panel doesn't open
- Check that the section name is exactly `'animation'` (lowercase)
- Verify the section is in the sections array passed to `<SidePanel>`

### Original controls missing
- Ensure `CustomAnimationsPanel` includes all the original sub-components
- Check that Polotno's internal APIs haven't changed

### Buttons not appearing
- Verify the placeholder buttons section is rendered (check the JSX)
- Check browser console for React errors

## Maintenance Notes

- **Polotno Updates**: When Polotno updates, check if their animation panel structure changed
- **API Changes**: If Polotno changes `element.setAnimation()` or `element.animations`, update accordingly
- **Translation Keys**: The component uses `t('toolbar.move')` etc. - ensure these translation keys exist

## Alternative Approach: DOM Injection (Current Implementation)

The current implementation in `App.jsx` uses DOM injection via `MutationObserver`. This approach:
- ✅ Doesn't require recreating the entire component
- ✅ Works with Polotno updates (as long as DOM structure doesn't change)
- ❌ Less maintainable
- ❌ Can break if Polotno changes their DOM structure
- ❌ Not as "React-like"

The new approach (this guide) is more maintainable but requires keeping the component in sync with Polotno's implementation.

