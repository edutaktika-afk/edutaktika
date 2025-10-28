import React, { useState, useEffect } from 'react';
import { Button, ButtonGroup, Card, Elevation, H5, Divider } from '@blueprintjs/core';

const AnimationSelector = ({ selectedElement, onAnimationSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('basic');
  const [previewMode, setPreviewMode] = useState(false);

  const categories = {
    basic: {
      name: 'Basic Animations',
      icon: '🔄',
      animations: [
        { name: 'slideUp', label: 'Slide Up', icon: '⬆️' },
        { name: 'slideDown', label: 'Slide Down', icon: '⬇️' },
        { name: 'slideLeft', label: 'Slide Left', icon: '⬅️' },
        { name: 'slideRight', label: 'Slide Right', icon: '➡️' },
        { name: 'scaleIn', label: 'Scale In', icon: '🔍' },
        { name: 'scaleOut', label: 'Scale Out', icon: '🔍' },
        { name: 'rotateIn', label: 'Rotate In', icon: '🔄' },
        { name: 'rotateOut', label: 'Rotate Out', icon: '🔄' }
      ]
    },
    advanced: {
      name: 'Advanced Animations',
      icon: '🎪',
      animations: [
        { name: 'flipInX', label: 'Flip In X', icon: '🔄' },
        { name: 'flipInY', label: 'Flip In Y', icon: '🔄' },
        { name: 'flipOutX', label: 'Flip Out X', icon: '🔄' },
        { name: 'flipOutY', label: 'Flip Out Y', icon: '🔄' },
        { name: 'rollIn', label: 'Roll In', icon: '🎲' },
        { name: 'rollOut', label: 'Roll Out', icon: '🎲' },
        { name: 'jackInTheBox', label: 'Jack In The Box', icon: '📦' },
        { name: 'jello', label: 'Jello', icon: '🍮' },
        { name: 'heartBeat', label: 'Heart Beat', icon: '💓' },
        { name: 'rubberBand', label: 'Rubber Band', icon: '🔗' },
        { name: 'swing', label: 'Swing', icon: '🎪' },
        { name: 'tada', label: 'Tada', icon: '🎉' }
      ]
    },
    visual: {
      name: 'Visual Effects',
      icon: '✨',
      animations: [
        { name: 'flash', label: 'Flash', icon: '⚡' },
        { name: 'glow', label: 'Glow', icon: '💡' },
        { name: 'float', label: 'Float', icon: '🎈' },
        { name: 'sink', label: 'Sink', icon: '⬇️' },
        { name: 'drift', label: 'Drift', icon: '🌊' },
        { name: 'wiggle', label: 'Wiggle', icon: '🐛' },
        { name: 'squash', label: 'Squash', icon: '🥞' },
        { name: 'stretch', label: 'Stretch', icon: '📏' },
        { name: 'squeeze', label: 'Squeeze', icon: '🤏' },
        { name: 'expand', label: 'Expand', icon: '📈' },
        { name: 'morph', label: 'Morph', icon: '🔄' },
        { name: 'colorShift', label: 'Color Shift', icon: '🌈' },
        { name: 'rainbow', label: 'Rainbow', icon: '🌈' },
        { name: 'sparkle', label: 'Sparkle', icon: '✨' },
        { name: 'twinkle', label: 'Twinkle', icon: '⭐' },
        { name: 'shimmer', label: 'Shimmer', icon: '✨' },
        { name: 'gradientShift', label: 'Gradient Shift', icon: '🎨' }
      ]
    },
    special: {
      name: 'Special Effects',
      icon: '🎭',
      animations: [
        { name: 'particle', label: 'Particle', icon: '✨' },
        { name: 'wave', label: 'Wave', icon: '🌊' },
        { name: 'ripple', label: 'Ripple', icon: '💧' },
        { name: 'magnetic', label: 'Magnetic', icon: '🧲' },
        { name: 'elastic', label: 'Elastic', icon: '🔗' }
      ]
    }
  };

  const handleAnimationClick = (animationName) => {
    if (previewMode && selectedElement) {
      // Preview the animation
      window.animationManager.previewAnimation(selectedElement, animationName);
    } else if (onAnimationSelect) {
      // Apply the animation
      onAnimationSelect(animationName);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const renderAnimationButton = (animation) => (
    <Button
      key={animation.name}
      minimal
      className="animation-button"
      onClick={() => handleAnimationClick(animation.name)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 8px',
        margin: '4px',
        minWidth: '80px',
        height: '80px',
        borderRadius: '8px',
        border: '1px solid #e1e8ed',
        backgroundColor: '#f8f9fa',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#e3f2fd';
        e.target.style.borderColor = '#2196f3';
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = '#f8f9fa';
        e.target.style.borderColor = '#e1e8ed';
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '4px' }}>
        {animation.icon}
      </div>
      <div style={{ 
        fontSize: '11px', 
        textAlign: 'center', 
        fontWeight: '500',
        color: '#333',
        lineHeight: '1.2'
      }}>
        {animation.label}
      </div>
    </Button>
  );

  return (
    <Card elevation={Elevation.TWO} style={{ padding: '20px', maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <H5 style={{ margin: 0, marginRight: '10px' }}>🎨 Animation Effects</H5>
        <Button
          small
          minimal
          active={previewMode}
          onClick={() => setPreviewMode(!previewMode)}
          style={{ marginLeft: 'auto' }}
        >
          {previewMode ? '👁️ Preview Mode' : '🎯 Apply Mode'}
        </Button>
      </div>

      {/* Category Selector */}
      <div style={{ marginBottom: '20px' }}>
        <ButtonGroup fill>
          {Object.entries(categories).map(([key, category]) => (
            <Button
              key={key}
              active={selectedCategory === key}
              onClick={() => handleCategoryChange(key)}
              style={{ fontSize: '14px' }}
            >
              {category.icon} {category.name}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <Divider />

      {/* Animation Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
        gap: '8px',
        marginTop: '20px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {categories[selectedCategory].animations.map(renderAnimationButton)}
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '12px', 
        backgroundColor: '#f0f8ff', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>💡 Tips:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>Click any animation to {previewMode ? 'preview' : 'apply'} it</li>
          <li>Use <strong>Basic</strong> animations for simple transitions</li>
          <li>Use <strong>Advanced</strong> animations for dynamic entrances</li>
          <li>Use <strong>Visual Effects</strong> for attention-grabbing elements</li>
          <li>Use <strong>Special Effects</strong> for unique interactions</li>
        </ul>
      </div>
    </Card>
  );
};

export default AnimationSelector;
