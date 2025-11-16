# Delete Dummy Accounts - Local Admin SDK Script

## Overview
This script uses Firebase Admin SDK to delete accounts with `@student.edu.ph` emails from **both Firebase Authentication AND Realtime Database**.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Service Account Key

Same as bulk-create script. If you already have `serviceAccountKey.json` in the `scripts/` directory, you're good to go!

If not:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **edutaktika**
3. Click the **gear icon** (⚙️) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save as `serviceAccountKey.json` in the `scripts/` directory

**⚠️ IMPORTANT:** Add `serviceAccountKey.json` to `.gitignore`!

### 3. Run the Script

```bash
npm run delete-dummy
```

Or directly:
```bash
node scripts/delete-dummy-accounts.js
```

## Usage

The script will:
1. Fetch all users from Firebase Authentication
2. Fetch all students from Realtime Database
3. Find accounts with `@student.edu.ph` emails
4. Ask for confirmation
5. Delete from both Auth and Database

## Example

```bash
$ npm run delete-dummy

🗑️  Delete Dummy Accounts Script

This will delete ALL accounts with @student.edu.ph emails
from both Firebase Authentication AND Realtime Database.

📋 Fetching users from Firebase Authentication...
✅ Found 150 total users in Authentication

📋 Fetching students from Realtime Database...
✅ Found 120 students in Database

📊 Summary:
   Total dummy accounts: 120
   In Authentication: 120
   In Database: 120

⚠️  Are you sure you want to delete ALL these accounts? (yes/no): yes

🗑️  Starting deletion...

📦 Processing batch 1/3 (50 accounts)...
   ✅ Deleted from Auth: John Doe (john.doe1@student.edu.ph)
   ✅ Deleted from Auth: Jane Smith (jane.smith2@student.edu.ph)
   ...
📦 Processing batch 2/3 (50 accounts)...
   ...
📦 Processing batch 3/3 (20 accounts)...
   ...

============================================================
📊 DELETION RESULTS
============================================================
✅ Deleted from Authentication: 120
✅ Deleted from Database: 120
❌ Failed: 0

✅ Done!
```

## What Gets Deleted

✅ **Firebase Authentication**: User accounts are completely removed  
✅ **Realtime Database**: Student records are removed  
✅ **Both**: Ensures complete cleanup  

## Benefits

✅ **Complete Deletion**: Removes from both Auth and Database  
✅ **No Rate Limits**: Admin SDK can delete quickly  
✅ **Batch Processing**: Processes in batches of 50  
✅ **Progress Tracking**: Shows real-time progress  
✅ **Safe**: Asks for confirmation before deletion  

## Comparison: Methods

| Method | Deletes from Auth | Deletes from DB | Rate Limits |
|--------|------------------|-----------------|-------------|
| **Local Script** (this) | ✅ Yes | ✅ Yes | ❌ No |
| **Cloud Function** | ✅ Yes | ✅ Yes | ❌ No |
| **Client-side** | ❌ No | ✅ Yes | ⚠️ Yes |

## Troubleshooting

### "serviceAccountKey.json not found"
- Make sure you downloaded the service account key
- Save it as `scripts/serviceAccountKey.json`

### "Permission denied"
- Make sure the service account has proper permissions
- Check Firebase Console → IAM & Admin → Service Accounts

### Some accounts not deleted
- Check if accounts exist in both Auth and Database
- Some might only exist in one location (script handles this)

