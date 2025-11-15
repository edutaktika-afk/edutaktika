# Teacher UI Flow Diagram
## Edutaktika Educational Platform

```mermaid
flowchart TD
    A([START - Teacher Visits Website]) --> B[index-html Landing Page]
    B --> C{Click I'M A TEACHER Button}
    C --> D[Teacher-logreg-html Login Register Page]
    D --> E{Select Tab}
    E -->|Register Tab| F[Registration Form Screen]
    E -->|Login Tab| G[Login Form Screen]
    
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
    
    style A fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style H fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style P3 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Q3 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Q4 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style AK fill:#ffebee,stroke:#c62828,stroke-width:2px
```

---

## Notes

### Teacher Data Paths:
- `teachers/uid` - Teacher profile
- `teachers/uid/sections/section/lessons/subject/quarter-q/title` - Teacher lessons
- `teachers/uid/sections/section/quizzes/subject/quarter/title` - Teacher quizzes
- `teachers/uid/assessments/assessmentId` - Teacher assessments
- `teachers/uid/grades/subject/quarter/studentUID` - Student grades

### Global Data Paths:
- `presentations/subject/quarter-q/title` - Global lessons

### Authentication:
- Firebase Auth for user authentication
- Email verification required
- Teacher approval required via admin

