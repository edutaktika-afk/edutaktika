/**
 * Grading Sheet Demo Data
 * Provides sample data and utilities for demonstrating the grading system
 */

// Sample student data structure
const sampleStudents = [
    {
        uid: 'student_001',
        fname: 'John',
        lname: 'Doe',
        id: 'STU001',
        section: 'Grade 5-A',
        gradelevel: '5'
    },
    {
        uid: 'student_002',
        fname: 'Jane',
        lname: 'Smith',
        id: 'STU002',
        section: 'Grade 5-A',
        gradelevel: '5'
    },
    {
        uid: 'student_003',
        fname: 'Michael',
        lname: 'Johnson',
        id: 'STU003',
        section: 'Grade 5-A',
        gradelevel: '5'
    },
    {
        uid: 'student_004',
        fname: 'Emily',
        lname: 'Brown',
        id: 'STU004',
        section: 'Grade 5-A',
        gradelevel: '5'
    },
    {
        uid: 'student_005',
        fname: 'David',
        lname: 'Wilson',
        id: 'STU005',
        section: 'Grade 5-A',
        gradelevel: '5'
    }
];

// Sample grade data based on default grading attributes
const sampleGrades = [
    {
        studentUID: 'student_001',
        subject: 'math',
        quarter: '1',
        gradingPeriod: '2024-2025',
        grades: {
            'Attendance': 95,
            'Quiz': 88,
            'Midterm Exam (Semi-finals)': 85,
            'Final Exam (Periodical)': 90,
            'Activities': 92
        },
        finalGrade: 89.25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        studentUID: 'student_002',
        subject: 'math',
        quarter: '1',
        gradingPeriod: '2024-2025',
        grades: {
            'Attendance': 98,
            'Quiz': 92,
            'Midterm Exam (Semi-finals)': 88,
            'Final Exam (Periodical)': 94,
            'Activities': 90
        },
        finalGrade: 91.8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        studentUID: 'student_003',
        subject: 'english',
        quarter: '1',
        gradingPeriod: '2024-2025',
        grades: {
            'Attendance': 92,
            'Quiz': 85,
            'Midterm Exam (Semi-finals)': 82,
            'Final Exam (Periodical)': 87,
            'Activities': 89
        },
        finalGrade: 85.75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        studentUID: 'student_004',
        subject: 'science',
        quarter: '1',
        gradingPeriod: '2024-2025',
        grades: {
            'Attendance': 100,
            'Quiz': 95,
            'Midterm Exam (Semi-finals)': 91,
            'Final Exam (Periodical)': 96,
            'Activities': 94
        },
        finalGrade: 94.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        studentUID: 'student_005',
        subject: 'math',
        quarter: '2',
        gradingPeriod: '2024-2025',
        grades: {
            'Attendance': 88,
            'Quiz': 82,
            'Midterm Exam (Semi-finals)': 78,
            'Final Exam (Periodical)': 85,
            'Activities': 86
        },
        finalGrade: 82.9,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Function to generate random grades within realistic ranges
function generateRandomGrade(component) {
    const ranges = {
        'Attendance': { min: 85, max: 100 },
        'Quiz': { min: 70, max: 95 },
        'Midterm Exam (Semi-finals)': { min: 65, max: 90 },
        'Final Exam (Periodical)': { min: 70, max: 95 },
        'Activities': { min: 75, max: 98 },
        'Recitation': { min: 80, max: 95 }
    };

    const range = ranges[component] || { min: 70, max: 95 };
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// Generate sample grades for all students and subjects
function generateSampleGrades(students, attributes, subjects = ['math', 'english', 'science'], quarters = ['1', '2']) {
    const grades = [];
    let gradeId = 1;

    students.forEach(student => {
        subjects.forEach(subject => {
            quarters.forEach(quarter => {
                const gradeEntry = {
                    id: `grade_${gradeId++}`,
                    studentUID: student.uid,
                    subject: subject,
                    quarter: quarter,
                    gradingPeriod: '2024-2025',
                    grades: {},
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                // Generate grades for each attribute
                let finalGrade = 0;
                attributes.forEach(attr => {
                    if (attr.percentage > 0) {
                        const grade = generateRandomGrade(attr.name);
                        gradeEntry.grades[attr.name] = grade;
                        finalGrade += (grade * attr.percentage / 100);
                    }
                });

                gradeEntry.finalGrade = Math.round(finalGrade * 100) / 100;
                grades.push(gradeEntry);
            });
        });
    });

    return grades;
}

// Function to populate Firebase with demo data (for testing purposes)
async function populateDemoData(teacherUID, section, gradingAttributes) {
    if (!window.firebase || !window.firebase.database) {
        console.error('Firebase not available');
        return false;
    }

    try {
        const db = firebase.database();
        
        // Generate sample grades based on current grading attributes
        const demoGrades = generateSampleGrades(sampleStudents, gradingAttributes);
        
        // Save to Firebase
        const gradesRef = db.ref(`teachers/${teacherUID}/sections/${section}/grades`);
        
        for (const grade of demoGrades) {
            await gradesRef.child(grade.id).set(grade);
        }
        
        console.log('Demo data populated successfully!');
        return true;
        
    } catch (error) {
        console.error('Error populating demo data:', error);
        return false;
    }
}

// Function to clear all grades data
async function clearGradesData(teacherUID, section) {
    if (!window.firebase || !window.firebase.database) {
        console.error('Firebase not available');
        return false;
    }

    try {
        const db = firebase.database();
        await db.ref(`teachers/${teacherUID}/sections/${section}/grades`).remove();
        console.log('Grades data cleared successfully!');
        return true;
        
    } catch (error) {
        console.error('Error clearing grades data:', error);
        return false;
    }
}

// Utility function to calculate grade statistics
function calculateGradeStatistics(grades, gradingAttributes) {
    if (!grades || grades.length === 0) {
        return {
            totalEntries: 0,
            uniqueStudents: 0,
            averageGrade: 0,
            highestGrade: 0,
            lowestGrade: 0,
            passingRate: 0,
            gradeDistribution: {
                excellent: 0, // 90-100
                good: 0,      // 80-89
                fair: 0,      // 70-79
                poor: 0       // Below 70
            }
        };
    }

    // Calculate final grades
    const finalGrades = grades.map(grade => {
        let finalGrade = 0;
        gradingAttributes.forEach(attr => {
            if (attr.percentage > 0) {
                const gradeValue = grade.grades && grade.grades[attr.name] ? grade.grades[attr.name] : 0;
                finalGrade += (gradeValue * attr.percentage / 100);
            }
        });
        return finalGrade;
    });

    const totalEntries = grades.length;
    const uniqueStudents = new Set(grades.map(g => g.studentUID)).size;
    const averageGrade = finalGrades.reduce((sum, grade) => sum + grade, 0) / finalGrades.length;
    const highestGrade = Math.max(...finalGrades);
    const lowestGrade = Math.min(...finalGrades);
    const passingGrades = finalGrades.filter(grade => grade >= 75).length;
    const passingRate = (passingGrades / finalGrades.length) * 100;

    // Grade distribution
    const gradeDistribution = {
        excellent: finalGrades.filter(g => g >= 90).length,
        good: finalGrades.filter(g => g >= 80 && g < 90).length,
        fair: finalGrades.filter(g => g >= 70 && g < 80).length,
        poor: finalGrades.filter(g => g < 70).length
    };

    return {
        totalEntries,
        uniqueStudents,
        averageGrade: Math.round(averageGrade * 100) / 100,
        highestGrade: Math.round(highestGrade * 100) / 100,
        lowestGrade: Math.round(lowestGrade * 100) / 100,
        passingRate: Math.round(passingRate * 100) / 100,
        gradeDistribution
    };
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sampleStudents,
        sampleGrades,
        generateRandomGrade,
        generateSampleGrades,
        populateDemoData,
        clearGradesData,
        calculateGradeStatistics
    };
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.GradingSheetDemo = {
        sampleStudents,
        sampleGrades,
        generateRandomGrade,
        generateSampleGrades,
        populateDemoData,
        clearGradesData,
        calculateGradeStatistics
    };
    
    // Add demo data button functionality (for development/demo purposes)
    document.addEventListener('DOMContentLoaded', function() {
        if (window.location.pathname.includes('grading.html')) {
            // Add demo data button to the grading controls
            setTimeout(() => {
                const demoBtn = document.createElement('button');
                demoBtn.innerHTML = '<i class="fas fa-database"></i> Load Demo Data';
                demoBtn.className = 'add-grade-btn';
                demoBtn.style.background = '#9c27b0';
                demoBtn.onclick = async function() {
                    if (confirm('This will add sample grade data for demonstration. Continue?')) {
                        if (typeof currentTeacherUID !== 'undefined' && typeof currentSection !== 'undefined' && typeof gradingAttributes !== 'undefined') {
                            const success = await populateDemoData(currentTeacherUID, currentSection, gradingAttributes);
                            if (success) {
                                alert('Demo data loaded! Refresh the page to see the changes.');
                            } else {
                                alert('Failed to load demo data. Please try again.');
                            }
                        } else {
                            alert('Teacher information not available. Please make sure you are logged in.');
                        }
                    }
                };
                
                // Add to grade actions
                const gradeActions = document.querySelector('.grade-actions');
                if (gradeActions) {
                    gradeActions.appendChild(demoBtn);
                }
            }, 2000);
        }
    });
}
