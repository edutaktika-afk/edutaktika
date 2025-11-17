# Deploying Cloud Functions for Bulk Account Creation

## Overview
Cloud Functions use the Firebase Admin SDK which has **no rate limits** and is much faster for bulk operations.

## Prerequisites

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Install dependencies**:
   ```bash
   cd functions
   npm install
   ```

## Deploy Functions

1. **Deploy all functions**:
   ```bash
   firebase deploy --only functions
   ```

2. **Or deploy specific functions**:
   ```bash
   firebase deploy --only functions:bulkCreateStudents
   firebase deploy --only functions:deleteDummyAccounts
   ```

## Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Functions** in the left sidebar
4. You should see:
   - `bulkCreateStudents`
   - `deleteDummyAccounts`

## How It Works

### Client-Side Code
- The admin panel automatically detects if Cloud Functions are available
- If available, it uses the Cloud Function (no rate limits!)
- If not available, it falls back to client-side creation (with rate limiting handling)

### Cloud Functions
- Use Firebase Admin SDK (server-side)
- No rate limits
- Can process hundreds of accounts quickly
- Secure (requires admin authentication)

## Testing

After deployment, test by:
1. Opening the admin panel
2. Clicking "Bulk Create Accounts"
3. Creating accounts - it should use the Cloud Function automatically
4. Check the browser console for any errors

## Troubleshooting

### Functions not deploying
- Make sure you're in the project root directory
- Check that `functions/package.json` exists
- Run `npm install` in the `functions` directory

### Functions not being called
- Check browser console for errors
- Verify Firebase Functions SDK is loaded in `admin.html`
- Check Firebase Console → Functions → Logs for errors

### Permission errors
- Make sure the user is authenticated as admin
- Check Firebase Console → Authentication → Users

## Benefits

✅ **No Rate Limits**: Admin SDK can create accounts much faster  
✅ **More Secure**: Server-side validation and authentication  
✅ **Better Error Handling**: Centralized error management  
✅ **Scalable**: Can handle thousands of accounts efficiently  

