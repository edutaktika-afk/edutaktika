# 📊 Edutaktika Codebase Analysis

## 🎯 Project Overview

**Edutaktika** is an educational platform that provides:
- **Design Editor** (Polotno-based React app) for creating educational content
- **Role-based access** (Teachers, Students, Admins)
- **Subject management** (Math, Science, English)
- **Quiz/Assessment system** with grading
- **Interactive games** for learning
- **Cloud storage** integration (Supabase + Firebase)

---

## 🏗️ Architecture

### **Tech Stack**

1. **Frontend:**
   - React 18.3.1 (Editor)
   - Vanilla JavaScript (Teacher/Student pages)
   - Polotno SDK 2.26.1 (Design editor)
   - Blueprint.js (UI components)

2. **Backend/Storage:**
   - **Firebase Realtime Database** (Auth, User data, Quiz data)
   - **Supabase Storage** (Lesson designs, JSON files, thumbnails)
   - **LocalStorage** (Fallback, design caching)

3. **Build Tools:**
   - Vite (Editor build system)
   - Node.js scripts (Build automation)

---

## 📁 Project Structure

```
edutaktika/
├── Editor/              # React-based design editor (Polotno)
│   ├── src/
│   │   ├── App.jsx      # Main editor component
│   │   ├── project.js   # Project management (save/load)
│   │   ├── supabase.js  # Supabase client config
│   │   ├── sections/    # Editor side panels (templates, shapes, etc.)
│   │   └── topbar/      # Save buttons, menus
│   └── dist/            # Built editor (deployed)
│
├── Teacher/             # Teacher-facing pages
│   ├── homepage.html    # Teacher dashboard
│   ├── subject_*.html   # Subject pages (Math, Science, English)
│   ├── grading.html     # Tabbed grading system
│   ├── quizEditor.html  # Quiz creation
│   └── ...
│
├── Student/             # Student-facing pages
│   ├── homepage.html    # Student dashboard
│   ├── subject_*.html   # Subject pages
│   ├── quizView.html    # Take quizzes
│   └── ...
│
├── Admin/               # Admin pages
│   ├── Editor.html      # Admin editor access
│   └── ...
│
├── assets/
│   ├── js/              # Shared JavaScript utilities
│   │   ├── loadSupabaseDesigns.js  # Load lessons from Supabase
│   │   ├── Teacher Side/           # Teacher-specific JS
│   │   └── Student Side/           # Student-specific JS
│   └── templates/       # Educational templates (JSON)
│
├── Games/               # Interactive learning games
│   ├── Quiz/            # Quiz games
│   ├── Assessment/      # Assessment activities
│   └── Spelling bee/    # Spelling games
│
└── deploy/              # Production build output
```

---

## 🔐 Authentication & Authorization

### **Firebase Authentication**
- Email/password authentication
- Role-based routing (Teacher/Student/Admin)
- Auth state persistence

### **Role Detection Flow:**
```javascript
1. User logs in → Firebase Auth
2. Check Firebase Realtime Database:
   - `/teachers/{uid}` → Teacher role
   - `/students/{uid}` → Student role
3. Redirect based on role:
   - Teacher → Teacher/homepage.html
   - Student → Student/homepage.html
```

### **Role-Based Features:**
- **Teachers:** Create/edit lessons, grade students, manage quizzes
- **Students:** View lessons, take quizzes, view grades
- **Admins:** Full access, manage teachers/students

---

## 📚 Lesson Management System

### **Storage Structure (Supabase)**

```
LessonStorage/
├── SCIENCE/
│   ├── grade5/              # Grade-specific (new structure)
│   │   ├── quarter1/
│   │   │   ├── {designId}.json
│   │   │   └── {designId}.jpg (thumbnail)
│   │   └── quarter2/
│   ├── quarter1/            # Old structure (backward compatible)
│   └── quarter2/
├── MATH/
│   └── (same structure)
└── ENGLISH/
    └── (same structure)
```

### **Design Loading Priority:**
1. **Grade + Quarter:** `{subject}/{grade}/{quarter}/{designId}.json`
2. **Grade only:** `{subject}/{grade}/{designId}.json`
3. **Quarter only:** `{subject}/{quarter}/{designId}.json`
4. **Root:** `{subject}/{designId}.json`

### **Key Files:**
- `assets/js/loadSupabaseDesigns.js` - Loads designs for subject pages
- `Editor/src/supabase-api.js` - Save/load functions
- `Editor/src/App.jsx` - Design loading logic

---

## 🎨 Editor Features

