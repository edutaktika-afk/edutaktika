# Edutaktika UI Flow - Simple Format

## Teacher UI Flow

```mermaid
flowchart TD
    A([START - Teacher Visits Website]) --> B[index.html<br/>Landing Page<br/>Shows: Two Large Buttons<br/>I'M A TEACHER | I'M A STUDENT])
    
    B -->|Click I'M A TEACHER| C[Teacher/logreg.html<br/>Login/Register Page<br/>Shows: Three Tabs<br/>Login | Register | Admin])
    
    C --> D{Which Tab Selected?}
    
    D -->|Register Tab| E[Registration Form Screen<br/>Shows:<br/>- ID Number input field<br/>- First/Middle/Last Name fields<br/>- Email input field<br/>- Address fields (Province, City, Barangay)<br/>- Grade Level dropdown<br/>- Section dropdown<br/>- Password fields<br/>- Submit button])
    
    D -->|Login Tab| F[Login Form Screen<br/>Shows:<br/>- Email input field<br/>- Password input field<br/>- Eye icon (show/hide password)<br/>- Login button])
    
    E --> G[Success Modal Popup<br/>Shows:<br/>Registration Successful!<br/>Please check your email message<br/>OK button]
    
    G --> F
    
    F --> H{Email Verified<br/>& Approved?}
    
    H -->|No| I[Show Error Message<br/>Pending Approval or<br/>Email Not Verified] --> F
    
    H -->|Yes| J[Teacher/homepage.html<br/>Teacher Dashboard<br/>Shows:<br/>- Header with Navigation Menu<br/>- Welcome Section with animated text<br/>- Assessment Tools Cards (3 cards)<br/>- Progress Summary Graphs<br/>- Subject Quick Links])
    
    J --> K[Navigation Menu Shows:<br/>Subjects | Student List | Leaderboard<br/>Create Quiz | Editor | Profile | Logout]
    
    %% SUBJECTS FLOW
    K -->|Click Subjects| L[Select Subject Page<br/>Teacher/subject_math.html<br/>or subject_english.html<br/>or subject_science.html<br/>Shows:<br/>- Header Navigation<br/>- Four Quarter Sections<br/>  Q1 | Q2 | Q3 | Q4])
    
    L --> M[Select Quarter Section<br/>Shows:<br/>- Lesson Cards Grid (if any lessons exist)<br/>- Empty State Message (if no lessons)<br/>- Create Lesson Button<br/>- Create Quiz Button])
    
    %% CREATE LESSON FLOW
    M -->|Click Create Lesson| N[Create Lesson Modal<br/>Shows:<br/>- Use Template Option button<br/>- Create Blank Option button<br/>- Upload JSON Option button<br/>- Cancel button])
    
    N -->|Choose Template| O[Template Selection Screen<br/>Shows:<br/>- Template Grid with Cards<br/>- Science Lesson Template<br/>- Math Lesson Template<br/>- English Essay Template<br/>- Book Report Template<br/>- Quiz Assessment Template<br/>- Blank Presentation Template])
    
    N -->|Create Blank| P[Teacher/Editor.html<br/>Polotno Editor Screen<br/>Shows:<br/>- Top Menu Bar (File, Edit, View)<br/>- Left Sidebar: Tools Panel<br/>  • Text Tool<br/>  • Image Tool<br/>  • Shape Tools<br/>  • Templates Button<br/>- Center: Canvas/Design Area<br/>- Right Sidebar: Properties Panel<br/>- Bottom: Slide Navigator])
    
    O --> P
    
    P --> Q[Design Presentation Slides<br/>User Sees:<br/>- Canvas with design elements<br/>- Toolbar with editing tools<br/>- Properties panel for selected items<br/>- Slide thumbnails at bottom])
    
    Q --> R{Click Save Button}
    
    R --> S[Save Modal<br/>Shows:<br/>- Title Input Field<br/>- Save to Firebase Option<br/>- Download JSON Option<br/>- Export as PDF Button<br/>- Export as PNG Button<br/>- Cancel button])
    
    S -->|Save to Firebase| T[Lesson Saved Successfully<br/>Shows: Success Message]
    
    T --> U([Return to Subject Page<br/>New Lesson Card Appears in Grid])
    
    %% CREATE QUIZ FLOW
    M -->|Click Create Quiz| V[Quiz Type Selection Modal<br/>Shows:<br/>- Simple Quiz Builder Button<br/>- Advanced Quiz Editor Button<br/>- Cancel button])
    
    V -->|Choose Simple| W[Teacher/create-quiz.html<br/>Simple Quiz Builder Screen<br/>Shows:<br/>- Title Input Field<br/>- Description Text Area<br/>- Quarter Selector Dropdown<br/>- Subject Display<br/>- Test Type Selector<br/>- Add Test Button<br/>- Password Toggle Switch<br/>- Password Input (if enabled)<br/>- Save Button])
    
    V -->|Choose Advanced| X[Teacher/quizEditor.html<br/>Advanced Quiz Editor Screen<br/>Shows:<br/>- Polotno Editor Interface<br/>- Quiz Slide Designer<br/>- Game Embedder Tool<br/>- Question Builder Panel<br/>- Save Button<br/>- Publish Button])
    
    W --> Y[Build Quiz Questions<br/>User Sees:<br/>- Test list with question types<br/>- Add/Remove test buttons<br/>- Question configuration options])
    
    X --> Z[Design Quiz Slides<br/>User Sees:<br/>- Canvas for quiz slides<br/>- Question elements<br/>- Game embed options<br/>- Slide navigation])
    
    Y --> AA[Save Quiz Button Clicked]
    Z --> AA
    
    AA --> AB[Quiz Saved Successfully<br/>Shows: Success Message<br/>Quiz Auto-Assigned to Students]
    
    AB --> U
    
    %% STUDENT LIST FLOW
    K -->|Click Student List| AC[Teacher/studentlist.html<br/>Student List Page<br/>Shows:<br/>- Header Navigation<br/>- Student Table with Columns:<br/>  • Student Name<br/>  • LRN<br/>  • Grade<br/>  • Section<br/>  • Actions<br/>- Filter Options<br/>- Search Bar])
    
    AC --> AD[View Students in Table<br/>Shows:<br/>- List of all students<br/>- Student information rows<br/>- View Details button per student])
    
    AD -->|Click View Details| AE[Student Details Modal<br/>Shows:<br/>- Student Full Information<br/>- Profile Picture<br/>- Contact Details<br/>- Academic Information<br/>- Close button])
    
    AE --> AC
    
    %% LEADERBOARD FLOW
    K -->|Click Leaderboard| AF[Teacher/leaderboard.html<br/>Leaderboard Page<br/>Shows:<br/>- Header Navigation<br/>- Subject Filter Dropdown<br/>- Quarter Filter Dropdown<br/>- Rankings Table with Columns:<br/>  • Rank<br/>  • Student Name<br/>  • Score<br/>  • Percentage<br/>  • Subject<br/>- Sort Options])
    
    AF --> AG[View Student Rankings<br/>Shows:<br/>- Ordered list of students<br/>- Scores displayed<br/>- Highlighted top performers])
    
    AG --> J
    
    %% PROFILE FLOW
    K -->|Click Profile| AH[Profile Sidebar Opens<br/>Shows:<br/>- Profile Avatar Image<br/>- Teacher Name<br/>- Role Badge (Teacher)<br/>- ID Number<br/>- Full Name<br/>- Grade Level<br/>- Section<br/>- Address Details<br/>- Logout Toggle Switch])
    
    AH --> AI[View Profile Information<br/>User Sees:<br/>- All personal details<br/>- Account information<br/>- Logout option])
    
    AI -->|Click Logout| AJ[Logout Confirmation<br/>Shows: Are you sure? message]
    
    AJ -->|Confirm| AK([END - Logged Out<br/>Redirect to Landing Page])
    
    AI -->|Close Sidebar| J
    
    U --> M
    
    AC --> J
    AF --> J
    
    style A fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style J fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style P fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style W fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style X fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style AK fill:#ffebee,stroke:#c62828,stroke-width:2px
```

