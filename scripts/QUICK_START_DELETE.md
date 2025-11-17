# Quick Start: Delete Dummy Accounts

## 🚀 Fast Setup (3 Steps)

### 1. Get Service Account Key
- Go to [Firebase Console](https://console.firebase.google.com/)
- Project Settings → Service Accounts → Generate New Private Key
- Save as `edutaktika-firebase-adminsdk.json` in the **root directory**

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Script
```bash
npm run delete-dummy
```

## ✅ What It Does

- ✅ Finds ALL accounts with `@student.edu.ph` emails
- ✅ Deletes from **Firebase Authentication**
- ✅ Deletes from **Realtime Database**
- ✅ Shows progress and summary
- ✅ Asks for confirmation before deleting

## 📋 Example Output

```
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
   ...
```

## ⚠️ Important Notes

- **Requires confirmation** - Type `yes` to proceed
- **Cannot be undone** - Deletion is permanent
- **No rate limits** - Uses Admin SDK (fast!)
- **Safe** - Only deletes accounts with `@student.edu.ph` emails

