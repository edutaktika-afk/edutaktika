function renderSummaryGraphs() {
    // 1. Get grades from localStorage (set by grading.html summary)
    const grades = JSON.parse(localStorage.getItem('edutaktikaSummaryGrades') || '[]');

    // 2. Compute analytics
    let passed = grades.filter(g => g >= 75).length;
    let failed = grades.filter(g => g > 0 && g < 75).length;
    let total = grades.length;
    let avg = total ? (grades.reduce((a, b) => a + b, 0) / total).toFixed(2) : 0;

    // 3. Grade distribution bins
    let bins = [0, 60, 70, 75, 80, 85, 90, 95, 100];
    let binLabels = ['60', '60-69', '70-74', '75-79', '80-84', '85-89', '90-94', '95-100'];
    let binCounts = Array(binLabels.length).fill(0);
    grades.forEach(g => {
        for (let i = 0; i < bins.length - 1; i++) {
            if (g >= bins[i] && g < bins[i + 1]) {
                binCounts[i]++;
                return;
            }
        }
        if (g >= 95) binCounts[binCounts.length - 1]++;
    });

    // 1. Completion Rate Pie
    if (window.completionChart) window.completionChart.destroy();
    window.completionChart = new Chart(document.getElementById('completionGraph'), {
        type: 'doughnut',
        data: {
            labels: ['Passed', 'Failed'],
            datasets: [{
                data: [passed, failed],
                backgroundColor: ['#2e8b57', '#e74c3c'],
                borderWidth: 2
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: { display: true, position: 'bottom' }
            }
        }
    });

    // 2. Average Grade Bar (for this teacher's subject only)
    if (window.avgChart) window.avgChart.destroy();
    window.avgChart = new Chart(document.getElementById('subjectGraph'), {
        type: 'bar',
        data: {
            labels: ['Average Grade'],
            datasets: [{
                label: 'Average',
                data: [avg],
                backgroundColor: ['#2e8b57']
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 100 }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // 3. Grade Distribution Histogram (instead of monthly activity)
    if (window.distChart) window.distChart.destroy();
    window.distChart = new Chart(document.getElementById('monthlyGraph'), {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Grade Distribution',
                data: binCounts,
                backgroundColor: '#ffe082'
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Call this on homepage load
document.addEventListener('DOMContentLoaded', renderSummaryGraphs);

// Scroll effect: fade in and slide up
document.addEventListener('DOMContentLoaded', function() {
    const scrollEls = document.querySelectorAll('.scroll-fade');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18 });

    scrollEls.forEach(el => observer.observe(el));
});