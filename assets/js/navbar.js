// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    const burgerBtn = document.getElementById('burgerBtn');
    const nav = document.querySelector('nav');
    const navOverlay = document.getElementById('navOverlay');
    const profileBtn = document.getElementById('profileBtn');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const profileSidebarOverlay = document.getElementById('profileSidebarOverlay');
    const closeNavBtn = document.getElementById('closeNavBtn');

    // Profile sidebar functions
    function openSidebar() {
        const profileSidebar = document.getElementById('profileSidebar');
        if (profileSidebar) {
            profileSidebar.classList.add('open');
            profileSidebar.classList.add('active');
        }
        if (profileSidebarOverlay) {
            profileSidebarOverlay.classList.add('active');
        }
    }

    function closeSidebar() {
        const profileSidebar = document.getElementById('profileSidebar');
        if (profileSidebar) {
            profileSidebar.classList.remove('open');
            profileSidebar.classList.remove('active');
        }
        if (profileSidebarOverlay) {
            profileSidebarOverlay.classList.remove('active');
        }
    }

    // Burger button navigation
    if (burgerBtn && nav) {
        burgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            nav.classList.toggle('open');
            burgerBtn.classList.toggle('open');
        });
    }

    // Navigation overlay
    if (navOverlay) {
        navOverlay.addEventListener('click', function(e) {
            if (e.target === navOverlay) {
                if (nav) nav.classList.remove('open');
                if (burgerBtn) burgerBtn.classList.remove('open');
                navOverlay.classList.remove('active');
            }
        });
    }

    // Profile button
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            if (window.innerWidth <= 700) {
                e.preventDefault();
                openSidebar();
            }
        });
    }

    // Close sidebar button
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }

    // Profile sidebar overlay
    if (profileSidebarOverlay) {
        profileSidebarOverlay.addEventListener('click', function(e) {
            if (e.target === profileSidebarOverlay) {
                closeSidebar();
            }
        });
    }

    // Close nav button
    if (closeNavBtn) {
        closeNavBtn.addEventListener('click', function() {
            if (nav) nav.classList.remove('open');
            if (burgerBtn) burgerBtn.classList.remove('open');
            if (navOverlay) navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});
