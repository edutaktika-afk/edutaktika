# Grading System Refactor Plan: Category-Based with Dynamic Items

## Overview
Refactor the grading system from attribute-based to category-based, where each category has a fixed weight and contains dynamic items with point-based scoring.

## Current System Analysis

### Current Data Model
- **Grading Attributes**: Flat list of attributes with percentages
- **Grade Storage**: `grades[attributeName] = percentageScore`
- **Quiz Scores**: Stored as `totalScore` and `totalMax` in `students/{uid}/quizzes/{subject}/{quarter}/{quizTitle}/summary`

### Target Data Model

#### Category Structure
```javascript
gradingCategories = [
  {
    name: "Quizzes",
    weight: 20, // Fixed percentage
    items: [
      { id: "quiz1", name: "Quiz 1", maxPoints: 50 },
      { id: "quiz2", name: "Quiz 2", maxPoints: 30 }
    ]
  },
  {
    name: "Assignments",
    weight: 10,
    items: [
      { id: "assignment1", name: "Assignment 1", maxPoints: 100 }
    ]
  },
  // ... other categories
]
```

#### Grade Entry Structure
```javascript
gradeEntry = {
  studentUID: "...",
  subject: "subject_math",
  quarter: "1",
  categories: {
    "Quizzes": {
      items: {
        "quiz1": { earnedPoints: 45, maxPoints: 50 },
        "quiz2": { earnedPoints: 25, maxPoints: 30 }
      }
    },
    "Assignments": {
      items: {
        "assignment1": { earnedPoints: 90, maxPoints: 100 }
      }
    }
  },
  categoryScores: {
    "Quizzes": 18.75, // (45+25)/(50+30) * 20 = 70/80 * 20 = 17.5
    "Assignments": 9.0 // 90/100 * 10 = 9
  },
  finalGrade: 27.75 // Sum of categoryScores
}
```

## Step-by-Step Implementation Plan

### Phase 1: Data Model Refactoring

#### Step 1.1: Update Default Categories
- **File**: `Teacher/grading.html`
- **Location**: `defaultAttributes` array (line ~2535)
- **Changes**:
  - Replace flat attributes with category structure
  - Define 8 categories with fixed weights:
    - Assignments: 10%
    - Seatworks: 5%
    - Activities: 5%
    - Project: 20%
    - Recitation: 10%
    - Group Work: 10%
    - Periodical Test: 20%
    - Quizzes: 20%
  - Each category starts with empty `items` array

#### Step 1.2: Update Data Structures
- **Variables to Add**:
  - `gradingCategories = []` (replaces `gradingAttributes`)
  - `categoryItems = {}` (stores items per category)
- **Migration Function**:
  - Create `migrateOldGradesToNewFormat()` to convert existing grade entries
  - Map old `grades[attributeName]` to new category-based structure

### Phase 2: Quiz Integration

#### Step 2.1: Auto-Populate Quiz Items
- **Function**: `syncQuizzesWithCategoryItems()`
- **Logic**:
  - Fetch quizzes from Firebase for current subject/quarter
  - For each quiz, add/update item in "Quizzes" category
  - Item ID = quiz ID, Name = quiz title, maxPoints = from `summary.totalMax`
  - Set up Firebase listener to auto-update when quizzes change

#### Step 2.2: Auto-Populate Quiz Scores
- **Function**: `autoPopulateQuizScores()`
- **Logic**:
  - Fetch quiz scores from `students/{uid}/quizzes/{subject}/{quarter}/`
  - For each quiz with `summary.totalScore` and `summary.totalMax`:
    - Find corresponding item in "Quizzes" category
    - Populate `earnedPoints` and `maxPoints` in grade entry

### Phase 3: UI Refactoring

#### Step 3.1: Category Configuration UI
- **File**: `Teacher/grading.html`
- **Component**: Attributes configuration panel
- **Changes**:
  - Display categories with fixed weights (non-editable)
  - Show expandable list of items per category
  - Add "Add Item" button per category
  - Allow editing item names and max points
  - Allow deleting items (except auto-managed quiz items)
  - Show item count per category

#### Step 3.2: Grade Entry Modal
- **Component**: `generateGradeInputs()`
- **Changes**:
  - Group inputs by category
  - For each category, show:
    - Category name and weight
    - List of items with:
      - Item name
      - Earned points input
      - Max points display (or editable for non-quiz items)
  - Auto-calculate category score as user types
  - Display category score preview
  - Calculate final grade = sum of category scores

#### Step 3.3: Grading Table
- **Function**: `generateGradingTable()`
- **Changes**:
  - Headers: Group columns by category
  - Show category weight in header
  - For each category, show:
    - Individual item columns (if space allows) OR
    - Single category score column
  - Calculate category scores on-the-fly from item scores
  - Final grade column = sum of category scores

