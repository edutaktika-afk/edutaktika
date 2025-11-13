/**
 * Custom Animation Section for Polotno Editor
 * Provides a comprehensive animation panel with all available animations
 */

import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, Card, Divider } from '@blueprintjs/core';

// Animation icon component
const AnimationIcon = ({ children }) => (
  <div style={{ 
    width: '40px', 
    height: '40px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontSize: '20px',
    marginBottom: '8px'
  }}>
    {children}
  </div>
);

export const AnimationPanel = observer(({ store }) => {
  const [selectedCategory, setSelectedCategory] = useState('animations');

  // Get currently selected element
  const selectedElement = store.selectedElements?.[0];
  
  // Debug: Log to verify component is rendering
  console.log('🎬 AnimationPanel rendering', { 
    hasStore: !!store, 
    selectedElement: selectedElement?.id,
    selectedCategory 
  });

  // Animation categories
  const animations = [
    { name: 'pan', label: 'Move', icon: '↔️', category: 'animations' },
    { name: 'fade', label: 'Fade', icon: '💫', category: 'animations' },
    { name: 'zoom', label: 'Zoom', icon: '🔍', category: 'animations' },
    { name: 'rise', label: 'Rise', icon: '⬆️', category: 'animations' },
    { name: 'wiggle', label: 'Wiggle', icon: '🐛', category: 'animations' },
    { name: 'blur', label: 'Blur', icon: '🌫️', category: 'animations' },
  ];

  const effects = [
    { name: 'spin', label: 'Rotate', icon: '🔄', category: 'effects' },
    { name: 'flash', label: 'Blink', icon: '⚡', category: 'effects' },
    { name: 'rise', label: 'Bounce', icon: '🎾', category: 'effects' },
    { name: 'flip', label: 'Flip', icon: '🔄', category: 'effects' },
    { name: 'elastic', label: 'Elastic', icon: '🔗', category: 'effects' },
    { name: 'swing', label: 'Swing', icon: '🎪', category: 'effects' },
    { name: 'tada', label: 'Tada', icon: '🎉', category: 'effects' },
    { name: 'rubberBand', label: 'Rubber Band', icon: '🔗', category: 'effects' },
    { name: 'jackInTheBox', label: 'Jack in Box', icon: '📦', category: 'effects' },
    { name: 'heartbeat', label: 'Heartbeat', icon: '💓', category: 'effects' },
    { name: 'jello', label: 'Jello', icon: '🍮', category: 'effects' },
  ];

  const handleAnimationClick = (animationName) => {
    if (!selectedElement) {
      alert('Please select an element first');
      return;
    }

    try {
      // Apply animation using Polotno's animation system
      const animation = {
        type: 'enter',
        name: animationName,
        duration: 1000,
        delay: 0,
        enabled: true,
        data: {}
      };

      // Get current animations or create new array
      const currentAnims = selectedElement.animations ? [...selectedElement.animations] : [];
      
      // Remove any existing enter animation
      const filteredAnims = currentAnims.filter(anim => anim.type !== 'enter');
      
      // Add new animation
      const updatedAnims = [...filteredAnims, animation];
      
      // Update element animations
      selectedElement.set('animations', updatedAnims);

      console.log('✅ Animation applied:', animationName);
    } catch (error) {
      console.error('❌ Error applying animation:', error);
      alert('Error applying animation: ' + error.message);
    }
  };

  const renderAnimationCard = (anim) => (
    <Card
      key={anim.name}
      interactive
      elevation={1}
      onClick={() => handleAnimationClick(anim.name)}
      style={{
        padding: '12px',
        textAlign: 'center',
        cursor: 'pointer',
        marginBottom: '8px',
        transition: 'all 0.2s',
        border: '1px solid #e0e0e0'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <AnimationIcon>{anim.icon}</AnimationIcon>
      <div style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
        {anim.label}
      </div>
    </Card>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '10px' }}>
      {/* Header */}
      <div style={{ padding: '10px', fontSize: '14px', color: '#333', textAlign: 'center', fontWeight: '600', marginBottom: '10px' }}>
        Animate
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

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        <Button
          active={selectedCategory === 'animations'}
          onClick={() => setSelectedCategory('animations')}
          style={{ flex: 1, fontSize: '12px' }}
        >
          Animations
        </Button>
        <Button
          active={selectedCategory === 'effects'}
          onClick={() => setSelectedCategory('effects')}
          style={{ flex: 1, fontSize: '12px' }}
        >
          Effects
        </Button>
      </div>

      <Divider style={{ margin: '10px 0' }} />

      {/* Animations Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '8px',
        overflowY: 'auto',
        flex: 1
      }}>
        {selectedCategory === 'animations' && animations.map(renderAnimationCard)}
        {selectedCategory === 'effects' && effects.map(renderAnimationCard)}
      </div>

      {/* Info */}
      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        fontSize: '10px', 
        color: '#999', 
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px'
      }}>
        Click an animation to apply it to the selected element
      </div>
    </div>
  );
});

export const AnimationSection = {
  name: 'custom-animate', // Changed from 'animate' to avoid conflict with Polotno's built-in section
  Tab: observer((props) => {
    console.log('🎬 AnimationSection Tab rendering', props);
    return (
      <SectionTab name="Animate" {...props}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0L6 6H0L5 10L3 16L8 12L13 16L11 10L16 6H10L8 0Z"/>
        </svg>
      </SectionTab>
    );
  }),
  Panel: AnimationPanel, // AnimationPanel is already wrapped with observer
};

