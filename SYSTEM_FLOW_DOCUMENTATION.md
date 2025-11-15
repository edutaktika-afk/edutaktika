    # Edutaktika System Flow Documentation
    ## For Flowchart Creation

    This document explains the complete system flow, functions, and UI interactions in a format suitable for creating flowcharts.

    ---

    ## 1. SYSTEM ENTRY POINT & AUTHENTICATION FLOW

    ### 1.1 Landing Page (index.html)
    **UI Component:** Role Selection Screen
    - **Function:** Initial entry point
    - **User Actions:**
    - Click "I'M A TEACHER" → Redirects to `Teacher/logreg.html`
    - Click "I'M A STUDENT" → Redirects to `Student/logreg.html`
    - **System Check:**
    - If user already authenticated → Auto-redirect based on role
    - Checks Firebase Auth state
    - Validates role in Firebase Realtime Database

    ### 1.2 Authentication Pages (logreg.html)
    **UI Component:** Login/Register Tabs
    - **Tabs Available:**
    - Login Tab
    - Register Tab
    - Admin Tab (Teacher only)

    **REGISTRATION FLOW:**
    1. User fills registration form (ID, Name, Email, Address, Grade, Section, Password)
    2. System validates:
    - Email format
    - Password strength (8+ chars, uppercase, lowercase, number, special char)
    - Required fields
    3. Creates Firebase Auth account
    4. Saves user data to Firebase Realtime Database:
    - Teachers → `teachers/{uid}`
    - Students → `students/{uid}`
    5. Sends email verification
    6. For Teachers: Sets `approved: false` (requires admin approval)
    7. For Students: Auto-assigns quizzes from matching teacher
    8. Signs out user (must verify email before login)

    **LOGIN FLOW:**
    1. User enters email and password
    2. Firebase Auth authenticates
    3. System checks role in database:
    - **Teacher:** Must have `approved: true` AND `emailVerified: true`
    - **Student:** Must have `emailVerified: true`
    - **Admin:** Checks `admins/{uid}` collection
    4. Redirects based on role:
    - Teacher → `Teacher/homepage.html`
    - Student → `Student/homepage.html`
    - Admin → `Teacher/admin.html`

    ---

    ## 2. TEACHER FLOW

    ### 2.1 Teacher Homepage (homepage.html)
    **UI Components:**
    - Navigation Header (Subjects, Leaderboard, Profile, Logout)
    - Welcome Section
    - Assessment Tools Section
    - Student Progress Summary (Graphs)

    **Functions:**
    - Displays teacher profile info
    - Shows quick access to subjects (Math, English, Science)
    - Links to assessment builder and manager
    - Displays student progress graphs

    **Navigation Options:**
    - **Subjects:** Math, English, Science → `subject_{subject}.html`
    - **Leaderboard:** View student rankings → `leaderboard.html`
    - **Student List:** Manage students → `studentlist.html`
    - **Create Quiz:** Build new quiz → `create-quiz.html`
    - **Quiz Editor:** Advanced quiz editor → `quizEditor.html`
    - **Assessment Builder:** Create assessments → `assessment-builder.html`
    - **Assessment Manager:** Manage assessments → `assessment-manager.html`
    - **Editor:** Polotno presentation editor → `Editor.html`
    - **Profile:** View/edit profile

    ### 2.2 Subject Pages (subject_math.html, subject_english.html, subject_science.html)
    **UI Structure:**
    - Four Quarter Sections (Q1, Q2, Q3, Q4)
    - Each quarter contains:
    - Lessons Container (displays lesson cards)
    - "Create Lesson" button
    - "Create Quiz" button

    **LESSON CREATION FLOW:**
    1. Teacher clicks "Create Lesson" in a quarter
    2. Modal opens with options:
    - Use Template (from `/assets/templates/`)
    - Create Blank
    - Upload Existing JSON
    3. Redirects to Polotno Editor (`Editor.html` or `Admin/Editor.html`)
    4. Teacher designs presentation:
    - Add text, images, shapes
    - Use templates (science-lesson.json, math-lesson.json, etc.)
    - Create multiple slides
    5. Teacher saves presentation:
    - Saves to Firebase: `teachers/{uid}/sections/{section}/lessons/{subject}/quarter-{q}/{title}`
    - Also saves to global: `presentations/{subject}/quarter-{q}/{title}`
    6. Presentation appears as card in subject page
    7. Students in same section/grade can view it

    **QUIZ CREATION FLOW:**
    1. Teacher clicks "Create Quiz" in a quarter
    2. Two options:
    - **Simple Quiz Builder** (`create-quiz.html`):
        - Enter title, description, quarter
        - Add test types (Multiple Choice, True/False, etc.)
        - Set password (optional)
        - Creates quiz structure
    - **Advanced Quiz Editor** (`quizEditor.html`):
        - Full Polotno-based editor
        - Create quiz slides with questions
        - Embed interactive games
        - Add custom game elements
    3. Quiz saved to:
    - `teachers/{uid}/sections/{section}/quizzes/{subject}/{quarter}/{title}`
    4. System automatically copies quiz to all matching students:
    - Finds students with same `section`, `grade`, `school_year`
    - Copies to `students/{studentUID}/quizzes/{subject}/{quarter}/{title}`
    5. Quiz appears in student's quiz list

    ### 2.3 Quiz Editor (quizEditor.html)
    **UI Components:**
    - Polotno canvas (design area)
    - Toolbar (text, shapes, images, etc.)
    - Slide navigator
    - Question builder
    - Game embedder
    - Save/Publish buttons

    **Functions:**
    - Create multi-slide quiz presentations
    - Add interactive game elements
    - Embed custom games from `/Games/Quiz/`
    - Set quiz password and lock status
    - Preview quiz before publishing

    ### 2.4 Assessment Builder (assessment-builder.html)
    **UI Components:**
    - Question type selector
    - Question editor
    - Answer options
    - Scoring settings
    - Time limit settings

    **Functions:**
    - Create structured assessments
    - Multiple question types
    - Set automatic grading
    - Configure time limits
    - Save to assessment library

    ### 2.5 Student List (studentlist.html)
    **UI Components:**
    - Table of students
    - Filter by section/grade
    - Student details modal

    **Functions:**
    - View all students in teacher's section
    - View student progress
    - Access individual student records

    ### 2.6 Leaderboard (leaderboard.html)
    **UI Components:**
    - Ranking table
    - Filter by subject/quarter
    - Score displays

    **Functions:**
    - Display student rankings
    - Show scores per subject
    - Track performance over time

    ### 2.7 Presentation Viewer (present.html)
    **UI Components:**
    - Full-screen slide viewer
    - Navigation arrows
    - Slide counter
    - Exit button

    **Functions:**
    - Display Polotno presentations
    - Navigate between slides
    - Full-screen mode
    - Load from Firebase or local JSON

    ---

    ## 3. STUDENT FLOW

    ### 3.1 Student Homepage (homepage.html)
    **UI Components:**
    - Navigation Header (Subjects, Leaderboard, Profile, Logout)
    - Welcome Section
    - Progress Summary Graphs

    **Functions:**
    - Display student profile
    - Show progress charts
    - Quick access to subjects

    **Navigation Options:**
    - **Subjects:** Math, English, Science → `subject_{subject}.html`
    - **Leaderboard:** View rankings → `leaderboard.html`
    - **Quiz Portal:** Access quizzes → `quizPortal.html`
    - **Profile:** View/edit profile

    ### 3.2 Student Subject Pages (subject_math.html, etc.)
    **UI Structure:**
    - Four Quarter Sections
    - Each quarter shows:
    - **Lessons:** Cards linking to presentations
    - **Quizzes:** Cards showing available quizzes

    **LESSON VIEWING FLOW:**
    1. Student clicks lesson card
    2. System loads presentation from:
    - `teachers/{teacherUID}/sections/{section}/lessons/{subject}/quarter-{q}/{title}`
    - OR `presentations/{subject}/quarter-{q}/{title}`
    3. Redirects to `present.html` with presentation data
    4. Student views slides, navigates through presentation
    5. Can exit back to subject page

    **QUIZ ACCESS FLOW:**
    1. Student sees quiz cards in subject page
    2. Quiz status indicators:
    - 🔒 Locked (requires password)
    - ✅ Unlocked (ready to take)
    - ✓ Completed (already taken)
    3. If locked:
    - Student clicks quiz
    - Enters password
    - System validates against `students/{uid}/quizzes/{subject}/{quarter}/{title}/password`
    - If correct: Updates `isLocked: false` in student's quiz record
    4. Student clicks "Start Quiz"
    5. Redirects to quiz player (`quizView.html` or `quizPlayer.html`)

    ### 3.3 Quiz Player (quizView.html, quizPlayer.html)
    **UI Components:**
    - Quiz slides (from Polotno)
    - Question display
    - Answer options
    - Submit button
    - Timer (if set)
    - Progress indicator

    **QUIZ TAKING FLOW:**
    1. System loads quiz from:
    - `students/{uid}/quizzes/{subject}/{quarter}/{title}`
    - OR `teachers/{teacherUID}/sections/{section}/quizzes/{subject}/{quarter}/{title}`
    2. Displays quiz slides/pages
    3. Student answers questions
    4. For interactive games:
    - Loads game from `/Games/Quiz/{gameType}.html`
    - Embeds in quiz flow
    5. Student submits quiz
    6. System calculates score
    7. Saves attempt to:
    - `students/{uid}/quizAttempts/{quizId}/{timestamp}`
    8. Updates quiz status to "Completed"
    9. Shows results/feedback

    ### 3.4 Quiz Portal (quizPortal.html)
    **UI Components:**
    - List of all available quizzes
    - Filter by quarter/subject
    - Status indicators
    - Quick access buttons

    **Functions:**
    - Centralized quiz access
    - View all quizzes across subjects
    - Filter and search quizzes

    ### 3.5 Assessment Taker (assessment-taker.html)
    **UI Components:**
    - Question display
    - Answer input fields
    - Timer
    - Submit button

    **Functions:**
    - Take structured assessments
    - Time-limited tests
    - Automatic submission
    - Immediate feedback (if configured)

    ---

    ## 4. ADMIN FLOW

    ### 4.1 Admin Dashboard (Teacher/admin.html)
    **UI Components:**
    - Teacher approval list
    - User management
    - System settings

    **Functions:**
    - Approve/reject teacher registrations
    - Manage user accounts
    - View system statistics
    - Access admin editor tools

    **TEACHER APPROVAL FLOW:**
    1. Admin views pending teachers
    2. Reviews teacher registration data
    3. Clicks "Approve" or "Reject"
    4. System updates `teachers/{uid}/approved: true/false`
    5. Approved teachers can now login

    ---

    ## 5. EDITOR SYSTEM (Polotno-based)

    ### 5.1 Editor Access
    **Paths:**
    - `Teacher/Editor.html`
    - `Admin/Editor.html`
    - `Editor/index.html` (standalone)

    ### 5.2 Editor Functions
    **UI Components:**
    - Canvas (design area)
    - Toolbar (tools panel)
    - Layers panel
    - Properties panel
    - File menu

    **CREATION FLOW:**
    1. Open editor
    2. Choose:
    - New blank presentation
    - Load template (from `/assets/templates/`)
    - Open existing (from Firebase or local)
    3. Design slides:
    - Add text, images, shapes
    - Customize colors, fonts
    - Arrange elements
    4. Save options:
    - **Save to Firebase:** Uploads to teacher's collection
    - **Download JSON:** Saves locally
    - **Export PDF/PNG:** Creates static files
    5. Presentation can be viewed via `present.html`

    ### 5.3 Available Templates
    Located in `/assets/templates/`:
    - `science-lesson.json` - 4 pages (Cover, Objectives, Content, Summary)
    - `math-lesson.json` - 4 pages (Cover, Formula, Example, Practice)
    - `english-essay.json` - 5 pages (Cover, Intro, Body×2, Conclusion)
    - `book-report.json` - 4 pages (Cover, Summary, Characters, Opinion)
    - `quiz-assessment.json` - 2+ pages (Cover, Questions)
    - `blank-presentation.json` - 2 pages (Title, Content)

    ---

    ## 6. DATABASE STRUCTURE (Firebase Realtime Database)

    ### 6.1 User Collections
    ```
    teachers/
    {uid}/
        - id, fname, lname, email, grade, section, approved, role
        - sections/
        {section}/
            lessons/
            {subject}/
                quarter-{q}/
                {lessonTitle}/
            quizzes/
            {subject}/
                {quarter}/
                {quizTitle}/

    students/
    {uid}/
        - id (LRN), fname, lname, email, grade, section, role
        - quizzes/
        {subject}/
            {quarter}/
            {quizTitle}/
        - quizAttempts/
        {quizId}/
            {timestamp}/

    admins/
    {uid}/
        - true (or role: "admin")
    ```

    ### 6.2 Global Collections
    ```
    presentations/
    {subject}/
        quarter-{q}/
        {lessonTitle}/
    ```

    ---

    ## 7. KEY SYSTEM FUNCTIONS

    ### 7.1 Authentication & Authorization
    - **Firebase Auth:** Handles login/logout
    - **Role Validation:** Checks database for role
    - **Session Management:** Persistent sessions via Firebase
    - **Email Verification:** Required for all users

    ### 7.2 Content Distribution
    - **Teacher → Student:** Automatic quiz/lesson copying based on section/grade match
    - **Global Lessons:** Available to all teachers
    - **Section-Specific:** Lessons tied to teacher's section

    ### 7.3 Quiz System
    - **Creation:** Teachers create quizzes with multiple question types
    - **Distribution:** Auto-copied to matching students
    - **Password Protection:** Optional quiz locking
    - **Scoring:** Automatic or manual grading
    - **Attempt Tracking:** Records all student attempts

    ### 7.4 Presentation System
    - **Polotno Editor:** Visual design tool
    - **Template System:** Pre-built templates for quick creation
    - **Storage:** Firebase or local JSON
    - **Viewing:** Full-screen presentation mode

    ---

    ## 8. UI/UX FLOW SUMMARY

    ### 8.1 Teacher Journey
    ```
    Landing → Login/Register → Homepage → Subject Page → 
    Create Lesson/Quiz → Editor → Save → View in Subject Page → 
    Students Access
    ```

    ### 8.2 Student Journey
    ```
    Landing → Login/Register → Homepage → Subject Page → 
    View Lesson (Presentation) OR Take Quiz → Results/Progress
    ```

    ### 8.3 Admin Journey
    ```
    Landing → Admin Login → Admin Dashboard → 
    Approve Teachers → Manage System
    ```

    ---

    ## 9. DECISION POINTS FOR FLOWCHART

    ### 9.1 Authentication Decisions
    - Is user logged in? → Yes: Check role → No: Show login
    - Is email verified? → Yes: Continue → No: Require verification
    - Is teacher approved? → Yes: Allow access → No: Show pending message

    ### 9.2 Quiz Access Decisions
    - Is quiz locked? → Yes: Require password → No: Allow access
    - Has student taken quiz? → Yes: Show results → No: Allow taking
    - Is password correct? → Yes: Unlock → No: Show error

    ### 9.3 Content Access Decisions
    - Does student match teacher's section/grade? → Yes: Show content → No: Hide content
    - Is content global? → Yes: Show to all → No: Section-specific only

    ---

    ## 10. DATA FLOW DIAGRAM ELEMENTS

    ### 10.1 Teacher Creates Quiz
    ```
    Teacher Input → Validation → Firebase Save (Teacher Collection) → 
    Find Matching Students → Copy to Student Collections → 
    Update UI (Both Teacher & Student Views)
    ```

    ### 10.2 Student Takes Quiz
    ```
    Student Clicks Quiz → Check Lock Status → 
    If Locked: Password Validation → Load Quiz Data → 
    Display Questions → Collect Answers → Calculate Score → 
    Save Attempt → Update Status → Show Results
    ```

    ### 10.3 Lesson Distribution
    ```
    Teacher Creates Lesson → Save to Teacher Collection → 
    Optionally Save to Global → Students in Same Section See Lesson → 
    Click to View → Load Presentation → Display Slides
    ```

    ---

    ## 11. KEY FILES & THEIR FUNCTIONS

    ### 11.1 Entry Points
    - `index.html` - Landing/role selection
    - `Teacher/logreg.html` - Teacher auth
    - `Student/logreg.html` - Student auth

    ### 11.2 Main Interfaces
    - `Teacher/homepage.html` - Teacher dashboard
    - `Student/homepage.html` - Student dashboard
    - `Teacher/subject_*.html` - Subject pages (teacher)
    - `Student/subject_*.html` - Subject pages (student)

    ### 11.3 Content Creation
    - `Teacher/Editor.html` - Polotno editor
    - `Teacher/create-quiz.html` - Simple quiz builder
    - `Teacher/quizEditor.html` - Advanced quiz editor
    - `Teacher/assessment-builder.html` - Assessment creator

    ### 11.4 Content Consumption
    - `Student/present.html` - Presentation viewer
    - `Student/quizView.html` - Quiz player
    - `Student/quizPortal.html` - Quiz hub

    ### 11.5 Supporting Files
    - `assets/js/loadQuizzes.js` - Quiz loading logic
    - `assets/js/*/header.js` - Navigation logic
    - `assets/js/*/profile.js` - Profile management
    - `Editor/` - Polotno editor React app

    ---

    ## 12. FLOWCHART CREATION TIPS

    ### 12.1 Main Flow Structure
    1. **Start:** Landing Page (index.html)
    2. **Branch:** Role Selection (Teacher/Student)
    3. **Auth Flow:** Login/Register → Verification → Approval (Teachers)
    4. **Dashboard:** Homepage for each role
    5. **Content Access:** Subject Pages
    6. **Actions:** Create/View/Take content
    7. **End Points:** Results, Progress, Logout

    ### 12.2 Sub-Flows to Detail
    - Quiz Creation Process
    - Quiz Taking Process
    - Lesson Creation Process
    - Lesson Viewing Process
    - Teacher Approval Process
    - Student Registration & Quiz Assignment

    ### 12.3 Decision Diamonds
    - User authenticated?
    - Email verified?
    - Teacher approved?
    - Quiz locked?
    - Password correct?
    - Student matches section/grade?
    - Content exists?

    ### 12.4 Process Boxes
    - Validate input
    - Save to Firebase
    - Load from Firebase
    - Calculate score
    - Update status
    - Send email
    - Copy to students

    ---

    This documentation provides all the information needed to create comprehensive flowcharts for the Edutaktika system. Each section can be converted into flowchart nodes, with decision points, processes, and data flows clearly defined.

