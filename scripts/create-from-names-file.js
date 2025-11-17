#!/usr/bin/env node

/**
 * Create Student Accounts from Names File
 * 
 * Uses Firebase Admin SDK to create accounts from a names file.
 * Reads names from "232 student names.txt" or any specified file.
 * 
 * Usage:
 *   node scripts/create-from-names-file.js [path-to-names-file]
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
// Try multiple possible locations for the service account key
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

// Helper function to get sections for a grade
function getSectionsForGrade(gradeLevel) {
  const grade = parseInt(gradeLevel);
  if (grade === 5) {
    return ['Melon', 'Kasoy', 'Ubas', 'Durian'];
  } else if (grade === 6) {
    return ['Fruit Salad', 'Langka', 'Santol', 'Guyabano'];
  }
  return ['Melon', 'Kasoy', 'Ubas', 'Durian']; // Default
}

// Helper function to generate email
function generateEmail(fname, lname, index, domain) {
  const cleanFname = fname.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLname = lname.toLowerCase().replace(/[^a-z]/g, '');
  return `${cleanFname}.${cleanLname}${index}@${domain}`;
}

// Helper function to parse names from file
function parseNamesFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const names = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue; // Skip empty lines
    
    // Try to split by space or comma
    const parts = trimmed.split(/[\s,]+/).filter(p => p.length > 0);
    
    if (parts.length >= 2) {
      // First part is first name, rest is last name
      const fname = parts[0];
      const lname = parts.slice(1).join(' ');
      names.push({ fname, lname });
    } else if (parts.length === 1) {
      // Single name - use as first name, empty last name
      names.push({ fname: parts[0], lname: '' });
    }
  }
  
  return names;
}

// Helper function to get random barangay for Apalit
function getRandomBarangay() {
  const barangays = ['Balucuc', 'Calantipe', 'Cansinala', 'Colgante', 'Sampaloc', 'Sucad'];
  return barangays[Math.floor(Math.random() * barangays.length)];
}

// Helper function to generate student data
function generateStudentData(gradeLevel, subjects, section, nameData, index, emailDomain) {
  const { fname, lname } = nameData;
  const email = generateEmail(fname, lname, index, emailDomain);
  const studentId = `2024${String(index).padStart(7, '0')}`;
  const subjectsArray = Array.isArray(subjects) ? subjects : (typeof subjects === 'string' ? subjects.split(',').map(s => s.trim()) : []);

  // Generate random street address
  const streetNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
  const streetNames = ['Rizal Street', 'Bonifacio Street', 'Aguinaldo Street', 'Mabini Street', 'Luna Street', 'Del Pilar Street', 'Burgos Street', 'Gomez Street', 'Zamora Street', 'Jacinto Street'];
  const streetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];

  return {
    id: studentId,
    fname: fname,
    mname: '',
    lname: lname,
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
      street: `${streetNumber} ${streetName}`,
      barangay: getRandomBarangay(),
      city: 'Apalit',
      province: 'Pampanga',
      zip: '2016',
      region: 'Region 3'
    },
    bulkCreated: true,
    bulkCreatedAt: new Date().toISOString(),
    registeredAt: Date.now()
  };
}

async function createAccountsFromNamesFile() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  console.log('\n📚 Create Student Accounts from Names File\n');
  console.log('This script uses Firebase Admin SDK - NO RATE LIMITS!\n');

  try {
    // Get names file path
    const namesFileArg = process.argv[2];
    let namesFilePath;
    
    if (namesFileArg) {
      namesFilePath = path.isAbsolute(namesFileArg) 
        ? namesFileArg 
        : path.join(rootDir, namesFileArg);
    } else {
      // Default to Teacher/232 student names.txt
      namesFilePath = path.join(rootDir, 'Teacher', '232 student names.txt');
    }

    if (!fs.existsSync(namesFilePath)) {
      console.error(`❌ Error: Names file not found: ${namesFilePath}`);
      console.log('\n💡 Usage:');
      console.log('   node scripts/create-from-names-file.js [path-to-names-file]');
      console.log('\n   Example:');
      console.log('   node scripts/create-from-names-file.js Teacher/232\\ student\\ names.txt');
      rl.close();
      process.exit(1);
    }

    console.log(`✅ Found names file: ${namesFilePath}\n`);

    // Parse names from file
    console.log('📖 Parsing names from file...');
    const names = parseNamesFromFile(namesFilePath);
    console.log(`✅ Found ${names.length} names in file\n`);

    if (names.length === 0) {
      console.error('❌ No valid names found in file!');
      rl.close();
      process.exit(1);
    }

    // Get configuration
    const gradeLevelsInput = await question('Enter grade levels (comma-separated, e.g., 5,6): ');
    const gradeLevels = gradeLevelsInput.split(',').map(g => g.trim()).filter(g => g);

    if (gradeLevels.length === 0) {
      console.error('❌ Error: At least one grade level is required.');
      rl.close();
      process.exit(1);
    }

    const accountsPerSectionInput = await question('Enter number of accounts per section (e.g., 15): ');
    const accountsPerSection = parseInt(accountsPerSectionInput);

    if (isNaN(accountsPerSection) || accountsPerSection < 1) {
      console.error('❌ Error: Invalid number of accounts per section.');
      rl.close();
      process.exit(1);
    }

    const subjectsInput = await question('Enter subjects (comma-separated, e.g., Math,English,Science): ');
    const subjects = subjectsInput.split(',').map(s => s.trim()).filter(s => s);

    const password = await question('Enter default password for all accounts: ');
    if (password.length < 6) {
      console.error('❌ Error: Password must be at least 6 characters.');
      rl.close();
      process.exit(1);
    }

    const emailDomain = await question('Enter email domain (e.g., student.edu.ph or SampalocElems.edu.ph): ') || 'student.edu.ph';

    // Calculate total accounts needed
    let totalSections = 0;
    gradeLevels.forEach(grade => {
      totalSections += getSectionsForGrade(grade).length;
    });
    const totalAccountsNeeded = totalSections * accountsPerSection;

    console.log(`\n📊 Configuration Summary:`);
    console.log(`   Grade Levels: ${gradeLevels.join(', ')}`);
    console.log(`   Sections per Grade: ${gradeLevels.map(g => `${g} (${getSectionsForGrade(g).join(', ')})`).join(' | ')}`);
    console.log(`   Total Sections: ${totalSections}`);
    console.log(`   Accounts per Section: ${accountsPerSection}`);
    console.log(`   Total Accounts Needed: ${totalAccountsNeeded}`);
    console.log(`   Names Available: ${names.length}`);
    console.log(`   Subjects: ${subjects.join(', ')}`);
    console.log(`   Email Domain: ${emailDomain}\n`);

    if (names.length < totalAccountsNeeded) {
      console.warn(`⚠️  Warning: Only ${names.length} names available, but ${totalAccountsNeeded} accounts will be created.`);
      console.warn(`   Names will be reused/cycled.\n`);
    }

    const confirmCreation = await question('Proceed with account creation? (yes/no): ');
    if (confirmCreation.toLowerCase() !== 'y' && confirmCreation.toLowerCase() !== 'yes') {
      console.log('❌ Account creation cancelled.');
      rl.close();
      process.exit(0);
    }

    console.log('\n🚀 Starting account creation...\n');

    // Generate all student data
    const allStudentsToCreate = [];
    let nameIndex = 0;

    for (const gradeLevel of gradeLevels) {
      const gradeSections = getSectionsForGrade(gradeLevel);
      for (const section of gradeSections) {
        for (let i = 0; i < accountsPerSection; i++) {
          const nameData = names[nameIndex % names.length]; // Cycle through names
          const studentData = generateStudentData(
            gradeLevel, 
            subjects, 
            section, 
            nameData, 
            allStudentsToCreate.length + 1, 
            emailDomain
          );
          allStudentsToCreate.push({
            ...studentData,
            password: password
          });
          nameIndex++;
        }
      }
    }

    // Create accounts in batches
    const batchSize = 50;
    let totalCreated = 0;
    let totalFailed = 0;
    const failedAccounts = [];

    for (let i = 0; i < allStudentsToCreate.length; i += batchSize) {
      const batch = allStudentsToCreate.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allStudentsToCreate.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} accounts)...`);

      await Promise.all(batch.map(async (student) => {
        try {
          // Create user with Admin SDK (no rate limits!)
          const userRecord = await auth.createUser({
            email: student.email,
            password: student.password,
            displayName: `${student.fname} ${student.lname}`,
            emailVerified: false, // Bulk created accounts bypass verification
            disabled: false
          });

          // Remove password before saving to database
          const { password: _, ...dataToSave } = student;
          await db.ref(`students/${userRecord.uid}`).set(dataToSave);

          console.log(`   ✅ Created: ${student.fname} ${student.lname} (${student.email})`);
          totalCreated++;
        } catch (error) {
          console.error(`   ❌ Failed: ${student.email} - ${error.message}`);
          totalFailed++;
          failedAccounts.push({
            email: student.email,
            name: `${student.fname} ${student.lname}`,
            error: error.message
          });
        }
      }));

      // Small delay between batches
      if (i + batchSize < allStudentsToCreate.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Print final results
    console.log('\n' + '='.repeat(60));
    console.log('📊 CREATION RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Successfully Created: ${totalCreated}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`📊 Total Processed: ${allStudentsToCreate.length}`);

    if (failedAccounts.length > 0) {
      console.log('\n❌ Failed Accounts:');
      failedAccounts.slice(0, 20).forEach(failure => {
        console.log(`   - ${failure.name} (${failure.email}): ${failure.error}`);
      });
      if (failedAccounts.length > 20) {
        console.log(`   ... and ${failedAccounts.length - 20} more`);
      }
    }

    console.log('\n✅ Done!');
    
    rl.close();
    admin.app().delete();
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    rl.close();
    admin.app().delete();
    process.exit(1);
  }
}

// Run the script
createAccountsFromNamesFile();

