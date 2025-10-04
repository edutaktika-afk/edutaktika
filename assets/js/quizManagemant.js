// Add this script for quiz management
function openQuizManagementModal() {
    document.getElementById('quizManagementModal').style.display = 'flex';
    loadQuizManagement();
}

function closeQuizManagementModal() {
    document.getElementById('quizManagementModal').style.display = 'none';
}

async function loadQuizManagement() {
    const content = document.getElementById('quizManagementContent');
    content.innerHTML = '<div style="text-align:center;padding:20px;">Loading...</div>';

    const user = firebase.auth().currentUser;
    if (!user) return;

    const teacherUID = user.uid;
    const teacherSnap = await db.ref('teachers/' + teacherUID).once('value');
    const teacher = teacherSnap.val();
    if (!teacher || !teacher.section) return;

    const section = teacher.section;
    let allQuizzes = [];

    // Load all quizzes from all quarters
    for (let q = 1; q <= 4; q++) {
        const snap = await db.ref('teachers/' + teacherUID + '/sections/' + section + '/quizzes/' + subjectPage + '/' + q).once('value');
        if (snap.exists()) {
            snap.forEach(child => {
                const data = child.val();
                allQuizzes.push({
                    title: child.key,
                    quarter: q,
                    ...data
                });
            });
        }
    }

    if (allQuizzes.length === 0) {
        content.innerHTML = '<div style="text-align:center;padding:20px;color:#666;">No quizzes found.</div>';
        return;
    }

    content.innerHTML = `
        <div style="margin-bottom:20px;">
            <h4 style="margin-bottom:15px;">Your Quizzes</h4>
            ${allQuizzes.map(quiz => `
                <div style="border:1px solid #ddd;border-radius:8px;padding:15px;margin-bottom:10px;background:#f9f9f9;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <h5 style="margin:0;color:#333;">${quiz.title}</h5>
                        <span style="background:${quiz.isLocked ? '#e74c3c' : '#27ae60'};color:white;padding:2px 8px;border-radius:4px;font-size:0.8rem;">
                            ${quiz.isLocked ? '🔒 Locked' : '🔓 Unlocked'}
                        </span>
                    </div>
                    <p style="margin:5px 0;color:#666;font-size:0.9rem;">Quarter ${quiz.quarter} • ${quiz.description || 'No description'}</p>
                    <div style="margin-top:10px;">
                        <strong>Password:</strong> 
                        <span style="background:#ffe600;padding:2px 8px;border-radius:4px;font-family:monospace;font-weight:bold;">${quiz.password || 'No password'}</span>
                    </div>
                    <div style="margin-top:10px;">
                        <button onclick="toggleQuizLock('${quiz.quarter}', '${quiz.title}', ${!quiz.isLocked})" 
                                style="background:${quiz.isLocked ? '#27ae60' : '#e74c3c'};color:white;border:none;padding:5px 12px;border-radius:4px;margin-right:8px;cursor:pointer;">
                            ${quiz.isLocked ? 'Unlock Quiz' : 'Lock Quiz'}
                        </button>
                        <button onclick="regeneratePassword('${quiz.quarter}', '${quiz.title}')" 
                                style="background:#3498db;color:white;border:none;padding:5px 12px;border-radius:4px;margin-right:8px;cursor:pointer;">
                            New Password
                        </button>
                        <button onclick="viewQuizStudentAccess('${quiz.quarter}', '${quiz.title}')" 
                                style="background:#9b59b6;color:white;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;">
                            View Access Log
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function toggleQuizLock(quarter, title, shouldLock) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const teacherUID = user.uid;
    const teacherSnap = await db.ref('teachers/' + teacherUID).once('value');
    const teacher = teacherSnap.val();
    const section = teacher.section;

    try {
        // Update main quiz data
        await db.ref('teachers/' + teacherUID + '/sections/' + section + '/quizzes/' + subjectPage + '/' + quarter + '/' + title + '/isLocked').set(shouldLock);
        
        // Update public quiz data
        await db.ref('publicQuizzes/' + section + '/' + subjectPage + '/' + quarter + '/' + title + '/isLocked').set(shouldLock);
        
        alert(`Quiz ${shouldLock ? 'locked' : 'unlocked'} successfully!`);
        loadQuizManagement(); // Refresh
    } catch (error) {
        alert('Error updating quiz: ' + error.message);
    }
}

async function regeneratePassword(quarter, title) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const teacherUID = user.uid;
    const teacherSnap = await db.ref('teachers/' + teacherUID).once('value');
    const teacher = teacherSnap.val();
    const section = teacher.section;

    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await db.ref('teachers/' + teacherUID + '/sections/' + section + '/quizzes/' + subjectPage + '/' + quarter + '/' + title + '/password').set(newPassword);
        alert(`New password generated: ${newPassword}`);
        loadQuizManagement(); // Refresh
    } catch (error) {
        alert('Error generating new password: ' + error.message);
    }
}

// Add "Manage Quizzes" button next to Create Quiz button
document.addEventListener('DOMContentLoaded', function() {
    const createQuizBtn = document.getElementById('createQuizBtn');
    if (createQuizBtn) {
        const manageBtn = document.createElement('button');
        manageBtn.innerHTML = '<i class="fa fa-cog"></i> Manage Quizzes';
        manageBtn.style.cssText = 'background:#9b59b6;color:white;border:none;border-radius:6px;padding:10px 28px;font-size:1.1rem;font-weight:600;cursor:pointer;margin-left:10px;';
        manageBtn.onclick = openQuizManagementModal;
        createQuizBtn.parentNode.insertBefore(manageBtn, createQuizBtn.nextSibling);
    }
});