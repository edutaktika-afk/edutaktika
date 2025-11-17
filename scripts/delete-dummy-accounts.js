#!/usr/bin/env node

/**
 * Delete Dummy Accounts Script
 * 
 * Uses Firebase Admin SDK to delete accounts with @student.edu.ph emails
 * from both Firebase Authentication AND Realtime Database.
 * 
 * Usage:
 *   node scripts/delete-dummy-accounts.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
// Try multiple possible locations and filenames for the service account key
const rootDir = path.join(__dirname, '..');
const possiblePaths = [
  // Root directory - common names
  path.join(rootDir, 'edutaktika-firebase-adminsdk.json'),
  path.join(rootDir, 'serviceAccountKey.json'),
  // Teacher directory - where the user placed it
  path.join(rootDir, 'Teacher', 'edutaktika-firebase-adminsdk-fbsvc-05bf4292a1.json'),
  path.join(rootDir, 'Teacher', 'edutaktika-firebase-adminsdk.json'),
  path.join(rootDir, 'Teacher', 'serviceAccountKey.json'),
  // Scripts directory
  path.join(__dirname, 'serviceAccountKey.json'),
];

// Also search for any file matching the pattern in common directories
const searchDirs = [rootDir, path.join(rootDir, 'Teacher'), __dirname];
const searchPattern = /edutaktika-firebase-adminsdk.*\.json$/i;

let serviceAccountPath = null;

// First, try exact paths
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    serviceAccountPath = possiblePath;
    break;
  }
}

// If not found, search directories for matching files
if (!serviceAccountPath) {
  for (const searchDir of searchDirs) {
    try {
      if (fs.existsSync(searchDir)) {
        const files = fs.readdirSync(searchDir);
        const matchingFile = files.find(file => searchPattern.test(file));
        if (matchingFile) {
          serviceAccountPath = path.join(searchDir, matchingFile);
          break;
        }
      }
    } catch (err) {
      // Directory doesn't exist or can't be read, skip
    }
  }
}

if (!serviceAccountPath) {
  console.error('❌ Error: Service account key not found!');
  console.log('\n📋 To get your service account key:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project (edutaktika)');
  console.log('3. Go to Project Settings (gear icon)');
  console.log('4. Click "Service Accounts" tab');
  console.log('5. Click "Generate New Private Key"');
  console.log('\n💡 Save the file as one of these names in the root or Teacher/ directory:');
  console.log('   - edutaktika-firebase-adminsdk.json');
  console.log('   - serviceAccountKey.json');
  console.log('   - Any file matching "edutaktika-firebase-adminsdk*.json"');
  process.exit(1);
}

console.log(`✅ Found service account key: ${serviceAccountPath}\n`);

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://edutaktika-default-rtdb.firebaseio.com'
});

const db = admin.database();
const auth = admin.auth();

async function deleteDummyAccounts() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  console.log('\n🗑️  Delete Dummy Accounts Script\n');
  console.log('This will delete accounts with a specific email domain');
  console.log('from both Firebase Authentication AND Realtime Database.\n');

  // Get email domain from user
  const emailDomainInput = await question('Enter email domain to delete (e.g., @student.edu.ph or @Sampaloclms.edu.ph): ');
  const emailDomain = emailDomainInput.trim();
  
  if (!emailDomain || !emailDomain.startsWith('@')) {
    console.error('❌ Error: Email domain must start with @ (e.g., @student.edu.ph)');
    rl.close();
    admin.app().delete();
    process.exit(1);
  }

  console.log(`\n✅ Will delete accounts with emails containing: ${emailDomain}\n`);

  // Get all users from Auth
  console.log('📋 Fetching users from Firebase Authentication...');
  let authUsers = [];
  let nextPageToken;
  
  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    authUsers = authUsers.concat(listUsersResult.users);
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  console.log(`✅ Found ${authUsers.length} total users in Authentication\n`);

  // Filter users with the specified email domain
  const dummyAuthUsers = authUsers.filter(user => 
    user.email && user.email.includes(emailDomain)
  );

  // Get all students from Realtime Database
  console.log('📋 Fetching students from Realtime Database...');
  const studentsSnap = await db.ref('students').once('value');
  const dummyDbStudents = [];
  
  if (studentsSnap.exists()) {
    studentsSnap.forEach(child => {
      const student = child.val();
      if (student.email && student.email.includes(emailDomain)) {
        dummyDbStudents.push({
          uid: child.key,
          email: student.email,
          name: `${student.fname || ''} ${student.lname || ''}`.trim() || 'Unknown'
        });
      }
    });
  }

  console.log(`✅ Found ${dummyDbStudents.length} students in Database\n`);

  // Combine and deduplicate
  const allDummyAccounts = new Map();
  
  // Add from Auth
  dummyAuthUsers.forEach(user => {
    allDummyAccounts.set(user.uid, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'Unknown',
      inAuth: true,
      inDb: false
    });
  });
  
  // Add from Database
  dummyDbStudents.forEach(student => {
    if (allDummyAccounts.has(student.uid)) {
      allDummyAccounts.get(student.uid).inDb = true;
      allDummyAccounts.get(student.uid).name = student.name;
    } else {
      allDummyAccounts.set(student.uid, {
        uid: student.uid,
        email: student.email,
        name: student.name,
        inAuth: false,
        inDb: true
      });
    }
  });

  const totalToDelete = allDummyAccounts.size;

  if (totalToDelete === 0) {
    console.log('✅ No dummy accounts found!');
    admin.app().delete();
    process.exit(0);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total dummy accounts: ${totalToDelete}`);
  console.log(`   In Authentication: ${dummyAuthUsers.length}`);
  console.log(`   In Database: ${dummyDbStudents.length}\n`);

  // Confirmation
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('⚠️  Are you sure you want to delete ALL these accounts? (yes/no): ', resolve);
  });

  if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
    console.log('❌ Cancelled.');
    rl.close();
    admin.app().delete();
    process.exit(0);
  }
  
  rl.close();

  console.log('\n🗑️  Starting deletion...\n');

  const results = {
    deletedFromAuth: [],
    deletedFromDb: [],
    failed: []
  };

  // Process in batches
  const accountsArray = Array.from(allDummyAccounts.values());
  const batchSize = 50;

  for (let i = 0; i < accountsArray.length; i += batchSize) {
    const batch = accountsArray.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(accountsArray.length / batchSize);
    
    console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} accounts)...`);

    await Promise.all(batch.map(async (account) => {
      try {
        // Delete from Authentication
        if (account.inAuth) {
          try {
            await auth.deleteUser(account.uid);
            results.deletedFromAuth.push(account);
            console.log(`   ✅ Deleted from Auth: ${account.name} (${account.email})`);
          } catch (authError) {
            console.log(`   ⚠️  Auth delete failed: ${account.email} - ${authError.message}`);
          }
        }

        // Delete from Realtime Database
        if (account.inDb) {
          try {
            await db.ref(`students/${account.uid}`).remove();
            results.deletedFromDb.push(account);
            if (!account.inAuth) {
              console.log(`   ✅ Deleted from DB: ${account.name} (${account.email})`);
            }
          } catch (dbError) {
            console.log(`   ⚠️  DB delete failed: ${account.email} - ${dbError.message}`);
          }
        }

      } catch (error) {
        results.failed.push({
          ...account,
          error: error.message
        });
        console.log(`   ❌ Failed: ${account.email} - ${error.message}`);
      }
    }));

    // Small delay between batches
    if (i + batchSize < accountsArray.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 DELETION RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Deleted from Authentication: ${results.deletedFromAuth.length}`);
  console.log(`✅ Deleted from Database: ${results.deletedFromDb.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Accounts:');
    results.failed.slice(0, 10).forEach(failure => {
      console.log(`   - ${failure.email}: ${failure.error}`);
    });
    if (results.failed.length > 10) {
      console.log(`   ... and ${results.failed.length - 10} more`);
    }
  }

  console.log('\n✅ Done!');
  
  // Cleanup
  admin.app().delete();
  process.exit(0);
}

// Run the script
deleteDummyAccounts().catch(error => {
  console.error('❌ Fatal error:', error);
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.close();
  admin.app().delete();
  process.exit(1);
});

