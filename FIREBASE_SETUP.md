# Firebase Setup Instructions

## Create Firebase Project

Since the automated project creation encountered permission issues, please create the Firebase project manually:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Click "Add project"**
3. **Enter project details**:
   - Project name: `sharevault-site`
   - Project ID: `sharevault-site` (or accept the generated one)
   - Enable Google Analytics (optional but recommended)
4. **Click "Create project"**

## Enable Required Services

After creating the project, enable these services:

1. **Firestore Database**:
   - Go to Firestore Database in the console
   - Click "Create database"
   - Start in test mode (we'll update security rules later)
   - Choose a location (e.g., `nam5` for North America)

2. **Cloud Storage**:
   - Go to Storage in the console
   - Click "Get started"
   - Start in test mode
   - Choose a location near your users

## Get Firebase Configuration

1. **Register a Web App**:
   - Go to Project Settings → General
   - Click "Add app" → Web app
   - App nickname: `ShareVault`
   - Check "Also set up Firebase Hosting" (optional)

2. **Copy Firebase Config**:
   - You'll get a config object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "sharevault-site.firebaseapp.com",
     projectId: "sharevault-site",
     storageBucket: "sharevault-site.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

## Set Environment Variables

Create `.env.local` file in your project root with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

## Deploy Security Rules

1. **Firestore Rules**:
   - Go to Firestore Database → Rules
   - Replace with the rules from `firestore.rules`
   - Click "Publish"

2. **Storage Rules**:
   - Go to Storage → Rules
   - Replace with the rules from `storage.rules`
   - Click "Publish"

## Seed the Database

Run the seeding script:

```bash
# You can run this in the browser console or create a temporary page
# For now, the app will show "No posts available" until you seed data
```

## Next Steps

1. Test the application with the seeded data
2. Set up authentication for user management
3. Create admin interface for post management
4. Deploy to Firebase Hosting if desired

## Troubleshooting

If you encounter permission errors:
- Ensure your Firebase project is properly set up
- Check that Firestore and Storage are enabled
- Verify your security rules allow read access
- Make sure environment variables are correctly set