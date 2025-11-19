// Only initialize Firebase if not already initialized
if (typeof firebase !== 'undefined' && (!firebase.apps || firebase.apps.length === 0)) {
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
    try {
        firebase.initializeApp(firebaseConfig);
    } catch (e) {
        // Firebase already initialized, ignore
        console.log('Firebase already initialized');
    }
}

// Use existing db and auth if available, otherwise create them
// Don't redeclare if they already exist
if (typeof db === 'undefined') {
    var db = window.db || (typeof firebase !== 'undefined' ? firebase.database() : null);
}
if (typeof auth === 'undefined') {
    var auth = window.auth || (typeof firebase !== 'undefined' ? firebase.auth() : null);
}

// Make them globally accessible
if (db) window.db = db;
if (auth) window.auth = auth;

          // Listen for auth state - wait for DOM to be ready
          function initProfile() {
            const authInstance = window.auth || (typeof auth !== 'undefined' ? auth : null);
            if (!authInstance) {
              // Wait a bit for Firebase to initialize
              setTimeout(initProfile, 100);
              return;
            }
            
            authInstance.onAuthStateChanged(function(user) {
              if (user) {
                const dbInstance = window.db || (typeof db !== 'undefined' ? db : null);
                if (!dbInstance) {
                  console.error('Database not available for profile');
                  return;
                }
                
                dbInstance.ref('teachers/' + user.uid).once('value').then(function(snapshot) {
                  const data = snapshot.val();
                  if (data) {
                    const profileNameEl = document.getElementById('profileName');
                    const profileIdEl = document.getElementById('profileId');
                    const profileFirstNameEl = document.getElementById('profileFirstName');
                    const profileMiddleNameEl = document.getElementById('profileMiddleName');
                    const profileLastNameEl = document.getElementById('profileLastName');
                    const profileGradeEl = document.getElementById('profileGrade');
                    const profileSectionEl = document.getElementById('profileSection');
                    const profileAvatarEl = document.getElementById('profileAvatar');
                    
                    if (profileNameEl) profileNameEl.textContent = (data.fname || '') + ' ' + (data.lname || '');
                    if (profileIdEl) profileIdEl.textContent = data.id || user.uid;
                    if (profileFirstNameEl) profileFirstNameEl.textContent = data.fname || '';
                    if (profileMiddleNameEl) profileMiddleNameEl.textContent = data.mname || '';
                    if (profileLastNameEl) profileLastNameEl.textContent = data.lname || '';
                    if (profileGradeEl) profileGradeEl.textContent = data.grade || '';
                    if (profileSectionEl) profileSectionEl.textContent = data.section || '';
                    if (profileAvatarEl) profileAvatarEl.src = "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(data.fname || "user");
                    
                    // After fetching student data in the sidebar:
                    if (data.address) {
                      const streetEl = document.getElementById('profileAddressStreet');
                      const barangayEl = document.getElementById('profileAddressBarangay');
                      const cityEl = document.getElementById('profileAddressCity');
                      const provinceEl = document.getElementById('profileAddressProvince');
                      const zipEl = document.getElementById('profileAddressZip');
                      const regionEl = document.getElementById('profileAddressRegion');
                      
                      if (streetEl) streetEl.textContent = data.address.street || '-';
                      if (barangayEl) barangayEl.textContent = data.address.barangay || '-';
                      if (cityEl) cityEl.textContent = data.address.city || '-';
                      if (provinceEl) provinceEl.textContent = data.address.province || '-';
                      if (zipEl) zipEl.textContent = data.address.zip || '-';
                      if (regionEl) regionEl.textContent = data.address.region || '-';
                    }
                  }
                }).catch(function(error) {
                  console.error('Error loading profile data:', error);
                });
              } else if (!user) {
                window.location.href = "logreg.html";
              } else {
                const profileNameEl = document.getElementById('profileName');
                if (profileNameEl) profileNameEl.textContent = "Not logged in";
              }
            });

            // Logout logic
            const logoutSwitch = document.getElementById('logoutSwitch');
            if (logoutSwitch) {
              logoutSwitch.onclick = function() {
                const authInstance = window.auth || (typeof auth !== 'undefined' ? auth : null);
                if (authInstance) {
                  authInstance.signOut().then(function() {
                    window.location.href = "logreg.html";
                  });
                } else {
                  window.location.href = "logreg.html";
                }
              };
            }
          }
          
          // Initialize when DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initProfile);
          } else {
            initProfile();
          }