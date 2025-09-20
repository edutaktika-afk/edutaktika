
function openSidebar() {
    document.getElementById('profileSidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('active');
}
function closeSidebar() {
    document.getElementById('profileSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

// Open sidebar when profile button is clicked (mobile only)
document.getElementById('profileBtn').addEventListener('click', function(e) {
    // Only slide in on mobile
    if (window.innerWidth <= 700) {
        e.preventDefault();
        openSidebar();
    }
});

// Close sidebar when close button is clicked
document.getElementById('closeSidebar').addEventListener('click', closeSidebar);



const burgerBtn = document.getElementById('burgerBtn');
const nav = document.querySelector('nav');
// Navbar overlay logic
const navOverlay = document.getElementById('navOverlay');

burgerBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    nav.classList.toggle('open');
    burgerBtn.classList.toggle('open');
    // Only show overlay for nav if you want a dark background, otherwise comment out:
    // sidebarOverlay.classList.toggle('active');
    
});

navOverlay.addEventListener('click', function(e) {
    if (e.target === navOverlay) {
        nav.classList.remove('open');
        burgerBtn.classList.remove('open');
        navOverlay.classList.remove('active');
    }
});


// Profile sidebar overlay logic
const profileSidebarOverlay = document.getElementById('profileSidebarOverlay');
function openSidebar() {
    document.getElementById('profileSidebar').classList.add('open');
    profileSidebarOverlay.classList.add('active');
}
function closeSidebar() {
    document.getElementById('profileSidebar').classList.remove('open');
    profileSidebarOverlay.classList.remove('active');
}
document.getElementById('profileBtn').addEventListener('click', function(e) {
    if (window.innerWidth <= 700) {
        e.preventDefault();
        openSidebar();
    }
});
document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
profileSidebarOverlay.addEventListener('click', function(e) {
    if (e.target === profileSidebarOverlay) {
        closeSidebar();
    }
});

document.getElementById('closeNavBtn').addEventListener('click', function() {
    document.querySelector('nav').classList.remove('open');
    document.getElementById('burgerBtn').classList.remove('open');
    document.getElementById('navOverlay').classList.remove('active');
    document.body.style.overflow = '';
});

document.getElementById('closeNavBtn').addEventListener('click', function() {
    document.querySelector('nav').classList.remove('open');
    document.getElementById('burgerBtn').classList.remove('open');
    document.getElementById('navOverlay').classList.remove('active');
    document.body.style.overflow = '';
});

