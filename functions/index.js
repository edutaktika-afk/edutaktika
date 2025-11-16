const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Bulk create student accounts using Admin SDK
 * This avoids rate limiting issues from client-side Auth
 * 
 * Expected request body:
 * {
 *   students: [
 *     {
 *       email: "student@example.com",
 *       password: "password123",
 *       fname: "John",
 *       lname: "Doe",
 *       gradelevel: "5",
 *       section: "Melon",
 *       subjects: ["Math", "English", "Science"],
 *       ...other student data
 *     }
 *   ]
 * }
 */
exports.bulkCreateStudents = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin
  const adminSnap = await admin.database().ref(`admins/${context.auth.uid}`).once('value');
  const adminData = adminSnap.val();
  
  if (!adminData || adminData.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create bulk accounts');
  }

  const { students } = data;
  
  if (!Array.isArray(students) || students.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'students must be a non-empty array');
  }

  const results = {
    created: [],
    failed: []
  };

  // Process students in batches to avoid overwhelming
  const batchSize = 10;
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (studentData) => {
      try {
        const { email, password, ...studentInfo } = studentData;
        
        if (!email || !password) {
          results.failed.push({
            email: email || 'unknown',
            error: 'Missing email or password'
          });
          return;
        }

        // Create user with Admin SDK (no rate limits!)
        const userRecord = await admin.auth().createUser({
          email: email,
          password: password,
          emailVerified: false, // Bulk created accounts bypass verification
          disabled: false
        });

        // Prepare student data
        const studentRecord = {
          ...studentInfo,
          id: studentInfo.id || `2024${String(i + 1).padStart(7, '0')}`,
          email: email,
          gradelevel: studentInfo.gradelevel || studentInfo.grade?.replace('grade=', '') || '',
          grade: studentInfo.grade || `grade=${studentInfo.gradelevel || ''}`,
          role: 'student',
          school_year: studentInfo.school_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          bulkCreated: true,
          bulkCreatedAt: new Date().toISOString(),
          registeredAt: Date.now()
        };

        // Save to Realtime Database
        await admin.database().ref(`students/${userRecord.uid}`).set(studentRecord);

        results.created.push({
          uid: userRecord.uid,
          email: email,
          name: `${studentInfo.fname || ''} ${studentInfo.lname || ''}`.trim()
        });

      } catch (error) {
        results.failed.push({
          email: studentData.email || 'unknown',
          error: error.message
        });
      }
    }));

    // Small delay between batches
    if (i + batchSize < students.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return {
    success: true,
    total: students.length,
    created: results.created.length,
    failed: results.failed.length,
    results: results
  };
});

/**
 * Delete dummy accounts with @student.edu.ph email
 */
exports.deleteDummyAccounts = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin
  const adminSnap = await admin.database().ref(`admins/${context.auth.uid}`).once('value');
  const adminData = adminSnap.val();
  
  if (!adminData || adminData.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can delete accounts');
  }

  const results = {
    deleted: [],
    failed: []
  };

  try {
    // Get all students
    const studentsSnap = await admin.database().ref('students').once('value');
    
    if (studentsSnap.exists()) {
      const deletePromises = [];
      
      studentsSnap.forEach((child) => {
        const student = child.val();
        if (student.email && student.email.includes('@student.edu.ph')) {
          deletePromises.push(
            (async () => {
              try {
                const accountInfo = {
                  uid: child.key,
                  email: student.email,
                  name: `${student.fname || ''} ${student.lname || ''}`.trim() || 'Unknown'
                };
                
                // Delete from Auth (if user exists)
                try {
                  await admin.auth().getUser(child.key); // Check if user exists
                  await admin.auth().deleteUser(child.key);
                } catch (authError) {
                  // User might not exist in Auth, that's okay
                  if (authError.code !== 'auth/user-not-found') {
                    throw authError;
                  }
                }
                
                // Delete from Realtime Database
                await admin.database().ref(`students/${child.key}`).remove();
                
                results.deleted.push(accountInfo);
              } catch (error) {
                results.failed.push({
                  uid: child.key,
                  email: student.email || 'unknown',
                  error: error.message
                });
              }
            })()
          );
        }
      });

      // Process deletions in batches
      const batchSize = 10;
      for (let i = 0; i < deletePromises.length; i += batchSize) {
        const batch = deletePromises.slice(i, i + batchSize);
        await Promise.all(batch);
        
        if (i + batchSize < deletePromises.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }

    return {
      success: true,
      deleted: results.deleted.length,
      failed: results.failed.length,
      results: results
    };

  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

