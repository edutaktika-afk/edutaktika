// Tab switching logic for navigation buttons
function showTab(tab) {
    // Hide all tab contents
    document.getElementById('contentAdmins').style.display = 'none';
    document.getElementById('contentStudents').style.display = 'none';
    document.getElementById('contentTeachers').style.display = 'none';
    if (document.getElementById('contentAnalytics')) {
        document.getElementById('contentAnalytics').style.display = 'none';
    }

    // Remove 'active' class from all nav tabs and reset their background color
    document.getElementById('tabAdmins').classList.remove('active');
    document.getElementById('tabStudents').classList.remove('active');
    document.getElementById('tabTeachers').classList.remove('active');
    if (document.getElementById('tabAnalytics')) {
        document.getElementById('tabAnalytics').classList.remove('active');
        document.getElementById('tabAnalytics').style.background = '#6c757d';
    }
    document.getElementById('tabAdmins').style.background = '#6c757d';
    document.getElementById('tabStudents').style.background = '#6c757d';
    document.getElementById('tabTeachers').style.background = '#6c757d';

    // Show the selected tab content and set active class and color
    if (tab === 'admins') {
        document.getElementById('contentAdmins').style.display = 'block';
        document.getElementById('tabAdmins').classList.add('active');
        document.getElementById('tabAdmins').style.background = '#2e8b57';
    } else if (tab === 'students') {
        document.getElementById('contentStudents').style.display = 'block';
        document.getElementById('tabStudents').classList.add('active');
        document.getElementById('tabStudents').style.background = '#2e8b57';
        loadStudents();
    } else if (tab === 'teachers') {
        document.getElementById('contentTeachers').style.display = 'block';
        document.getElementById('tabTeachers').classList.add('active');
        document.getElementById('tabTeachers').style.background = '#2e8b57';
        loadTeachers();
    } else if (tab === 'analytics') {
        if (document.getElementById('contentAnalytics')) {
            document.getElementById('contentAnalytics').style.display = 'block';
            document.getElementById('tabAnalytics').classList.add('active');
            document.getElementById('tabAnalytics').style.background = '#2e8b57';
            loadAdminAnalytics();
        }
    }
}

// Set default tab on load
document.addEventListener("DOMContentLoaded", function() {
    showTab('admins');
});

function showTeacherSubTab(tab) {
    document.getElementById('teacherApprovals').style.display = 'none';
    document.getElementById('teacherApproved').style.display = 'none';
    document.getElementById('btnApprovals').classList.remove('active');
    document.getElementById('btnApproved').classList.remove('active');
    if(tab === 'approvals') {
        document.getElementById('teacherApprovals').style.display = 'block';
        document.getElementById('btnApprovals').classList.add('active');
    } else {
        document.getElementById('teacherApproved').style.display = 'block';
        document.getElementById('btnApproved').classList.add('active');
    }
}