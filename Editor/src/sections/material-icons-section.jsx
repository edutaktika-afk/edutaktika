import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, Card, HTMLSelect, InputGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

// Material Icons organized by educational categories
const MATERIAL_ICONS = {
  'Science': [
    { name: 'science', label: 'Science', category: 'Science' },
    { name: 'biotech', label: 'Biotech', category: 'Science' },
    { name: 'psychology', label: 'Psychology', category: 'Science' },
    { name: 'bubble_chart', label: 'Data Chart', category: 'Science' },
    { name: 'scatter_plot', label: 'Scatter Plot', category: 'Science' },
    { name: 'analytics', label: 'Analytics', category: 'Science' },
    { name: 'experiment', label: 'Experiment', category: 'Science' },
    { name: 'flask', label: 'Flask', category: 'Science' },
    { name: 'microscope', label: 'Microscope', category: 'Science' },
    { name: 'dna', label: 'DNA', category: 'Science' },
    { name: 'genetics', label: 'Genetics', category: 'Science' },
    { name: 'ecosystem', label: 'Ecosystem', category: 'Science' },
    { name: 'forest', label: 'Forest', category: 'Science' },
    { name: 'water_drop', label: 'Water Drop', category: 'Science' },
    { name: 'air', label: 'Air', category: 'Science' },
    { name: 'thermostat', label: 'Temperature', category: 'Science' },
    { name: 'speed', label: 'Speed', category: 'Science' },
    { name: 'electric_bolt', label: 'Electricity', category: 'Science' },
    { name: 'radioactive', label: 'Radioactive', category: 'Science' },
    { name: 'satellite_alt', label: 'Satellite', category: 'Science' }
  ],
  'Math': [
    { name: 'calculate', label: 'Calculator', category: 'Math' },
    { name: 'functions', label: 'Functions', category: 'Math' },
    { name: 'trending_up', label: 'Trending Up', category: 'Math' },
    { name: 'trending_down', label: 'Trending Down', category: 'Math' },
    { name: 'bar_chart', label: 'Bar Chart', category: 'Math' },
    { name: 'pie_chart', label: 'Pie Chart', category: 'Math' },
    { name: 'timeline', label: 'Timeline', category: 'Math' },
    { name: 'account_tree', label: 'Tree Diagram', category: 'Math' },
    { name: 'hub', label: 'Network', category: 'Math' },
    { name: 'schema', label: 'Schema', category: 'Math' },
    { name: 'polyline', label: 'Graph', category: 'Math' },
    { name: 'show_chart', label: 'Line Chart', category: 'Math' },
    { name: 'percent', label: 'Percent', category: 'Math' },
    { name: 'currency_exchange', label: 'Currency', category: 'Math' },
    { name: 'straighten', label: 'Ruler', category: 'Math' },
    { name: 'square_foot', label: 'Area', category: 'Math' },
    { name: 'crop_free', label: 'Coordinate', category: 'Math' },
    { name: 'rotate_90_degrees_ccw', label: 'Rotation', category: 'Math' },
    { name: 'transform', label: 'Transform', category: 'Math' },
    { name: 'pattern', label: 'Pattern', category: 'Math' },
    { name: 'schedule', label: 'Clock', category: 'Math' },
    { name: 'access_time', label: 'Time', category: 'Math' },
    { name: 'calendar_today', label: 'Calendar', category: 'Math' },
    { name: 'numbers', label: 'Numbers', category: 'Math' },
    { name: 'plus_one', label: 'Plus One', category: 'Math' },
    { name: 'exposure_plus_1', label: 'Add', category: 'Math' },
    { name: 'remove', label: 'Subtract', category: 'Math' },
    { name: 'close', label: 'Multiply', category: 'Math' },
    { name: 'horizontal_rule', label: 'Divide', category: 'Math' },
    { name: 'equals', label: 'Equals', category: 'Math' }
  ],
  'Education': [
    { name: 'school', label: 'School', category: 'Education' },
    { name: 'book', label: 'Book', category: 'Education' },
    { name: 'menu_book', label: 'Textbook', category: 'Education' },
    { name: 'library_books', label: 'Library', category: 'Education' },
    { name: 'class', label: 'Classroom', category: 'Education' },
    { name: 'quiz', label: 'Quiz', category: 'Education' },
    { name: 'assignment', label: 'Assignment', category: 'Education' },
    { name: 'homework', label: 'Homework', category: 'Education' },
    { name: 'grading', label: 'Grading', category: 'Education' },
    { name: 'fact_check', label: 'Fact Check', category: 'Education' },
    { name: 'checklist', label: 'Checklist', category: 'Education' },
    { name: 'task', label: 'Task', category: 'Education' },
    { name: 'note_alt', label: 'Notes', category: 'Education' },
    { name: 'edit_note', label: 'Edit Notes', category: 'Education' },
    { name: 'draw', label: 'Drawing', category: 'Education' },
    { name: 'palette', label: 'Palette', category: 'Education' },
    { name: 'brush', label: 'Brush', category: 'Education' },
    { name: 'color_lens', label: 'Color Lens', category: 'Education' },
    { name: 'format_paint', label: 'Format Paint', category: 'Education' },
    { name: 'auto_fix_high', label: 'Auto Fix', category: 'Education' },
    { name: 'person', label: 'Student', category: 'Education' },
    { name: 'groups', label: 'Class', category: 'Education' },
    { name: 'person_outline', label: 'Teacher', category: 'Education' },
    { name: 'emoji_events', label: 'Award', category: 'Education' },
    { name: 'star', label: 'Star', category: 'Education' },
    { name: 'thumb_up', label: 'Good Job', category: 'Education' },
    { name: 'celebration', label: 'Celebration', category: 'Education' },
    { name: 'lightbulb', label: 'Idea', category: 'Education' },
    { name: 'psychology', label: 'Thinking', category: 'Education' },
    { name: 'visibility', label: 'See', category: 'Education' },
    { name: 'hearing', label: 'Listen', category: 'Education' },
    { name: 'record_voice_over', label: 'Speak', category: 'Education' }
  ],
  'Technology': [
    { name: 'computer', label: 'Computer', category: 'Technology' },
    { name: 'laptop', label: 'Laptop', category: 'Technology' },
    { name: 'tablet', label: 'Tablet', category: 'Technology' },
    { name: 'smartphone', label: 'Smartphone', category: 'Technology' },
    { name: 'code', label: 'Code', category: 'Technology' },
    { name: 'terminal', label: 'Terminal', category: 'Technology' },
    { name: 'bug_report', label: 'Bug Report', category: 'Technology' },
    { name: 'memory', label: 'Memory', category: 'Technology' },
    { name: 'storage', label: 'Storage', category: 'Technology' },
    { name: 'cloud', label: 'Cloud', category: 'Technology' },
    { name: 'wifi', label: 'WiFi', category: 'Technology' },
    { name: 'bluetooth', label: 'Bluetooth', category: 'Technology' },
    { name: 'router', label: 'Router', category: 'Technology' },
    { name: 'security', label: 'Security', category: 'Technology' },
    { name: 'lock', label: 'Lock', category: 'Technology' },
    { name: 'key', label: 'Key', category: 'Technology' },
    { name: 'fingerprint', label: 'Fingerprint', category: 'Technology' },
    { name: 'verified_user', label: 'Verified User', category: 'Technology' },
    { name: 'admin_panel_settings', label: 'Admin Panel', category: 'Technology' },
    { name: 'settings', label: 'Settings', category: 'Technology' }
  ],
  'Communication': [
    { name: 'chat', label: 'Chat', category: 'Communication' },
    { name: 'forum', label: 'Forum', category: 'Communication' },
    { name: 'message', label: 'Message', category: 'Communication' },
    { name: 'email', label: 'Email', category: 'Communication' },
    { name: 'call', label: 'Call', category: 'Communication' },
    { name: 'video_call', label: 'Video Call', category: 'Communication' },
    { name: 'share', label: 'Share', category: 'Communication' },
    { name: 'forward', label: 'Forward', category: 'Communication' },
    { name: 'reply', label: 'Reply', category: 'Communication' },
    { name: 'send', label: 'Send', category: 'Communication' },
    { name: 'attach_file', label: 'Attach File', category: 'Communication' },
    { name: 'link', label: 'Link', category: 'Communication' },
    { name: 'content_copy', label: 'Copy', category: 'Communication' },
    { name: 'paste', label: 'Paste', category: 'Communication' },
    { name: 'print', label: 'Print', category: 'Communication' },
    { name: 'download', label: 'Download', category: 'Communication' },
    { name: 'upload', label: 'Upload', category: 'Communication' },
    { name: 'folder', label: 'Folder', category: 'Communication' },
    { name: 'description', label: 'Document', category: 'Communication' },
    { name: 'text_snippet', label: 'Text Snippet', category: 'Communication' }
  ],
  'General': [
    { name: 'star', label: 'Star', category: 'General' },
    { name: 'favorite', label: 'Favorite', category: 'General' },
    { name: 'thumb_up', label: 'Thumb Up', category: 'General' },
    { name: 'thumb_down', label: 'Thumb Down', category: 'General' },
    { name: 'flag', label: 'Flag', category: 'General' },
    { name: 'warning', label: 'Warning', category: 'General' },
    { name: 'info', label: 'Info', category: 'General' },
    { name: 'help', label: 'Help', category: 'General' },
    { name: 'search', label: 'Search', category: 'General' },
    { name: 'filter_list', label: 'Filter', category: 'General' },
    { name: 'sort', label: 'Sort', category: 'General' },
    { name: 'refresh', label: 'Refresh', category: 'General' },
    { name: 'autorenew', label: 'Auto Renew', category: 'General' },
    { name: 'sync', label: 'Sync', category: 'General' },
    { name: 'update', label: 'Update', category: 'General' },
    { name: 'add', label: 'Add', category: 'General' },
    { name: 'remove', label: 'Remove', category: 'General' },
    { name: 'edit', label: 'Edit', category: 'General' },
    { name: 'delete', label: 'Delete', category: 'General' },
    { name: 'close', label: 'Close', category: 'General' }
  ]
};