### Phase 4: Calculation Logic

#### Step 4.1: Category Score Calculation
- **Function**: `calculateCategoryScore(categoryName, items)`
- **Formula**:
  ```javascript
  const earnedSum = items.reduce((sum, item) => sum + (item.earnedPoints || 0), 0);
  const maxSum = items.reduce((sum, item) => sum + (item.maxPoints || 0), 0);
  const percentage = maxSum > 0 ? (earnedSum / maxSum) * 100 : 0;
  const categoryScore = (percentage / 100) * categoryWeight;
  return categoryScore;
  ```

#### Step 4.2: Final Grade Calculation
- **Function**: `calculateFinalGrade()`
- **Formula**:
  ```javascript
  const finalGrade = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
  ```

#### Step 4.3: Real-time Updates
- Add event listeners to all point input fields
- On change, recalculate:
  1. Category score
  2. Final grade
  3. Update display

### Phase 5: Data Persistence

#### Step 5.1: Save Grade Entry
- **Function**: `saveGrade()`
- **Changes**:
  - Save structure: `categories` object with items
  - Calculate and save `categoryScores`
  - Calculate and save `finalGrade`
  - Maintain backward compatibility with old format

#### Step 5.2: Load Grade Entry
- **Function**: `loadGradeData()`
- **Changes**:
  - Check if grade entry uses old or new format
  - If old format, migrate on-the-fly
  - Populate category items with saved scores

#### Step 5.3: Category Configuration Persistence
- **Function**: `saveToFirebase()` / `loadFromFirebase()`
- **Changes**:
  - Save `gradingCategories` structure
  - Save `categoryItems` per category
  - Load and restore on page load

### Phase 6: Analytics Updates

#### Step 6.1: Summary Statistics
- **Function**: `updateSummaryStats()`
- **Changes**:
  - Calculate final grades using new category-based formula
  - All existing stats (average, passing rate, etc.) work with new format

#### Step 6.2: Grade Distribution
- **Function**: `updateGradeDistribution()`
- **Changes**:
  - Use new `finalGrade` calculation
  - No changes to distribution logic itself

### Phase 7: Backward Compatibility

#### Step 7.1: Migration Function
- **Function**: `migrateOldGradeEntry(oldGrade)`
- **Logic**:
  - Map old attribute names to categories:
    - "Quizzes" → "Quizzes" category
    - "Assignment" → "Assignments" category
    - etc.
  - Convert percentage scores to point-based:
    - Assume maxPoints = 100 for all old items
    - earnedPoints = percentageScore
  - Create category structure
  - Calculate category scores

#### Step 7.2: Dual Format Support
- During transition, support both formats
- Prefer new format, fallback to old
- Auto-migrate when loading old entries

### Phase 8: Testing & Validation

#### Step 8.1: Test Cases
1. **Category Score Calculation**:
   - Quiz 1: 45/50, Quiz 2: 25/30
   - Expected: (70/80) * 20 = 17.5

2. **Final Grade Calculation**:
   - Quizzes: 17.5, Assignments: 9.0
   - Expected: 26.5

3. **Dynamic Quiz Addition**:
   - Add new quiz → appears in Quizzes category
   - Category score recalculates automatically

4. **Item Deletion**:
   - Delete item → category score updates
   - Final grade recalculates

5. **Backward Compatibility**:
   - Load old grade entry → migrates correctly
   - All calculations match old system

## Files to Modify

1. **Teacher/grading.html** (Primary file)
   - Data model (categories)
   - UI components (configuration, entry modal, table)
   - Calculation functions
   - Persistence functions
   - Migration functions

2. **No other files** (self-contained refactor)

## Implementation Order

1. ✅ Create plan (this document)
2. ⏳ Update data model and default categories
3. ⏳ Create migration functions
4. ⏳ Refactor calculation logic
5. ⏳ Update UI components
6. ⏳ Integrate quiz auto-population
7. ⏳ Update persistence
8. ⏳ Update analytics
9. ⏳ Test and validate

## Key Considerations

1. **Quiz Items**: Auto-managed, cannot be manually deleted/edited
2. **Other Items**: Can be added, edited, deleted manually
3. **Category Weights**: Fixed, cannot be changed
4. **Item Points**: Can be different per item
5. **Real-time Calculation**: All scores update as user types
6. **Backward Compatibility**: Old grade entries must still work

## Success Criteria

- ✅ Categories have fixed weights
- ✅ Each category can have unlimited items
- ✅ Items can have different point totals
- ✅ Category score = (earned/max) * weight
- ✅ Final grade = sum of category scores
- ✅ Dynamic updates when items added/deleted
- ✅ Quiz items auto-populate and sync
- ✅ Backward compatible with old grades
- ✅ Analytics work correctly

