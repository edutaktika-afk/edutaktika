#!/usr/bin/env node

/**
 * Bulk Create Students Script
 * 
 * Uses Firebase Admin SDK to create student accounts without rate limits.
 * Run this script from the command line instead of using the web interface.
 * 
 * Usage:
 *   node scripts/bulk-create-students.js
 * 
 * Or with arguments:
 *   node scripts/bulk-create-students.js --grades "5,6" --perSection 15 --subjects "Math,English,Science" --password "StudentPass123!" --domain "student.edu.ph"
 */

const admin = require('firebase-admin');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// You need to download your service account key from Firebase Console
// Go to: Project Settings > Service Accounts > Generate New Private Key
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  console.log('\n📋 To get your service account key:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project (edutaktika)');
  console.log('3. Go to Project Settings (gear icon)');
  console.log('4. Click "Service Accounts" tab');
  console.log('5. Click "Generate New Private Key"');
  console.log('6. Save the file as "serviceAccountKey.json" in the scripts/ directory');
  console.log('7. Make sure to add serviceAccountKey.json to .gitignore!');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://edutaktika-default-rtdb.firebaseio.com'
});

const db = admin.database();

// Get sections for a specific grade level
function getSectionsForGrade(gradeLevel) {
  const grade = parseInt(gradeLevel);
  if (grade === 5) {
    return ['Melon', 'Kasoy', 'Ubas', 'Durian'];
  } else if (grade === 6) {
    return ['Fruit Salad', 'Langka', 'Santol', 'Guyabano'];
  }
  // Fallback for other grades
  return ['Melon', 'Kasoy', 'Ubas', 'Durian'];
}

// Generate student email
function generateEmail(fname, lname, index, domain) {
  const cleanFname = fname.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLname = lname.toLowerCase().replace(/[^a-z]/g, '');
  return `${cleanFname}.${cleanLname}${index}@${domain}`;
}

// Generate random names
function generateRandomName() {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 'William', 'Sophia', 'Richard', 'Isabella', 'Joseph', 'Mia', 'Thomas', 'Charlotte', 'Charles', 'Amelia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];
  
  return {
    fname: firstNames[Math.floor(Math.random() * firstNames.length)],
    lname: lastNames[Math.floor(Math.random() * lastNames.length)]
  };
}

// Parse names from file
function parseNamesFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const names = [];
    
    lines.forEach(line => {
      // Support formats: "First Last" or "First,Last"
      const parts = line.includes(',') 
        ? line.split(',').map(p => p.trim())
        : line.split(/\s+/);
      
      if (parts.length >= 2) {
        names.push({
          fname: parts[0],
          lname: parts.slice(1).join(' ')
        });
      }
    });
    
    return names;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

// Generate student data
function generateStudentData(gradeLevel, subjects, section, index, emailDomain, name = null) {
  const studentName = name || generateRandomName();
  const email = generateEmail(studentName.fname, studentName.lname, index, emailDomain);
  const studentId = `2024${String(index).padStart(7, '0')}`;
  
  const subjectsArray = Array.isArray(subjects) ? subjects : (typeof subjects === 'string' ? subjects.split(',').map(s => s.trim()) : []);
  
  return {
    id: studentId,
    fname: studentName.fname,
    mname: '',
    lname: studentName.lname,
    email: email,
    gradelevel: gradeLevel.toString(),
    grade: `grade=${gradeLevel}`,
    section: section,
    subjects: subjectsArray,
    role: 'student',
    school_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    age: (10 + parseInt(gradeLevel) - 5).toString(),
    address: {
      street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
      barangay: 'Sample Barangay',
      city: 'Angeles City',
      province: 'Pampanga',
      zip: '2009',
      region: 'Region 3'
    },
    bulkCreated: true,
    bulkCreatedAt: new Date().toISOString(),
    registeredAt: Date.now()
  };
}