## Student UI Flow

```mermaid
flowchart TD
    A([START - Student Visits Website]) --> B[index.html<br/>Landing Page<br/>Shows: Two Large Buttons<br/>I'M A TEACHER | I'M A STUDENT])
    
    B -->|Click I'M A STUDENT| C[Student/logreg.html<br/>Login/Register Page<br/>Shows: Two Tabs<br/>Login | Register])
    
    C --> D{Which Tab Selected?}
    
    D -->|Register Tab| E[Registration Form Screen<br/>Shows:<br/>- LRN field (12 digits)<br/>- First/Middle/Last Name fields<br/>- Email input field<br/>- Address fields<br/>- Grade Level dropdown<br/>- Section dropdown<br/>- Password fields<br/>- Submit button])
    
    D -->|Login Tab| F[Login Form Screen<br/>Shows:<br/>- Email input field<br/>- Password input field<br/>- Eye icon (show/hide password)<br/>- Login button])
    
    E --> G[Success Modal Popup<br/>Shows:<br/>Registration Successful!<br/>Please check your email message<br/>OK button]
    
    G --> F
    
    F --> H{Email Verified?}
    
    H -->|No| I[Show Error Message<br/>Email Not Verified] --> F
    
    H -->|Yes| J[Student/homepage.html<br/>Student Dashboard<br/>Shows:<br/>- Header with Navigation Menu<br/>- Welcome Section<br/>- Progress Summary Graphs<br/>  • Overall Completion Rate<br/>  • Average Scores per Subject<br/>  • Monthly Activity<br/>- Subject Quick Links])
    
    J --> K[Navigation Menu Shows:<br/>Subjects | Leaderboard | Quiz Portal<br/>Profile | Logout]
    
    %% SUBJECTS FLOW
    K -->|Click Subjects| L[Select Subject Page<br/>Student/subject_math.html<br/>or subject_english.html<br/>or subject_science.html<br/>Shows:<br/>- Header Navigation<br/>- Four Quarter Sections<br/>  Q1 | Q2 | Q3 | Q4])
    
    L --> M[Select Quarter Section<br/>Shows:<br/>- Lesson Cards Grid<br/>  • Lesson Title<br/>  • Thumbnail Image<br/>  • Click to View button<br/>- Quiz Cards Grid<br/>  • Quiz Title<br/>  • Status Indicator:<br/>    🔒 Locked<br/>    ✅ Unlocked<br/>    ✓ Completed<br/>  • Click to Take button])
    
    %% VIEW LESSON FLOW
    M -->|Click Lesson Card| N[Student/present.html<br/>Presentation Viewer Screen<br/>Shows:<br/>- Full-screen Slide Display<br/>- Left/Right Navigation Arrows<br/>- Slide Counter (e.g., Slide 2 of 5)<br/>- Exit Button (top-right corner)<br/>- Smooth slide transitions])
    
    N --> O{User Action}
    
    O -->|Click Next Arrow| N
    O -->|Click Previous Arrow| N
    O -->|Click Exit Button| M
    
    %% TAKE QUIZ FLOW
    M -->|Click Quiz Card| P{Quiz Status?}
    
    P -->|Locked| Q[Password Entry Modal<br/>Shows:<br/>- Password Input Field<br/>- Unlock Button<br/>- Cancel Button<br/>- Error Message Area])
    
    P -->|Unlocked| R[Student/quizView.html<br/>Quiz Player Screen<br/>Shows:<br/>- Quiz Title Header<br/>- Question Display Area<br/>- Answer Options (buttons or inputs)<br/>- Progress Bar<br/>- Timer Display (if enabled)<br/>- Next/Previous Buttons<br/>- Submit Button])
    
    P -->|Completed| S[Results Screen<br/>Shows:<br/>- Final Score Display<br/>- Percentage Circle<br/>- Correct Answers Count<br/>- Time Taken<br/>- Review Answers Button])
    
    Q --> T{Password Correct?}
    
    T -->|Wrong| U[Error Message Display<br/>Shows:<br/>Incorrect Password<br/>Please try again] --> Q
    
    T -->|Correct| V[Unlock Success Message<br/>Shows:<br/>Quiz Unlocked Successfully!<br/>You can now start the quiz]
    
    V --> R
    
    R --> W[Answering Interface<br/>User Sees:<br/>- Current Question Number<br/>- Question Text<br/>- Multiple Choice Options<br/>- Or Interactive Game (if embedded)<br/>- Selected Answer Highlighted])
    
    W --> X{Continue Answering?}
    
    X -->|Click Next| W
    X -->|Click Previous| W
    X -->|Click Submit| Y[Loading/Processing Screen<br/>Shows:<br/>- Calculating Score... message<br/>- Spinner Animation<br/>- Progress indicator])
    
    Y --> Z[Quiz Results Screen<br/>Shows:<br/>- Large Score Display<br/>- Percentage (e.g., 85%)<br/>- Correct Answers: X/Y<br/>- Time Taken: X minutes<br/>- Review Answers Section<br/>- Return to Subject Button])
    
    Z --> M
    
    %% LEADERBOARD FLOW
    K -->|Click Leaderboard| AA[Student/leaderboard.html<br/>Leaderboard Page<br/>Shows:<br/>- Header Navigation<br/>- Subject Filter Dropdown<br/>- Rankings Table<br/>  • Rank<br/>  • Student Name<br/>  • Score<br/>  • Subject<br/>- Your Position Highlighted])
    
    AA --> AB[View Rankings<br/>Shows:<br/>- Ordered student list<br/>- Your position highlighted<br/>- Top 3 highlighted differently])
    
    AB --> J
    
    %% QUIZ PORTAL FLOW
    K -->|Click Quiz Portal| AC[Student/quizPortal.html<br/>Quiz Portal Page<br/>Shows:<br/>- Header Navigation<br/>- Quarter Filter Dropdown<br/>- Subject Filter Dropdown<br/>- All Available Quizzes List<br/>  • Quiz Title<br/>  • Subject Badge<br/>  • Quarter Badge<br/>  • Status Badge<br/>  • Take Quiz Button])
    
    AC --> AD[View All Quizzes<br/>Shows:<br/>- Filtered quiz list<br/>- Status indicators<br/>- Quick access buttons])
    
    AD -->|Click Take Quiz| P
    
    %% PROFILE FLOW
    K -->|Click Profile| AE[Profile Sidebar Opens<br/>Shows:<br/>- Profile Avatar Image<br/>- Student Name<br/>- Role Badge (Student)<br/>- LRN Number<br/>- Full Name<br/>- Grade Level<br/>- Section<br/>- Address Details<br/>- Logout Toggle Switch])
    
    AE --> AF[View Profile Information<br/>User Sees:<br/>- All personal details<br/>- Account information<br/>- Logout option])
    
    AF -->|Click Logout| AG[Logout Confirmation<br/>Shows: Are you sure? message]
    
    AG -->|Confirm| AH([END - Logged Out<br/>Redirect to Landing Page])
    
    AF -->|Close Sidebar| J
    
    S --> M
    
    style A fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style J fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style N fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style R fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Z fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    style AH fill:#ffebee,stroke:#c62828,stroke-width:2px
```

