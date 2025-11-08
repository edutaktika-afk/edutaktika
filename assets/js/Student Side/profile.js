
// Listen for auth state
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        firebase.database().ref('students/' + user.uid).once('value').then(function(snapshot) {
            const data = snapshot.val();
            if (data) {
                document.getElementById('profileName').textContent = (data.fname || '') + ' ' + (data.lname || '');
                document.getElementById('profileId').textContent = data.id || user.uid;
                document.getElementById('profileFirstName').textContent = data.fname || '';
                document.getElementById('profileMiddleName').textContent = data.mname || '';
                document.getElementById('profileLastName').textContent = data.lname || '';
                document.getElementById('profileGrade').textContent = data.grade || '';
                document.getElementById('profileSection').textContent = data.section || '';
                document.getElementById('profileAvatar').src = "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(data.fname || "user");
            }
        });
    } else if(!user) {
        window.location.href = "../index.html";
    } else {
        document.getElementById('profileName').textContent = "Not logged in";
    }
});

// Logout logic
document.getElementById('logoutSwitch').onclick = function() {
    firebase.auth().signOut().then(function() {
        window.location.href = "../index.html";
    });
};