// Simple icon component for the tab
const MaterialIconTab = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

export const MaterialIconsPanel = observer(({ store }) => {
  const [selectedCategory, setSelectedCategory] = useState('Science');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('outlined');

  const categories = Object.keys(MATERIAL_ICONS);

  const filteredIcons = MATERIAL_ICONS[selectedCategory].filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addIconToCanvas = (iconName, iconLabel) => {
    // Create a text element with the Material Icon
    const textElement = store.activePage?.addElement({
      type: 'text',
      text: iconName,
      fontSize: 48,
      fontFamily: `Material Symbols ${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)}`,
      x: store.width / 2 - 50,
      y: store.height / 2 - 50,
      fill: '#000000'
    });

    if (textElement) {
      store.selectElements([textElement.id]);
    }
  };

  const getIconStyle = () => {
    switch (selectedStyle) {
      case 'filled':
        return 'Material Icons';
      case 'rounded':
        return 'Material Symbols Rounded';
      case 'sharp':
        return 'Material Symbols Sharp';
      default:
        return 'Material Symbols Outlined';
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '15px 10px', fontSize: '14px', color: '#333', textAlign: 'center', fontWeight: '600' }}>
        Material Design Icons
      </div>

      {/* Search */}
      <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
        <InputGroup
          placeholder="Search icons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={IconNames.SEARCH}
          style={{ fontSize: '12px' }}
        />
      </div>

      {/* Category Filter */}
      <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>
          Category
        </label>
        <HTMLSelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ width: '100%', fontSize: '12px' }}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </HTMLSelect>
      </div>

      {/* Style Selector */}
      <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>
          Icon Style
        </label>
        <HTMLSelect
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          style={{ width: '100%', fontSize: '12px' }}
        >
          <option value="outlined">Outlined</option>
          <option value="rounded">Rounded</option>
          <option value="sharp">Sharp</option>
          <option value="filled">Filled</option>
        </HTMLSelect>
      </div>

      {/* Icons Grid */}
      <div style={{ padding: '10px', flex: 1, overflow: 'auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
          gap: '8px' 
        }}>
          {filteredIcons.map(icon => (
            <Card
              key={`${icon.name}-${icon.category}`}
              interactive
              style={{ 
                padding: '8px', 
                textAlign: 'center',
                cursor: 'pointer',
                minHeight: '70px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onClick={() => addIconToCanvas(icon.name, icon.label)}
            >
              <div 
                style={{ 
                  fontSize: '24px',
                  fontFamily: getIconStyle(),
                  color: '#333',
                  marginBottom: '4px'
                }}
              >
                {icon.name}
              </div>
              <div style={{ 
                fontSize: '8px', 
                color: '#666',
                textAlign: 'center',
                lineHeight: '1.1'
              }}>
                {icon.label}
              </div>
            </Card>
          ))}
        </div>
        
        {filteredIcons.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#666',
            fontSize: '12px'
          }}>
            No icons found for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ 
        padding: '10px', 
        fontSize: '10px', 
        color: '#999', 
        textAlign: 'center',
        borderTop: '1px solid #eee'
      }}>
        {filteredIcons.length} icons • Material Design Icons by Google
      </div>
    </div>
  );
});

export const MaterialIconsSection = {
  name: 'material-icons',
  Tab: observer((props) => (
    <SectionTab name="Icons" {...props}>
      <MaterialIconTab />
    </SectionTab>
  )),
  Panel: MaterialIconsPanel,
};

