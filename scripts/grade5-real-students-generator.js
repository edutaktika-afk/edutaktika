// Script to generate Grade 5 student accounts using real student data
// Split into 3 sections: Apple, Banana, Orange
// Run this in your browser console while on your Firebase project

// Real student data from your list
const REAL_STUDENTS = [
    { name: "Acerdano, Precious Deborah Grace P.", studentNumber: "2022307258" },
    { name: "Agustin, Elaine E.", studentNumber: "2022307916" },
    { name: "Arcilla, Zenrick M.", studentNumber: "2022308136" },
    { name: "Austria, Clark Joshua M.", studentNumber: "2022308411" },
    { name: "Balando, Allysa S.", studentNumber: "2022307460" },
    { name: "Balagtas, Earl Joshua M.", studentNumber: "2021311997" },
    { name: "Batac, Jabez Josh C.", studentNumber: "2022307975" },
    { name: "Caballero, John Paul O.", studentNumber: "2022308249" },
    { name: "Carlos, Mark Raven M.", studentNumber: "2022316029" },
    { name: "Castro, Ivan Jhaus R.", studentNumber: "2022307233" },
    { name: "Danday, Adrian", studentNumber: "2022312435" },
    { name: "Dungo, Katrina Shane S.", studentNumber: "2022307627" },
    { name: "Duque, John Paul S.", studentNumber: "2021314640" },
    { name: "Fabian, Justine M.", studentNumber: "2021314639" },
    { name: "Fajela, Leonil E.", studentNumber: "2022307897" },
    { name: "Ignacio, Patrick Daniel R.", studentNumber: "2022313630" },
    { name: "Lopez, Joshua", studentNumber: "2022308012" },
    { name: "Maglalang, Jubainne L.", studentNumber: "2022308207" },
    { name: "Malonzo, Rovic Carl G.", studentNumber: "2021312004" },
    { name: "Manabat, Romiel Christian L.", studentNumber: "2022307429" },
    { name: "Mandap, Sherleeo Glend C.", studentNumber: "2022308422" },
    { name: "Manlapaz, Jasmine Claire A.", studentNumber: "2022308649" },
    { name: "Mercado, Neo Rafael G.", studentNumber: "2022314995" },
    { name: "Mercado, Roland Felix L.", studentNumber: "2022308352" },
    { name: "Miclat III, Catalino D.", studentNumber: "2021310139" },
    { name: "Miguel, Mark Angelo L.", studentNumber: "2022315864" },
    { name: "Mindioro, Mark Angelo M.", studentNumber: "2022315954" },
    { name: "Moral, Joshua D.", studentNumber: "2022308219" },
    { name: "Nucom, Norman U.", studentNumber: "2021309829" },
    { name: "Pabustan, Allaine Cedrick M.", studentNumber: "2022307173" },
    { name: "Pagtalunan, Prince Samuel S.", studentNumber: "2022308170" },
    { name: "Palabasan, Ralph David C.", studentNumber: "2022310074" },
    { name: "Pandio, James Benedict M.", studentNumber: "2022314994" },
    { name: "Placido, Benjamin B. Jr.", studentNumber: "2021310023" },
    { name: "Quaichon, Mark Jayson F.", studentNumber: "2021309835" },
    { name: "Quiroz, Calvin Jhon", studentNumber: "2022312547" },
    { name: "Reyes, John Lester", studentNumber: "2021314218" },
    { name: "Salvador, Lee Andrew G.", studentNumber: "2022308145" },
    { name: "Sanchez, Ken", studentNumber: "2022308520" },
    { name: "Seblero, Karl Chester C.", studentNumber: "2022312398" },
    { name: "Sicat, Arlan Adrian B.", studentNumber: "2022308030" },
    { name: "Simon, John Llyod C.", studentNumber: "2022307689" },
    { name: "Sunga, Mark Kevin B.", studentNumber: "2022308197" },
    { name: "Talavera, Reyster James M.", studentNumber: "2022308017" },
    { name: "Tiglao, Josheph Reyland B.", studentNumber: "2021310147" },
    { name: "Torres, Camille G.", studentNumber: "2022308304" },
    { name: "Tucay, Lester John T.", studentNumber: "2021311998" },
    { name: "Trinidad, Rommer Y.", studentNumber: "2022308365" },
    { name: "Vasquez, Jeremy G.", studentNumber: "2022308000" },
    { name: "Yabut, Lauviah Ether B.", studentNumber: "2022308121" },
    { name: "Yutuc, John Eric M.", studentNumber: "2022308378" }
];

