/**
 * Custom Animation Section for Polotno Editor
 * Provides a comprehensive animation panel with all available animations
 */

import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button } from '@blueprintjs/core';

export const AnimationPanel = observer(({ store }) => {
  // Get currently selected element
  const selectedElement = store.selectedElements?.[0];

  // All animations in a single list (matching the image layout)
  const allAnimations = [
    { name: 'wiggle', label: 'Wiggle', icon: '🐛' },
    { name: 'blur', label: 'Blur', icon: '🌫️' },
    { name: 'pan', label: 'Pan', icon: '➡️' },
    { name: 'rise', label: 'Rise', icon: '⬆️' },
    { name: 'spin', label: 'Spin', icon: '🌀' },
    { name: 'flip', label: 'Flip', icon: '🔄' },
    { name: 'elastic', label: 'Elastic', icon: '🔗' },
    { name: 'swing', label: 'Swing', icon: '🎯' },
    { name: 'tada', label: 'Tada', icon: '🎉' },
    { name: 'flash', label: 'Flash', icon: '⚡' },
    { name: 'rubberBand', label: 'Rubber Band', icon: '🎈' },
    { name: 'jackInTheBox', label: 'Jack in the Box', icon: '📦' },
    { name: 'heartbeat', label: 'Heartbeat', icon: '💓' },
    { name: 'jello', label: 'Jello', icon: '🍮' },
  ];


  const handleAnimationClick = (animationName) => {
    if (!selectedElement) {
      alert('Please select an element first');
      return;
    }

    try {
      // Determine animation type based on name
      // Loop animations: spin, flash (blink)
      const isLoopAnimation = ['spin', 'flash'].includes(animationName);
      const animationType = isLoopAnimation ? 'loop' : 'enter';

      // Apply animation using Polotno's animation system
      store.history.transaction(() => {
        if (isLoopAnimation) {
          selectedElement.setAnimation('loop', {
            name: animationName,
            enabled: true,
            duration: 1000,
            data: {}
          });
        } else {
          selectedElement.setAnimation('enter', {
            name: animationName,
            enabled: true,
            duration: 1000,
            delay: 0,
            data: {}
          });
        }
      });

      // Preview the animation
      const activePage = store.activePage;
      store.play({
        animatedElementsIds: [selectedElement.id],
        currentTime: selectedElement.page.startTime
      });
      setTimeout(() => {
        store.stop();
        if (activePage) store.selectPage(activePage.id);
      }, 1500);

      console.log('✅ Animation applied:', animationName);
    } catch (error) {
      console.error('❌ Error applying animation:', error);
      alert('Error applying animation: ' + error.message);
    }
  };

  const removeAllAnimations = () => {
    if (!selectedElement) {
      alert('Please select an element first');
      return;
    }

    store.history.transaction(() => {
      selectedElement.set({ animations: [] });
    });
  };

  // Check if element has any animations
  const hasAnimations = selectedElement && selectedElement.animations && selectedElement.animations.length > 0;

  const renderAnimationButton = (anim) => {
    // Check if this animation is currently active
    const isActive = selectedElement && selectedElement.animations?.some(a => 
      a.name === anim.name && a.enabled
    );

    return (
      <button
        key={anim.name}
        type="button"
        onClick={() => handleAnimationClick(anim.name)}
        className="bp5-button bp5-fill bp5-large bp5-minimal bp5-outlined"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          position: 'relative',
          border: isActive ? '2px solid #2e8b57' : undefined,
          backgroundColor: isActive ? 'rgba(46, 139, 87, 0.1)' : undefined
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '4px' }}>
          {anim.icon}
        </div>
        <span className="bp5-button-text" style={{ fontSize: '12px', fontWeight: '500' }}>
          {anim.label}
        </span>
      </button>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '0 10px' }}>
      {/* Header */}
      <div style={{ padding: '15px 10px', textAlign: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
          Custom Animations
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
          Click to apply custom animations
        </p>
      </div>

      {!selectedElement && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#999', 
          fontSize: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px',
          marginBottom: '15px'
        }}>
          Select an element to add animations
        </div>
      )}

      {/* Animations Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '8px',
        overflowY: 'auto',
        flex: 1,
        paddingBottom: '15px'
      }}>
        {allAnimations.map(renderAnimationButton)}
      </div>

      {/* Remove All Animations Button */}
      {selectedElement && (
        <div style={{ padding: '15px 0', borderTop: '1px solid #e0e0e0', marginTop: 'auto' }}>
          <Button
            intent="danger"
            fill
            onClick={removeAllAnimations}
            disabled={!hasAnimations}
            style={{
              backgroundColor: hasAnimations ? '#dc3545' : '#ccc',
              color: 'white',
              fontWeight: '600'
            }}
          >
            Remove All Animations
          </Button>
        </div>
      )}
    </div>
  );
});

// Floating Animation Panel Component
export const FloatingAnimationPanel = observer(({ store }) => {
  const selectedElement = store.selectedElements?.[0];
  const [isOpen, setIsOpen] = React.useState(false);

  // Open panel when element is selected
  React.useEffect(() => {
    if (selectedElement) {
      setIsOpen(true);
    } else {
      // Keep it open for a moment when deselecting to allow smooth transition
      const timer = setTimeout(() => setIsOpen(false), 100);
      return () => clearTimeout(timer);
    }
  }, [selectedElement?.id]);

  // Close button handler
  const handleClose = () => {
    setIsOpen(false);
  };

  if (!selectedElement || !isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '340px',
        maxHeight: '85vh',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        animation: 'fadeInSlide 0.3s ease-out'
      }}
    >
      {/* Close button */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 10,
        cursor: 'pointer',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        transition: 'background-color 0.2s'
      }}
      onClick={handleClose}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
      >
        <span style={{ fontSize: '16px', color: '#666' }}>×</span>
      </div>
      <AnimationPanel store={store} />
    </div>
  );
});

export const AnimationSection = {
  name: 'animation', // Use 'animation' to hook into Polotno's Animate button
  Tab: () => null, // No tab - opens via toolbar button or floating panel
  Panel: AnimationPanel,
};

