# Firebase Authentication Setup

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "humble-notes")
4. Follow the setup wizard

## 2. Enable Google Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Click on **Google** provider
5. Enable it and configure:
   - **Project support email**: Your email
   - **Web SDK configuration**: Add your domain (localhost for development)
6. Click **Save**

## 3. Get Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "humble-notes-web")
6. Copy the configuration object

## 4. Set Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration.

## 5. Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

## 6. Test the Setup

1. Run your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Continue with Google"
4. You should be redirected to the home page after successful authentication

## Troubleshooting

- **"Firebase: Error (auth/popup-closed-by-user)"**: User closed the popup before completing sign-in
- **"Firebase: Error (auth/unauthorized-domain)"**: Domain not added to authorized domains
- **"Firebase: Error (auth/operation-not-allowed)"**: Google sign-in not enabled in Firebase Console

## Security Notes

- Never commit your `.env.local` file to version control
- Add `.env.local` to your `.gitignore` file
- Use different Firebase projects for development and production
