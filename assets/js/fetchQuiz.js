// Fetch and display quiz tests/types in the sidebar
async function fetchAndShowQuizTests() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const section = window.teacherSection || '';
    const subject = getParam('subject');
    const quarter = getParam('quarter');
    const title = getParam('name') || getParam('title');
    if (!section || !subject || !quarter || !title) return;

    // Fetch quiz data
    const quizRef = db.ref(`teachers/${user.uid}/sections/${section}/quizzes/${subject}/${quarter}/${title}`);
    const snap = await quizRef.once('value');
    const quiz = snap.val();

    // Display tests and types in the sidebar group
    const testsList = document.getElementById('quiz-tests-list');
    testsList.innerHTML = '';
    if (quiz && Array.isArray(quiz.tests) && quiz.tests.length > 0) {
        quiz.tests.forEach((test, idx) => {
            const li = document.createElement('li');
            li.textContent = `${test.name}: ${test.type}`;
            testsList.appendChild(li);
        });
    } else {
        testsList.innerHTML = '<li style="color:#c00;">No tests found for this quiz.</li>';
    }
}

// Call this after authentication and after you load teacher profile
auth.onAuthStateChanged(async user => {
    if (!user) return;
    // Load teacher profile and cache section
    const teacherSnap = await db.ref('teachers/' + user.uid).once('value');
    const teacher = teacherSnap.val();
    window.teacherSection = teacher && teacher.section ? teacher.section : '';
    // ...other initialization...
    await fetchAndShowQuizTests();
});