
// Enhanced quiz loading for students from their availableQuizzes collection
async function loadStudentAvailableQuizzes(studentUID) {
    console.log('Loading available quizzes for student:', studentUID);
    
    const quizzesContainer = document.getElementById('quizzesContainer');
    if (!quizzesContainer) return;

    // Show loading message
    quizzesContainer.innerHTML = '<div style="color:#888;text-align:center;padding:20px;">Loading your assigned quizzes...</div>';

    try {
        const subjectPage = "subject_math";
        let allQuizzes = [];

        // Load quizzes from all quarters
        for (let q = 1; q <= 4; q++) {
            const quizzesPath = `students/${studentUID}/quizzes/${subjectPage}/${q}`;
            console.log(`Checking available quizzes: ${quizzesPath}`);
            
            const quizzesSnap = await db.ref(quizzesPath).once('value');
            if (quizzesSnap.exists()) {
                console.log(`✓ Found available quizzes for Q${q}:`, quizzesSnap.val());
                quizzesSnap.forEach(quizSnap => {
                    const quiz = quizSnap.val();
                    allQuizzes.push({
                        ...quiz,
                        name: quizSnap.key,
                        quarter: q,
                        source: 'available'
                    });
                });
            }
        }

        console.log(`Total available quizzes found:`, allQuizzes.length);

        // Clear container
        quizzesContainer.innerHTML = '';

        if (allQuizzes.length === 0) {
            const emptyMsg = document.createElement('div');
            
            quizzesContainer.appendChild(emptyMsg);
        } else {
            // Sort quizzes by creation date (newest first)
            allQuizzes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            // Create section headers for each quarter that has quizzes
            const quarterGroups = {};
            allQuizzes.forEach(quiz => {
                if (!quarterGroups[quiz.quarter]) {
                    quarterGroups[quiz.quarter] = [];
                }
                quarterGroups[quiz.quarter].push(quiz);
            });

            // Render quizzes grouped by quarter
            Object.keys(quarterGroups).sort().forEach(quarter => {
                const quizzes = quarterGroups[quarter];
                
                // Create quarter header
                const quarterHeader = document.createElement('div');
                quizzesContainer.appendChild(quarterHeader);

                // Create quiz grid container
                const quizGrid = document.createElement('div');
                quizGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;';
                
                quizzes.forEach(quiz => {
                    const quizItem = document.createElement('div');
                    quizItem.className = 'lesson-item student-quiz-item';
                    
                    const createdDate = quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : '';
                    const isLocked = quiz.isLocked !== false; // Default to locked
                    const hasPassword = quiz.hasPassword !== false; // Default to has password
                    
                    quizItem.innerHTML = `
                        <div class="lesson-thumbnail" style="background: linear-gradient(135deg, #ffe600 0%, #ffcd00 100%); position: relative;">
                            <div style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; font-size: 10px; padding: 2px 6px; border-radius: 3px;">
                                ${quiz.teacherName || 'Teacher'}
                            </div>
                            <div style="position: absolute; top: 5px; left: 5px; background: ${isLocked ? '#e74c3c' : '#27ae60'}; color: white; font-size: 9px; padding: 2px 4px; border-radius: 3px; font-weight: bold;">
                                ${isLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
                            </div>
                            <div style="position: absolute; bottom: 5px; right: 5px; background: rgba(255,255,255,0.9); color: #333; font-size: 10px; padding: 2px 6px; border-radius: 3px;">
                                <i class="fas fa-puzzle-piece"></i> QUIZ
                            </div>
                            <div style="position: absolute; bottom: 5px; left: 5px; background: rgba(255,255,255,0.9); color: #333; font-size: 10px; padding: 2px 6px; border-radius: 3px;">
                                Q${quiz.quarter}
                            </div>
                        </div>
                        <div class="lesson-title">
                            <h3>${quiz.title || quiz.name}</h3>
                            <p>${quiz.description || 'Teacher quiz'}</p>
                            <div style="font-size: 0.85rem; color: #666; margin: 4px 0;">
                                <i class="fas fa-user-tie" style="margin-right: 4px;"></i>${quiz.teacherName || 'Teacher'}
                                ${createdDate ? `• ${createdDate}` : ''}
                            </div>
                            <div style="font-size: 0.8rem; color: #999; margin: 8px 0;">
                                Status: <span style="color: ${quiz.status === 'available' ? '#27ae60' : '#e74c3c'};">${quiz.status || 'available'}</span>
                                ${hasPassword ? ' • Password Required' : ''}
                            </div>
                            ${isLocked ? 
                                `<button class="lesson-badge" onclick="unlockStudentQuiz('${quiz.quarter}','${quiz.name}','${subjectPage}')" style="cursor:pointer; background: #e74c3c;">
                                    🔒 Enter Password
                                </button>` :
                                `<button class="lesson-badge" onclick="startStudentQuiz('${quiz.quarter}','${quiz.name}','${quiz.createdBy}','${subjectPage}')" style="cursor:pointer; background: #27ae60;">
                                    ▶ Start Quiz
                                </button>`
                            }
                        </div>
                    `;
                    quizGrid.appendChild(quizItem);
                });
                
                quizzesContainer.appendChild(quizGrid);
            });
        }

    } catch (error) {
        console.error('Error loading available quizzes:', error);
        quizzesContainer.innerHTML = `<div style="color:#e74c3c;text-align:center;padding:20px;">Error loading quizzes: ${error.message}</div>`;
    }
}

