// Firebase integration for the Editor
import { nanoid } from 'nanoid';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5BbeLLvPX8l1c4Lq0f-CmIUml4hQOQlE",
  authDomain: "edutaktika.firebaseapp.com",
  databaseURL: "https://edutaktika-default-rtdb.firebaseio.com",
  projectId: "edutaktika",
  storageBucket: "edutaktika.appspot.com",
  messagingSenderId: "676848575316",
  appId: "1:676848575316:web:f78f8c0f83bf3d9dfb5ec1",
  measurementId: "G-X3GT5TNN87"
};

// Initialize Firebase
let firebase = null;
let db = null;
let auth = null;

const initFirebase = async () => {
  if (firebase) return { firebase, db, auth };
  
  try {
    // Dynamically import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
    const { getDatabase } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
    
    firebase = initializeApp(firebaseConfig);
    db = getDatabase(firebase);
    auth = getAuth(firebase);
    
    return { firebase, db, auth };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

// Get current user
const getCurrentUser = async () => {
  const { auth } = await initFirebase();
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Save lesson to Firebase
export async function saveLessonToFirebase({ 
  storeJSON, 
  preview, 
  name, 
  id, 
  subject, 
  quarter, 
  description = '',
  teacherUID = null,
  section = null
}) {
  try {
    const { db } = await initFirebase();
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const teacherUIDToUse = teacherUID || user.uid;
    
    if (!id) {
      id = nanoid(10);
    }
    
    // Convert preview blob to base64 for Firebase storage
    let previewBase64 = null;
    if (preview) {
      previewBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(preview);
      });
    }
    
    const lessonData = {
      id,
      name,
      description,
      subject,
      quarter,
      storeJSON,
      preview: previewBase64,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      teacherUID: teacherUIDToUse,
      section: section
    };
    
    // Save to Firebase
    const lessonRef = db.ref(`teachers/${teacherUIDToUse}/sections/${section}/lessons/${subject}/quarter-${quarter}/${id}`);
    await lessonRef.set(lessonData);
    
    return { id, status: 'saved' };
  } catch (error) {
    console.error('Error saving lesson to Firebase:', error);
    throw error;
  }
}

// Load lesson from Firebase
export async function loadLessonFromFirebase({ id, teacherUID, section, subject, quarter }) {
  try {
    const { db } = await initFirebase();
    
    const lessonRef = db.ref(`teachers/${teacherUID}/sections/${section}/lessons/${subject}/quarter-${quarter}/${id}`);
    const snapshot = await lessonRef.once('value');
    const lessonData = snapshot.val();
    
    if (!lessonData) {
      throw new Error('Lesson not found');
    }
    
    return {
      storeJSON: lessonData.storeJSON,
      name: lessonData.name,
      description: lessonData.description,
      subject: lessonData.subject,
      quarter: lessonData.quarter,
      preview: lessonData.preview
    };
  } catch (error) {
    console.error('Error loading lesson from Firebase:', error);
    throw error;
  }
}

// List lessons for a specific subject and quarter
export async function listLessonsFromFirebase({ teacherUID, section, subject, quarter }) {
  try {
    const { db } = await initFirebase();
    
    const lessonsRef = db.ref(`teachers/${teacherUID}/sections/${section}/lessons/${subject}/quarter-${quarter}`);
    const snapshot = await lessonsRef.once('value');
    const lessons = snapshot.val();
    
    if (!lessons) {
      return [];
    }
    
    return Object.keys(lessons).map(id => ({
      id,
      ...lessons[id]
    }));
  } catch (error) {
    console.error('Error listing lessons from Firebase:', error);
    return [];
  }
}

// Delete lesson from Firebase
export async function deleteLessonFromFirebase({ id, teacherUID, section, subject, quarter }) {
  try {
    const { db } = await initFirebase();
    
    const lessonRef = db.ref(`teachers/${teacherUID}/sections/${section}/lessons/${subject}/quarter-${quarter}/${id}`);
    await lessonRef.remove();
    
    return { status: 'deleted' };
  } catch (error) {
    console.error('Error deleting lesson from Firebase:', error);
    throw error;
  }
}

// Get lesson parameters from URL
export function getLessonParamsFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    subject: urlParams.get('subject'),
    quarter: urlParams.get('quarter'),
    teacherUID: urlParams.get('teacherUID'),
    section: urlParams.get('section'),
    lessonId: urlParams.get('lessonId'),
    lessonName: urlParams.get('lessonName'),
    description: urlParams.get('description')
  };
}

// Save lesson with current URL parameters
export async function saveLessonWithURLParams({ storeJSON, preview, name, id }) {
  const params = getLessonParamsFromURL();
  
  if (!params.subject || !params.quarter || !params.teacherUID || !params.section) {
    throw new Error('Missing required parameters: subject, quarter, teacherUID, section');
  }
  
  return await saveLessonToFirebase({
    storeJSON,
    preview,
    name: name || params.lessonName || 'Untitled Lesson',
    id,
    subject: params.subject,
    quarter: params.quarter,
    description: params.description || '',
    teacherUID: params.teacherUID,
    section: params.section
  });
}

// Load lesson with current URL parameters
export async function loadLessonWithURLParams({ id }) {
  const params = getLessonParamsFromURL();
  
  if (!params.subject || !params.quarter || !params.teacherUID || !params.section) {
    throw new Error('Missing required parameters: subject, quarter, teacherUID, section');
  }
  
  return await loadLessonFromFirebase({
    id: id || params.lessonId,
    teacherUID: params.teacherUID,
    section: params.section,
    subject: params.subject,
    quarter: params.quarter
  });
}

