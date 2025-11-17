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
  },
  // Science Templates (1-5)
  {
    id: 'science-template-1',
    name: 'Science Template 1',
    preview: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=150&fit=crop',
    category: 'science',
    icon: FaFlask,
    isMultiPage: true,
    fileName: 'science-template-1',
    description: 'Science lesson template with comprehensive content'
  },
  {
    id: 'science-template-2',
    name: 'Science Template 2',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=150&fit=crop',
    category: 'science',
    icon: FaMicroscope,
    isMultiPage: true,
    fileName: 'science-template-2',
    description: 'Science lesson template with detailed sections'
  },
  {
    id: 'science-template-3',
    name: 'Science Template 3',
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop',
    category: 'science',
    icon: FaRocket,
    isMultiPage: true,
    fileName: 'science-template-3',
    description: 'Science lesson template with interactive elements'
  },
  {
    id: 'science-template-4',
    name: 'Science Template 4',
    preview: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop',
    category: 'science',
    icon: FaAtom,
    isMultiPage: true,
    fileName: 'science-template-4',
    description: 'Science lesson template with visual aids'
  },
  {
    id: 'science-template-5',
    name: 'Science Template 5',
    preview: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&h=150&fit=crop',
    category: 'science',
    icon: FaDna,
    isMultiPage: true,
    fileName: 'science-template-5',
    description: 'Science lesson template with comprehensive layout'
  },
  // English Templates (1-5)
  {
    id: 'english-template-1',
    name: 'English Template 1',
    preview: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaBook,
    isMultiPage: true,
    fileName: 'english-template-1',
    description: 'English lesson template with comprehensive content'
  },
  {
    id: 'english-template-2',
    name: 'English Template 2',
    preview: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaLanguage,
    isMultiPage: true,
    fileName: 'english-template-2',
    description: 'English lesson template with detailed sections'
  },
  {
    id: 'english-template-3',
    name: 'English Template 3',
    preview: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaBook,
    isMultiPage: true,
    fileName: 'english-template-3',
    description: 'English lesson template with interactive elements'
  },
  {
    id: 'english-template-4',
    name: 'English Template 4',
    preview: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaLanguage,
    isMultiPage: true,
    fileName: 'english-template-4',
    description: 'English lesson template with visual aids'
  },
  {
    id: 'english-template-5',
    name: 'English Template 5',
    preview: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaBook,
    isMultiPage: true,
    fileName: 'english-template-5',
    description: 'English lesson template with comprehensive layout'
  },
  // Quick single-page templates - following multi-page design principles
  {
    id: 'math-problem-template',
    name: 'Math Problem',
    preview: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=150&fit=crop',
    category: 'math',
    icon: FaCalculator,
    isMultiPage: false,
    elements: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        fill: '#f5f5f5',
        stroke: 'transparent',
        strokeWidth: 0
      },
      {
        type: 'text',
        text: 'MATH PROBLEM',
        fontSize: 72,
        fontWeight: 'bold',
        x: 150,
        y: 150,
        fill: '#1976d2',
        shadowEnabled: true,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowColor: 'rgba(0,0,0,0.2)'
      },
      {
        type: 'text',
        text: 'Problem #1',
        fontSize: 36,
        fontWeight: 'bold',
        x: 150,
        y: 280,
        fill: '#333333'
      },
      {
        type: 'text',
        text: 'Solve the following equation:',
        fontSize: 24,
        x: 150,
        y: 360,
        fill: '#555555'
      },
      {
        type: 'rect',
        x: 140,
        y: 420,
        width: 800,
        height: 120,
        fill: '#ffffff',
        stroke: '#1976d2',
        strokeWidth: 3,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: '2x + 5 = 15',
        fontSize: 48,
        fontWeight: 'bold',
        x: 150,
        y: 450,
        fill: '#1976d2'
      },
      {
        type: 'text',
        text: 'Solution:',
        fontSize: 28,
        fontWeight: '600',
        x: 150,
        y: 600,
        fill: '#333333'
      },
      {
        type: 'rect',
        x: 140,
        y: 650,
        width: 1200,
        height: 300,
        fill: '#f9f9f9',
        stroke: '#e0e0e0',
        strokeWidth: 2,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: 'Show your work here...',
        fontSize: 20,
        x: 160,
        y: 680,
        fill: '#999999',
        fontStyle: 'italic'
      }
    ],
    description: 'Professional math problem template with solution space'
  },
  {
    id: 'reading-comprehension-template',
    name: 'Reading Comprehension',
    preview: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaBook,
    isMultiPage: false,
    elements: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        fill: '#ffffff',
        stroke: 'transparent',
        strokeWidth: 0
      },
      {
        type: 'text',
        text: 'READING COMPREHENSION',
        fontSize: 64,
        fontWeight: 'bold',
        x: 150,
        y: 100,
        fill: '#2980b9',
        shadowEnabled: true,
        shadowBlur: 8,
        shadowOffsetX: 0,
        shadowOffsetY: 3,
        shadowColor: 'rgba(0,0,0,0.15)'
      },
      {
        type: 'text',
        text: 'Read the passage carefully and answer the questions below.',
        fontSize: 22,
        x: 150,
        y: 220,
        fill: '#555555'
      },
      {
        type: 'rect',
        x: 140,
        y: 280,
        width: 1640,
        height: 400,
        fill: '#f8f9fa',
        stroke: '#2980b9',
        strokeWidth: 2,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: 'Passage:',
        fontSize: 24,
        fontWeight: '600',
        x: 160,
        y: 310,
        fill: '#2980b9'
      },
      {
        type: 'text',
        text: '[Insert your reading passage here. Make sure it is clear and well-formatted for students to read and understand.]',
        fontSize: 20,
        x: 160,
        y: 360,
        fill: '#333333',
        width: 1600,
        lineHeight: 1.6
      },
      {
        type: 'text',
        text: 'Questions:',
        fontSize: 32,
        fontWeight: 'bold',
        x: 150,
        y: 750,
        fill: '#2c3e50'
      },
      {
        type: 'rect',
        x: 140,
        y: 800,
        width: 1640,
        height: 200,
        fill: '#ffffff',
        stroke: '#e0e0e0',
        strokeWidth: 1,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: '1. Question one goes here...',
        fontSize: 20,
        x: 160,
        y: 830,
        fill: '#333333'
      }
    ],
    description: 'Professional reading comprehension template with passage and question areas'
  },
  {
    id: 'vocabulary-flashcard-template',
    name: 'Vocabulary Flashcard',
    preview: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=150&fit=crop',
    category: 'english',
    icon: FaBook,
    isMultiPage: false,
    elements: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        fill: '#e8f4f8',
        stroke: 'transparent',
        strokeWidth: 0
      },
      {
        type: 'rect',
        x: 360,
        y: 200,
        width: 1200,
        height: 680,
        fill: '#ffffff',
        stroke: '#3498db',
        strokeWidth: 4,
        cornerRadius: 16,
        shadowEnabled: true,
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowOffsetY: 8,
        shadowColor: 'rgba(0,0,0,0.2)'
      },
      {
        type: 'text',
        text: 'VOCABULARY',
        fontSize: 48,
        fontWeight: 'bold',
        x: 960,
        y: 280,
        fill: '#2980b9',
        align: 'center'
      },
      {
        type: 'text',
        text: 'Word',
        fontSize: 72,
        fontWeight: 'bold',
        x: 960,
        y: 380,
        fill: '#2c3e50',
        align: 'center',
        shadowEnabled: true,
        shadowBlur: 5,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        shadowColor: 'rgba(0,0,0,0.1)'
      },
      {
        type: 'rect',
        x: 400,
        y: 500,
        width: 1120,
        height: 120,
        fill: '#ecf0f1',
        stroke: '#3498db',
        strokeWidth: 2,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: 'Definition:',
        fontSize: 24,
        fontWeight: '600',
        x: 400,
        y: 520,
        fill: '#2980b9'
      },
      {
        type: 'text',
        text: '[Enter the definition here]',
        fontSize: 22,
        x: 400,
        y: 560,
        fill: '#555555'
      },
      {
        type: 'text',
        text: 'Example:',
        fontSize: 24,
        fontWeight: '600',
        x: 400,
        y: 680,
        fill: '#2980b9'
      },
      {
        type: 'rect',
        x: 400,
        y: 720,
        width: 1120,
        height: 100,
        fill: '#ffffff',
        stroke: '#bdc3c7',
        strokeWidth: 1,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: '[Enter an example sentence here]',
        fontSize: 20,
        x: 420,
        y: 750,
        fill: '#7f8c8d',
        fontStyle: 'italic'
      }
    ],
    description: 'Professional vocabulary flashcard template with definition and example'
  },
  {
    id: 'science-experiment-template',
    name: 'Science Experiment',
    preview: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=150&fit=crop',
    category: 'science',
    icon: FaFlask,
    isMultiPage: false,
    elements: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        fill: '#f0f4f8',
        stroke: 'transparent',
        strokeWidth: 0
      },
      {
        type: 'text',
        text: 'SCIENCE EXPERIMENT',
        fontSize: 64,
        fontWeight: 'bold',
        x: 150,
        y: 100,
        fill: '#27ae60',
        shadowEnabled: true,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowColor: 'rgba(0,0,0,0.2)'
      },
      {
        type: 'text',
        text: 'Experiment Title',
        fontSize: 40,
        fontWeight: 'bold',
        x: 150,
        y: 220,
        fill: '#2c3e50'
      },
      {
        type: 'rect',
        x: 140,
        y: 300,
        width: 800,
        height: 180,
        fill: '#ffffff',
        stroke: '#27ae60',
        strokeWidth: 3,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: 'Objective:',
        fontSize: 28,
        fontWeight: 'bold',
        x: 160,
        y: 330,
        fill: '#27ae60'
      },
      {
        type: 'text',
        text: '[State the purpose of this experiment]',
        fontSize: 22,
        x: 160,
        y: 380,
        fill: '#555555',
        width: 760
      },
      {
        type: 'rect',
        x: 140,
        y: 520,
        width: 800,
        height: 200,
        fill: '#ffffff',
        stroke: '#27ae60',
        strokeWidth: 3,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: 'Materials:',
        fontSize: 28,
        fontWeight: 'bold',
        x: 160,
        y: 550,
        fill: '#27ae60'
      },
      {
        type: 'text',
        text: '• Material 1\n• Material 2\n• Material 3',
        fontSize: 22,
        x: 160,
        y: 600,
        fill: '#333333',
        width: 760,
        lineHeight: 1.8
      },
      {
        type: 'rect',
        x: 1000,
        y: 300,
        width: 780,
        height: 420,
        fill: '#ffffff',
        stroke: '#27ae60',
        strokeWidth: 3,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: 'Procedure:',
        fontSize: 28,
        fontWeight: 'bold',
        x: 1020,
        y: 330,
        fill: '#27ae60'
      },
      {
        type: 'text',
        text: '1. Step one\n2. Step two\n3. Step three',
        fontSize: 22,
        x: 1020,
        y: 380,
        fill: '#333333',
        width: 740,
        lineHeight: 1.8
      },
      {
        type: 'rect',
        x: 140,
        y: 760,
        width: 1640,
        height: 240,
        fill: '#ffffff',
        stroke: '#27ae60',
        strokeWidth: 3,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: 'Results & Observations:',
        fontSize: 28,
        fontWeight: 'bold',
        x: 160,
        y: 790,
        fill: '#27ae60'
      },
      {
        type: 'text',
        text: '[Record your observations and results here]',
        fontSize: 22,
        x: 160,
        y: 850,
        fill: '#999999',
        fontStyle: 'italic',
        width: 1600
      }
    ],
    description: 'Professional science experiment template with objective, materials, procedure, and results'
  },
  {
    id: 'quiz-question-template',
    name: 'Quiz Question',
    preview: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=200&h=150&fit=crop',
    category: 'assessment',
    icon: FaBook,
    isMultiPage: false,
    elements: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        fill: '#ffffff',
        stroke: 'transparent',
        strokeWidth: 0
      },
      {
        type: 'text',
        text: 'QUIZ QUESTION',
        fontSize: 64,
        fontWeight: 'bold',
        x: 150,
        y: 100,
        fill: '#e74c3c',
        shadowEnabled: true,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowColor: 'rgba(0,0,0,0.2)'
      },
      {
        type: 'rect',
        x: 140,
        y: 220,
        width: 1640,
        height: 200,
        fill: '#fff5f5',
        stroke: '#e74c3c',
        strokeWidth: 3,
        cornerRadius: 8
      },
      {
        type: 'text',
        text: 'Question 1:',
        fontSize: 32,
        fontWeight: 'bold',
        x: 160,
        y: 250,
        fill: '#e74c3c'
      },
      {
        type: 'text',
        text: 'What is the answer to this question?',
        fontSize: 28,
        x: 160,
        y: 310,
        fill: '#2c3e50',
        width: 1600
      },
      {
        type: 'text',
        text: 'Multiple Choice Options:',
        fontSize: 28,
        fontWeight: 'bold',
        x: 150,
        y: 480,
        fill: '#2c3e50'
      },
      {
        type: 'rect',
        x: 140,
        y: 540,
        width: 800,
        height: 80,
        fill: '#ffffff',
        stroke: '#bdc3c7',
        strokeWidth: 2,
        cornerRadius: 8
      },
      {
        type: 'circle',
        x: 180,
        y: 580,
        radius: 15,
        fill: '#ffffff',
        stroke: '#e74c3c',
        strokeWidth: 3
      },
      {
        type: 'text',
        text: 'A) Option A',
        fontSize: 24,
        x: 220,
        y: 575,
        fill: '#2c3e50'
      },
      {
        type: 'rect',
        x: 140,
        y: 640,
        width: 800,
        height: 80,
        fill: '#ffffff',
        stroke: '#bdc3c7',
        strokeWidth: 2,
        cornerRadius: 8
      },
      {
        type: 'circle',
        x: 180,
        y: 680,
        radius: 15,
        fill: '#ffffff',
        stroke: '#e74c3c',
        strokeWidth: 3
      },
      {
        type: 'text',
        text: 'B) Option B',
        fontSize: 24,
        x: 220,
        y: 675,
        fill: '#2c3e50'
      },
      {
        type: 'rect',
        x: 1000,
        y: 540,
        width: 780,
        height: 80,
        fill: '#ffffff',
        stroke: '#bdc3c7',
        strokeWidth: 2,
        cornerRadius: 8
      },
      {
        type: 'circle',
        x: 1040,
        y: 580,
        radius: 15,
        fill: '#ffffff',
        stroke: '#e74c3c',
        strokeWidth: 3
      },
      {
        type: 'text',
        text: 'C) Option C',
        fontSize: 24,
        x: 1080,
        y: 575,
        fill: '#2c3e50'
      },
      {
        type: 'rect',
        x: 1000,
        y: 640,
        width: 780,
        height: 80,
        fill: '#ffffff',
        stroke: '#bdc3c7',
        strokeWidth: 2,
        cornerRadius: 8
      },
      {
        type: 'circle',
        x: 1040,
        y: 680,
        radius: 15,
        fill: '#ffffff',
        stroke: '#e74c3c',
        strokeWidth: 3
      },
      {
        type: 'text',
        text: 'D) Option D',
        fontSize: 24,
        x: 1080,
        y: 675,
        fill: '#2c3e50'
      }
    ],
    description: 'Professional quiz question template with multiple choice options'
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
      
      // First, try to get template data from embedded data
      let templateData = TEMPLATE_DATA[templateName];
      
      // If not found in embedded data, try to fetch from /templates/ directory
      if (!templateData) {
        console.log(`Template "${templateName}" not found in TEMPLATE_DATA, trying to fetch from /templates/`);
        try {
          const response = await fetch(`/templates/${templateName}.json`);
          if (response.ok) {
            templateData = await response.json();
            console.log(`Successfully loaded template from /templates/${templateName}.json`);
          } else {
            console.error(`Failed to fetch template: ${response.status} ${response.statusText}`);
            throw new Error(`Template file not found: ${templateName}.json`);
          }
        } catch (fetchError) {
          console.error(`Error fetching template from /templates/:`, fetchError);
          console.error(`Template "${templateName}" not found in TEMPLATE_DATA or /templates/`);
          console.log('Available templates in TEMPLATE_DATA:', Object.keys(TEMPLATE_DATA));
          alert(`Error: Template "${templateName}" not found. Please contact support.`);
          return;
        }
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

      // Add template elements with all properties
      template.elements.forEach(element => {
        try {
          if (element.type === 'text') {
            const textElement = {
              type: 'text',
              text: element.text,
              fontSize: element.fontSize,
              fontWeight: element.fontWeight || 'normal',
              x: element.x,
              y: element.y,
              fill: element.fill,
              fontStyle: element.fontStyle,
              align: element.align,
              width: element.width,
              lineHeight: element.lineHeight
            };
            // Add shadow properties if present
            if (element.shadowEnabled) {
              textElement.shadowEnabled = element.shadowEnabled;
              textElement.shadowBlur = element.shadowBlur;
              textElement.shadowOffsetX = element.shadowOffsetX;
              textElement.shadowOffsetY = element.shadowOffsetY;
              textElement.shadowColor = element.shadowColor;
            }
            store.activePage?.addElement(textElement);
          } else if (element.type === 'rect') {
            const rectElement = {
              type: 'rect',
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              fill: element.fill || 'transparent',
              stroke: element.stroke,
              strokeWidth: element.strokeWidth || 0
            };
            // Add corner radius if present
            if (element.cornerRadius !== undefined) {
              rectElement.cornerRadius = element.cornerRadius;
            }
            // Add shadow properties if present
            if (element.shadowEnabled) {
              rectElement.shadowEnabled = element.shadowEnabled;
              rectElement.shadowBlur = element.shadowBlur;
              rectElement.shadowOffsetX = element.shadowOffsetX;
              rectElement.shadowOffsetY = element.shadowOffsetY;
              rectElement.shadowColor = element.shadowColor;
            }
            store.activePage?.addElement(rectElement);
          } else if (element.type === 'circle') {
            const circleElement = {
              type: 'circle',
              x: element.x,
              y: element.y,
              radius: element.radius,
              fill: element.fill || 'transparent',
              stroke: element.stroke,
              strokeWidth: element.strokeWidth || 0
            };
            store.activePage?.addElement(circleElement);
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
