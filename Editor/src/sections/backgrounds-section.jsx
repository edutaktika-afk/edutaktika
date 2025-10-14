import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import FaPalette from '@meronex/icons/fa/FaPalette';
import { t } from 'polotno/utils/l10n';

// Educational-friendly background colors
const BACKGROUND_COLORS = [
  // Basic Colors
  { name: 'White', color: '#FFFFFF' },
  { name: 'Light Gray', color: '#F5F5F5' },
  { name: 'Gray', color: '#E0E0E0' },
  { name: 'Dark Gray', color: '#9E9E9E' },
  { name: 'Charcoal', color: '#424242' },
  { name: 'Black', color: '#000000' },
  
  // Blues
  { name: 'Sky Blue', color: '#87CEEB' },
  { name: 'Light Blue', color: '#ADD8E6' },
  { name: 'Blue', color: '#2196F3' },
  { name: 'Royal Blue', color: '#4169E1' },
  { name: 'Navy Blue', color: '#001F3F' },
  { name: 'Midnight Blue', color: '#191970' },
  
  // Greens
  { name: 'Mint', color: '#98FF98' },
  { name: 'Light Green', color: '#90EE90' },
  { name: 'Green', color: '#4CAF50' },
  { name: 'Forest Green', color: '#228B22' },
  { name: 'Dark Green', color: '#2C5F2D' },
  { name: 'Emerald', color: '#50C878' },
  
  // Yellows & Oranges
  { name: 'Cream', color: '#FFFACD' },
  { name: 'Light Yellow', color: '#FFFFE0' },
  { name: 'Yellow', color: '#FFEB3B' },
  { name: 'Gold', color: '#FFD700' },
  { name: 'Orange', color: '#FF9800' },
  { name: 'Dark Orange', color: '#FF8C00' },
  
  // Reds & Pinks
  { name: 'Light Pink', color: '#FFB6C1' },
  { name: 'Pink', color: '#FFC0CB' },
  { name: 'Rose', color: '#FF69B4' },
  { name: 'Red', color: '#F44336' },
  { name: 'Dark Red', color: '#8B0000' },
  { name: 'Maroon', color: '#800000' },
  
  // Purples
  { name: 'Lavender', color: '#E6E6FA' },
  { name: 'Light Purple', color: '#DDA0DD' },
  { name: 'Purple', color: '#9C27B0' },
  { name: 'Deep Purple', color: '#673AB7' },
  { name: 'Indigo', color: '#3F51B5' },
  { name: 'Dark Purple', color: '#4B0082' },
  
  // Browns & Earth Tones
  { name: 'Beige', color: '#F5F5DC' },
  { name: 'Tan', color: '#D2B48C' },
  { name: 'Brown', color: '#795548' },
  { name: 'Dark Brown', color: '#654321' },
  { name: 'Coffee', color: '#6F4E37' },
  { name: 'Chocolate', color: '#3E2723' },
  
  // Teal & Cyan
  { name: 'Aqua', color: '#00FFFF' },
  { name: 'Cyan', color: '#00BCD4' },
  { name: 'Teal', color: '#009688' },
  { name: 'Turquoise', color: '#40E0D0' },
  { name: 'Deep Teal', color: '#008080' },
  { name: 'Dark Cyan', color: '#008B8B' },
];

export const BackgroundsPanel = observer(({ store }) => {
  const handleColorSelect = (color) => {
    // Remove any background image and set solid color
    store.activePage?.set({
      background: color,
      backgroundImage: null,
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ padding: '15px 10px', fontSize: '14px', color: '#333', textAlign: 'center', fontWeight: '600' }}>
        Background Colors
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', 
        gap: '10px', 
        padding: '10px',
        overflowY: 'auto'
      }}>
        {BACKGROUND_COLORS.map((item, index) => (
          <div
            key={index}
            onClick={() => handleColorSelect(item.color)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
            }}
            title={item.name}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: item.color,
                borderRadius: '8px',
                border: item.color === '#FFFFFF' || item.color === '#F5F5F5' 
                  ? '2px solid #ddd' 
                  : '2px solid transparent',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            />
            <span style={{ 
              fontSize: '10px', 
              color: '#666', 
              textAlign: 'center',
              lineHeight: '1.2',
              maxWidth: '70px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
      
      <div style={{ 
        padding: '15px 10px', 
        fontSize: '11px', 
        color: '#999', 
        textAlign: 'center',
        borderTop: '1px solid #eee',
        marginTop: 'auto'
      }}>
        Click any color to set as background
      </div>
    </div>
  );
});

export const BackgroundsSection = {
  name: 'backgrounds',
  Tab: observer((props) => (
    <SectionTab name={t('sidePanel.background')} {...props}>
      <FaPalette />
    </SectionTab>
  )),
  Panel: BackgroundsPanel,
};
