/**
 * Utility to get the current user's grade level from Firebase
 * This ensures the editor always has access to the teacher's grade level
 * for proper file organization in R2 storage.
 */

/**
 * Get the current user's grade level from Firebase
 * @returns {Promise<string|null>} Grade level (e.g., "grade5", "grade6") or null if not found
 */
export async function getUserGradeLevel() {
  try {
    console.log('🔍 [getUserGradeLevel] Starting grade level fetch...');
    
    // Check if Firebase is available
    if (typeof window === 'undefined') {
      console.error('❌ [getUserGradeLevel] Window object not available');
      return null;
    }
    
    if (!window.firebase) {
      console.error('❌ [getUserGradeLevel] Firebase not available in window.firebase');
      console.log('💡 [getUserGradeLevel] Available window properties:', Object.keys(window).filter(k => k.includes('firebase') || k.includes('Firebase')));
      return null;
    }
    
    console.log('✅ [getUserGradeLevel] Firebase found in window.firebase');
    
    // Check if auth is available
    if (!window.firebase.auth) {
      console.error('❌ [getUserGradeLevel] Firebase auth not available');
      return null;
    }
    
    // Wait for auth state to be ready (Firebase might still be initializing)
    let user = window.firebase.auth().currentUser;
    
    // If no current user, wait a bit for auth state to initialize
    if (!user) {
      console.log('⏳ [getUserGradeLevel] No current user, waiting for auth state...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      user = window.firebase.auth().currentUser;
    }
    
    if (!user) {
      console.warn('⚠️ [getUserGradeLevel] No authenticated user found');
      console.log('💡 [getUserGradeLevel] Make sure you are logged in to Firebase');
      return null;
    }
    
    console.log('✅ [getUserGradeLevel] Authenticated user found:', user.uid);
    
    // Check if database is available
    if (!window.firebase.database) {
      console.error('❌ [getUserGradeLevel] Firebase database not available');
      return null;
    }
    
    console.log('📡 [getUserGradeLevel] Fetching teacher data from Firebase...');
    
    // Fetch teacher data from Firebase
    const teacherSnap = await window.firebase.database().ref('teachers/' + user.uid).once('value');
    const teacher = teacherSnap.val();

    if (!teacher) {
      console.warn('⚠️ [getUserGradeLevel] Teacher data not found for user:', user.uid);
      console.log('💡 [getUserGradeLevel] Path checked: teachers/' + user.uid);
      return null;
    }

    console.log('✅ [getUserGradeLevel] Teacher data found:', teacher);

    if (!teacher.gradelevel) {
      console.warn('⚠️ [getUserGradeLevel] Grade level not set in teacher profile');
      console.log('💡 [getUserGradeLevel] Teacher data:', Object.keys(teacher));
      return null;
    }

    // Normalize grade level format (e.g., "5" -> "grade5", "grade5" -> "grade5")
    const grade = teacher.gradelevel.toString();
    const normalizedGrade = grade.startsWith('grade') ? grade : `grade${grade}`;

    console.log(`✅ [getUserGradeLevel] Found teacher grade level: ${teacher.gradelevel} → normalized: ${normalizedGrade}`);
    return normalizedGrade;
  } catch (error) {
    console.error('❌ [getUserGradeLevel] Error fetching user grade level:', error);
    console.error('❌ [getUserGradeLevel] Error stack:', error.stack);
    return null;
  }
}

/**
 * Get grade level with fallback to sessionStorage and URL params
 * Priority: Firebase > sessionStorage > URL params
 * @returns {Promise<string|null>} Grade level or null if not found
 */
export async function getUserGradeLevelWithFallback() {
  console.log('🔍 [getUserGradeLevelWithFallback] Starting fallback chain...');
  
  // Try Firebase first (most reliable)
  console.log('1️⃣ [getUserGradeLevelWithFallback] Trying Firebase...');
  let gradeLevel = await getUserGradeLevel();
  
  if (gradeLevel) {
    console.log('✅ [getUserGradeLevelWithFallback] Got grade level from Firebase:', gradeLevel);
    // Store in sessionStorage for future use
    try {
      sessionStorage.setItem('supabase-design-grade', gradeLevel);
      console.log('💾 [getUserGradeLevelWithFallback] Stored in sessionStorage');
    } catch (error) {
      console.warn('⚠️ [getUserGradeLevelWithFallback] Could not store grade in sessionStorage:', error);
    }
    return gradeLevel;
  }

  // Fallback to sessionStorage
  console.log('2️⃣ [getUserGradeLevelWithFallback] Trying sessionStorage...');
  try {
    const storedGrade = sessionStorage.getItem('supabase-design-grade');
    if (storedGrade) {
      console.log(`✅ [getUserGradeLevelWithFallback] Found grade level from sessionStorage: ${storedGrade}`);
      return storedGrade;
    } else {
      console.log('⚠️ [getUserGradeLevelWithFallback] No grade level in sessionStorage');
    }
  } catch (error) {
    console.warn('⚠️ [getUserGradeLevelWithFallback] Could not read grade from sessionStorage:', error);
  }

  // Fallback to URL params
  console.log('3️⃣ [getUserGradeLevelWithFallback] Trying URL params...');
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlGrade = urlParams.get('grade');
    if (urlGrade) {
      const normalizedGrade = urlGrade.startsWith('grade') ? urlGrade : `grade${urlGrade}`;
      console.log(`✅ [getUserGradeLevelWithFallback] Found grade level from URL params: ${normalizedGrade}`);
      return normalizedGrade;
    } else {
      console.log('⚠️ [getUserGradeLevelWithFallback] No grade parameter in URL');
      console.log('💡 [getUserGradeLevelWithFallback] Current URL:', window.location.href);
    }
  } catch (error) {
    console.warn('⚠️ [getUserGradeLevelWithFallback] Could not read grade from URL:', error);
  }

  console.error('❌ [getUserGradeLevelWithFallback] Grade level not found in any source!');
  return null;
}

