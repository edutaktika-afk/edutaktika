# System Flowcharts Index
## Edutaktika Educational Platform

This document provides an overview of all system flowcharts. Each role has been separated into its own file for easier navigation.

---

## Flowchart Files

### 📘 [Student Flowchart](STUDENT_FLOWCHART.md)
Complete UI flow diagram for students, including:
- Registration and login
- Dashboard navigation
- Viewing lessons and taking quizzes
- Leaderboard and quiz portal
- Profile management

### 👨‍🏫 [Teacher Flowchart](TEACHER_FLOWCHART.md)
Complete UI flow diagram for teachers, including:
- Registration and approval process
- Dashboard navigation
- Creating lessons and quizzes
- Student management and grading
- Assessment builder
- Leaderboard

### 👑 [Admin Flowchart](ADMIN_FLOWCHART.md)
Complete UI flow diagram for administrators, including:
- Admin login
- Teacher approval management
- Global content creation
- Access to all system features

---

## Combined View (Legacy)

<details>
<summary>Click to view all flowcharts in one document</summary>

## 1. STUDENT UI + DATA FLOW DIAGRAM

```mermaid
flowchart TD
    A([START - Student Visits Website]) --> B[index-html Landing Page]
    B --> C{Click I'M A STUDENT Button}
    C --> D[Student-logreg-html Login Register Page]
    D --> E{Select Tab}
    E -->|Register Tab| F[Registration Form Screen]
    E -->|Login Tab| G[Login Form Screen]
    
    F --> F1[Registration Form - LRN Name Email Address Grade Section Age Gender Password Fields]
    
    F1 --> F2{Validate Form}
    F2 -->|Invalid| F1
    F2 -->|Valid| F3[Create Auth Account]
    F3 --> F4[Save Student Data to Firebase]
    F4 --> F5[Send Email Verification]
    F5 --> F6[Auto-Assign Quizzes from Matching Teacher]
    F6 --> F7[Success Modal - Registration Successful]
    F7 --> G
    
    G --> G1[Form Fields - Email Password Login Button]
    G1 --> G2[Sign In]
    G2 --> G3{Email Verified?}
    G3 -->|No| G4[Error - Email Not Verified] --> G1
    G3 -->|Yes| G5[Check Student Record in Firebase]
    G5 --> G6{Student Record Exists?}
    G6 -->|No| G7[Error - No Student Record] --> G1
    G6 -->|Yes| H[Student Dashboard]
    
    H --> H1[Navigation Menu - Home Subjects Leaderboard Quiz Portal Profile]
    H1 --> H2[Dashboard - Welcome Section - Progress Graphs - Subject Links]
    
    H1 --> I{Click Navigation}
    I -->|Subjects| J[Subject Page - Math English Science]
    I -->|Leaderboard| K[Leaderboard Page]
    I -->|Quiz Portal| L[Quiz Portal Page]
    I -->|Profile| M[Profile Sidebar]
    
    J --> J1[Subject Page - Four Quarters Q1 Q2 Q3 Q4]
    J1 --> J2[Select Quarter]
    J2 --> J3[Quarter View - Lesson Cards - Quiz Cards with Status]
    
    J3 --> J4{Click Content}
    J4 -->|Lesson Card| N[Presentation Viewer]
    J4 -->|Quiz Card| O{Quiz Status?}
    
    N --> N1[Full-Screen Slides - Navigation Arrows - Slide Counter - Exit Button]
    N1 --> N2{User Action}
    N2 -->|Next Previous| N1
    N2 -->|Exit| J3
    
    O -->|Locked| P[Password Entry Modal]
    O -->|Unlocked| Q[Quiz Player Screen]
    O -->|Completed| R[View Results]
    
    P --> P1[Enter Password]
    P1 --> P2{Password Correct?}
    P2 -->|Wrong| P3[Error - Try Again] --> P1
    P2 -->|Correct| P4[Unlock Quiz in Firebase]
    P4 --> P5[Success - Quiz Unlocked]
    P5 --> Q
    
    Q --> Q1[Quiz Player - Questions - Answer Options - Progress Bar - Timer - Submit Button]
    Q1 --> Q2[Load Quiz from Firebase]
    Q2 --> Q3[Display Question]
    Q3 --> Q4{Continue?}
    Q4 -->|Next Previous| Q3
    Q4 -->|Submit| Q5[Calculate Score]
    
    Q5 --> Q6[Save Quiz Attempt to Firebase]
    Q6 --> Q7[Update Quiz Status to Completed]
    Q7 --> S[Results Screen - Score - Percentage - Correct Answers - Time Taken]
    
    S --> J3
    R --> J3
    
    K --> K1[Leaderboard - Rankings Table - Subject Filter - Your Position]
    K1 --> K2[Load Rankings from Firebase]
    K2 --> H
    
    L --> L1[Quiz Portal - All Quizzes List - Quarter Filter - Subject Filter]
    L1 --> L2[Load Quizzes from Firebase]
    L2 --> L3{Click Take Quiz}
    L3 --> O
    
    M --> M1[Profile Sidebar - Student Info - LRN Name Grade Section - Logout Toggle]
    M1 --> M2{User Action}
    M2 -->|Logout| M3[Logout Confirmation]
    M2 -->|Close| H
    M3 -->|Confirm| M4[Sign Out - Redirect to Landing]
    M4 --> AK([END])
    
    style A fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style H fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style N fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Q fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style S fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    style AK fill:#ffebee,stroke:#c62828,stroke-width:2px
```

