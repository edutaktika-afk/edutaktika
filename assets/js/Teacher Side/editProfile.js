
// Open modal and fill with current info
const profileEditBtn = document.querySelector('.profile-edit-btn');
if (profileEditBtn) {
    profileEditBtn.onclick = async function() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const snap = await firebase.database().ref('teachers/' + user.uid).once('value');
    const data = snap.val() || {};
    document.getElementById('edit_fname').value = data.fname || '';
    document.getElementById('edit_mname').value = data.mname || '';
    document.getElementById('edit_lname').value = data.lname || '';
    document.getElementById('edit_gradelevel').value = data.grade || '';
    document.getElementById('edit_section').value = data.section || '';
    document.getElementById('editProfileModal').style.display = 'flex';
    };
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').style.display = 'none';
}

// Save changes
const editProfileForm = document.getElementById('editProfileForm');
if (editProfileForm) {
    editProfileForm.onsubmit = async function(e) {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;
    const updates = {
        fname: document.getElementById('edit_fname').value,
        mname: document.getElementById('edit_mname').value,
        lname: document.getElementById('edit_lname').value,
        grade: document.getElementById('edit_gradelevel').value,
        section: document.getElementById('edit_section').value
    };
    await firebase.database().ref('teachers/' + user.uid).update(updates);
    closeEditProfileModal();
    // Optionally, refresh profile info on sidebar
    location.reload();
    };
}