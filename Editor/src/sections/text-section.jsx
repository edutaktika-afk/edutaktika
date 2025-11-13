import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, Card, HTMLSelect } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
// Simple text icon component
const TextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 3h12v1H2V3zm0 2h12v1H2V5zm0 2h8v1H2V7zm0 2h10v1H2V9zm0 2h6v1H2v-1z"/>
  </svg>
);
import { t } from 'polotno/utils/l10n';

// Removed Google Fonts - using Polotno's default fonts instead
// import { CUSTOM_FONTS, loadGoogleFonts, getFontOptions, waitForFont } from '../fonts';

export const TextPanel = observer(({ store }) => {
  const [selectedFont, setSelectedFont] = useState('Arial');

  const addTextElement = (text, fontSize = 24, fontFamily = 'Arial') => {
    // Use Polotno's default fonts - no need to wait for font loading
    const textElement = store.activePage?.addElement({
      type: 'text',
      text: text,
      fontSize: fontSize,
      fontFamily: fontFamily,
      x: store.width / 2 - 100,
      y: store.height / 2 - 50,
      fill: '#000000'
    });
    
    if (textElement) {
      store.selectElements([textElement.id]);
    }
  };

  const handleFontChange = (event) => {
    const newFont = event.target.value;
    setSelectedFont(newFont);
    
    // Apply font to currently selected text elements
    const selectedElements = store.selectedElements;
    selectedElements.forEach(element => {
      if (element.type === 'text') {
        element.set({ fontFamily: newFont });
      }
    });
  };

  // Use Polotno's default fonts instead of Google Fonts
  const fontOptions = [
    { value: 'Arial', label: 'Arial', category: 'sans-serif' },
    { value: 'Helvetica', label: 'Helvetica', category: 'sans-serif' },
    { value: 'Times New Roman', label: 'Times New Roman', category: 'serif' },
    { value: 'Courier New', label: 'Courier New', category: 'monospace' },
    { value: 'Georgia', label: 'Georgia', category: 'serif' },
    { value: 'Verdana', label: 'Verdana', category: 'sans-serif' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS', category: 'sans-serif' },
    { value: 'Impact', label: 'Impact', category: 'sans-serif' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS', category: 'sans-serif' },
    { value: 'Palatino', label: 'Palatino', category: 'serif' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '15px 10px', fontSize: '14px', color: '#333', textAlign: 'center', fontWeight: '600' }}>
        Educational Text Tools
      </div>

      {/* Font Selection */}
      <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>
          Font Family
        </label>
        <HTMLSelect
          value={selectedFont}
          onChange={handleFontChange}
          style={{ width: '100%', fontSize: '12px' }}
        >
          {fontOptions.map(font => (
            <option key={font.value} value={font.value}>
              {font.label} ({font.category})
            </option>
          ))}
        </HTMLSelect>
      </div>

      {/* Style Presets */}
      <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
          Style Presets
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
          <Button
            text="Heading"
            onClick={() => {
              const element = store.activePage?.addElement({
                type: 'text',
                text: 'Heading',
                fontSize: 36,
                fontFamily: selectedFont,
                fontWeight: 'bold',
                x: store.width / 2 - 100,
                y: store.height / 2 - 50,
                fill: '#1a1a1a'
              });
              if (element) store.selectElements([element.id]);
            }}
            small
            style={{ fontSize: '11px' }}
          />
          <Button
            text="Subheading"
            onClick={() => {
              const element = store.activePage?.addElement({
                type: 'text',
                text: 'Subheading',
                fontSize: 24,
                fontFamily: selectedFont,
                fontWeight: '600',
                x: store.width / 2 - 80,
                y: store.height / 2 - 30,
                fill: '#333333'
              });
              if (element) store.selectElements([element.id]);
            }}
            small
            style={{ fontSize: '11px' }}
          />
          <Button
            text="Body"
            onClick={() => {
              const element = store.activePage?.addElement({
                type: 'text',
                text: 'Body text',
                fontSize: 18,
                fontFamily: selectedFont,
                fontWeight: 'normal',
                x: store.width / 2 - 60,
                y: store.height / 2 - 10,
                fill: '#555555'
              });
              if (element) store.selectElements([element.id]);
            }}
            small
            style={{ fontSize: '11px' }}
          />
          <Button
            text="Caption"
            onClick={() => {
              const element = store.activePage?.addElement({
                type: 'text',
                text: 'Caption text',
                fontSize: 14,
                fontFamily: selectedFont,
                fontWeight: 'normal',
                fontStyle: 'italic',
                x: store.width / 2 - 50,
                y: store.height / 2 + 10,
                fill: '#777777'
              });
              if (element) store.selectElements([element.id]);
            }}
            small
            style={{ fontSize: '11px' }}
          />
        </div>
      </div>

      {/* Quick Text Buttons */}
      <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Quick Add Text
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <Button
            text="Create Header"
            style={{ fontSize: '14px', fontWeight: 'bold' }}
            onClick={() => addTextElement('Your Header Here', 32, selectedFont)}
            small
          />
          <Button
            text="Create Sub Header"
            style={{ fontSize: '12px' }}
            onClick={() => addTextElement('Your Sub Header', 24, selectedFont)}
            small
          />
          <Button
            text="Create Body Text"
            style={{ fontSize: '11px' }}
            onClick={() => addTextElement('Your body text here...', 16, selectedFont)}
            small
          />
        </div>
      </div>

      {/* Font Preview */}
      <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Font Preview
        </div>
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          padding: '10px',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ 
            fontFamily: selectedFont,
            fontSize: '16px',
            color: '#333',
            marginBottom: '5px'
          }}>
            The quick brown fox jumps over the lazy dog
          </div>
          <div style={{ 
            fontFamily: selectedFont,
            fontSize: '14px',
            color: '#666',
            fontStyle: 'italic'
          }}>
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
          </div>
          <div style={{ 
            fontFamily: selectedFont,
            fontSize: '12px',
            color: '#999'
          }}>
            0123456789
          </div>
        </div>
      </div>

      {/* Educational Text Examples */}
      <div style={{ padding: '10px', flex: 1, overflow: 'auto' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          Educational Examples
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* Example 1: Science */}
          <Card
            interactive
            style={{ padding: '8px', fontSize: '10px' }}
            onClick={() => addTextElement('Photosynthesis', 28, selectedFont)}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Science Title</div>
            <div style={{ fontFamily: selectedFont, fontSize: '12px' }}>
              Photosynthesis
            </div>
          </Card>

          {/* Example 2: Math */}
          <Card
            interactive
            style={{ padding: '8px', fontSize: '10px' }}
            onClick={() => addTextElement('y = mx + b', 24, selectedFont)}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Math Formula</div>
            <div style={{ fontFamily: selectedFont, fontSize: '12px' }}>
              y = mx + b
            </div>
          </Card>

          {/* Example 3: English */}
          <Card
            interactive
            style={{ padding: '8px', fontSize: '10px' }}
            onClick={() => addTextElement('The Great Gatsby', 22, selectedFont)}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Literature</div>
            <div style={{ fontFamily: selectedFont, fontSize: '12px' }}>
              The Great Gatsby
            </div>
          </Card>

          {/* Example 4: History */}
          <Card
            interactive
            style={{ padding: '8px', fontSize: '10px' }}
            onClick={() => addTextElement('World War II', 26, selectedFont)}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>History</div>
            <div style={{ fontFamily: selectedFont, fontSize: '12px' }}>
              World War II
            </div>
          </Card>

          {/* Example 5: Art */}
          <Card
            interactive
            style={{ padding: '8px', fontSize: '10px' }}
            onClick={() => addTextElement('Renaissance Art', 24, selectedFont)}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Art History</div>
            <div style={{ fontFamily: selectedFont, fontSize: '12px' }}>
              Renaissance Art
            </div>
          </Card>

          {/* Example 6: Geography */}
          <Card
            interactive
            style={{ padding: '8px', fontSize: '10px' }}
            onClick={() => addTextElement('Continents', 22, selectedFont)}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Geography</div>
            <div style={{ fontFamily: selectedFont, fontSize: '12px' }}>
              Continents
            </div>
          </Card>
        </div>
      </div>

      {/* Status */}
      <div style={{ padding: '10px', fontSize: '10px', color: '#999', textAlign: 'center' }}>
        Using Polotno default fonts
      </div>
    </div>
  );
});

export const TextSection = {
  name: 'text',
  Tab: observer((props) => (
    <SectionTab name="Text" {...props}>
      <TextIcon />
    </SectionTab>
  )),
  Panel: TextPanel,
};