---

## 2. TEACHER UI + DATA FLOW DIAGRAM

```mermaid
flowchart TD
    A([START - Teacher Visits Website]) --> B[index-html Landing Page]
    B --> C{Click I'M A TEACHER Button}
    C --> D[Teacher-logreg-html Login Register Admin Page]
    D --> E{Select Tab}
    E -->|Register Tab| F[Registration Form Screen]
    E -->|Login Tab| G[Login Form Screen]
    E -->|Admin Tab| GA[Admin Login Form Screen]
    
    F --> F1[Registration Form - ID Name Email Address Grade Section Age Gender Password Fields]
    
    F1 --> F2{Validate Form}
    F2 -->|Invalid| F1
    F2 -->|Valid| F3[Create Auth Account]
    F3 --> F4[Save Teacher Data to Firebase]
    F4 --> F5[Copy Global Lessons to Teacher]
    F5 --> F6[Send Email Verification]
    F6 --> F7[Success Modal - Check Email]
    F7 --> G
    
    G --> G1[Login Form - Email Password Login Button]
    G1 --> G2[Sign In]
    G2 --> G3{Check Admin?}
    G3 -->|Is Admin| G4[Redirect to Admin Dashboard]
    G3 -->|Not Admin| G5{Email Verified?}
    G5 -->|No| G6[Error - Email Not Verified] --> G1
    G5 -->|Yes| G7[Check Teacher Approval Status]
    G7 --> G8{Teacher Approved?}
    G8 -->|No| G9[Error - Pending Approval] --> G1
    G8 -->|Yes| H[Teacher Dashboard]
    
    H --> H1[Navigation - Home Subjects Student List Grading Assessments Leaderboard Profile]
    H1 --> H2[Dashboard - Welcome - Assessment Tools - Progress Graphs - Subject Links]
    
    H1 --> I{Click Navigation}
    I -->|Subjects| J[Subject Page - Math English Science]
    I -->|Student List| K[Student List Page]
    I -->|Grading| L[Grading Page]
    I -->|Assessments| M{Assessment Menu}
    I -->|Leaderboard| N[Leaderboard Page]
    I -->|Profile| O[Profile Sidebar]
    
    J --> J1[Subject Page - Four Quarters Q1 Q2 Q3 Q4]
    J1 --> J2[Select Quarter]
    J2 --> J3[Quarter View - Lesson Cards - Create Lesson Button - Create Quiz Button]
    
    J3 --> J4{Click Action}
    J4 -->|Create Lesson| P[Create Lesson Modal - Template Blank Upload Options]
    J4 -->|Create Quiz| Q[Create Quiz Modal - Quarter Title Description]
    
    P --> P1{Choose Option}
    P1 -->|Template| P2[Template Selection - Science Math English Templates]
    P1 -->|Blank| P3[Polotno Editor]
    P1 -->|Upload| P4[Upload JSON File]
    
    P2 --> P3
    P4 --> P3
    
    P3 --> P5[Editor - Tools Panel - Canvas - Properties Panel - Slide Navigator]
    P5 --> P6[Design Slides - Add Text Images Shapes]
    P6 --> P7{Click Save}
    P7 --> P8[Save Modal - Title - Save to Firebase - Download - Export Options]
    P8 -->|Save| P9[Get Teacher Section Grade]
    P9 --> P10[Save Lesson to Firebase]
    P10 --> P11[Optionally Save to Global]
    P11 --> P12[Success - Lesson Saved]
    P12 --> J3
    
    Q --> Q1[Quiz Modal Submitted]
    Q1 --> Q2{Quiz Type?}
    Q2 -->|Simple| Q3[Simple Quiz Builder]
    Q2 -->|Advanced| Q4[Advanced Quiz Editor]
    
    Q3 --> Q5[Builder - Title Description Quarter - Test Types - Password Toggle - Save]
    Q5 --> Q6[Build Questions - Multiple Choice True False Custom Game]
    Q6 --> Q7[Get Teacher Data]
    Q7 --> Q8[Save Quiz to Firebase]
    Q8 --> Q9[Find Matching Students]
    Q9 --> Q10[Copy Quiz to Students]
    Q10 --> Q11[Success - Quiz Distributed]
    Q11 --> J3
    
    Q4 --> Q12[Advanced Editor - Polotno Interface - Game Embedder - Question Builder]
    Q12 --> Q13[Design Quiz Slides - Embed Games - Set Password]
    Q13 --> Q14[Process Quiz Data]
    Q14 --> Q7
    
    K --> K1[Student List - Table - Name LRN Grade Section - View Details Button]
    K1 --> K2[Load Students from Firebase]
    K2 --> K3{Click View Details}
    K3 --> K4[Student Details Modal - Full Info - Quiz Attempts - Scores]
    K4 --> K1
    
    L --> L1[Grading Page - Two Tabs - Configuration - Grading Sheet]
    L1 --> L2{Select Tab}
    L2 -->|Configuration| L3[Config Form - Subject Quarter Grade Section - Criteria Input]
    L2 -->|Grading Sheet| L4[Grading Table - Student Names - Quiz Scores - Total Grade]
    L3 --> L5[Save Configuration to Firebase]
    L4 --> L6[Load Student Scores from Firebase]
    L6 --> L7[Update Grades in Firebase]
    L7 --> H
    
    M -->|Create| M1[Assessment Builder]
    M -->|Manage| M2[Assessment Manager]
    
    M1 --> M3[Builder - Question Types - Answer Options - Scoring - Time Limit]
    M3 --> M4[Build Questions - Set Answers - Configure Scoring]
    M4 --> M5[Save Assessment to Firebase]
    M5 --> H
    
    M2 --> M6[Manager - Assessment List - Title Subject Quarter - Analytics Edit Delete]
    M6 --> M7[Load Assessments from Firebase]
    M7 --> M8{Click Action}
    M8 -->|Analytics| M9[Analytics - Attempts Table - Score Chart]
    M8 -->|Edit| M1
    M8 -->|Delete| M10[Delete Assessment from Firebase]
    M10 --> H
    
    N --> N1[Leaderboard - Rankings Table - Subject Filter - Quarter Filter]
    N1 --> N2[Load Rankings from Firebase]
    N2 --> H
    
    O --> O1[Profile Sidebar - Teacher Info - ID Name Grade Section - Logout Toggle]
    O1 --> O2{User Action}
    O2 -->|Logout| O3[Logout Confirmation]
    O2 -->|Close| H
    O3 -->|Confirm| O4[Sign Out - Redirect]
    O4 --> AK([END])
    
    GA --> GA1[Admin Login Form - Email Password Login]
    GA1 --> GA2[Sign In]
    GA2 --> GA3{Check Admin Role}
    GA3 -->|Not Admin| GA4[Error - Not Admin] --> GA1
    GA3 -->|Is Admin| G4
    
    G4 --> G4A[Admin Dashboard]
    G4A --> G4B[Admin Page - Teacher Approvals Table - Name Email Grade Section Status - Approve Reject Review Delete Buttons]
    G4B --> G4C[Load Pending Teachers from Firebase]
    G4C --> G4D{Click Action}
    G4D -->|Approve| G4E[Update Firebase - Set approved true]
    G4D -->|Reject| G4F[Update Firebase - Set approved false]
    G4D -->|Review| G4G[Teacher Details Modal - Full Registration Data]
    G4D -->|Delete| G4H[Delete Teacher from Firebase and Auth]
    G4E --> G4C
    G4F --> G4C
    G4G --> G4C
    G4H --> G4C
        
        style A fill:#e1f5ff,stroke:#01579b,stroke-width:3px
        style H fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
        style P3 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
        style Q3 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
        style Q4 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
        style G4A fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
        style AK fill:#ffebee,stroke:#c62828,stroke-width:2px
```

