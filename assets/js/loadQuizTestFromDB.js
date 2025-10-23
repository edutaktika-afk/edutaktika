function loadQuizTestsFromDB() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const section = getParam('section') || (window.teacherSection || '');
    const subject = getParam('subject');
    const quarter = getParam('quarter');
    const name = getParam('name') || getParam('title');
    if (!section || !subject || !quarter || !name) return;

    db.ref(`teachers/${user.uid}/sections/${section}/quizzes/${subject}/${quarter}/${name}`)
      .once('value')
      .then(snap => {
        const quiz = snap.val();
        if (quiz && Array.isArray(quiz.tests)) {
            quizTests = quiz.tests;
        } else {
            quizTests = [];
        }
        renderQuizTestsSidebar();
      });
}

// Sidebar rendering function
function renderQuizTestsSidebar() {
    const testsList = document.getElementById('quiz-tests-list');
    testsList.innerHTML = '';
    if (quizTests.length > 0) {
        quizTests.forEach((test, idx) => {
            const li = document.createElement('li');
            li.textContent = `${test.name}: ${test.type}`;
            testsList.appendChild(li);
        });
    } else {
        testsList.innerHTML = '<li style="color:#c00;">No tests found for this quiz.</li>';
    }
}