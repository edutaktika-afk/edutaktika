# Edutaktika UI Flow Diagram
## Visual Screen Flow - What Users See

```mermaid
flowchart TD
    Start([🌐 index.html<br/>Landing Page<br/>Two Buttons:<br/>I'M A TEACHER<br/>I'M A STUDENT]) --> RoleChoice{User Clicks}
    
    %% Teacher UI Flow
    RoleChoice -->|I'M A TEACHER| TeacherLogReg[Teacher/logreg.html<br/>Login/Register Page<br/>Three Tabs:<br/>Login | Register | Admin<br/>Form Fields Visible]
    
    TeacherLogReg --> TeacherTab{Which Tab?}
    TeacherTab -->|Register Tab| TeacherRegScreen[Registration Form Screen<br/>Shows:<br/>- ID Number field<br/>- Name fields<br/>- Email field<br/>- Address fields<br/>- Grade/Section dropdowns<br/>- Password fields<br/>- Submit button]
    
    TeacherTab -->|Login Tab| TeacherLoginScreen[Login Form Screen<br/>Shows:<br/>- Email input<br/>- Password input<br/>- Login button]
    
    TeacherRegScreen --> RegSuccessModal[Success Modal Popup<br/>Shows:<br/>Registration Successful!<br/>Check email message<br/>OK button]
    RegSuccessModal --> TeacherLoginScreen
    
    TeacherLoginScreen --> TeacherHome[Teacher/homepage.html<br/>Teacher Dashboard<br/>Shows:<br/>- Header with Navigation<br/>- Welcome Section<br/>- Assessment Tools Cards<br/>- Progress Graphs<br/>- Subject Quick Links]
    
    TeacherHome --> TeacherNav{Click Navigation}
    TeacherNav -->|Subjects| TeacherSubjectPage[Teacher/subject_math.html<br/>or subject_english.html<br/>or subject_science.html<br/>Shows:<br/>- Header Navigation<br/>- Four Quarter Sections<br/>- Each Quarter Shows:<br/>  • Lesson Cards Grid<br/>  • Create Lesson Button<br/>  • Create Quiz Button]
    
    TeacherNav -->|Leaderboard| TeacherLeaderboard[Teacher/leaderboard.html<br/>Shows:<br/>- Student Rankings Table<br/>- Subject Filter<br/>- Score Columns]
    
    TeacherNav -->|Students| TeacherStudentList[Teacher/studentlist.html<br/>Shows:<br/>- Student Table<br/>- Filter Options<br/>- Student Details]
    
    TeacherNav -->|Assessment Builder| TeacherAssessmentBuilder[Teacher/assessment-builder.html<br/>Shows:<br/>- Question Type Selector<br/>- Question Editor<br/>- Answer Options<br/>- Time Limit Settings]
    
    TeacherSubjectPage --> QuarterView[Quarter Section View<br/>Shows:<br/>- Lesson Cards (if any)<br/>- Empty State Message<br/>- Create Lesson Button<br/>- Create Quiz Button]
    
    QuarterView --> CreateLessonModal{Click Create Lesson}
    CreateLessonModal --> LessonModal[Create Lesson Modal<br/>Shows:<br/>- Use Template Option<br/>- Create Blank Option<br/>- Upload JSON Option<br/>- Cancel/Continue Buttons]
    
    LessonModal -->|Use Template| TemplateSelection[Template Selection Screen<br/>Shows:<br/>- Template Grid<br/>- Science/Math/English Templates<br/>- Preview Cards]
    
    LessonModal -->|Create Blank| EditorScreen[Teacher/Editor.html<br/>Polotno Editor Screen<br/>Shows:<br/>- Left Sidebar: Tools Panel<br/>- Center: Canvas/Design Area<br/>- Right: Properties Panel<br/>- Top: File Menu Bar<br/>- Bottom: Slide Navigator]
    
    TemplateSelection --> EditorScreen
    EditorScreen --> EditorToolbar[Editor Toolbar Visible<br/>Shows:<br/>- Text Tool<br/>- Image Tool<br/>- Shape Tools<br/>- Color Picker<br/>- Layer List]
    
    EditorToolbar --> EditorSave{Click Save}
    EditorSave --> SaveModal[Save Modal<br/>Shows:<br/>- Title Input<br/>- Save to Firebase Option<br/>- Download JSON Option<br/>- Export PDF/PNG Options]
    
    SaveModal -->|Save| BackToSubject[Return to Subject Page<br/>New Lesson Card Appears]
    BackToSubject --> QuarterView
    
    QuarterView --> CreateQuizModal{Click Create Quiz}
    CreateQuizModal --> QuizTypeModal[Quiz Type Selection Modal<br/>Shows:<br/>- Simple Quiz Builder Button<br/>- Advanced Quiz Editor Button]
    
    QuizTypeModal -->|Simple| SimpleQuizScreen[Teacher/create-quiz.html<br/>Simple Quiz Builder Screen<br/>Shows:<br/>- Title Input<br/>- Description Input<br/>- Quarter Selector<br/>- Test Type Selector<br/>- Add Test Button<br/>- Password Toggle<br/>- Save Button]
    
    QuizTypeModal -->|Advanced| AdvancedQuizScreen[Teacher/quizEditor.html<br/>Advanced Quiz Editor Screen<br/>Shows:<br/>- Polotno Editor Interface<br/>- Quiz Slide Designer<br/>- Game Embedder<br/>- Question Builder<br/>- Save/Publish Buttons]
    
    SimpleQuizScreen --> QuizSaved[Quiz Saved Confirmation<br/>Shows Success Message]
    AdvancedQuizScreen --> QuizSaved
    QuizSaved --> BackToSubject
    
    %% Student UI Flow
    RoleChoice -->|I'M A STUDENT| StudentLogReg[Student/logreg.html<br/>Login/Register Page<br/>Two Tabs:<br/>Login | Register<br/>Form Fields Visible]
    
    StudentLogReg --> StudentTab{Which Tab?}
    StudentTab -->|Register Tab| StudentRegScreen[Registration Form Screen<br/>Shows:<br/>- LRN field (12 digits)<br/>- Name fields<br/>- Email field<br/>- Address fields<br/>- Grade/Section dropdowns<br/>- Password fields<br/>- Submit button]
    
    StudentTab -->|Login Tab| StudentLoginScreen[Login Form Screen<br/>Shows:<br/>- Email input<br/>- Password input<br/>- Login button]
    
    StudentRegScreen --> StudentRegSuccessModal[Success Modal Popup<br/>Shows:<br/>Registration Successful!<br/>Check email message<br/>OK button]
    StudentRegSuccessModal --> StudentLoginScreen
    
    StudentLoginScreen --> StudentHome[Student/homepage.html<br/>Student Dashboard<br/>Shows:<br/>- Header with Navigation<br/>- Welcome Section<br/>- Progress Summary Graphs<br/>- Subject Quick Links]
    
    StudentHome --> StudentNav{Click Navigation}
    StudentNav -->|Subjects| StudentSubjectPage[Student/subject_math.html<br/>or subject_english.html<br/>or subject_science.html<br/>Shows:<br/>- Header Navigation<br/>- Four Quarter Sections<br/>- Each Quarter Shows:<br/>  • Lesson Cards<br/>  • Quiz Cards<br/>  • Status Indicators]
    
    StudentNav -->|Leaderboard| StudentLeaderboard[Student/leaderboard.html<br/>Shows:<br/>- Rankings Table<br/>- Student Position<br/>- Scores Display]
    
    StudentNav -->|Quiz Portal| StudentQuizPortal[Student/quizPortal.html<br/>Shows:<br/>- All Available Quizzes List<br/>- Quarter Filter<br/>- Subject Filter<br/>- Status Badges]
    
    StudentSubjectPage --> StudentQuarterView[Quarter Section View<br/>Shows:<br/>- Lesson Cards (clickable)<br/>- Quiz Cards with Status:<br/>  🔒 Locked<br/>  ✅ Unlocked<br/>  ✓ Completed]
    
    StudentQuarterView --> StudentContentClick{Click Content}
    StudentContentClick -->|Click Lesson Card| PresentationScreen[Student/present.html<br/>Presentation Viewer Screen<br/>Shows:<br/>- Full-screen Slide Display<br/>- Navigation Arrows<br/>- Slide Counter (1/5)<br/>- Exit Button<br/>- Slide Transitions]
    
    PresentationScreen --> SlideNav{User Action}
    SlideNav -->|Next Arrow| PresentationScreen
    SlideNav -->|Previous Arrow| PresentationScreen
    SlideNav -->|Exit Button| StudentQuarterView
    
    StudentContentClick -->|Click Quiz Card| QuizCardClick[Quiz Card Clicked]
    QuizCardClick --> QuizStatusCheck{Quiz Status?}
    
    QuizStatusCheck -->|Locked| PasswordModal[Password Entry Modal<br/>Shows:<br/>- Password Input Field<br/>- Unlock Button<br/>- Cancel Button]
    
    QuizStatusCheck -->|Unlocked| QuizPlayerScreen[Student/quizView.html<br/>Quiz Player Screen<br/>Shows:<br/>- Quiz Title<br/>- Question Display<br/>- Answer Options<br/>- Progress Bar<br/>- Timer (if set)<br/>- Submit Button]
    
    QuizStatusCheck -->|Completed| ResultsScreen[Results Screen<br/>Shows:<br/>- Score Display<br/>- Correct/Incorrect Answers<br/>- Feedback Message]
    
    PasswordModal --> PasswordCheck{Password Correct?}
    PasswordCheck -->|Wrong| PasswordError[Error Message<br/>Shows:<br/>Incorrect Password<br/>Try Again]
    PasswordError --> PasswordModal
    PasswordCheck -->|Correct| UnlockSuccess[Unlock Success Message<br/>Quiz Now Available]
    UnlockSuccess --> QuizPlayerScreen
    
    QuizPlayerScreen --> AnsweringScreen[Answering Interface<br/>Shows:<br/>- Current Question<br/>- Multiple Choice Options<br/>- Or Interactive Game<br/>- Next/Previous Buttons]
    
    AnsweringScreen --> SubmitQuiz{Click Submit}
    SubmitQuiz --> LoadingScreen[Loading/Processing Screen<br/>Shows:<br/>- Calculating Score...<br/>- Spinner Animation]
    
    LoadingScreen --> QuizResultsScreen[Quiz Results Screen<br/>Shows:<br/>- Final Score<br/>- Percentage<br/>- Correct Answers Count<br/>- Time Taken<br/>- Review Answers Button]
    
    QuizResultsScreen --> BackToQuarter[Return to Subject Page<br/>Quiz Status Updated to Completed]
    BackToQuarter --> StudentQuarterView
    
    %% Assessment Flow
    TeacherAssessmentBuilder --> AssessmentScreen[Assessment Builder Screen<br/>Shows:<br/>- Question Editor<br/>- Answer Options<br/>- Scoring Settings<br/>- Time Limit Input<br/>- Preview Button]
    
    AssessmentScreen --> AssessmentSaved[Assessment Saved<br/>Shows Success Message]
    AssessmentSaved --> TeacherHome
    
    StudentNav -->|Take Assessment| AssessmentTakerScreen[Student/assessment-taker.html<br/>Assessment Taker Screen<br/>Shows:<br/>- Question Display<br/>- Answer Input Fields<br/>- Timer Countdown<br/>- Submit Button]
    
    AssessmentTakerScreen --> AssessmentSubmit[Submit Assessment]
    AssessmentSubmit --> AssessmentResults[Assessment Results<br/>Shows Score & Feedback]
    AssessmentResults --> StudentHome
    
    %% Styling
    classDef landing fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    classDef auth fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dashboard fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef subject fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px
    classDef editor fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef quiz fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef modal fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef results fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    
    class Start,RoleChoice landing
    class TeacherLogReg,StudentLogReg,TeacherLoginScreen,StudentLoginScreen,TeacherRegScreen,StudentRegScreen auth
    class TeacherHome,StudentHome dashboard
    class TeacherSubjectPage,StudentSubjectPage,QuarterView,StudentQuarterView subject
    class EditorScreen,EditorToolbar,TemplateSelection editor
    class QuizPlayerScreen,AnsweringScreen,AssessmentTakerScreen quiz
    class PasswordModal,LessonModal,QuizTypeModal,SaveModal modal
    class QuizResultsScreen,ResultsScreen,AssessmentResults results
```