## Combined Overview Flow

```mermaid
flowchart TD
    START([START - User Visits Website]) --> LANDING[index.html<br/>Landing Page<br/>Two Buttons Visible])
    
    LANDING -->|Teacher| TEACHER_AUTH[Teacher/logreg.html<br/>Login/Register Tabs]
    LANDING -->|Student| STUDENT_AUTH[Student/logreg.html<br/>Login/Register Tabs]
    
    TEACHER_AUTH --> TEACHER_DASH[Teacher/homepage.html<br/>Dashboard with Navigation]
    STUDENT_AUTH --> STUDENT_DASH[Student/homepage.html<br/>Dashboard with Navigation]
    
    TEACHER_DASH --> TEACHER_NAV{Teacher Navigation}
    STUDENT_DASH --> STUDENT_NAV{Student Navigation}
    
    TEACHER_NAV -->|Subjects| TEACHER_SUBJECT[Subject Page<br/>4 Quarters<br/>Create Buttons]
    TEACHER_NAV -->|Student List| TEACHER_STUDENTS[Student List<br/>Table View]
    TEACHER_NAV -->|Leaderboard| TEACHER_LEADER[Leaderboard<br/>Rankings Table]
    
    STUDENT_NAV -->|Subjects| STUDENT_SUBJECT[Subject Page<br/>4 Quarters<br/>Content Cards]
    STUDENT_NAV -->|Leaderboard| STUDENT_LEADER[Leaderboard<br/>Rankings Table]
    STUDENT_NAV -->|Quiz Portal| STUDENT_QUIZ[Quiz Portal<br/>All Quizzes List]
    
    TEACHER_SUBJECT --> CREATE_LESSON[Create Lesson<br/>Modal → Editor]
    TEACHER_SUBJECT --> CREATE_QUIZ[Create Quiz<br/>Modal → Builder]
    
    CREATE_LESSON --> EDITOR[Editor Screen<br/>Canvas & Tools]
    CREATE_QUIZ --> QUIZ_BUILDER[Quiz Builder<br/>Questions & Settings]
    
    EDITOR --> SAVE_LESSON[Save Lesson<br/>Returns to Subject]
    QUIZ_BUILDER --> SAVE_QUIZ[Save Quiz<br/>Auto-Assigns to Students]
    
    STUDENT_SUBJECT --> VIEW_LESSON[Click Lesson Card<br/>Presentation Viewer]
    STUDENT_SUBJECT --> TAKE_QUIZ[Click Quiz Card<br/>Quiz Player]
    
    VIEW_LESSON --> PRESENTATION[Full-screen Slides<br/>Navigation Arrows]
    TAKE_QUIZ --> QUIZ_PLAYER[Quiz Interface<br/>Questions & Answers]
    
    QUIZ_PLAYER --> QUIZ_RESULTS[Results Screen<br/>Score & Feedback]
    
    PRESENTATION --> END1([Return to Subject])
    QUIZ_RESULTS --> END1
    SAVE_LESSON --> END1
    SAVE_QUIZ --> END1
    
    style START fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style TEACHER_DASH fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style STUDENT_DASH fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style EDITOR fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style PRESENTATION fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style QUIZ_PLAYER fill:#fff9c4,stroke:#f57f17,stroke-width:2px
```