// Main function
async function bulkCreateStudents() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function question(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  }

  console.log('\n🚀 Bulk Student Account Creator (Admin SDK)\n');
  console.log('This script uses Firebase Admin SDK - NO RATE LIMITS!\n');

  // Get configuration
  const gradeLevelsInput = await question('Grade Levels (comma-separated, e.g., 5,6): ');
  const gradeLevels = gradeLevelsInput.split(',').map(g => g.trim()).filter(g => g);
  
  const accountsPerSectionInput = await question('Accounts per Section (default: 15): ');
  const accountsPerSection = parseInt(accountsPerSectionInput) || 15;
  
  const subjectsInput = await question('Subjects (comma-separated, e.g., Math,English,Science): ');
  const subjects = subjectsInput.split(',').map(s => s.trim()).filter(s => s);
  
  const password = await question('Default Password (default: StudentPass123!): ') || 'StudentPass123!';
  
  const emailDomain = await question('Email Domain (default: student.edu.ph): ') || 'student.edu.ph';
  
  const namesFileInput = await question('Names File (optional, .txt or .csv, press Enter to skip): ');
  let importedNames = [];
  if (namesFileInput.trim()) {
    const namesFilePath = path.resolve(namesFileInput.trim());
    importedNames = parseNamesFromFile(namesFilePath);
    if (importedNames.length > 0) {
      console.log(`✅ Loaded ${importedNames.length} names from file`);
    }
  }

  // Calculate totals
  let totalSections = 0;
  gradeLevels.forEach(grade => {
    totalSections += getSectionsForGrade(grade).length;
  });
  
  const totalAccounts = totalSections * accountsPerSection;
  
  console.log('\n📋 Configuration Summary:');
  console.log(`   Grade Levels: ${gradeLevels.join(', ')}`);
  console.log(`   Total Sections: ${totalSections}`);
  console.log(`   Accounts per Section: ${accountsPerSection}`);
  console.log(`   Subjects: ${subjects.join(', ')}`);
  console.log(`   Total Accounts: ${totalAccounts}`);
  if (importedNames.length > 0) {
    console.log(`   Imported Names: ${importedNames.length}`);
  }
  
  const confirm = await question('\n⚠️  Proceed with account creation? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('❌ Cancelled.');
    rl.close();
    return;
  }

  rl.close();

  // Generate all student data
  console.log('\n📚 Generating student data...');
  const allStudents = [];
  let nameIndex = 0;

  for (const gradeLevel of gradeLevels) {
    const gradeSections = getSectionsForGrade(gradeLevel);
    
    for (const section of gradeSections) {
      for (let i = 0; i < accountsPerSection; i++) {
        const currentName = importedNames.length > 0 && nameIndex < importedNames.length
          ? importedNames[nameIndex]
          : null;
        
        const studentData = generateStudentData(
          gradeLevel,
          subjects,
          section,
          allStudents.length + 1,
          emailDomain,
          currentName
        );
        
        allStudents.push({
          ...studentData,
          password: password
        });
        
        if (importedNames.length > 0) {
          nameIndex = (nameIndex + 1) % importedNames.length;
        }
      }
    }
  }

  console.log(`✅ Generated ${allStudents.length} student records\n`);
  console.log('🚀 Creating accounts (this may take a while)...\n');

  // Create accounts using Admin SDK
  const results = {
    created: [],
    failed: []
  };

  // Process in batches to show progress
  const batchSize = 50;
  for (let i = 0; i < allStudents.length; i += batchSize) {
    const batch = allStudents.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(allStudents.length / batchSize);
    
    console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} accounts)...`);
    
    await Promise.all(batch.map(async (studentData) => {
      try {
        const { password: pwd, ...studentInfo } = studentData;
        
        // Create user with Admin SDK (NO RATE LIMITS!)
        const userRecord = await admin.auth().createUser({
          email: studentData.email,
          password: pwd,
          emailVerified: false, // Bulk created accounts bypass verification
          disabled: false
        });

        // Save to Realtime Database
        await db.ref(`students/${userRecord.uid}`).set(studentInfo);

        results.created.push({
          uid: userRecord.uid,
          email: studentData.email,
          name: `${studentData.fname} ${studentData.lname}`
        });

      } catch (error) {
        results.failed.push({
          email: studentData.email,
          error: error.message
        });
      }
    }));

    // Small delay between batches
    if (i + batchSize < allStudents.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📈 Success Rate: ${((results.created.length / allStudents.length) * 100).toFixed(1)}%`);

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
bulkCreateStudents().catch(error => {
  console.error('❌ Fatal error:', error);
  admin.app().delete();
  process.exit(1);
});

