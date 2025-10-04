// Add this script to the student version of subject_math.html
(function() {
    // Function to load teacher-created quizzes for students
    async function loadTeacherQuizzesForStudents() {
        const user = firebase.auth().currentUser;
        if (!user) return;

        try {
            const uid = user.uid;
            
            // Get student info
            const studentSnap = await db.ref('students/' + uid).once('value');
            const student = studentSnap.val();
            if (!student || !student.section) {
                console.log('No student section found');
                return;
            }

            const section = student.section;
            const subject = 'subject_math'; // Adjust based on current subject

            // Load teacher quizzes for each quarter
            for (let quarter = 1; quarter <= 4; quarter++) {
                await loadQuizzesForQuarter(section, subject, quarter);
            }

        } catch (error) {
            console.error('Error loading teacher quizzes:', error);
        }
    }

    // Function to load quizzes for a specific quarter
    async function loadQuizzesForQuarter(section, subject, quarter) {
        try {
            const quizPath = `publicQuizzes/${section}/${subject}/${quarter}`;
            const quizzesSnap = await db.ref(quizPath).once('value');

            if (!quizzesSnap.exists()) {
                return;
            }

            const quizContainer = document.getElementById('quiz-list') || document.querySelector(`#quarter-${quarter} .lessons-container`);
            if (!quizContainer) return;

            // Process each quiz
            quizzesSnap.forEach(quizSnap => {
                const quiz = quizSnap.val();
                const quizName = quizSnap.key;
                
                // Create quiz card for student
                const quizCard = createStudentQuizCard(quiz, quizName, quarter, section, subject);
                quizContainer.appendChild(quizCard);
            });

        } catch (error) {
            console.error(`Error loading quizzes for quarter ${quarter}:`, error);
        }
    }

    // Function to create a student quiz card
    function createStudentQuizCard(quiz, quizName, quarter, section, subject) {
        const card = document.createElement('div');
        card.className = 'lesson-item teacher-quiz-item';
        card.setAttribute('data-quarter', quarter);

        const isLocked = quiz.isLocked !== false; // Default to locked if not specified
        const lockIcon = isLocked ? '🔒' : '🔓';
        const lockStatus = isLocked ? 'Locked' : 'Available';

        card.innerHTML = `
            <div class="lesson-thumbnail" style="background: linear-gradient(135deg, ${isLocked ? '#e74c3c' : '#27ae60'} 0%, ${isLocked ? '#c0392b' : '#229954'} 100%); display:flex; align-items:center; justify-content:center; font-size:28px; color:#fff; position:relative;">
                <i class="fas ${isLocked ? 'fa-lock' : 'fa-unlock'}"></i>
                <div style="position:absolute; bottom:4px; right:4px; background:rgba(0,0,0,0.7); color:white; font-size:10px; padding:2px 6px; border-radius:4px;">
                    Q${quarter}
                </div>
            </div>
            <div class="lesson-title">
                <h3>${quiz.title}</h3>
                <p>${quiz.description || 'Teacher-created quiz'}</p>
                <div style="font-size:0.85rem; color:#666; margin:4px 0;">
                    <i class="fas fa-user-tie" style="margin-right:4px;"></i>Teacher Quiz • ${lockStatus}
                </div>
                <div style="margin:8px 0; display:flex; gap:8px; flex-wrap:wrap;">
                    ${isLocked 
                        ? `<span class="lesson-badge" style="background:#e74c3c; cursor:pointer;" onclick="unlockQuiz('${section}', '${subject}', '${quarter}', '${quizName}')">
                            ${lockIcon} Unlock Quiz
                           </span>`
                        : `<span class="lesson-badge" style="background:#27ae60; cursor:pointer;" onclick="startTeacherQuiz('${section}', '${subject}', '${quarter}', '${quizName}')">
                            Start Quiz
                           </span>`
                    }
                </div>
                <div style="margin-top:8px; font-size:0.9rem; color:#444;" id="teacher-quiz-${quizName.replace(/[^a-zA-Z0-9]/g, '')}-score">
                    ${isLocked ? 'Enter password to unlock' : 'Click to start quiz'}
                </div>
            </div>
        `;

        return card;
    }

    // Function to unlock quiz with password
    window.unlockQuiz = async function(section, subject, quarter, quizName) {
        const password = prompt('Enter the quiz password:');
        if (!password) return;

        try {
            // Get teacher's quiz data to verify password
            const teachersSnap = await db.ref('teachers').once('value');
            let correctPassword = null;
            let teacherUID = null;

            teachersSnap.forEach(teacherSnap => {
                const teacher = teacherSnap.val();
                if (teacher.section === section) {
                    teacherUID = teacherSnap.key;
                }
            });

            if (!teacherUID) {
                alert('Teacher not found for this section.');
                return;
            }

            const quizSnap = await db.ref(`teachers/${teacherUID}/sections/${section}/quizzes/${subject}/${quarter}/${quizName}`).once('value');
            if (quizSnap.exists()) {
                const quizData = quizSnap.val();
                correctPassword = quizData.password;
            }

            if (password === correctPassword) {
                // Password correct - log access and start quiz
                const user = firebase.auth().currentUser;
                if (user) {
                    // Log quiz access
                    await db.ref(`quizAccess/${quizName}/${user.uid}`).set({
                        timestamp: new Date().toISOString(),
                        studentId: user.uid,
                        section: section
                    });
                }

                alert('Quiz unlocked! Starting quiz...');
                startTeacherQuiz(section, subject, quarter, quizName, teacherUID);
            } else {
                alert('Incorrect password. Please ask your teacher for the correct password.');
            }

        } catch (error) {
            console.error('Error unlocking quiz:', error);
            alert('Error unlocking quiz. Please try again.');
        }
    };

    // Function to start teacher quiz
    window.startTeacherQuiz = function(section, subject, quarter, quizName, teacherUID) {
        const params = new URLSearchParams({
            type: 'teacher',
            teacher: teacherUID || 'unknown',
            section: section,
            subject: subject,
            quarter: quarter,
            quiz: quizName
        });
        
        window.location.href = `teacher-quiz-player.html?${params.toString()}`;
    };

    // Initialize when auth state changes
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            setTimeout(() => {
                loadTeacherQuizzesForStudents();
            }, 1000);
        }
    });
})();