/**
 * Environment Switcher Component
 * Provides UI to switch between local and deployed editor modes
 */

import React, { useState, useEffect } from 'react';
import { Button, Dialog, Classes, Intent } from '@blueprintjs/core';
import { config } from '../utils/environment';

const EnvironmentSwitcher = ({ isOpen, onClose }) => {
  const [currentEnv, setCurrentEnv] = useState(() => {
    const currentConfig = window.edutaktikaConfig || config;
    return currentConfig?.isLocal ? 'local' : 'deployed';
  });
  const [isSwitching, setIsSwitching] = useState(false);

  const environments = [
    {
      id: 'local',
      name: 'Local Development',
      description: 'Run editor locally for development and testing',
      url: '/Editor/index.html',
      icon: '🛠️',
      features: ['Full debugging', 'Hot reload', 'Source maps', 'Development tools']
    },
    {
      id: 'deployed',
      name: 'Deployed Production',
      description: 'Use the deployed editor on Netlify',
      url: '/editor/index.html',
      icon: '🚀',
      features: ['Optimized build', 'Production ready', 'CDN delivery', 'Better performance']
    }
  ];

  const handleSwitch = async (envId) => {
    if (envId === currentEnv) return;

    setIsSwitching(true);
    
    try {
      const targetEnv = environments.find(e => e.id === envId);
      
      // Show confirmation
      const confirmed = window.confirm(
        `Switch to ${targetEnv.name}?\n\nThis will redirect you to: ${targetEnv.url}\n\nYour current work will be saved automatically.`
      );
      
      if (confirmed) {
        // Save current work if possible
        if (window.store && window.store.pages.length > 0) {
          try {
            await window.project?.save();
            console.log('✅ Work saved before switching environment');
          } catch (error) {
            console.warn('⚠️ Could not save work:', error);
          }
        }
        
        // Redirect to the target environment
        window.location.href = targetEnv.url;
      }
    } catch (error) {
      console.error('❌ Error switching environment:', error);
      alert('Failed to switch environment. Please try again.');
    } finally {
      setIsSwitching(false);
    }
  };

  const getCurrentEnvironment = () => {
    return environments.find(e => e.id === currentEnv);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="🎨 Editor Environment Switcher"
      className="environment-switcher-dialog"
      style={{ width: '600px' }}
    >
      <div className={Classes.DIALOG_BODY}>
        <div style={{ marginBottom: '20px' }}>
          <p>
            Choose your preferred editor environment. You can switch between local development 
            and deployed production versions.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {environments.map((env) => (
            <div
              key={env.id}
              style={{
                border: `2px solid ${env.id === currentEnv ? '#137cbd' : '#e1e8ed'}`,
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: env.id === currentEnv ? '#f7f8fa' : '#ffffff',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>{env.icon}</span>
                <div>
                  <h3 style={{ margin: 0, color: '#182026' }}>{env.name}</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#5c7080', fontSize: '14px' }}>
                    {env.description}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Features:</strong>
                <ul style={{ margin: '5px 0 0 20px', fontSize: '13px', color: '#5c7080' }}>
                  {env.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <code style={{ 
                  backgroundColor: '#f5f8fa', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#182026'
                }}>
                  {env.url}
                </code>
                
                <Button
                  intent={env.id === currentEnv ? Intent.PRIMARY : Intent.NONE}
                  disabled={env.id === currentEnv || isSwitching}
                  loading={isSwitching && env.id !== currentEnv}
                  onClick={() => handleSwitch(env.id)}
                  small
                >
                  {env.id === currentEnv ? 'Current' : 'Switch To'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f7f8fa', 
          borderRadius: '6px',
          fontSize: '13px',
          color: '#5c7080'
        }}>
          <strong>💡 Tips:</strong>
          <ul style={{ margin: '5px 0 0 20px' }}>
            <li>Local development is best for creating and testing new features</li>
            <li>Deployed production is optimized for performance and sharing</li>
            <li>Your work is automatically saved when switching environments</li>
            <li>License banners are hidden in presentation mode regardless of environment</li>
          </ul>
        </div>
      </div>

      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
};

export default EnvironmentSwitcher;
