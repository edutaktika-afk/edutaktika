/**
 * Grading System Demo Script
 * Demonstrates the functionality of the dynamic grading system
 */

// Demo function to show grading system capabilities
function demonstrateGradingSystem() {
    console.log('=== Edutaktika Grading System Demo ===');
    
    // Example grading configuration
    const exampleConfig = [
        { name: 'Attendance', percentage: 10, required: true },
        { name: 'Quiz', percentage: 20, required: true },
        { name: 'Midterm Exam (Semi-finals)', percentage: 25, required: true },
        { name: 'Final Exam (Periodical)', percentage: 30, required: true },
        { name: 'Activities', percentage: 15, required: true },
        { name: 'Project Work', percentage: 0, required: false }
    ];

    console.log('Default Configuration:');
    exampleConfig.forEach(attr => {
        console.log(`- ${attr.name}: ${attr.percentage}% ${attr.required ? '(Required)' : '(Optional)'}`);
    });

    const total = exampleConfig.reduce((sum, attr) => sum + attr.percentage, 0);
    console.log(`Total: ${total}%`);
    console.log(`Valid Configuration: ${total === 100 ? 'Yes' : 'No'}`);

    // Demonstrate validation
    console.log('\n=== Validation Examples ===');
    
    // Valid case
    console.log('✅ Valid: All percentages sum to 100%');
    
    // Invalid cases
    console.log('❌ Invalid: Total < 100% (Missing percentage)');
    console.log('❌ Invalid: Total > 100% (Exceeds limit)');
    console.log('❌ Invalid: Negative percentages not allowed');
    console.log('❌ Invalid: Individual attribute > 100% not allowed');

    // Dynamic features
    console.log('\n=== Dynamic Features ===');
    console.log('✨ Add custom attributes (e.g., "Group Work", "Presentation")');
    console.log('✨ Remove optional attributes');
    console.log('✨ Real-time validation and feedback');
    console.log('✨ Automatic saving to Firebase');
    console.log('✨ Responsive design for all devices');
    console.log('✨ Visual feedback with color coding');

    return exampleConfig;
}

// Utility function to calculate grade based on configuration
function calculateStudentGrade(scores, gradingConfig) {
    let totalGrade = 0;
    let totalWeight = 0;

    gradingConfig.forEach(attr => {
        if (attr.percentage > 0 && scores[attr.name] !== undefined) {
            totalGrade += (scores[attr.name] * attr.percentage / 100);
            totalWeight += attr.percentage;
        }
    });

    return totalWeight > 0 ? (totalGrade / totalWeight * 100) : 0;
}

// Example usage
function exampleGradeCalculation() {
    const config = demonstrateGradingSystem();
    
    // Example student scores
    const studentScores = {
        'Attendance': 95,
        'Quiz': 85,
        'Midterm Exam (Semi-finals)': 88,
        'Final Exam (Periodical)': 92,
        'Activities': 90
    };

    console.log('\n=== Grade Calculation Example ===');
    console.log('Student Scores:', studentScores);
    
    const finalGrade = calculateStudentGrade(studentScores, config);
    console.log(`Final Grade: ${finalGrade.toFixed(2)}%`);

    return finalGrade;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        demonstrateGradingSystem,
        calculateStudentGrade,
        exampleGradeCalculation
    };
}

// Auto-run demo if script is loaded directly
if (typeof window !== 'undefined') {
    // Run demo when page loads (for demonstration purposes)
    document.addEventListener('DOMContentLoaded', function() {
        if (window.location.pathname.includes('grading.html')) {
            console.log('Grading System loaded successfully!');
            // Uncomment the line below to see the demo in console
            // demonstrateGradingSystem();
        }
    });
}
