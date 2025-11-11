import { nanoid } from 'nanoid';
import { storage } from './storage';
import { supabase, BUCKET_DESIGNS, BUCKET_ASSETS, shouldUseSupabase, BUCKET_LESSON_STORAGE, getSubjectFolder } from './supabase';

/**
 * Supabase API Implementation
 * 
 * This file provides the same interface as api.js but uses Supabase
 * for cloud storage instead of Puter or local storage.
 * 
 * Setup Required:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Create two storage buckets: 'designs' and 'uploads'
 * 3. Set up Row Level Security (RLS) policies as needed
 * 4. Add environment variables to your .env file:
 *    VITE_SUPABASE_URL=your_project_url
 *    VITE_SUPABASE_ANON_KEY=your_anon_key
 */

/**
 * Ensure folder path exists in Supabase Storage
 * In Supabase, folders are created implicitly, but we verify the path exists
 * @param {string} folderPath - Path to check (e.g., "ENGLISH/grade5/quarter1")
 * @param {string} bucket - Bucket name (defaults to BUCKET_LESSON_STORAGE)
 * @returns {Promise<boolean>} - True if path exists or was created, false on error
 */
const ensureFolderExists = async function ensureFolderExists(folderPath, bucket = BUCKET_LESSON_STORAGE) {
  if (!shouldUseSupabase() || !folderPath) {
    return true; // Skip check if not using Supabase or no path
  }

  try {
    // Remove trailing slash if present
    const cleanPath = folderPath.replace(/\/$/, '');
    
    // Check if path exists by listing it
    // If the path exists (even if empty), list() will succeed
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(cleanPath, {
        limit: 1,
        offset: 0
      });

    if (error) {
      // If error is "not found" or similar, the folder doesn't exist
      // In Supabase, folders are created automatically when you upload a file
      // So we just log and continue - the upload will create the folder structure
      if (error.message && error.message.includes('not found')) {
        console.log(`📁 Folder path "${cleanPath}" doesn't exist yet - will be created on first file upload`);
        return false;
      }
      // Other errors might mean the path structure needs to be created
      console.warn(`⚠️ Could not verify folder path "${cleanPath}":`, error.message);
      return false;
    }

    // Path exists (list succeeded)
    console.log(`✅ Folder path "${cleanPath}" exists`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Error checking folder path "${folderPath}":`, error);
    // Don't throw - we'll try to upload anyway (which will create the folder)
    return false;
  }
};

/**
 * Save file to Supabase Storage or local storage
 * Automatically ensures folder structure exists before uploading
 */
const writeFile = async function writeFile(fileName, data) {
  if (shouldUseSupabase()) {
    try {
      // Extract folder path from filename (everything except the filename)
      const pathParts = fileName.split('/');
      const bucketToUse = fileName.includes('SCIENCE/') || fileName.includes('ENGLISH/') || fileName.includes('MATH/') 
        ? BUCKET_LESSON_STORAGE 
        : BUCKET_DESIGNS;
      
      if (pathParts.length > 1) {
        const folderPath = pathParts.slice(0, -1).join('/');
        // Check if folder exists before uploading
        await ensureFolderExists(folderPath, bucketToUse);
      }

      // Supabase Storage accepts Blobs directly
      const fileData = data instanceof Blob ? data : new Blob([data], { type: 'application/json' });

      console.log(`Uploading to Supabase: bucket="${bucketToUse}", path="${fileName}"`);

      // Upload to Supabase Storage (this will create folder structure if it doesn't exist)
      const { data: uploadData, error } = await supabase.storage
        .from(bucketToUse)
        .upload(fileName, fileData, {
          upsert: true,
          contentType: data instanceof Blob ? data.type : 'application/json'
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      console.log(`✅ Upload successful:`, uploadData);
      return uploadData;
    } catch (error) {
      console.error('Failed to upload to Supabase, falling back to local storage:', error);
      // Fall back to local storage
      await storage.setItem(fileName, data);
    }
  } else {
    await storage.setItem(fileName, data);
  }
};

/**
 * Read file from Supabase Storage or local storage
 */
const readFile = async function readFile(fileName) {
  if (shouldUseSupabase()) {
    try {
      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_DESIGNS)
        .download(fileName);

      if (error) {
        console.error('Supabase download error:', error);
        // Fall back to local storage
        return await storage.getItem(fileName);
      }

      return data;
    } catch (error) {
      console.error('Failed to download from Supabase, falling back to local storage:', error);
      return await storage.getItem(fileName);
    }
  }
  return await storage.getItem(fileName);
};

/**
 * Delete file from Supabase Storage or local storage
 */
const deleteFile = async function deleteFile(fileName) {
  if (shouldUseSupabase()) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_DESIGNS)
        .remove([fileName]);

      if (error) {
        console.error('Supabase delete error:', error);
        // Fall back to local storage
        await storage.removeItem(fileName);
      }
    } catch (error) {
      console.error('Failed to delete from Supabase, falling back to local storage:', error);
      await storage.removeItem(fileName);
    }
  } else {
    return await storage.removeItem(fileName);
  }
};

/**
 * Read key-value pair from Supabase or local storage
 */
const readKv = async function readKv(key) {
  if (shouldUseSupabase()) {
    // For Supabase, we'll store KV pairs in the database
    // This requires setting up a 'designs_metadata' table
    try {
      const { data, error } = await supabase
        .from('designs_metadata')
        .select('value')
        .eq('key', key)
        .maybeSingle(); // Use maybeSingle to avoid errors when not found

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found (expected)
        console.error('Supabase read KV error:', error);
        return await storage.getItem(key);
      }

      return data?.value;
    } catch (error) {
      console.error('Failed to read from Supabase, falling back to local storage:', error);
      return await storage.getItem(key);
    }
  } else {
    return await storage.getItem(key);
  }
};

/**
 * Write key-value pair to Supabase or local storage
 */
const writeKv = async function writeKv(key, value) {
  if (shouldUseSupabase()) {
    try {
      const { error } = await supabase
        .from('designs_metadata')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) {
        console.error('Supabase write KV error:', error);
        return await storage.setItem(key, value);
      }
    } catch (error) {
      console.error('Failed to write to Supabase, falling back to local storage:', error);
      return await storage.setItem(key, value);
    }
  } else {
    return await storage.setItem(key, value);
  }
};

/**
 * Back up local designs to Supabase
 */
export async function backupFromLocalToCloud() {
  const localDesigns = (await storage.getItem('designs-list')) || [];
  for (const design of localDesigns) {
    const storeJSON = await storage.getItem(`designs/${design.id}.json`);
    const preview = await storage.getItem(`designs/${design.id}.jpg`);
    await writeFile(`designs/${design.id}.json`, storeJSON);
    await writeFile(`designs/${design.id}.jpg`, preview);
  }
  const cloudDesigns = (await readKv('designs-list')) || [];
  cloudDesigns.push(...localDesigns);
  await writeKv('designs-list', cloudDesigns);
  await storage.removeItem('designs-list');
  for (const design of localDesigns) {
    await storage.removeItem(`designs/${design.id}.json`);
    await storage.removeItem(`designs/${design.id}.jpg`);
  }
  return cloudDesigns.length;
}

/**
 * List all designs
 */
export async function listDesigns() {
  return (await readKv('designs-list')) || [];
}

/**
 * Delete a design
 */
export async function deleteDesign({ id }) {
  const list = await listDesigns();
  const newList = list.filter((design) => design.id !== id);
  await writeKv('designs-list', newList);
  await deleteFile(`designs/${id}.json`);
  await deleteFile(`designs/${id}.jpg`);
}

/**
 * Load a design by ID
 */
export async function loadById({ id }) {
  let storeJSON = await readFile(`designs/${id}.json`);
  const list = await listDesigns();
  const design = list.find((design) => design.id === id);
  
  // if it is blob, convert to JSON
  if (storeJSON instanceof Blob) {
    storeJSON = JSON.parse(await storeJSON.text());
  } else if (typeof storeJSON === 'string') {
    storeJSON = JSON.parse(storeJSON);
  }

  return { storeJSON, name: design?.name };
}

/**
 * Save a design (main function)
 */
export async function saveDesign({ storeJSON, preview, name, id }) {
  console.log('saving to Supabase');
  if (!id) {
    id = nanoid(10);
  }

  const previewPath = `designs/${id}.jpg`;
  const storePath = `designs/${id}.json`;

  await writeFile(previewPath, preview);
  console.log('preview saved to Supabase');
  await writeFile(storePath, JSON.stringify(storeJSON));

  let list = await listDesigns();
  const existing = list.find((design) => design.id === id);
  if (existing) {
    existing.name = name;
  } else {
    list.push({ id, name });
  }

  await writeKv('designs-list', list);
  return { id, status: 'saved' };
}

/**
 * Get preview URL
 */
export const getPreview = async ({ id }) => {
  const preview = await readFile(`designs/${id}.jpg`);
  
  if (shouldUseSupabase()) {
    // Return public URL from Supabase
    try {
      const { data } = supabase.storage
        .from(BUCKET_DESIGNS)
        .getPublicUrl(`designs/${id}.jpg`);
      return data.publicUrl;
    } catch (error) {
      return URL.createObjectURL(preview);
    }
  }
  
  return URL.createObjectURL(preview);
};

/**
 * List all assets
 */
export const listAssets = async () => {
  const list = (await readKv('assets-list')) || [];
  for (const asset of list) {
    asset.src = await getAssetSrc({ id: asset.id });
    asset.preview = await getAssetPreviewSrc({ id: asset.id });
  }
  return list;
};

/**
 * Get asset source URL
 */
export const getAssetSrc = async ({ id }) => {
  if (shouldUseSupabase()) {
    try {
      const { data } = supabase.storage
        .from(BUCKET_ASSETS)
        .getPublicUrl(`${id}`);
      return data.publicUrl;
    } catch (error) {
      const file = await readFile(`uploads/${id}`);
      return URL.createObjectURL(file);
    }
  } else {
    const file = await readFile(`uploads/${id}`);
    return URL.createObjectURL(file);
  }
};

/**
 * Get asset preview URL
 */
export const getAssetPreviewSrc = async ({ id }) => {
  if (shouldUseSupabase()) {
    try {
      const { data } = supabase.storage
        .from(BUCKET_ASSETS)
        .getPublicUrl(`${id}-preview`);
      return data.publicUrl;
    } catch (error) {
      const file = await readFile(`uploads/${id}-preview`);
      console.log('file', file);
      return URL.createObjectURL(file);
    }
  } else {
    const file = await readFile(`uploads/${id}-preview`);
    console.log('file', file);
    return URL.createObjectURL(file);
  }
};

/**
 * Upload an asset
 */
export const uploadAsset = async ({ file, preview, type }) => {
  const list = await listAssets();
  const id = nanoid(10);
  await writeFile(`uploads/${id}`, file);
  await writeFile(`uploads/${id}-preview`, preview);
  list.push({ id, type });
  await writeKv('assets-list', list);

  const src = await getAssetSrc({ id });
  const previewSrc = await getAssetPreviewSrc({ id });
  return { id, src, preview: previewSrc };
};

/**
 * Delete an asset
 */
export const deleteAsset = async ({ id }) => {
  const list = await listAssets();
  const newList = list.filter((asset) => asset.id !== id);
  await writeKv('assets-list', newList);
};

// ============================================================================
// SUBJECT-AWARE FUNCTIONS FOR LESSON STORAGE
// ============================================================================

/**
 * Save a design to a specific subject folder (SCIENCE, ENGLISH, MATH)
 * @param {Object} params - Design parameters
 * @param {Object} params.storeJSON - Design data
 * @param {Blob} params.preview - Preview image
 * @param {string} params.name - Design name
 * @param {string} params.subject - Subject name (science, english, math)
 * @param {string} [params.quarter] - Optional quarter number
 * @param {string} [params.id] - Optional design ID
 */
export async function saveDesignBySubject({ storeJSON, preview, name, subject, quarter, id }) {
  console.log(`💾 Saving to Supabase - Subject: "${subject}", Quarter: "${quarter}"`);
  if (!id) {
    id = nanoid(10);
  }
  
  // Validate subject and quarter
  if (!subject) {
    console.error('❌ Error: No subject provided!');
    throw new Error('Subject is required');
  }
  
  if (!quarter) {
    console.error('❌ Error: No quarter provided!');
    throw new Error('Quarter is required');
  }

  const subjectFolder = getSubjectFolder(subject);
  console.log(`📁 Subject: "${subject}" → Folder: "${subjectFolder}"`);
  
  if (!subjectFolder) {
    console.error(`❌ Error: Subject "${subject}" could not be mapped to a folder!`);
    throw new Error(`Invalid subject: ${subject}. Must be one of: science, english, math`);
  }
  
  // Try to get teacher's grade level from Firebase or sessionStorage
  let gradeLevel = null;
  
  // First try sessionStorage (from when Editor was opened from subject page)
  try {
    const storedGrade = sessionStorage.getItem('supabase-design-grade');
    if (storedGrade) {
      gradeLevel = storedGrade;
      console.log(`📚 Found grade level from sessionStorage: ${gradeLevel}`);
    }
  } catch (error) {
    console.warn('Could not read grade from sessionStorage:', error);
  }
  
  // If not in sessionStorage, try Firebase
  if (!gradeLevel) {
    try {
      // Dynamically import Firebase if available
      if (typeof window !== 'undefined' && window.firebase) {
        const user = window.firebase.auth().currentUser;
        if (user) {
          const teacherSnap = await window.firebase.database().ref('teachers/' + user.uid).once('value');
          const teacher = teacherSnap.val();
          if (teacher && teacher.gradelevel) {
            const grade = teacher.gradelevel.toString();
            gradeLevel = grade.startsWith('grade') ? grade : `grade${grade}`;
            console.log(`📚 Found teacher grade level from Firebase: ${teacher.gradelevel} → normalized: ${gradeLevel}`);
            
            // Store it in sessionStorage for future use
            try {
              sessionStorage.setItem('supabase-design-grade', gradeLevel);
            } catch (error) {
              console.warn('Could not store grade in sessionStorage:', error);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not fetch grade level from Firebase:', error);
    }
  }
  
  // Build paths with grade if available: subject/gradeX/quarterX/id.json
  const quarterFolder = `quarter${quarter}`;
  let previewPath, storePath;
  
  // Always try to use grade-based structure for better organization
  // If gradeLevel is not found, try to get it from URL params or default to a generic location
  if (!gradeLevel) {
    // Try to get from URL parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlGrade = urlParams.get('grade');
      if (urlGrade) {
        gradeLevel = urlGrade.startsWith('grade') ? urlGrade : `grade${urlGrade}`;
        console.log(`📚 Found grade level from URL params: ${gradeLevel}`);
      }
    } catch (error) {
      console.warn('Could not read grade from URL:', error);
    }
  }
  
  if (gradeLevel) {
    previewPath = `${subjectFolder}/${gradeLevel}/${quarterFolder}/${id}.jpg`;
    storePath = `${subjectFolder}/${gradeLevel}/${quarterFolder}/${id}.json`;
    console.log(`✅ Using grade-based path structure: ${gradeLevel}/${quarterFolder}/`);
  } else {
    // Fallback to old structure without grade (but log a warning)
    previewPath = `${subjectFolder}/${quarterFolder}/${id}.jpg`;
    storePath = `${subjectFolder}/${quarterFolder}/${id}.json`;
    console.warn(`⚠️ No grade level found! Saving to: ${subjectFolder}/${quarterFolder}/`);
    console.warn(`💡 Tip: Grade level helps organize designs. Make sure teacher's grade level is set in Firebase.`);
  }
  
  console.log(`📤 Upload paths: preview="${previewPath}", design="${storePath}"`);

  // Ensure folder structure exists before uploading
  const previewFolder = previewPath.split('/').slice(0, -1).join('/');
  const designFolder = storePath.split('/').slice(0, -1).join('/');
  
  console.log(`📁 Checking folder structure...`);
  if (previewFolder) {
    await ensureFolderExists(previewFolder, BUCKET_LESSON_STORAGE);
  }
  if (designFolder && designFolder !== previewFolder) {
    await ensureFolderExists(designFolder, BUCKET_LESSON_STORAGE);
  }

  await writeFile(previewPath, preview);
  console.log(`✅ Preview saved to Supabase: ${previewPath}`);
  await writeFile(storePath, JSON.stringify(storeJSON));
  console.log(`✅ Design saved to Supabase: ${storePath}`);

  let list = await listDesigns();
  const existing = list.find((design) => design.id === id);
  if (existing) {
    existing.name = name;
    existing.subject = subject;
    existing.quarter = quarter;
  } else {
    list.push({ id, name, subject, quarter });
  }

  await writeKv('designs-list', list);
  return { id, status: 'saved', subject, quarter };
}

/**
 * Load a design by ID and subject
 * @param {Object} params - Load parameters
 * @param {string} params.id - Design ID
 * @param {string} params.subject - Subject name (science, english, math)
 */
export async function loadByIdAndSubject({ id, subject }) {
  const subjectFolder = getSubjectFolder(subject);
  let storeJSON = await readFile(`${subjectFolder}/${id}.json`);
  
  // if it is blob, convert to JSON
  if (storeJSON instanceof Blob) {
    storeJSON = JSON.parse(await storeJSON.text());
  } else if (typeof storeJSON === 'string') {
    storeJSON = JSON.parse(storeJSON);
  }

  return { storeJSON, subject };
}

/**
 * Delete a design from a specific subject folder
 * @param {Object} params - Delete parameters
 * @param {string} params.id - Design ID
 * @param {string} params.subject - Subject name (science, english, math)
 */
export async function deleteDesignBySubject({ id, subject }) {
  const subjectFolder = getSubjectFolder(subject);
  const list = await listDesigns();
  const newList = list.filter((design) => design.id !== id);
  await writeKv('designs-list', newList);
  await deleteFile(`${subjectFolder}/${id}.json`);
  await deleteFile(`${subjectFolder}/${id}.jpg`);
}

/**
 * Get preview URL for a design in a specific subject folder
 * @param {Object} params - Preview parameters
 * @param {string} params.id - Design ID
 * @param {string} params.subject - Subject name (science, english, math)
 */
export const getPreviewBySubject = async ({ id, subject }) => {
  const subjectFolder = getSubjectFolder(subject);
  const preview = await readFile(`${subjectFolder}/${id}.jpg`);
  
  if (shouldUseSupabase()) {
    try {
      const { data } = supabase.storage
        .from(BUCKET_LESSON_STORAGE)
        .getPublicUrl(`${subjectFolder}/${id}.jpg`);
      return data.publicUrl;
    } catch (error) {
      return URL.createObjectURL(preview);
    }
  }
  
  return URL.createObjectURL(preview);
};

/**
 * List all files in a specific subject folder
 * @param {string} subject - Subject name (science, english, math)
 */
export async function listDesignsBySubject(subject) {
  const subjectFolder = getSubjectFolder(subject);
  
  if (shouldUseSupabase()) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_LESSON_STORAGE)
        .list(subjectFolder, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error('Error listing files:', error);
        return [];
      }

      // Filter out folders and return file names
      return data
        .filter(file => file.name !== null)
        .map(file => ({
          name: file.name,
          id: file.name.replace(/\.(json|jpg)$/, ''),
          type: file.name.endsWith('.json') ? 'json' : 'image',
        }));
    } catch (error) {
      console.error('Failed to list files from Supabase:', error);
      return [];
    }
  }
  
  return [];
}