---

## 3. ADMIN UI + DATA FLOW DIAGRAM

```mermaid
flowchart TD
    A([START - Admin Visits Website]) --> B[index-html Landing Page]
    B --> C{Click I'M A TEACHER Button}
    C --> D[Teacher-logreg-html Login Register Admin Page]
    D --> E{Select Admin Tab}
    E --> F[Admin Login Form Screen]
    
    F --> F1[Admin Login Form - Email Password Login Button]
    F1 --> F2[Sign In]
    F2 --> F3{Check Admin Role}
    F3 -->|Not Admin| F4[Error - Not Admin] --> F1
    F3 -->|Is Admin| G[Admin Dashboard]
    
    G --> G1[Admin Bar - Email Display - Role Display - Logout Button]
    G1 --> G2[Main Content - Teacher Approvals Table]
    
    G2 --> G3[Approvals Table - Columns Name Email Grade Section Status - Buttons Approve Reject Review Delete]
    
    G3 --> G4[Load Teachers from Firebase]
    G4 --> G5{Click Action}
    
    G5 -->|Approve| H[Approve Teacher]
    G5 -->|Reject| I[Reject Teacher]
    G5 -->|Review| J[Review Teacher Details]
    G5 -->|Delete| K[Delete Teacher]
    
    H --> H1[Get Teacher UID]
    H1 --> H2[Update Firebase - Set approved true]
    H2 --> H3[Success - Teacher Approved]
    H3 --> G4
    
    I --> I1[Get Teacher UID]
    I1 --> I2[Update Firebase - Set approved false]
    I2 --> I3[Success - Teacher Rejected]
    I3 --> G4
    
    J --> J1[Get Teacher UID]
    J1 --> J2[Load Teacher Data from Firebase]
    J2 --> J3[Details Modal - Full Registration Info - ID Name Email Address Grade Section Age Gender]
    J3 --> J4{User Action}
    J4 -->|Close| G3
    J4 -->|Approve| H
    J4 -->|Reject| I
    
    K --> K1[Get Teacher UID]
    K1 --> K2[Confirmation Dialog]
    K2 --> K3{User Confirms?}
    K3 -->|No| G3
    K3 -->|Yes| K4[Delete Teacher from Firebase]
    K4 --> K5[Delete Teacher from Firebase Auth]
    K5 --> K6[Success - Teacher Deleted]
    K6 --> G4
    
    G1 --> L{Click Logout}
    L --> L1[Logout Confirmation]
    L1 --> L2{User Confirms?}
    L2 -->|No| G
    L2 -->|Yes| L3[Sign Out - Redirect to Landing]
    L3 --> AK([END])
    
    G --> M{Admin Can Access}
    M -->|Subject Pages| N[Subject Pages - Create Lessons Quizzes for All Sections]
    M -->|Editor| O[Polotno Editor - Create Global Content]
    M -->|Quiz Editor| P[Advanced Quiz Editor - Create Global Quizzes]
    M -->|Viewer| Q[Presentation Viewer]
    
    N --> N1[Subject Functions - View Quarters - Create Content - Edit Delete]
    N1 --> N2[Save to Firebase - Global or Section-Specific]
    N2 --> G
    
    O --> O1[Editor - Design Presentations - Templates - Save or Download]
    O1 --> O2[Save Options - Global Presentations - Teacher Sections - Export PDF PNG]
    O2 --> G
    
    P --> P1[Quiz Editor - Create Slides - Embed Games - Set Passwords]
    P1 --> P2[Save Quiz - Global or Distribute to All Students]
    P2 --> G
    
    Q --> Q1[Viewer - Load Presentation - Display Slides - Navigate - Exit]
    Q1 --> G
    
    style A fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style G fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style H fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style I fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style K fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style N fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style O fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style P fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style AK fill:#ffebee,stroke:#c62828,stroke-width:2px
```

