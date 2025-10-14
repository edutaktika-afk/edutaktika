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
  {
    id: 'science-lab-report',
    name: 'Lab Report Template',
    preview: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=150&fit=crop',
    category: 'chemistry',
    icon: FaFlask,
    elements: [
      {
        type: 'text',
        text: 'LAB REPORT',
        fontSize: 32,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: 'Experiment: ',
        fontSize: 16,
        x: 50,
        y: 100,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Date: ',
        fontSize: 16,
        x: 50,
        y: 130,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Objective: ',
        fontSize: 16,
        x: 50,
        y: 160,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Materials: ',
        fontSize: 16,
        x: 50,
        y: 190,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Procedure: ',
        fontSize: 16,
        x: 50,
        y: 220,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Results: ',
        fontSize: 16,
        x: 50,
        y: 250,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Conclusion: ',
        fontSize: 16,
        x: 50,
        y: 280,
        fill: '#34495e'
      }
    ]
  },
  {
    id: 'biology-diagram',
    name: 'Biology Diagram Template',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=150&fit=crop',
    category: 'biology',
    icon: FaDna,
    elements: [
      {
        type: 'text',
        text: 'BIOLOGY DIAGRAM',
        fontSize: 28,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#27ae60'
      },
      {
        type: 'rect',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        fill: '#ecf0f1',
        stroke: '#27ae60',
        strokeWidth: 2
      },
      {
        type: 'text',
        text: 'Label your diagram here',
        fontSize: 14,
        x: 110,
        y: 270,
        fill: '#2c3e50'
      }
    ]
  },
  {
    id: 'physics-formula',
    name: 'Physics Formula Sheet',
    preview: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop',
    category: 'physics',
    icon: FaRocket,
    elements: [
      {
        type: 'text',
        text: 'PHYSICS FORMULAS',
        fontSize: 28,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#e74c3c'
      },
      {
        type: 'text',
        text: 'Kinematics:',
        fontSize: 18,
        fontWeight: 'bold',
        x: 50,
        y: 100,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: 'v = v₀ + at',
        fontSize: 16,
        x: 70,
        y: 130,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'x = x₀ + v₀t + ½at²',
        fontSize: 16,
        x: 70,
        y: 160,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Dynamics:',
        fontSize: 18,
        fontWeight: 'bold',
        x: 50,
        y: 200,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: 'F = ma',
        fontSize: 16,
        x: 70,
        y: 230,
        fill: '#34495e'
      }
    ]
  },
  {
    id: 'astronomy-presentation',
    name: 'Astronomy Presentation',
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop',
    category: 'astronomy',
    icon: FaRocket,
    elements: [
      {
        type: 'text',
        text: 'ASTRONOMY',
        fontSize: 32,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#8e44ad'
      },
      {
        type: 'text',
        text: 'The Solar System',
        fontSize: 20,
        x: 50,
        y: 100,
        fill: '#2c3e50'
      },
      {
        type: 'circle',
        x: 150,
        y: 150,
        radius: 20,
        fill: '#f39c12'
      },
      {
        type: 'text',
        text: 'Sun',
        fontSize: 12,
        x: 145,
        y: 180,
        fill: '#2c3e50'
      },
      {
        type: 'circle',
        x: 200,
        y: 150,
        radius: 8,
        fill: '#95a5a6'
      },
      {
        type: 'text',
        text: 'Mercury',
        fontSize: 10,
        x: 195,
        y: 170,
        fill: '#2c3e50'
      }
    ]
  },
  {
    id: 'earth-science-poster',
    name: 'Earth Science Poster',
    preview: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=150&fit=crop',
    category: 'earth-science',
    icon: FaGlobe,
    elements: [
      {
        type: 'text',
        text: 'EARTH SCIENCE',
        fontSize: 28,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#16a085'
      },
      {
        type: 'text',
        text: 'Layers of the Earth',
        fontSize: 18,
        x: 50,
        y: 100,
        fill: '#2c3e50'
      },
      {
        type: 'circle',
        x: 200,
        y: 200,
        radius: 60,
        fill: '#e67e22',
        stroke: '#d35400',
        strokeWidth: 2
      },
      {
        type: 'circle',
        x: 200,
        y: 200,
        radius: 40,
        fill: '#f39c12',
        stroke: '#e67e22',
        strokeWidth: 2
      },
      {
        type: 'circle',
        x: 200,
        y: 200,
        radius: 20,
        fill: '#f1c40f',
        stroke: '#f39c12',
        strokeWidth: 2
      },
      {
        type: 'text',
        text: 'Core',
        fontSize: 12,
        x: 195,
        y: 205,
        fill: '#2c3e50'
      }
    ]
  },
  {
    id: 'chemistry-periodic-table',
    name: 'Periodic Table Template',
    preview: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
    category: 'chemistry',
    icon: FaFlask,
    elements: [
      {
        type: 'text',
        text: 'PERIODIC TABLE',
        fontSize: 24,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#2c3e50'
      },
      {
        type: 'rect',
        x: 100,
        y: 100,
        width: 30,
        height: 30,
        fill: '#3498db',
        stroke: '#2980b9',
        strokeWidth: 1
      },
      {
        type: 'text',
        text: 'H',
        fontSize: 14,
        fontWeight: 'bold',
        x: 110,
        y: 120,
        fill: 'white'
      },
      {
        type: 'text',
        text: '1',
        fontSize: 8,
        x: 105,
        y: 135,
        fill: 'white'
      },
      {
        type: 'rect',
        x: 140,
        y: 100,
        width: 30,
        height: 30,
        fill: '#e74c3c',
        stroke: '#c0392b',
        strokeWidth: 1
      },
      {
        type: 'text',
        text: 'He',
        fontSize: 12,
        fontWeight: 'bold',
        x: 148,
        y: 120,
        fill: 'white'
      },
      {
        type: 'text',
        text: '2',
        fontSize: 8,
        x: 153,
        y: 135,
        fill: 'white'
      }
    ]
  },
  {
    id: 'science-presentation',
    name: 'Science Presentation',
    preview: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&h=150&fit=crop',
    category: 'general',
    icon: FaAtom,
    elements: [
      {
        type: 'text',
        text: 'SCIENCE PRESENTATION',
        fontSize: 24,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: 'Topic: ',
        fontSize: 16,
        x: 50,
        y: 100,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Introduction',
        fontSize: 14,
        x: 50,
        y: 130,
        fill: '#7f8c8d'
      },
      {
        type: 'text',
        text: '• Key points',
        fontSize: 12,
        x: 70,
        y: 150,
        fill: '#95a5a6'
      },
      {
        type: 'text',
        text: '• Research findings',
        fontSize: 12,
        x: 70,
        y: 170,
        fill: '#95a5a6'
      },
      {
        type: 'text',
        text: '• Conclusion',
        fontSize: 12,
        x: 70,
        y: 190,
        fill: '#95a5a6'
      }
    ]
  },
  // English Templates
  {
    id: 'english-essay',
    name: 'Essay Template',
    preview: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaBook,
    elements: [
      {
        type: 'text',
        text: 'ESSAY',
        fontSize: 28,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#8e44ad'
      },
      {
        type: 'text',
        text: 'Title: ',
        fontSize: 16,
        x: 50,
        y: 100,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: 'Introduction',
        fontSize: 18,
        fontWeight: 'bold',
        x: 50,
        y: 140,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Body Paragraph 1',
        fontSize: 16,
        fontWeight: 'bold',
        x: 50,
        y: 180,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Body Paragraph 2',
        fontSize: 16,
        fontWeight: 'bold',
        x: 50,
        y: 220,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Conclusion',
        fontSize: 18,
        fontWeight: 'bold',
        x: 50,
        y: 260,
        fill: '#34495e'
      }
    ]
  },
  {
    id: 'english-book-report',
    name: 'Book Report Template',
    preview: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaLanguage,
    elements: [
      {
        type: 'text',
        text: 'BOOK REPORT',
        fontSize: 24,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#27ae60'
      },
      {
        type: 'text',
        text: 'Book Title: ',
        fontSize: 14,
        x: 50,
        y: 90,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: 'Author: ',
        fontSize: 14,
        x: 50,
        y: 110,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: 'Summary: ',
        fontSize: 16,
        fontWeight: 'bold',
        x: 50,
        y: 140,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Characters: ',
        fontSize: 16,
        fontWeight: 'bold',
        x: 50,
        y: 180,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'My Opinion: ',
        fontSize: 16,
        fontWeight: 'bold',
        x: 50,
        y: 220,
        fill: '#34495e'
      }
    ]
  },
  {
    id: 'english-poetry',
    name: 'Poetry Template',
    preview: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaBook,
    elements: [
      {
        type: 'text',
        text: 'POETRY',
        fontSize: 28,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#e74c3c'
      },
      {
        type: 'text',
        text: 'Title: ',
        fontSize: 16,
        x: 50,
        y: 100,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: 'Line 1',
        fontSize: 14,
        x: 50,
        y: 140,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Line 2',
        fontSize: 14,
        x: 50,
        y: 160,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Line 3',
        fontSize: 14,
        x: 50,
        y: 180,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: 'Line 4',
        fontSize: 14,
        x: 50,
        y: 200,
        fill: '#34495e'
      }
    ]
  },
  // Math Templates
  {
    id: 'math-worksheet',
    name: 'Math Worksheet',
    preview: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=150&fit=crop',
    category: 'math',
    icon: FaCalculator,
    elements: [
      {
        type: 'text',
        text: 'MATH WORKSHEET',
        fontSize: 24,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#3498db'
      },
      {
        type: 'text',
        text: 'Name: _________________',
        fontSize: 14,
        x: 50,
        y: 90,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: 'Date: _________________',
        fontSize: 14,
        x: 50,
        y: 110,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: '1. 5 + 3 = _____',
        fontSize: 16,
        x: 50,
        y: 150,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: '2. 12 - 7 = _____',
        fontSize: 16,
        x: 50,
        y: 180,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: '3. 4 × 6 = _____',
        fontSize: 16,
        x: 50,
        y: 210,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: '4. 15 ÷ 3 = _____',
        fontSize: 16,
        x: 50,
        y: 240,
        fill: '#34495e'
      }
    ]
  },
  {
    id: 'math-geometry',
    name: 'Geometry Template',
    preview: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=200&h=150&fit=crop',
    category: 'math',
    icon: FaCalculator,
    elements: [
      {
        type: 'text',
        text: 'GEOMETRY',
        fontSize: 28,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#16a085'
      },
      {
        type: 'text',
        text: 'Shapes and Measurements',
        fontSize: 16,
        x: 50,
        y: 100,
        fill: '#2c3e50'
      },
      {
        type: 'rect',
        x: 100,
        y: 130,
        width: 60,
        height: 40,
        fill: '#ecf0f1',
        stroke: '#3498db',
        strokeWidth: 2
      },
      {
        type: 'text',
        text: 'Rectangle',
        fontSize: 12,
        x: 110,
        y: 180,
        fill: '#2c3e50'
      },
      {
        type: 'circle',
        x: 200,
        y: 150,
        radius: 20,
        fill: '#ecf0f1',
        stroke: '#e74c3c',
        strokeWidth: 2
      },
      {
        type: 'text',
        text: 'Circle',
        fontSize: 12,
        x: 190,
        y: 180,
        fill: '#2c3e50'
      }
    ]
  },
  {
    id: 'math-algebra',
    name: 'Algebra Template',
    preview: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&h=150&fit=crop',
    category: 'math',
    icon: FaCalculator,
    elements: [
      {
        type: 'text',
        text: 'ALGEBRA',
        fontSize: 28,
        fontWeight: 'bold',
        x: 50,
        y: 50,
        fill: '#8e44ad'
      },
      {
        type: 'text',
        text: 'Solve for x:',
        fontSize: 16,
        x: 50,
        y: 100,
        fill: '#2c3e50'
      },
      {
        type: 'text',
        text: '1. 2x + 5 = 13',
        fontSize: 16,
        x: 50,
        y: 130,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: '2. 3x - 7 = 14',
        fontSize: 16,
        x: 50,
        y: 160,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: '3. x² + 4x = 0',
        fontSize: 16,
        x: 50,
        y: 190,
        fill: '#34495e'
      },
      {
        type: 'text',
        text: '4. 2(x + 3) = 10',
        fontSize: 16,
        x: 50,
        y: 220,
        fill: '#34495e'
      }
    ]
  },
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
