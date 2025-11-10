/**
 * Polotno Animation Settings Component
 * Allows users to customize animation settings for Polotno animations
 * Similar to Canva's animation customization
 */

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Card, NumericInput, Switch, Select, Divider, H5 } from '@blueprintjs/core';
import { ANIMATION_METADATA } from '../utils/polotno-animations';

const PolotnoAnimationSettings = observer(({ store, element }) => {
  const [selectedAnimation, setSelectedAnimation] = useState(null);
  const [animationSettings, setAnimationSettings] = useState({});
  const [animationType, setAnimationType] = useState('enter'); // 'enter' or 'exit'
  const [duration, setDuration] = useState(1000); // milliseconds
  const [delay, setDelay] = useState(0); // milliseconds

  // Get current element's animation if it exists
  useEffect(() => {
    if (element && element.animations && element.animations.length > 0) {
      // Get the first animation (or enter animation if available)
      const enterAnim = element.animations.find(a => a.type === 'enter');
      const exitAnim = element.animations.find(a => a.type === 'exit');
      const anim = enterAnim || exitAnim || element.animations[0];
      
      if (anim) {
        setSelectedAnimation(anim.name);
        setAnimationType(anim.type || 'enter');
        setDuration(anim.duration || 1000);
        setDelay(anim.delay || 0);
        setAnimationSettings(anim.data || {});
      }
    } else {
      // Reset if no animations
      setSelectedAnimation(null);
      setAnimationSettings({});
    }
  }, [element]);

  if (!element) {
    return (
      <Card style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>Select an element to add animations</p>
      </Card>
    );
  }

  const handleAnimationSelect = (animationName) => {
    setSelectedAnimation(animationName);
    // Initialize with default settings
    const metadata = ANIMATION_METADATA[animationName];
    if (metadata) {
      const defaults = {};
      metadata.settings.forEach(setting => {
        defaults[setting.key] = setting.default;
      });
      setAnimationSettings(defaults);
    }
  };

  const handleSettingChange = (key, value) => {
    setAnimationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyAnimation = () => {
    if (!selectedAnimation) return;

    try {
      // Polotno animation format: { type, name, duration, delay, enabled, data }
      const newAnimation = {
        type: animationType,
        name: selectedAnimation,
        duration: duration,
        delay: delay,
        enabled: true,
        data: animationSettings
      };

      // Get current animations or create new array
      const currentAnims = element.animations ? [...element.animations] : [];
      
      // Remove any existing animation of the same type (enter/exit)
      const filteredAnims = currentAnims.filter(anim => anim.type !== animationType);
      
      // Add new animation
      const updatedAnims = [...filteredAnims, newAnimation];
      
      // Update element animations using Polotno's API
      element.set('animations', updatedAnims);

      console.log('✅ Animation applied:', {
        name: selectedAnimation,
        type: animationType,
        duration,
        delay,
        settings: animationSettings
      });
    } catch (error) {
      console.error('❌ Error applying animation:', error);
      alert('Error applying animation: ' + error.message);
    }
  };

  const removeAnimation = () => {
    try {
      // Clear all animations
      element.set('animations', []);
      setSelectedAnimation(null);
      setAnimationSettings({});
      console.log('✅ Animation removed');
    } catch (error) {
      console.error('❌ Error removing animation:', error);
    }
  };

  const previewAnimation = () => {
    if (!selectedAnimation) return;
    
    // Temporarily apply animation for preview
    const originalAnimations = element.animations ? [...element.animations] : [];
    
    applyAnimation();
    
    // Reset after duration
    setTimeout(() => {
      if (element.animations) {
        element.animations.forEach(anim => {
          element.removeAnimation(anim.id);
        });
      }
      originalAnimations.forEach(anim => {
        element.addAnimation(anim);
      });
    }, duration + delay + 100);
  };

  const renderSettingInput = (setting) => {
    const value = animationSettings[setting.key] !== undefined 
      ? animationSettings[setting.key] 
      : setting.default;

    switch (setting.type) {
      case 'number':
        return (
          <NumericInput
            key={setting.key}
            value={value}
            onValueChange={(val) => handleSettingChange(setting.key, val)}
            min={setting.min}
            max={setting.max}
            step={setting.step || 1}
            fill
            style={{ marginBottom: '10px' }}
            rightElement={
              setting.unit ? (
                <span style={{ padding: '0 8px', color: '#666' }}>{setting.unit}</span>
              ) : null
            }
          />
        );

      case 'select':
        return (
          <Select
            key={setting.key}
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            fill
            style={{ marginBottom: '10px' }}
          >
            {setting.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        );

      case 'boolean':
        return (
          <Switch
            key={setting.key}
            checked={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
            style={{ marginBottom: '10px' }}
          />
        );

      default:
        return null;
    }
  };

  const selectedMetadata = selectedAnimation ? ANIMATION_METADATA[selectedAnimation] : null;

  return (
    <Card style={{ padding: '20px', maxWidth: '400px' }}>
      <H5 style={{ marginTop: 0, marginBottom: '20px' }}>
        🎬 Animation Settings
      </H5>

      {/* Animation Type Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Animation Type
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            active={animationType === 'enter'}
            onClick={() => setAnimationType('enter')}
            style={{ flex: 1 }}
          >
            Enter
          </Button>
          <Button
            active={animationType === 'exit'}
            onClick={() => setAnimationType('exit')}
            style={{ flex: 1 }}
          >
            Exit
          </Button>
        </div>
      </div>

      {/* Animation Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Animation
        </label>
        <Select
          value={selectedAnimation || ''}
          onChange={(e) => handleAnimationSelect(e.target.value)}
          fill
        >
          <option value="">Select animation...</option>
          {Object.entries(ANIMATION_METADATA).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.name} - {meta.description}
            </option>
          ))}
        </Select>
      </div>

      {/* Duration and Delay */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500' }}>
            Duration (ms)
          </label>
          <NumericInput
            value={duration}
            onValueChange={(val) => setDuration(val)}
            min={100}
            max={5000}
            step={100}
            fill
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500' }}>
            Delay (ms)
          </label>
          <NumericInput
            value={delay}
            onValueChange={(val) => setDelay(val)}
            min={0}
            max={3000}
            step={100}
            fill
          />
        </div>
      </div>

      {/* Animation Settings */}
      {selectedMetadata && selectedMetadata.settings && selectedMetadata.settings.length > 0 && (
        <>
          <Divider style={{ margin: '20px 0' }} />
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
              Customize Settings
            </label>
            {selectedMetadata.settings.map(setting => (
              <div key={setting.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  {setting.label}
                </label>
                {renderSettingInput(setting)}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        <Button
          intent="primary"
          onClick={applyAnimation}
          disabled={!selectedAnimation}
          style={{ flex: 1 }}
        >
          Apply
        </Button>
        <Button
          onClick={previewAnimation}
          disabled={!selectedAnimation}
        >
          Preview
        </Button>
        <Button
          intent="danger"
          onClick={removeAnimation}
          disabled={!element.animations || element.animations.length === 0}
        >
          Remove
        </Button>
      </div>

      {/* Info */}
      {selectedMetadata && (
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#f0f8ff', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>ℹ️ {selectedMetadata.name}:</strong> {selectedMetadata.description}
        </div>
      )}
    </Card>
  );
});

export default PolotnoAnimationSettings;