## Simplified UI Screen Flow

```mermaid
flowchart LR
    A[index.html<br/>Landing Page<br/>Role Selection] -->|Teacher| B[Teacher/logreg.html<br/>Login/Register Tabs]
    A -->|Student| C[Student/logreg.html<br/>Login/Register Tabs]
    
    B -->|Authenticated| D[Teacher/homepage.html<br/>Dashboard<br/>Navigation Menu]
    C -->|Authenticated| E[Student/homepage.html<br/>Dashboard<br/>Navigation Menu]
    
    D -->|Click Subject| F[Teacher/subject_*.html<br/>Subject Page<br/>4 Quarters<br/>Lesson/Quiz Cards]
    E -->|Click Subject| G[Student/subject_*.html<br/>Subject Page<br/>4 Quarters<br/>Content Cards]
    
    F -->|Create Lesson| H[Teacher/Editor.html<br/>Polotno Editor<br/>Canvas & Tools]
    F -->|Create Quiz| I[Teacher/create-quiz.html<br/>or quizEditor.html<br/>Quiz Builder]
    
    G -->|View Lesson| J[Student/present.html<br/>Presentation Viewer<br/>Full-screen Slides]
    G -->|Take Quiz| K[Student/quizView.html<br/>Quiz Player<br/>Questions & Answers]
    
    H -->|Save| F
    I -->|Save| F
    J -->|Exit| G
    K -->|Submit| L[Results Screen<br/>Score Display]
    L --> G
    
    style A fill:#e1f5ff
    style D fill:#e8f5e9
    style E fill:#e3f2fd
    style F fill:#c8e6c9
    style G fill:#bbdefb
    style H fill:#fff9c4
    style I fill:#fff9c4
    style J fill:#fff9c4
    style K fill:#fff9c4
```