// Configuration
const CONFIG = {
    gradeLevel: "5",
    sections: ["Apple", "Banana", "Orange"],
    subjects: ["Math", "English", "Science"],
    
    // Assessment and Quiz IDs (adjust based on your actual IDs)
    assessments: ["assessment1", "assessment2", "assessment3"],
    quizzes: ["spelling-bee", "clock-quiz", "lesson1", "science_quiz"],
    
    // Score ranges (realistic distribution)
    scoreRanges: {
        high: { min: 80, max: 100 },    // 20% of students
        medium: { min: 60, max: 79 },   // 50% of students  
        low: { min: 30, max: 59 }       // 30% of students
    }
};

// Helper functions
function parseName(fullName) {
    // Parse "Last, First Middle" format
    const parts = fullName.split(', ');
    if (parts.length !== 2) {
        // Handle names without comma (like "Danday, Adrian")
        const nameParts = fullName.split(' ');
        return {
            lname: nameParts[0],
            fname: nameParts.slice(1).join(' '),
            mname: ""
        };
    }
    
    const lastName = parts[0];
    const firstMiddle = parts[1].split(' ');
    
    return {
        lname: lastName,
        fname: firstMiddle[0] || "",
        mname: firstMiddle.slice(1).join(' ') || ""
    };
}

