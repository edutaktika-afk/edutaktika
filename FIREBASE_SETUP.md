# Firebase Realtime Database Integration Setup

This guide will help you set up Firebase Realtime Database integration for the Polotno Editor, Gallery, and Viewer.

## 🚀 Quick Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 2. Enable Firebase Realtime Database

1. In your Firebase project, go to **Realtime Database** in the left sidebar
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select a location for your database
5. Click **Done**

### 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Add app** → **Web app** (</> icon)
4. Register your app with a nickname
5. Copy the configuration object

### 4. Update Configuration

Edit `Editor/src/firebase-config.js` and replace the placeholder values:

```javascript
export const FIREBASE_CONFIG = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id", 
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 5. Set Database Rules (Important!)

Go to **Realtime Database** → **Rules** and replace the rules with:

```json
{
  "rules": {
    "designs": {
      ".read": true,
      ".write": true
    }
  }
}
```

**⚠️ Security Note:** This rule allows public read/write access. For production, implement proper authentication and security rules.

## 🎯 How It Works

### Editor Integration
- **Save Design Button**: Added to the top navigation bar
- **Upload Process**: Saves JSON design data and PNG thumbnail to Realtime Database
- **Firebase Realtime Database**: Data is stored in the `designs/` path
- **URLs Generated**: Direct Firebase Realtime Database URLs for sharing

### Gallery Integration  
- **Manual Mode**: Edit the designs array with Firebase Realtime Database URLs
- **Auto Mode**: Automatically fetch all designs from Firebase Realtime Database
- **Thumbnail Display**: Shows PNG thumbnails or generated placeholders

### Viewer Integration
- **Direct Loading**: Loads designs from Firebase Realtime Database URLs
- **Read-only Mode**: Displays designs without editing capabilities
- **Responsive**: Works on all devices

## 📁 File Structure

```
Editor/
├── src/
│   ├── firebase-config.js          # Firebase configuration
│   ├── topbar/
│   │   └── firebase-save-button.jsx # Save to Firebase button
│   └── ...
├── gallery.html                    # Design gallery
├── viewer.html                     # Design viewer
└── ...

Firebase Realtime Database:
└── designs/
    ├── design1-1234567890/
    │   ├── id: "design1-1234567890"
    │   ├── name: "Math Poster"
    │   ├── json: { ... }           # Design JSON data
    │   ├── thumbnail: "data:image/png;base64..." # Thumbnail
    │   ├── createdAt: 1234567890
    │   └── createdBy: "teacher"
    └── design2-1234567890/
        ├── id: "design2-1234567890"
        ├── name: "Spelling Bee"
        ├── json: { ... }
        ├── thumbnail: "data:image/png;base64..."
        ├── createdAt: 1234567890
        └── createdBy: "teacher"
```

## 🔧 Usage

### For Teachers (Creating Designs)
1. Open `Editor/index.html`
2. Create your design
3. Click **"Save Design"** button in top navigation
4. Enter a design name
5. Click **"Save to Firebase"**
6. Copy the generated database URL for sharing

### For Students (Viewing Designs)
1. Open `gallery.html`
2. Configure Firebase settings (Auto Mode) or add design URLs (Manual Mode)
3. Click on any design to view it
4. Use zoom controls and navigation in the viewer

## 🛠️ Troubleshooting

### Common Issues

**"Firebase not initialized" error:**
- Check your Firebase configuration in `firebase-config.js`
- Ensure all required fields are filled

**"Permission denied" error:**
- Check your Database Rules in Firebase Console
- Make sure rules allow public read/write access

**"Design not loading" error:**
- Verify the Firebase Realtime Database URLs are correct
- Check that data exists in Firebase Realtime Database
- Ensure the JSON structure is correct

**Gallery not showing designs:**
- In Auto Mode: Check Firebase configuration and database path
- In Manual Mode: Verify the designs array has correct database URLs

### Testing Your Setup

1. **Test Firebase Connection:**
   - Open browser console in Editor
   - Try saving a design
   - Check for any error messages

2. **Test Gallery:**
   - Open `gallery.html`
   - Try both Manual and Auto modes
   - Verify designs load correctly

3. **Test Viewer:**
   - Click on a design in the gallery
   - Ensure it loads in the viewer
   - Test zoom and navigation controls

## 🔒 Security Considerations

### Development (Current Setup)
- Public read/write access to Storage
- Suitable for testing and development
- **Not recommended for production**

### Production Recommendations
1. **Implement Authentication:**
   - Use Firebase Auth for user login
   - Restrict access to authenticated users only

2. **Secure Database Rules:**
   ```json
   {
     "rules": {
       "designs": {
         ".read": true, // Public read for gallery
         ".write": "auth != null" // Only authenticated users can write
       }
     }
   }
   ```

3. **Add User Management:**
   - Teacher accounts for creating designs
   - Student accounts for viewing designs
   - Role-based permissions

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Firebase configuration
3. Test with a simple design first
4. Ensure Database Rules are correct
5. Check that Firebase Realtime Database is enabled

## 🎉 Success!

Once configured, you'll have:
- ✅ Teachers can save designs to Firebase Realtime Database
- ✅ Gallery automatically shows all designs from the database
- ✅ Students can view designs in read-only mode
- ✅ No backend server required
- ✅ Free Firebase tier sufficient for most use cases
- ✅ Real-time updates when new designs are added
