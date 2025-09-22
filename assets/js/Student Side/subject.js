
    // Quarter tab switching
    const quarterTabs = document.querySelectorAll(".quarter-tab");
    const quarterSections = document.querySelectorAll(".quarter-section");

    quarterTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            // Remove active class from all tabs and sections
            quarterTabs.forEach((t) => t.classList.remove("active"));
            quarterSections.forEach((s) => s.classList.remove("active"));

            // Add active class to clicked tab and corresponding section
            tab.classList.add("active");
            const quarterId = `quarter-${tab.dataset.quarter}`;
            document.getElementById(quarterId).classList.add("active");
        });
    });

    document.querySelectorAll('.lesson-item[data-lesson]').forEach((item) => {
        item.addEventListener('click', function (e) {
            // Prevent click if Edit button is clicked
            if (e.target.tagName === 'BUTTON') return;
            e.preventDefault();
            let lessonNum = item.getAttribute('data-lesson');
            // Open lessonTeacher.php in a fullscreen modal
            if (document.getElementById('teacher-fullscreen-modal')) return false;
            let modal = document.createElement('div');
            modal.id = 'teacher-fullscreen-modal';
            modal.style.position = 'fixed';
            modal.style.top = 0;
            modal.style.left = 0;
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.8)';
            modal.style.zIndex = 9999;
            modal.innerHTML = `
                <iframe src="lessonTeacher.php?lesson=${lessonNum}"
                    style="width:100%; height:100%; border:none;"></iframe>
                <button onclick="document.getElementById('teacher-fullscreen-modal').remove();"
                    style="position:absolute; top:20px; right:20px; background:red; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer;">
                    Close
                </button>
            `;
            document.body.appendChild(modal);
        });
    });

    // View toggle functionality
    const gridViewBtn = document.querySelector(".grid-view-btn");
    const listViewBtn = document.querySelector(".list-view-btn");
    const lectureList = document.querySelector(".lecture-list");

    if (gridViewBtn) {
        gridViewBtn.addEventListener("click", () => {
            gridViewBtn.classList.add("active");
            if (listViewBtn) listViewBtn.classList.remove("active");
            if (lectureList) lectureList.classList.remove("list-view");
        });
    }

    if (listViewBtn) {
        listViewBtn.addEventListener("click", () => {
            listViewBtn.classList.add("active");
            if (gridViewBtn) gridViewBtn.classList.remove("active");
            if (lectureList) lectureList.classList.add("list-view");
        });
    }

    
    

    function updateProgress() {
        // This would calculate actual progress in a real app
        console.log("Progress updated!");
    }
