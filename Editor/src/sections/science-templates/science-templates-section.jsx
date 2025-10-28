import React from 'react';
import { observer } from 'mobx-react-lite';
import { isAlive } from 'mobx-state-tree';
import { SectionTab } from 'polotno/side-panel';
// ImagesGrid and getImageSize imports removed - no longer using image backgrounds
import FaAtom from '@meronex/icons/fa/FaAtom';
import FaFlask from '@meronex/icons/fa/FaFlask';
import FaDna from '@meronex/icons/fa/FaDna';
import FaRocket from '@meronex/icons/fa/FaRocket';
import FaGlobe from '@meronex/icons/fa/FaGlobe';
import FaBook from '@meronex/icons/fa/FaBook';
import FaCalculator from '@meronex/icons/fa/FaCalculator';
import FaLanguage from '@meronex/icons/fa/FaLanguage';
import FaMicroscope from '@meronex/icons/fa/FaMicroscope';
import { t } from 'polotno/utils/l10n';
import { TEMPLATE_DATA } from '../../templateData';

// Educational background images and patterns for all subjects
// EDUCATIONAL_BACKGROUNDS removed - using color-only backgrounds instead
const EDUCATIONAL_BACKGROUNDS_DISABLED = [
  {
    src: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=150&fit=crop',
    credit: 'Chemistry Lab - Unsplash',
    category: 'chemistry'
  },
  {
    src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=150&fit=crop',
    credit: 'Microscope - Unsplash',
    category: 'biology'
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop',
    credit: 'Space Galaxy - Unsplash',
    category: 'astronomy'
  },
  {
    src: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop',
    credit: 'Physics Formulas - Unsplash',
    category: 'physics'
  },
  {
    src: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&h=150&fit=crop',
    credit: 'DNA Structure - Unsplash',
    category: 'biology'
  },
  {
    src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
    credit: 'Periodic Table - Unsplash',
    category: 'chemistry'
  },
  {
    src: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=150&fit=crop',
    credit: 'Earth Science - Unsplash',
    category: 'earth-science'
  },
  {
    src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=150&fit=crop',
    credit: 'Laboratory Equipment - Unsplash',
    category: 'general'
  },
  {
    src: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=200&h=150&fit=crop',
    credit: 'Solar System - Unsplash',
    category: 'astronomy'
  },
  {
    src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&h=150&fit=crop',
    credit: 'Molecular Structure - Unsplash',
    category: 'chemistry'
  },
  {
    src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=150&fit=crop',
    credit: 'Plant Biology - Unsplash',
    category: 'biology'
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop',
    credit: 'Physics Experiments - Unsplash',
    category: 'physics'
  },
  // English-themed backgrounds
  {
    src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop',
    credit: 'Books and Literature - Unsplash',
    category: 'english'
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop',
    credit: 'Writing and Grammar - Unsplash',
    category: 'english'
  },
  {
    src: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=150&fit=crop',
    credit: 'Poetry and Literature - Unsplash',
    category: 'english'
  },
  {
    src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=150&fit=crop',
    credit: 'Reading and Books - Unsplash',
    category: 'english'
  },
  // Math-themed backgrounds
  {
    src: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=150&fit=crop',
    credit: 'Mathematics Formulas - Unsplash',
    category: 'math'
  },
  {
    src: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=200&h=150&fit=crop',
    credit: 'Geometry and Shapes - Unsplash',
    category: 'math'
  },
  {
    src: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&h=150&fit=crop',
    credit: 'Algebra and Equations - Unsplash',
    category: 'math'
  },
  {
    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop',
    credit: 'Statistics and Data - Unsplash',
    category: 'math'
  }
];

