# Admin UI Flow Diagram
## Edutaktika Educational Platform

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

## Notes

### Admin Data Paths:
- `admins/uid` - Admin records
- `teachers/uid` - Teacher records (for approval management)

### Global Data Paths:
- `presentations/subject/quarter-q/title` - Global lessons
- `presentations/quizzes/subject/quarter/title` - Global quizzes

### Authentication:
- Firebase Auth for user authentication
- Admin role check required