// Function to unlock student quiz with password
window.unlockStudentQuiz = async function(quarter, name, subject) {
    const password = prompt('Enter the quiz password provided by your teacher:');
    if (!password) return;

    const user = firebase.auth().currentUser;
    if (!user) return;

    const studentUID = user.uid;

    try {
        // Check the quiz from availableQuizzes to get the correct password
        const availableQuizRef = db.ref(`students/${studentUID}/availableQuizzes/${subject}/${quarter}/${name}`);
        const availableQuizSnap = await availableQuizRef.once('value');
        
        if (!availableQuizSnap.exists()) {
            alert('Quiz not found.');
            return;
        }

        const availableQuiz = availableQuizSnap.val();
        
        // For available quizzes, we need to check the teacher's quiz for the password
        if (availableQuiz.teacherUID && availableQuiz.section) {
            const teacherQuizRef = db.ref(`teachers/${availableQuiz.teacherUID}/sections/${availableQuiz.section}/quizzes/${subject}/${quarter}/${name}`);
            const teacherQuizSnap = await teacherQuizRef.once('value');
            
            if (teacherQuizSnap.exists()) {
                const teacherQuiz = teacherQuizSnap.val();
                
                if (teacherQuiz.password === password) {
                    // Unlock the quiz in availableQuizzes
                    await availableQuizRef.update({
                        isLocked: false,
                        unlockedAt: new Date().toISOString(),
                        status: 'unlocked'
                    });
                    
                    // Also save to student's personal quizzes if not already there
                    const personalQuizRef = db.ref(`students/${studentUID}/quizzes/${subject}/${quarter}/${name}`);
                    const personalQuizSnap = await personalQuizRef.once('value');
                    
                    if (!personalQuizSnap.exists()) {
                        // Copy the complete quiz data to student's personal collection
                        await personalQuizRef.set({
                            ...teacherQuiz,
                            studentUID: studentUID,
                            assignedBy: availableQuiz.teacherUID,
                            assignedAt: availableQuiz.createdAt,
                            unlockedAt: new Date().toISOString(),
                            status: 'unlocked',
                            attempts: 0,
                            bestScore: 0,
                            lastAttemptAt: null,
                            isLocked: false
                        });
                    } else {
                        // Just unlock the existing personal quiz
                        await personalQuizRef.update({
                            isLocked: false,
                            unlockedAt: new Date().toISOString(),
                            status: 'unlocked'
                        });
                    }
                    
                    alert('Quiz unlocked successfully! You can now start the quiz.');
                    
                    // Reload the quizzes to show updated status
                    loadStudentAvailableQuizzes(studentUID);
                } else {
                    alert('Incorrect password. Please try again.');
                }
            } else {
                alert('Quiz data not found. Please contact your teacher.');
            }
        } else {
            alert('Quiz information incomplete. Please contact your teacher.');
        }
    } catch (error) {
        console.error('Error unlocking quiz:', error);
        alert('Error unlocking quiz. Please try again.');
    }
};

// Function to start student quiz
window.startStudentQuiz = function(quarter, name, teacherUID, subject) {
    console.log('Starting student quiz:', { quarter, name, teacherUID, subject });
    
    const params = new URLSearchParams({
        quarter: quarter,
        name: name,
        subject: subject,
        teacher: teacherUID,
        mode: 'student'
    });
    
    window.location.href = 'quizPlayer.html?' + params.toString();
};

// Enhanced auth state handler that loads available quizzes
firebase.auth().onAuthStateChanged(async function(user) {
    if (!user) {
        window.location.href = "logreg.html";
        return;
    }

    const studentUID = user.uid;
    
    try {
        const studentSnap = await db.ref('students/' + studentUID).once('value');
        const student = studentSnap.val();
        
        if (!student || student.role !== "student") {
            alert("Access denied.");
            await firebase.auth().signOut();
            window.location.href = "logreg.html";
            return;
        }

        document.getElementById('mainContent').style.display = "block";

        // Load available quizzes for the student
        await loadStudentAvailableQuizzes(studentUID);

    } catch (error) {
        console.error('Error in student auth state change:', error);
    }
});