// Educational template layouts for all subjects
const EDUCATIONAL_TEMPLATES = [
  // Multi-page templates from assets/templates/
  {
    id: 'science-lesson-multipage',
    name: 'Science Lesson (Multi-page)',
    preview: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=150&fit=crop',
    category: 'science',
    icon: FaFlask,
    isMultiPage: true,
    fileName: 'science-lesson',
    description: 'Complete science lesson with cover, objectives, content, and summary'
  },
  {
    id: 'math-lesson-multipage',
    name: 'Math Lesson (Multi-page)',
    preview: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=150&fit=crop',
    category: 'math',
    icon: FaCalculator,
    isMultiPage: true,
    fileName: 'math-lesson',
    description: 'Math lesson with formulas, examples, and practice problems'
  },
  {
    id: 'english-essay-multipage',
    name: 'English Essay (Multi-page)',
    preview: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaBook,
    isMultiPage: true,
    fileName: 'english-essay',
    description: 'Complete essay structure with introduction, body, and conclusion'
  },
  {
    id: 'book-report-multipage',
    name: 'Book Report (Multi-page)',
    preview: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaBook,
    isMultiPage: true,
    fileName: 'book-report',
    description: 'Book report template with summary, characters, and opinion'
  },
  {
    id: 'quiz-assessment-multipage',
    name: 'Quiz & Assessment (Multi-page)',
    preview: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=200&h=150&fit=crop',
    category: 'assessment',
    icon: FaBook,
    isMultiPage: true,
    fileName: 'quiz-assessment',
    description: 'Quiz template with cover page and question format'
  },
  {
    id: 'blank-presentation-multipage',
    name: 'Blank Presentation (Multi-page)',
    preview: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=200&h=150&fit=crop',
    category: 'general',
    icon: FaBook,
    isMultiPage: true,
    fileName: 'blank-presentation',
    description: 'Clean starter template for any subject'
  }
];

