// Script to generate dummy student accounts with random scores for leaderboards
// Run this in your browser console while on your Firebase project

// Configuration
const CONFIG = {
    // Number of dummy accounts to create per grade level
    accountsPerGrade: 15,
    
    // Grade levels to populate
    gradeLevels: [5, 6],
    
    // Subjects
    subjects: ['Math', 'English', 'Science'],
    
    // Sections
    sections: ['Apple', 'Banana', 'Orange', 'Grape', 'Mango'],
    
    // Assessment and Quiz IDs (you may need to adjust these based on your actual IDs)
    assessments: ['assessment1', 'assessment2', 'assessment3'],
    quizzes: ['spelling-bee', 'clock-quiz', 'lesson1', 'science_quiz'],
    
    // Score ranges (realistic distribution)
    scoreRanges: {
        high: { min: 80, max: 100 },    // 20% of students
        medium: { min: 60, max: 79 },   // 50% of students  
        low: { min: 30, max: 59 }       // 30% of students
    }
};

// Sample names and data
const SAMPLE_DATA = {
    firstNames: [
        'Maria', 'Jose', 'Ana', 'Juan', 'Carmen', 'Pedro', 'Rosa', 'Antonio', 'Isabel', 'Francisco',
        'Dolores', 'Manuel', 'Pilar', 'David', 'Teresa', 'Carlos', 'Elena', 'Miguel', 'Concepcion', 'Rafael',
        'Mercedes', 'Jorge', 'Amparo', 'Luis', 'Rosario', 'Fernando', 'Josefa', 'Angel', 'Dolores', 'Sergio',
        'Cristina', 'Alberto', 'Victoria', 'Roberto', 'Francisca', 'Eduardo', 'Purificacion', 'Javier', 'Encarnacion', 'Ricardo'
    ],
    lastNames: [
        'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Andres', 'Castillo',
        'Flores', 'Rivera', 'Morales', 'Ramos', 'Gutierrez', 'Diaz', 'Herrera', 'Jimenez', 'Vargas', 'Romero',
        'Moreno', 'Alvarez', 'Munoz', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Castro',
        'Ortega', 'Delgado', 'Vega', 'Molina', 'Aguilar', 'Silva', 'Medina', 'Guerrero', 'Navarro', 'Blanco'
    ],
    middleNames: ['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'I.', 'J.', 'K.', 'L.', 'M.', 'N.', 'O.', 'P.', 'Q.', 'R.', 'S.', 'T.'],
    genders: ['Male', 'Female'],
    cities: ['Angeles City', 'San Fernando', 'Mabalacat', 'Apalit', 'Bacolor', 'Candaba', 'Floridablanca', 'Guagua', 'Lubao', 'Macabebe'],
    provinces: ['Pampanga'],
    regions: ['Region 3'],
    barangays: ['Pampang', 'Cansinala', 'Colgante', 'Sampaloc', 'Baliti', 'San Nicolas', 'San Jose', 'San Agustin', 'San Rafael', 'San Miguel']
};

// Generate random LRN (12 digits)
function generateLRN() {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

// Generate random email
function generateEmail(firstName, lastName) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'student.edu.ph'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const number = Math.floor(Math.random() * 100);
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${number}@${domain}`;
}

// Generate random score based on performance level
function generateScore(level) {
    const range = CONFIG.scoreRanges[level];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// Generate assessment/quiz data
function generateScoreData(type, id) {
    const performanceLevels = ['high', 'medium', 'low'];
    const weights = [0.2, 0.5, 0.3]; // 20% high, 50% medium, 30% low
    
    // Randomly select performance level based on weights
    const random = Math.random();
    let cumulative = 0;
    let level = 'medium';
    
    for (let i = 0; i < performanceLevels.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
            level = performanceLevels[i];
            break;
        }
    }
    
    const score = generateScore(level);
    const total = 10; // Assuming most assessments/quizzes are out of 10
    const percentage = Math.round((score / total) * 100);
    const attempts = Math.floor(Math.random() * 3) + 1; // 1-3 attempts
    
    return {
        summary: {
            attempts: attempts,
            best: score,
            bestPercentage: percentage,
            last: score,
            lastPercentage: percentage,
            lastTimestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time in last 30 days
            total: total
        }
    };
}

// Generate complete student data
function generateStudentData(gradeLevel, subject, section) {
    const firstName = SAMPLE_DATA.firstNames[Math.floor(Math.random() * SAMPLE_DATA.firstNames.length)];
    const lastName = SAMPLE_DATA.lastNames[Math.floor(Math.random() * SAMPLE_DATA.lastNames.length)];
    const middleName = SAMPLE_DATA.middleNames[Math.floor(Math.random() * SAMPLE_DATA.middleNames.length)];
    const gender = SAMPLE_DATA.genders[Math.floor(Math.random() * SAMPLE_DATA.genders.length)];
    const city = SAMPLE_DATA.cities[Math.floor(Math.random() * SAMPLE_DATA.cities.length)];
    const barangay = SAMPLE_DATA.barangays[Math.floor(Math.random() * SAMPLE_DATA.barangays.length)];
    
    const studentData = {
        id: generateLRN(),
        fname: firstName,
        mname: middleName,
        lname: lastName,
        address: {
            street: `${Math.floor(Math.random() * 999) + 1} ${barangay} Street`,
            barangay: barangay,
            city: city,
            province: SAMPLE_DATA.provinces[0],
            zip: Math.floor(1000 + Math.random() * 9000).toString(),
            region: SAMPLE_DATA.regions[0]
        },
        gender: gender,
        age: (gradeLevel + 5).toString(), // Rough age calculation
        gradelevel: gradeLevel.toString(),
        subject: subject,
        section: section,
        school_year: "2024-2025",
        email: generateEmail(firstName, lastName),
        role: "student"
    };
    
    // Add random assessments
    studentData.assessments = {};
    CONFIG.assessments.forEach(assessmentId => {
        if (Math.random() > 0.3) { // 70% chance to have this assessment
            studentData.assessments[assessmentId] = generateScoreData('assessment', assessmentId);
        }
    });
    
    // Add random quizzes
    studentData.quizzes = {};
    CONFIG.quizzes.forEach(quizId => {
        if (Math.random() > 0.4) { // 60% chance to have this quiz
            studentData.quizzes[quizId] = generateScoreData('quiz', quizId);
        }
    });
    
    return studentData;
}

// Main function to create dummy accounts
async function createDummyAccounts() {
    console.log('🚀 Starting dummy account creation...');
    
    if (!firebase || !firebase.database) {
        console.error('❌ Firebase not available. Make sure you\'re on a page with Firebase loaded.');
        return;
    }
    
    const db = firebase.database();
    let totalCreated = 0;
    
    try {
        for (const gradeLevel of CONFIG.gradeLevels) {
            console.log(`📚 Creating accounts for Grade ${gradeLevel}...`);
            
            for (const subject of CONFIG.subjects) {
                console.log(`  📖 Subject: ${subject}`);
                
                for (let i = 0; i < CONFIG.accountsPerGrade; i++) {
                    const section = CONFIG.sections[Math.floor(Math.random() * CONFIG.sections.length)];
                    const studentData = generateStudentData(gradeLevel, subject, section);
                    
                    // Create Firebase Auth user
                    const email = studentData.email;
                    const password = 'DummyPass123!'; // Default password for all dummy accounts
                    
                    try {
                        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                        const uid = userCredential.user.uid;
                        
                        // Save student data to database
                        await db.ref(`students/${uid}`).set(studentData);
                        
                        // Sign out the created user
                        await firebase.auth().signOut();
                        
                        totalCreated++;
                        console.log(`    ✅ Created: ${studentData.fname} ${studentData.lname} (${studentData.gradelevel}-${studentData.section})`);
                        
                        // Small delay to avoid overwhelming Firebase
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                    } catch (error) {
                        console.error(`    ❌ Failed to create ${email}:`, error.message);
                    }
                }
            }
        }
        
        console.log(`🎉 Successfully created ${totalCreated} dummy accounts!`);
        console.log('📊 Check your leaderboards to see the populated data.');
        
    } catch (error) {
        console.error('❌ Error creating dummy accounts:', error);
    }
}

// Function to clean up dummy accounts (if needed)
async function cleanupDummyAccounts() {
    console.log('🧹 Starting cleanup of dummy accounts...');
    
    if (!firebase || !firebase.database) {
        console.error('❌ Firebase not available.');
        return;
    }
    
    const db = firebase.database();
    
    try {
        const snapshot = await db.ref('students').once('value');
        const students = snapshot.val();
        let deletedCount = 0;
        
        for (const [uid, studentData] of Object.entries(students)) {
            // Check if it's a dummy account (you can adjust this criteria)
            if (studentData.email && studentData.email.includes('@gmail.com') && 
                studentData.email.match(/\d+@/)) { // Has numbers in email
                
                try {
                    // Delete from database
                    await db.ref(`students/${uid}`).remove();
                    
                    // Delete from Auth (you'll need admin privileges for this)
                    // await firebase.auth().deleteUser(uid);
                    
                    deletedCount++;
                    console.log(`🗑️ Deleted: ${studentData.fname} ${studentData.lname}`);
                } catch (error) {
                    console.error(`❌ Failed to delete ${studentData.email}:`, error.message);
                }
            }
        }
        
        console.log(`🧹 Cleaned up ${deletedCount} dummy accounts.`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

// Export functions for use
window.createDummyAccounts = createDummyAccounts;
window.cleanupDummyAccounts = cleanupDummyAccounts;

console.log('📋 Dummy Account Generator loaded!');
console.log('📝 Available commands:');
console.log('  - createDummyAccounts() - Create dummy accounts with random scores');
console.log('  - cleanupDummyAccounts() - Remove dummy accounts');
console.log('');
console.log('⚙️ Configuration:');
console.log(`  - ${CONFIG.accountsPerGrade} accounts per grade level`);
console.log(`  - Grade levels: ${CONFIG.gradeLevels.join(', ')}`);
console.log(`  - Subjects: ${CONFIG.subjects.join(', ')}`);
console.log('');
console.log('🚀 Run createDummyAccounts() to start!');