function generateEmail(firstName, lastName, studentNumber) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'student.edu.ph'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentNumber.slice(-4)}@${domain}`;
}

function generateScore(level) {
    const range = CONFIG.scoreRanges[level];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

function generateScoreData() {
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

function generateStudentData(student, section, subject) {
    const nameParts = parseName(student.name);
    
    const studentData = {
        id: student.studentNumber,
        fname: nameParts.fname,
        mname: nameParts.mname,
        lname: nameParts.lname,
        address: {
            street: `${Math.floor(Math.random() * 999) + 1} Pampang Street`,
            barangay: "Pampang",
            city: "Angeles City",
            province: "Pampanga",
            zip: "2009",
            region: "Region 3"
        },
        gender: Math.random() > 0.5 ? "Male" : "Female", // Random gender assignment
        age: "10", // Grade 5 students are typically 10 years old
        gradelevel: CONFIG.gradeLevel,
        subject: subject,
        section: section,
        school_year: "2024-2025",
        email: generateEmail(nameParts.fname, nameParts.lname, student.studentNumber),
        role: "student"
    };
    
    // Add random assessments
    studentData.assessments = {};
    CONFIG.assessments.forEach(assessmentId => {
        if (Math.random() > 0.3) { // 70% chance to have this assessment
            studentData.assessments[assessmentId] = generateScoreData();
        }
    });
    
    // Add random quizzes
    studentData.quizzes = {};
    CONFIG.quizzes.forEach(quizId => {
        if (Math.random() > 0.4) { // 60% chance to have this quiz
            studentData.quizzes[quizId] = generateScoreData();
        }
    });
    
    return studentData;
}

// Main function to create Grade 5 accounts
async function createGrade5Accounts() {
    console.log('🚀 Starting Grade 5 real student account creation...');
    console.log(`📚 Total students: ${REAL_STUDENTS.length}`);
    console.log(`📖 Sections: ${CONFIG.sections.join(', ')}`);
    console.log(`📝 Subjects: ${CONFIG.subjects.join(', ')}`);
    
    if (!firebase || !firebase.database) {
        console.error('❌ Firebase not available. Make sure you\'re on a page with Firebase loaded.');
        return;
    }
    
    const db = firebase.database();
    let totalCreated = 0;
    
    try {
        // Split students into 3 sections
        const studentsPerSection = Math.ceil(REAL_STUDENTS.length / CONFIG.sections.length);
        console.log(`👥 Students per section: ~${studentsPerSection}`);
        
        for (let sectionIndex = 0; sectionIndex < CONFIG.sections.length; sectionIndex++) {
            const section = CONFIG.sections[sectionIndex];
            const startIndex = sectionIndex * studentsPerSection;
            const endIndex = Math.min(startIndex + studentsPerSection, REAL_STUDENTS.length);
            const sectionStudents = REAL_STUDENTS.slice(startIndex, endIndex);
            
            console.log(`\n📚 Creating accounts for Section ${section} (${sectionStudents.length} students)...`);
            
            for (const subject of CONFIG.subjects) {
                console.log(`  📖 Subject: ${subject}`);
                
                for (const student of sectionStudents) {
                    const studentData = generateStudentData(student, section, subject);
                    
                    try {
                        const userCredential = await firebase.auth().createUserWithEmailAndPassword(
                            studentData.email, 
                            'StudentPass123!'
                        );
                        const uid = userCredential.user.uid;
                        
                        // Save student data to database
                        await db.ref(`students/${uid}`).set(studentData);
                        
                        // Sign out the created user
                        await firebase.auth().signOut();
                        
                        totalCreated++;
                        console.log(`    ✅ Created: ${studentData.fname} ${studentData.lname} (${section}-${subject})`);
                        
                        // Small delay to avoid overwhelming Firebase
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                    } catch (error) {
                        console.error(`    ❌ Failed to create ${studentData.email}:`, error.message);
                    }
                }
            }
        }
        
        console.log(`\n🎉 Successfully created ${totalCreated} Grade 5 accounts!`);
        console.log('📊 Check your Grade 5 leaderboards to see the populated data.');
        console.log('🔑 All accounts use password: StudentPass123!');
        
    } catch (error) {
        console.error('❌ Error creating Grade 5 accounts:', error);
    }
}

// Function to show section distribution
function showSectionDistribution() {
    console.log('📊 Section Distribution Preview:');
    const studentsPerSection = Math.ceil(REAL_STUDENTS.length / CONFIG.sections.length);
    
    CONFIG.sections.forEach((section, index) => {
        const startIndex = index * studentsPerSection;
        const endIndex = Math.min(startIndex + studentsPerSection, REAL_STUDENTS.length);
        const sectionStudents = REAL_STUDENTS.slice(startIndex, endIndex);
        
        console.log(`\n📚 Section ${section} (${sectionStudents.length} students):`);
        sectionStudents.forEach((student, i) => {
            const nameParts = parseName(student.name);
            console.log(`  ${i + 1}. ${nameParts.fname} ${nameParts.lname} (${student.studentNumber})`);
        });
    });
    
    console.log(`\n📝 Total: ${REAL_STUDENTS.length} students across ${CONFIG.sections.length} sections`);
    console.log(`📖 Each student will have accounts for: ${CONFIG.subjects.join(', ')}`);
    console.log(`🎯 Total accounts to create: ${REAL_STUDENTS.length * CONFIG.subjects.length}`);
}

// Function to clean up Grade 5 accounts
async function cleanupGrade5Accounts() {
    console.log('🧹 Starting cleanup of Grade 5 accounts...');
    
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
            // Check if it's a Grade 5 account with real student numbers
            if (studentData.gradelevel === "5" && 
                studentData.id && 
                studentData.id.match(/^202[12]\d{7}$/)) { // Matches your student number pattern
                
                try {
                    await db.ref(`students/${uid}`).remove();
                    deletedCount++;
                    console.log(`🗑️ Deleted: ${studentData.fname} ${studentData.lname} (${studentData.id})`);
                } catch (error) {
                    console.error(`❌ Failed to delete ${studentData.email}:`, error.message);
                }
            }
        }
        
        console.log(`🧹 Cleaned up ${deletedCount} Grade 5 accounts.`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

// Export functions for use
window.createGrade5Accounts = createGrade5Accounts;
window.showSectionDistribution = showSectionDistribution;
window.cleanupGrade5Accounts = cleanupGrade5Accounts;

console.log('📋 Grade 5 Real Student Account Generator loaded!');
console.log('📝 Available commands:');
console.log('  - showSectionDistribution() - Preview how students will be distributed');
console.log('  - createGrade5Accounts() - Create Grade 5 accounts with real student data');
console.log('  - cleanupGrade5Accounts() - Remove Grade 5 accounts');
console.log('');
console.log('⚙️ Configuration:');
console.log(`  - Grade Level: ${CONFIG.gradeLevel}`);
console.log(`  - Sections: ${CONFIG.sections.join(', ')}`);
console.log(`  - Subjects: ${CONFIG.subjects.join(', ')}`);
console.log(`  - Total students: ${REAL_STUDENTS.length}`);
console.log('');
console.log('🚀 Run showSectionDistribution() first to preview, then createGrade5Accounts() to start!');
