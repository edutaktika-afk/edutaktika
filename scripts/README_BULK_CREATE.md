# Local Admin SDK Scripts

## Available Scripts

1. **`bulk-create-students.js`** - Create student accounts in bulk
2. **`delete-dummy-accounts.js`** - Delete accounts with @student.edu.ph emails from both Auth and Database

---

# Bulk Create Students - Local Admin SDK Script

## Overview
This script uses Firebase Admin SDK to create student accounts from the command line. **No rate limits!**

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **edutaktika**
3. Click the **gear icon** (⚙️) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file as `serviceAccountKey.json` in the `scripts/` directory

**⚠️ IMPORTANT:** Add `serviceAccountKey.json` to `.gitignore` to keep it secure!

### 3. Run the Script

```bash
npm run bulk-create
```

Or directly:
```bash
node scripts/bulk-create-students.js
```

## Usage

The script will prompt you for:
- **Grade Levels**: e.g., `5,6`
- **Accounts per Section**: e.g., `15`
- **Subjects**: e.g., `Math,English,Science`
- **Default Password**: e.g., `StudentPass123!`
- **Email Domain**: e.g., `student.edu.ph`
- **Names File** (optional): Path to a `.txt` or `.csv` file with names

### Names File Format

Create a text file with one name per line:

**Format 1:** `First Last`
```
John Doe
Jane Smith
Michael Johnson
```

**Format 2:** `First,Last`
```
John,Doe
Jane,Smith
Michael,Johnson
```

## Example

```bash
$ npm run bulk-create

🚀 Bulk Student Account Creator (Admin SDK)

This script uses Firebase Admin SDK - NO RATE LIMITS!

Grade Levels (comma-separated, e.g., 5,6): 5,6
Accounts per Section (default: 15): 15
Subjects (comma-separated, e.g., Math,English,Science): Math,English,Science
Default Password (default: StudentPass123!): StudentPass123!
Email Domain (default: student.edu.ph): student.edu.ph
Names File (optional, .txt or .csv, press Enter to skip): names.txt

📋 Configuration Summary:
   Grade Levels: 5, 6
   Total Sections: 8
   Accounts per Section: 15
   Subjects: Math, English, Science
   Total Accounts: 120
   Imported Names: 50

⚠️  Proceed with account creation? (yes/no): yes

📚 Generating student data...
✅ Generated 120 student records

🚀 Creating accounts (this may take a while)...

📦 Processing batch 1/3 (50 accounts)...
📦 Processing batch 2/3 (50 accounts)...
📦 Processing batch 3/3 (20 accounts)...

============================================================
📊 RESULTS
============================================================
✅ Created: 120
❌ Failed: 0
📈 Success Rate: 100.0%

✅ Done!
```

## Benefits

✅ **No Rate Limits**: Admin SDK can create accounts very quickly  
✅ **Batch Processing**: Processes accounts in batches of 50  
✅ **Progress Tracking**: Shows real-time progress  
✅ **Error Handling**: Continues even if some accounts fail  
✅ **File Import**: Supports importing names from text files  
✅ **No Deployment Needed**: Run locally from command line  

## Security

- The service account key has full admin access
- Keep `serviceAccountKey.json` secure and never commit it to git
- Only run this script on trusted machines
- The script requires the key file to be present

## Troubleshooting

### "serviceAccountKey.json not found"
- Make sure you downloaded the service account key from Firebase Console
- Save it as `scripts/serviceAccountKey.json`
- Check the file path is correct

### "Permission denied"
- Make sure the service account has proper permissions
- Check Firebase Console → IAM & Admin → Service Accounts

### Accounts not appearing
- Check Firebase Console → Authentication → Users
- Check Firebase Console → Realtime Database → students
- Verify the script completed successfully

## Comparison: Cloud Functions vs Local Script

| Feature | Cloud Functions | Local Script |
|---------|----------------|--------------|
| Setup | Requires deployment | Just download key |
| Rate Limits | None | None |
| Speed | Fast | Fast |
| Accessibility | From web UI | Command line only |
| Best For | Production use | Development/testing |