---

## Notes on Firebase Data Structure

### Student Data Paths:
- `students/uid` - Student profile
- `students/uid/quizzes/subject/quarter/title` - Student quiz assignments
- `students/uid/quizAttempts/quizId/timestamp` - Quiz attempt records
- `students/uid/assessments/assessmentId/attempts` - Assessment attempts

### Teacher Data Paths:
- `teachers/uid` - Teacher profile
- `teachers/uid/sections/section/lessons/subject/quarter-q/title` - Teacher lessons
- `teachers/uid/sections/section/quizzes/subject/quarter/title` - Teacher quizzes
- `teachers/uid/assessments/assessmentId` - Teacher assessments
- `teachers/uid/grades/subject/quarter/studentUID` - Student grades

### Global Data Paths:
- `presentations/subject/quarter-q/title` - Global lessons
- `admins/uid` - Admin records

### Authentication:
- Firebase Auth for user authentication
- Email verification required
- Teacher approval required via admin

</details>

---

## Quick Reference

### Student Data Paths:
- `students/uid` - Student profile
- `students/uid/quizzes/subject/quarter/title` - Student quiz assignments
- `students/uid/quizAttempts/quizId/timestamp` - Quiz attempt records
- `students/uid/assessments/assessmentId/attempts` - Assessment attempts

### Teacher Data Paths:
- `teachers/uid` - Teacher profile
- `teachers/uid/sections/section/lessons/subject/quarter-q/title` - Teacher lessons
- `teachers/uid/sections/section/quizzes/subject/quarter/title` - Teacher quizzes
- `teachers/uid/assessments/assessmentId` - Teacher assessments
- `teachers/uid/grades/subject/quarter/studentUID` - Student grades

### Global Data Paths:
- `presentations/subject/quarter-q/title` - Global lessons
- `admins/uid` - Admin records

### Authentication:
- Firebase Auth for user authentication
- Email verification required
- Teacher approval required via admin

