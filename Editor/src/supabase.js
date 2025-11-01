import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';

// Supabase configuration
// Your actual Supabase credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://liiwqyodlzivzzethyrj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaXdxeW9kbHppdnp6ZXRoeXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDY0MTYsImV4cCI6MjA3NzU4MjQxNn0.5sPzjw-DLvZ5bA7NlRF5YdunBD-nOsQ0GC8ALz03sFE';

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
  const folders = {
    science: FOLDER_SCIENCE,
    english: FOLDER_ENGLISH,
    math: FOLDER_MATH
  };
  return folders[subject?.toLowerCase()] || '';
};

// Check if Supabase is properly configured
const shouldUseSupabase = () => {
  return SUPABASE_URL && SUPABASE_ANON_KEY && 
         SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && 
         SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE';
};

export { shouldUseSupabase };