export const ScienceTemplatesPanel = observer(({ store }) => {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  
  const categories = [
    { id: 'all', name: 'All', icon: FaAtom },
    { id: 'english', name: 'English', icon: FaBook },
    { id: 'science', name: 'Science', icon: FaMicroscope },
    { id: 'math', name: 'Math', icon: FaCalculator },
    { id: 'assessment', name: 'Assessment', icon: FaBook },
    { id: 'general', name: 'General', icon: FaBook }
  ];
  
  // Background filtering removed - using color-only backgrounds instead
  
  const filteredTemplates = selectedCategory === 'all' 
    ? EDUCATIONAL_TEMPLATES 
    : EDUCATIONAL_TEMPLATES.filter(template => {
        if (selectedCategory === 'science') {
          return ['chemistry', 'biology', 'physics', 'astronomy', 'earth-science', 'science'].includes(template.category);
        }
        return template.category === selectedCategory;
      });

  const loadMultiPageTemplate = async (templateName) => {
    try {
      console.log('Loading multi-page template:', templateName);
      
      // Get template data from embedded data
      const templateData = TEMPLATE_DATA[templateName];
      
      if (!templateData) {
        console.error(`Template "${templateName}" not found in TEMPLATE_DATA`);
        console.log('Available templates:', Object.keys(TEMPLATE_DATA));
        alert(`Error: Template "${templateName}" not found. Please contact support.`);
        return;
      }
      
      // Clear all existing pages safely
      try {
        // First, clear all elements from all pages
        const pages = [...store.pages];
        pages.forEach((page, index) => {
          try {
            if (page && isAlive(page) && page.children) {
              const children = [...page.children];
              children.forEach(child => {
                try {
                  if (child && isAlive(child) && page.hasChild && page.hasChild(child.id)) {
                    page.removeChild(child);
                  }
                } catch (e) {
                  console.warn('Could not remove child:', e);
                }
              });
            }
          } catch (e) {
            console.warn('Could not clear page children:', e);
          }
        });

        // Then remove all pages except the first one
        const pagesToRemove = [...store.pages];
        for (let i = pagesToRemove.length - 1; i > 0; i--) {
          try {
            const page = pagesToRemove[i];
            if (page && isAlive(page) && page.id) {
              store.removePage(page.id);
            }
          } catch (e) {
            console.warn('Could not remove page:', e);
          }
        }
      } catch (e) {
        console.warn('Error during page cleanup:', e);
      }

      // Small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 100));

      // Load the template data
      store.loadJSON(templateData);
      
      console.log('Multi-page template loaded successfully');
    } catch (error) {
      console.error('Error loading template:', error);
      alert(`Error loading template: ${error.message}`);
    }
  };

  const applyTemplate = (template) => {
    try {
      console.log('Applying template:', template.id, template.name);
      
      // Check if this is a multi-page template
      if (template.isMultiPage) {
        loadMultiPageTemplate(template.fileName);
        return;
      }

      // Validate single-page template has elements
      if (!template.elements || !Array.isArray(template.elements)) {
        console.error(`Template "${template.id}" has no elements array`);
        alert(`Error: Template "${template.name}" is not properly configured.`);
        return;
      }

      // Clear current page safely
      const activePage = store.activePage;
      if (activePage && isAlive(activePage) && activePage.children) {
        const childrenToRemove = [...activePage.children];
        childrenToRemove.forEach(child => {
          try {
            if (child && isAlive(child) && child.id && activePage.hasChild && activePage.hasChild(child.id)) {
              activePage.removeChild(child);
            }
          } catch (e) {
            console.warn('Could not remove child:', e);
          }
        });
      }

      // Add template elements
      template.elements.forEach(element => {
        try {
          if (element.type === 'text') {
            store.activePage?.addElement({
              type: 'text',
              text: element.text,
              fontSize: element.fontSize,
              fontWeight: element.fontWeight || 'normal',
              x: element.x,
              y: element.y,
              fill: element.fill
            });
          } else if (element.type === 'rect') {
            store.activePage?.addElement({
              type: 'rect',
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              fill: element.fill,
              stroke: element.stroke,
              strokeWidth: element.strokeWidth
            });
          } else if (element.type === 'circle') {
            store.activePage?.addElement({
              type: 'circle',
              x: element.x,
              y: element.y,
              radius: element.radius,
              fill: element.fill
            });
          }
        } catch (elementError) {
          console.warn('Could not add element:', element, elementError);
        }
      });
      
      console.log('Template applied successfully');
    } catch (error) {
      console.error('Error applying template:', error);
      alert(`Error applying template "${template.name}": ${error.message}`);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        Educational templates for English, Science & Math
      </div>
      
      {/* Category Filter */}
      <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
          {categories.map(category => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  border: selectedCategory === category.id ? '2px solid #3498db' : '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: selectedCategory === category.id ? '#e3f2fd' : 'white',
                  cursor: 'pointer',
                  color: selectedCategory === category.id ? '#1976d2' : '#666'
                }}
              >
                <IconComponent size={12} />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Section */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#2c3e50' }}>
          Quick Templates ({filteredTemplates.length})
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {filteredTemplates.map(template => {
            const IconComponent = template.icon;
            return (
              <div
                key={template.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '10px',
                  backgroundColor: 'white',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onClick={() => applyTemplate(template)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                  <IconComponent size={16} color="#3498db" />
                </div>
                <img 
                  src={template.preview} 
                  style={{ width: '100%', height: '35px', objectFit: 'cover', borderRadius: '3px' }}
                  alt={template.name}
                />
                <div style={{ marginTop: '4px', color: '#2c3e50', fontWeight: '500', lineHeight: '1.2' }}>
                  {template.name}
                </div>
                {template.description && (
                  <div style={{ marginTop: '2px', color: '#7f8c8d', fontSize: '8px', lineHeight: '1.1' }}>
                    {template.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Backgrounds Section Removed - Using color-only backgrounds instead */}
    </div>
  );
});

export const EducationalTemplatesSection = {
  name: 'templates',
  Tab: observer((props) => (
    <SectionTab name="Templates" {...props}>
      <FaBook />
    </SectionTab>
  )),
  Panel: ScienceTemplatesPanel,
};
