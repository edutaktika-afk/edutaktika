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
    // Check if Firebase is available
    if (typeof window === 'undefined' || !window.firebase) {
      console.warn('⚠️ Firebase not available in window object');
      return null;
    }

    // Get current user
    const user = window.firebase.auth().currentUser;
    if (!user) {
      console.warn('⚠️ No authenticated user found');
      return null;
    }

    // Fetch teacher data from Firebase
    const teacherSnap = await window.firebase.database().ref('teachers/' + user.uid).once('value');
    const teacher = teacherSnap.val();

    if (!teacher) {
      console.warn('⚠️ Teacher data not found for user:', user.uid);
      return null;
    }

    if (!teacher.gradelevel) {
      console.warn('⚠️ Grade level not set in teacher profile');
      return null;
    }

    // Normalize grade level format (e.g., "5" -> "grade5", "grade5" -> "grade5")
    const grade = teacher.gradelevel.toString();
    const normalizedGrade = grade.startsWith('grade') ? grade : `grade${grade}`;

    console.log(`✅ Found teacher grade level: ${teacher.gradelevel} → normalized: ${normalizedGrade}`);
    return normalizedGrade;
  } catch (error) {
    console.error('❌ Error fetching user grade level:', error);
    return null;
  }
}

/**
 * Get grade level with fallback to sessionStorage and URL params
 * Priority: Firebase > sessionStorage > URL params
 * @returns {Promise<string|null>} Grade level or null if not found
 */
export async function getUserGradeLevelWithFallback() {
  // Try Firebase first (most reliable)
  let gradeLevel = await getUserGradeLevel();
  
  if (gradeLevel) {
    // Store in sessionStorage for future use
    try {
      sessionStorage.setItem('supabase-design-grade', gradeLevel);
    } catch (error) {
      console.warn('Could not store grade in sessionStorage:', error);
    }
    return gradeLevel;
  }

  // Fallback to sessionStorage
  try {
    const storedGrade = sessionStorage.getItem('supabase-design-grade');
    if (storedGrade) {
      console.log(`📚 Found grade level from sessionStorage: ${storedGrade}`);
      return storedGrade;
    }
  } catch (error) {
    console.warn('Could not read grade from sessionStorage:', error);
  }

  // Fallback to URL params
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlGrade = urlParams.get('grade');
    if (urlGrade) {
      const normalizedGrade = urlGrade.startsWith('grade') ? urlGrade : `grade${urlGrade}`;
      console.log(`📚 Found grade level from URL params: ${normalizedGrade}`);
      return normalizedGrade;
    }
  } catch (error) {
    console.warn('Could not read grade from URL:', error);
  }

  return null;
}