## UI Component Breakdown

### Landing Page (index.html)
- **Visual Elements:**
  - Large heading: "Kids Learn Faster Visually"
  - Two large buttons: "I'M A TEACHER" and "I'M A STUDENT"
  - Animated image on the right side
  - Simple, clean layout

### Login/Register Pages (logreg.html)
- **Visual Elements:**
  - Tab buttons at top (Login | Register | Admin)
  - Form fields with icons
  - Left side: Hero content with image
  - Right side: Form container
  - Password visibility toggle
  - Validation messages

### Dashboard Pages (homepage.html)
- **Visual Elements:**
  - Header with navigation menu
  - Profile sidebar (clickable)
  - Welcome section with animated text
  - Cards/Grid layout for features
  - Progress graphs (charts)
  - Footer

### Subject Pages (subject_*.html)
- **Visual Elements:**
  - Header navigation
  - Four quarter sections (Q1, Q2, Q3, Q4)
  - Each quarter shows:
    - Grid of lesson/quiz cards
    - Card shows: Title, thumbnail, status
    - "Create Lesson" button
    - "Create Quiz" button
  - Empty state message if no content

### Editor Screen (Editor.html)
- **Visual Elements:**
  - Top menu bar (File, Edit, View)
  - Left sidebar: Tools panel
  - Center: Large canvas area
  - Right sidebar: Properties panel
  - Bottom: Slide navigator
  - Toolbar with icons

### Presentation Viewer (present.html)
- **Visual Elements:**
  - Full-screen slide display
  - Navigation arrows (left/right)
  - Slide counter (e.g., "Slide 2 of 5")
  - Exit button (top-right)
  - Smooth transitions between slides

### Quiz Player (quizView.html)
- **Visual Elements:**
  - Quiz title header
  - Question text display
  - Answer options (buttons or inputs)
  - Progress indicator
  - Timer (if enabled)
  - Submit button
  - Navigation buttons

### Results Screen
- **Visual Elements:**
  - Large score display
  - Percentage circle
  - Correct/Incorrect breakdown
  - Time taken
  - Review answers section
  - Return button

