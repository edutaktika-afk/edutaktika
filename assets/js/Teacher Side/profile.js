const firebaseConfig = {
            apiKey: "AIzaSyB5BbeLLvPX8l1c4Lq0f-CmIUml4hQOQlE",
            authDomain: "edutaktika.firebaseapp.com",
            databaseURL: "https://edutaktika-default-rtdb.firebaseio.com",
            projectId: "edutaktika",
            storageBucket: "edutaktika.appspot.com",
            messagingSenderId: "676848575316",
            appId: "1:676848575316:web:f78f8c0f83bf3d9dfb5ec1",
            measurementId: "G-X3GT5TNN87"
        };
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();
        const auth = firebase.auth();
        // Make them globally accessible
        window.db = db;
        window.auth = auth;

          // Listen for auth state
          firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              firebase.database().ref('teachers/' + user.uid).once('value').then(function(snapshot) {
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
                // After fetching student data in the sidebar:
if (data.address) {
    document.getElementById('profileAddressStreet').textContent = data.address.street || '-';
    document.getElementById('profileAddressBarangay').textContent = data.address.barangay || '-';
    document.getElementById('profileAddressCity').textContent = data.address.city || '-';
    document.getElementById('profileAddressProvince').textContent = data.address.province || '-';
    document.getElementById('profileAddressZip').textContent = data.address.zip || '-';
    document.getElementById('profileAddressRegion').textContent = data.address.region || '-';
}
              });
            } else if(!user) {
                    window.location.href = "logreg.html";
                }
            
            
            else {
              document.getElementById('profileName').textContent = "Not logged in";
            }
          });

          // Logout logic
          document.getElementById('logoutSwitch').onclick = function() {
            firebase.auth().signOut().then(function() {
              window.location.href = "logreg.html";
            });
          };