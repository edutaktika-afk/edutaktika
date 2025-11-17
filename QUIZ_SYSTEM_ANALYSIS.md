# Quiz System Analysis - Complete Overview

## 📋 Table of Contents
1. [Quiz Creation Process](#quiz-creation-process)
2. [Quiz Storage Structure](#quiz-storage-structure)
3. [Answer Submission & Storage](#answer-submission--storage)
4. [Data Flow Diagram](#data-flow-diagram)

---

## 🎯 Quiz Creation Process

### **Where Teachers Create Quizzes:**

1. **`Teacher/create-quiz.html`** - Initial quiz creation form
2. **`Teacher/quizEditor.html`** - Quiz editor for adding questions/slides
3. **`Teacher/subject_english.html`, `subject_math.html`, `subject_science.html`** - Quick quiz creation from subject pages

### **Quiz Creation Steps:**

1. **Initial Creation** (`create-quiz.html`):
   - Teacher fills form: title, description, quarter, subject
   - System generates random 6-digit password
   - Creates quiz data structure
   - Saves to teacher's collection
   - Assigns to matching students

2. **Quiz Editing** (`quizEditor.html`):
   - Teacher adds slides/questions
   - Can add custom games/tests
   - Saves quiz with all content
   - Updates all assigned students

---

## 💾 Quiz Storage Structure

### **1. Teacher's Quiz Storage**

**Path:** `teachers/{teacherUID}/sections/{section}/quizzes/{subject}/{quarter}/{quizTitle}`

**Data Structure:**
```javascript
{
  title: "Quiz Title",
  description: "Quiz description",
  quarter: "1", // or "2", "3", "4"
  section: "Melon", // Teacher's section
  grade: "5", // or "6"
  createdAt: "2024-01-01T00:00:00.000Z",
  savedAt: "2024-01-01T00:00:00.000Z",
  createdBy: "teacherUID",
  teacherName: "Teacher Name",
  password: "123456", // 6-digit password
  isLocked: true,
  hasPassword: true,
  subject: "subject_english", // or subject_math, subject_science
  slides: "[{...}]", // JSON string of quiz slides
  tests: [...], // Array of test objects with gamePage, gameUrl
  parts: ["Test 1: multiple-choice", "Test 2: spelling"],
  quizId: "unique-quiz-id",
  hasCustomGames: true/false,
  gameCount: 5,
  customGameCount: 2
}
```

### **2. Student's Quiz Storage (Assigned Quizzes)**

**Path:** `students/{studentUID}/quizzes/{subject}/{quarter}/{quizTitle}`

**Data Structure:**
```javascript
{
  // All teacher quiz data copied here, plus:
  assignedBy: "teacherUID",
  assignedAt: "2024-01-01T00:00:00.000Z",
  status: "available", // or "completed"
  attempts: 0,
  bestScore: 0,
  lastAttemptAt: null,
  studentUID: "studentUID"
}
```

**Assignment Logic:**
- When teacher creates quiz, system finds ALL students with:
  - Matching `section` (case-insensitive)
  - Matching `grade` level
- Automatically copies quiz to each matching student's collection

---

## 📝 Answer Submission & Storage

### **Where Answers Are Stored:**

#### **1. Individual Test Scores** (Per Slide/Test)

**Path:** `students/{studentUID}/quizzes/{subject}/{quarter}/{quizTitle}/tests/{slideIndex}/score`

**Data Structure:**
```javascript
{
  score: 8, // Correct answers
  maxScore: 10, // Total questions
  answers: [0, 1, 2, 0, 1, ...], // Array of selected answers
  timestamp: 1704067200000, // Date.now()
  gameUrl: "Games/Quiz/ex/spelling-bee-quiz.html" // Optional
}
```

**Path:** `students/{studentUID}/quizzes/{subject}/{quarter}/{quizTitle}/tests/{slideIndex}/summary`

**Data Structure:**
```javascript
{
  score: 8,
  maxScore: 10,
  timestamp: 1704067200000,
  gameUrl: "Games/Quiz/ex/spelling-bee-quiz.html"
}
```

#### **2. Overall Quiz Summary**

**Path:** `students/{studentUID}/quizzes/{subject}/{quarter}/{quizTitle}/summary`

**Data Structure:**
```javascript
{
  totalScore: 45, // Sum of all test scores
  totalMax: 50, // Sum of all max scores
  completedAt: 1704067200000, // Date.now()
  // OR for quizPortal.html:
  score: 45,
  maxScore: 50,
  answers: [...], // All answers combined
  completedAt: 1704067200000
}
```

### **Answer Submission Methods:**

#### **Method 1: `quizView.html` (Slide-based Quizzes)**
- Each slide contains a game/test
- Game sends `quizResult` message via `postMessage`
- System saves per-test scores as student completes each test
- Final summary calculated from all test scores

**Code Location:** `Student/quizView.html` lines 532-558

#### **Method 2: `quizPortal.html` (Question-based Quizzes)**
- All questions on one page
- Student answers all questions
- Submits via "Submit Quiz" button
- Saves complete answer array and total score

**Code Location:** `Student/quizPortal.html` lines 513-534

#### **Method 3: Legacy `quizSummaries` (Some Old Quizzes)**
- Some older quizzes use global `quizSummaries` path
- **Path:** `quizSummaries/{quizId}/{studentUID}`
- Used for: `lesson1`, `clock-quiz`, `spelling-bee`, `science-experiments`

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    QUIZ CREATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

Teacher creates quiz
    ↓
[create-quiz.html] or [subject_*.html]
    ↓
Quiz data created with:
  - title, description, quarter, section, grade
  - password (auto-generated)
  - subject
    ↓
┌─────────────────────────────────────┐
│ SAVE TO TEACHER COLLECTION          │
│ teachers/{uid}/sections/{section}/   │
│   quizzes/{subject}/{quarter}/{title}│
└─────────────────────────────────────┘
    ↓
Find all students with matching:
  - section (case-insensitive)
  - grade level
    ↓
┌─────────────────────────────────────┐
│ ASSIGN TO STUDENTS                  │
│ students/{studentUID}/quizzes/      │
│   {subject}/{quarter}/{title}       │
│                                     │
│ + assignedBy, assignedAt            │
│ + status: "available"               │
│ + attempts: 0, bestScore: 0          │
└─────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                  ANSWER SUBMISSION FLOW                       │
└─────────────────────────────────────────────────────────────┘

Student takes quiz
    ↓
[quizView.html] or [quizPortal.html]
    ↓
Student answers questions/tests
    ↓
┌─────────────────────────────────────┐
│ PER-TEST SCORES (quizView.html)     │
│ students/{uid}/quizzes/{subject}/   │
│   {quarter}/{title}/tests/{index}/  │
│   - score                            │
│   - summary                          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ OVERALL QUIZ SUMMARY                │
│ students/{uid}/quizzes/{subject}/   │
│   {quarter}/{title}/summary         │
│   - totalScore, totalMax             │
│   - completedAt                      │
└─────────────────────────────────────┘
```

---

## 📊 Key Storage Paths Summary

### **Quiz Data:**
- **Teacher:** `teachers/{teacherUID}/sections/{section}/quizzes/{subject}/{quarter}/{title}`
- **Student (Assigned):** `students/{studentUID}/quizzes/{subject}/{quarter}/{title}`

### **Quiz Answers:**
- **Per Test:** `students/{studentUID}/quizzes/{subject}/{quarter}/{title}/tests/{slideIndex}/score`
- **Per Test Summary:** `students/{studentUID}/quizzes/{subject}/{quarter}/{title}/tests/{slideIndex}/summary`
- **Overall Summary:** `students/{studentUID}/quizzes/{subject}/{quarter}/{title}/summary`

### **Legacy (Some Old Quizzes):**
- **Global Summaries:** `quizSummaries/{quizId}/{studentUID}`

---

## 🔍 Important Notes

1. **Section Matching:** Uses case-insensitive comparison (`toLowerCase()`)
2. **Grade Matching:** Uses string comparison after trimming
3. **Password:** Auto-generated 6-digit number (100000-999999)
4. **Multiple Attempts:** Currently, `quizView.html` prevents multiple attempts (one attempt per test)
5. **Quiz Types:**
   - **Slide-based:** Multiple tests on different slides (`quizView.html`)
   - **Question-based:** All questions on one page (`quizPortal.html`)
6. **Auto-Assignment:** When quiz is created/updated, all matching students automatically receive it

---

## 🛠️ Files Involved

### **Quiz Creation:**
- `Teacher/create-quiz.html` - Initial creation form
- `Teacher/quizEditor.html` - Quiz editor
- `Teacher/subject_english.html` - Quick create (English)
- `Teacher/subject_math.html` - Quick create (Math)
- `Teacher/subject_science.html` - Quick create (Science)

### **Quiz Taking:**
- `Student/quizView.html` - Slide-based quiz viewer
- `Student/quizPortal.html` - Question-based quiz portal
- `Student/quizView1.html` - Alternative quiz viewer

### **Quiz Games/Tests:**
- `Games/Quiz/ex/*.html` - Individual quiz game files
- `Games/SAMPLE GAMES/*.html` - Sample quiz games

---

## 📌 Next Steps for Integration

If you need to:
- **Fetch quiz scores for grading:** Read from `students/{uid}/quizzes/{subject}/{quarter}/{title}/summary`
- **Track individual test performance:** Read from `students/{uid}/quizzes/{subject}/{quarter}/{title}/tests/{index}/summary`
- **Get all quizzes for a student:** Read from `students/{uid}/quizzes/{subject}/{quarter}/`
- **Get all quizzes created by teacher:** Read from `teachers/{uid}/sections/{section}/quizzes/{subject}/{quarter}/`