### **Design Editor (Polotno-based)**
- **Multi-page support** - Create presentations with multiple pages
- **Educational templates** - Pre-built templates for lessons
- **Custom sections:**
  - Science Templates
  - Educational Backgrounds
  - Material Icons
  - Shapes
  - Text (Google Fonts)
  - My Designs (saved designs)

### **Save/Load Flow:**
1. **Save:**
   - Teacher creates/edits design in Editor
   - Selects subject + quarter
   - Saves to Supabase Storage
   - JSON + thumbnail saved
   - Metadata stored in `designs_metadata` table

2. **Load:**
   - Teacher/Student opens subject page
   - Designs loaded from Supabase by quarter
   - Thumbnails displayed in grid
   - Click to view/edit (teachers can edit, students view-only)

### **Editor Modes:**
- **Edit mode:** Full editing capabilities (teachers)
- **View mode:** Read-only (students)
- **Presentation mode:** Fullscreen presentation

---

## 📊 Subject Pages

### **Teacher Subject Pages:**
- `Teacher/subject_math.html`
- `Teacher/subject_science.html`
- `Teacher/subject_english.html`

**Features:**
- Quarter tabs (Q1, Q2, Q3, Q4, Assessments)
- "Create Lesson" button → Opens Editor
- Grid of saved lessons with thumbnails
- Edit/View buttons for each lesson
- Grade-aware filtering (shows lessons for teacher's grade)

### **Student Subject Pages:**
- `Student/subject_math.html`
- `Student/subject_science.html`
- `Student/subject_english.html`

**Features:**
- View lessons (read-only)
- Organized by quarter
- Click to view in fullscreen

---

## 🎮 Quiz & Assessment System

### **Quiz Features:**
- Create quizzes (`Teacher/quizEditor.html`)
- Take quizzes (`Student/quizView.html`)
- Grade tracking
- Attempt tracking
- Leaderboards

### **Assessment System:**
- Multiple assessment types
- Student progress tracking
- Teacher grading interface
- Tabbed grading system (Configuration + Grading Sheet)

---

## 🔄 Data Flow

### **Lesson Creation Flow:**
```
1. Teacher clicks "Create Lesson" on subject page
   ↓
2. Editor opens (new tab/window)
   ↓
3. Teacher selects template or starts blank
   ↓
4. Teacher designs lesson (adds text, images, etc.)
   ↓
5. Teacher clicks "Save to Supabase"
   ↓
6. Selects subject + quarter
   ↓
7. Design saved to Supabase Storage:
   - JSON file: {subject}/{grade}/{quarter}/{designId}.json
   - Thumbnail: {subject}/{grade}/{quarter}/{designId}.jpg
   ↓
8. Metadata updated in designs_metadata table
   ↓
9. Subject page refreshes, shows new lesson
```

### **Lesson Viewing Flow:**
```
1. Student/Teacher opens subject page
   ↓
2. loadSupabaseDesigns.js loads designs for selected quarter
   ↓
3. Designs displayed in grid with thumbnails
   ↓
4. User clicks "View" button
   ↓
5. Editor opens in view mode (or edit mode for teachers)
   ↓
6. Design loaded from Supabase Storage
   ↓
7. User can view/present/edit (based on role)
```

---

## 🌐 Integration Points

### **Firebase Integration:**
- **Authentication:** User login/logout
- **Realtime Database:**
  - User roles (`/teachers/{uid}`, `/students/{uid}`)
  - Quiz data
  - Grade data
  - Teacher grade level (`teachers/{uid}/gradelevel`)

### **Supabase Integration:**
- **Storage:** Lesson designs (JSON + thumbnails)
- **Database:** Design metadata (`designs_metadata` table)
- **Structure:** Subject → Grade → Quarter → Design files

### **Grade Level System:**
- Teachers have `gradelevel` in Firebase
- Used to organize lessons by grade
- Path structure: `{subject}/{grade5}/{quarter1}/...`
- Fallback to quarter-only if no grade

---

## 🎯 Key Features

### **1. Multi-Page Templates**
- Science Lesson (4 pages)
- Math Lesson (4 pages)
- English Essay (5 pages)
- Book Report (4 pages)
- Quiz/Assessment (2+ pages)
- Blank Presentation (2 pages)

### **2. Grade-Aware Organization**
- Lessons organized by grade level
- Teachers see only their grade's lessons
- Backward compatible with non-grade structure

### **3. Quarter-Based Organization**
- Lessons organized by quarters (1-4)
- Assessments separate section
- Easy filtering by quarter

### **4. Role-Based Access**
- Teachers: Create, edit, delete lessons
- Students: View lessons only
- Admins: Full access

### **5. Cloud Storage**
- Supabase for lesson storage
- Firebase for user data
- LocalStorage fallback

---

## 🔧 Configuration

### **Supabase Configuration:**
- URL: `https://liiwqyodlzivzzethyrj.supabase.co`
- Bucket: `LessonStorage`
- Folders: `SCIENCE`, `MATH`, `ENGLISH`

### **Firebase Configuration:**
- Project ID: `edutaktika`
- Database URL: `https://edutaktika-default-rtdb.firebaseio.com`
- Auth Domain: `edutaktika.firebaseapp.com`

### **Editor Configuration:**
- Base URL: `/editor/index.html` (production)
- Local dev: `http://localhost:5173/`
- Environment-aware URL detection

---

## 📝 Key Files Reference

### **Editor:**
- `Editor/src/App.jsx` - Main editor component, design loading
- `Editor/src/project.js` - Project save/load management
- `Editor/src/supabase-api.js` - Supabase save/load functions
- `Editor/src/topbar/supabase-save-button.jsx` - Save dialog

### **Subject Pages:**
- `assets/js/loadSupabaseDesigns.js` - Load designs for subject pages
- `Teacher/subject_*.html` - Teacher subject pages
- `Student/subject_*.html` - Student subject pages

### **Authentication:**
- `index.html` - Role selection and auth check
- `Teacher/logreg.html` - Teacher login
- `Student/logreg.html` - Student login

### **Games/Quizzes:**
- `Games/Quiz/` - Quiz games
- `Teacher/quizEditor.html` - Create quizzes
- `Student/quizView.html` - Take quizzes

---

## 🚀 Deployment

### **Build Process:**
1. Build Editor: `cd Editor && npm run build`
2. Copy static files to `deploy/` folder
3. Deploy `deploy/` folder to hosting

### **Deployment Structure:**
```
deploy/
├── Editor/          # Built editor (dist/)
├── Teacher/         # Teacher pages
├── Student/         # Student pages
├── assets/          # Shared assets
└── index.html       # Landing page
```

---

## 🔍 Current State

### **Working Features:**
✅ Firebase authentication
✅ Role-based routing
✅ Supabase storage integration
✅ Grade-aware lesson organization
✅ Quarter-based organization
✅ Multi-page templates
✅ Design editor (Polotno)
✅ Quiz system
✅ Grading system

### **Recent Changes (from git status):**
- Modified: `Editor/src/App.jsx` - Design loading improvements
- Modified: `assets/js/loadSupabaseDesigns.js` - Grade-aware loading

---

## 🎓 Usage Patterns

### **For Teachers:**
1. Login → Teacher homepage
2. Select subject (Math/Science/English)
3. Select quarter
4. Click "Create Lesson" → Editor opens
5. Design lesson → Save to Supabase
6. Lesson appears on subject page
7. Students can view lesson

### **For Students:**
1. Login → Student homepage
2. Select subject
3. Select quarter
4. View available lessons
5. Click to view lesson in fullscreen
6. Can take quizzes/assessments

---

## 📚 Documentation Files

- `README.md` - Project overview
- `FIREBASE_SETUP.md` - Firebase setup guide
- `Editor/SUPABASE_SETUP.md` - Supabase setup guide
- `WHATS_NEW.md` - Recent updates
- `INTEGRATION_COMPLETE.md` - Template integration
- `CODEBASE_ANALYSIS.md` - This file

---

## 🔄 Data Models

### **Teacher (Firebase):**
```json
{
  "teachers/{uid}": {
    "role": "teacher",
    "approved": true,
    "gradelevel": "5"  // or "grade5"
  }
}
```

### **Student (Firebase):**
```json
{
  "students/{uid}": {
    "role": "student"
  }
}
```

### **Design Metadata (Supabase):**
```json
{
  "id": "design-id",
  "name": "Lesson Name",
  "subject": "math",
  "quarter": "1",
  "grade": "grade5",
  "createdAt": "timestamp",
  "createdBy": "teacher-uid"
}
```

---

## 🎯 Summary

**Edutaktika** is a comprehensive educational platform with:
- **Design Editor** for creating interactive lessons
- **Cloud Storage** for lesson management
- **Role-based Access** for teachers and students
- **Subject Organization** by grade and quarter
- **Quiz System** for assessments
- **Interactive Games** for learning

The codebase is well-structured with clear separation between:
- Editor (React/Polotno)
- Teacher pages (Vanilla JS)
- Student pages (Vanilla JS)
- Shared utilities (assets/js)

Key integration points:
- Firebase for auth and user data
- Supabase for lesson storage
- Grade-aware organization
- Quarter-based filtering

---

*Last Updated: Based on current codebase analysis*
*Status: ✅ Comprehensive analysis complete*


