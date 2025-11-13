import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';

// Supabase configuration
// ⚠️ Use environment variables - never hardcode keys in source code!
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage bucket configuration
// LessonStorage bucket with SCIENCE, ENGLISH, MATH folders
export const BUCKET_LESSON_STORAGE = 'LessonStorage'; // Main public bucket
export const FOLDER_SCIENCE = 'SCIENCE';
export const FOLDER_ENGLISH = 'ENGLISH';
export const FOLDER_MATH = 'MATH';

// For backward compatibility with existing code
export const BUCKET_DESIGNS = BUCKET_LESSON_STORAGE;
export const BUCKET_ASSETS = BUCKET_LESSON_STORAGE;

// Subject folder mapping helper
export const getSubjectFolder = (subject) => {
  if (!subject) return '';
  
  // Normalize subject name - handle both "math" and "subject_math" formats
  let normalized = subject.toLowerCase();
  if (normalized.startsWith('subject_')) {
    normalized = normalized.replace('subject_', '');
  }
  
  const folders = {
    science: FOLDER_SCIENCE,
    english: FOLDER_ENGLISH,
    math: FOLDER_MATH
  };
  
  const folder = folders[normalized];
  console.log(`📁 getSubjectFolder: "${subject}" → normalized: "${normalized}" → folder: "${folder}"`);
  return folder || '';
};

// Check if Supabase is properly configured
const shouldUseSupabase = () => {
  return SUPABASE_URL && SUPABASE_ANON_KEY && 
         SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && 
         SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE';
};

export { shouldUseSupabase };
