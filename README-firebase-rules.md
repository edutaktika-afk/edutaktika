# Firebase Rules and Indexes for Edutaktika

This directory contains Firebase configuration files to optimize query performance and secure the Edutaktika assessment system.

## Files

- `firebase.json` - Main Firebase configuration
- `database.rules.json` - Realtime Database security rules and indexes
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore composite indexes
- `deploy-firebase-rules.js` - Deployment script

## Firebase Realtime Database Indexes

The following indexes have been added to improve query performance:

### Assessments Collection
```json
"assessments": {
  ".indexOn": ["subject", "status", "createdBy", "gradeLevel"]
}
```

**Queries optimized:**
- `assessments.orderByChild('subject').equalTo('math')`
- `assessments.orderByChild('status').equalTo('published')`
- `assessments.orderByChild('createdBy').equalTo(teacherId)`
- `assessments.orderByChild('gradeLevel').equalTo('grade5')`

### Assessment Attempts Collection
```json
"assessmentAttempts": {
  ".indexOn": ["assessmentId", "studentId", "timestamp"]
}
```

**Queries optimized:**
- `assessmentAttempts.orderByChild('assessmentId').equalTo(assessmentId)`
- `assessmentAttempts.orderByChild('studentId').equalTo(studentId)`
- `assessmentAttempts.orderByChild('timestamp').limitToLast(10)`

### Students Collection
```json
"students": {
  ".indexOn": ["role", "grade", "subject"]
}
```

**Queries optimized:**
- `students.orderByChild('role').equalTo('student')`
- `students.orderByChild('grade').equalTo('grade5')`
- `students.orderByChild('subject').equalTo('math')`

### Teachers Collection
```json
"teachers": {
  ".indexOn": ["role", "subject", "status"]
}
```

**Queries optimized:**
- `teachers.orderByChild('role').equalTo('teacher')`
- `teachers.orderByChild('subject').equalTo('math')`
- `teachers.orderByChild('status').equalTo('approved')`

### Admins Collection
```json
"admins": {
  ".indexOn": ["role", "status"]
}
```

**Queries optimized:**
- `admins.orderByChild('role').equalTo('admin')`
- `admins.orderByChild('status').equalTo('active')`

### Quiz Summaries Collection
```json
"quizSummaries": {
  ".indexOn": ["lessonId", "studentId"]
}
```

**Queries optimized:**
- `quizSummaries.child(lessonId).orderByChild('studentId')`
- `quizSummaries.child(lessonId).child(studentId)`

### Assessment Summaries Collection
```json
"assessmentSummaries": {
  ".indexOn": ["assessmentId", "studentId"]
}
```

**Queries optimized:**
- `assessmentSummaries.child(assessmentId).orderByChild('studentId')`
- `assessmentSummaries.child(assessmentId).child(studentId)`

## Deployment

### Prerequisites
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase project (if not already done):
   ```bash
   firebase init
   ```

### Deploy Rules and Indexes

#### Option 1: Using the deployment script
```bash
node deploy-firebase-rules.js
```

#### Option 2: Manual deployment
```bash
# Deploy Realtime Database rules
firebase deploy --only database

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Verify Deployment
1. Check Firebase Console: https://console.firebase.google.com/
2. Navigate to your project
3. Go to Realtime Database → Rules
4. Go to Firestore → Rules and Indexes
5. Verify the rules and indexes are active

## Performance Impact

### Before Indexes
- Queries on `subject` field downloaded all assessments and filtered client-side
- Warning: "Using an unspecified index. Your data will be downloaded and filtered on the client"
- Slower performance with large datasets

### After Indexes
- Queries use server-side filtering
- Only relevant data is downloaded
- Faster response times
- Reduced bandwidth usage

## Security Rules

### Authentication Required
All read/write operations require authentication:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Access Control
- Only authenticated users can access data
- Users can only access their own data or data they're authorized to see
- Teachers can only access assessments they created
- Students can only access published assessments

## Monitoring

### Firebase Console
- Monitor query performance in the Firebase Console
- Check for any remaining index warnings
- Review security rule violations

### Performance Metrics
- Query response times should improve
- Data transfer should decrease
- Client-side filtering should be eliminated

## Troubleshooting

### Common Issues

1. **Index build failures**
   - Check Firebase Console for error messages
   - Ensure data structure matches index requirements
   - Wait for index build to complete (can take several minutes)

2. **Rules deployment failures**
   - Verify Firebase CLI is logged in
   - Check project permissions
   - Ensure rules syntax is valid

3. **Query performance issues**
   - Verify indexes are built and active
   - Check query structure matches index
   - Monitor Firebase Console for warnings

### Support
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com/
- Firebase Support: https://firebase.google.com/support

## Maintenance

### Regular Tasks
1. Monitor query performance
2. Review security rule violations
3. Update indexes as new query patterns emerge
4. Test rules in Firebase Console simulator

### Updates
When adding new query patterns:
1. Add appropriate indexes to `database.rules.json`
2. Deploy updated rules
3. Test queries to ensure they use indexes
4. Monitor performance improvements
