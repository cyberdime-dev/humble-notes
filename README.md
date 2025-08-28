# Humble Notes

A beautiful, simple note-taking application built with Next.js, Firebase, and Tailwind CSS.

## Features

- ✨ **Beautiful UI** - Modern, responsive design with dark/light mode
- 🔐 **Secure Authentication** - Google Sign-in with Firebase Auth
- ☁️ **Cloud Storage** - Notes stored securely in Firebase Firestore
- 📱 **Real-time Updates** - Auto-save with immediate UI feedback
- 🎨 **Auto-generated Titles** - Titles automatically created from note content

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Firebase Authentication, Firestore Database
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/humble-notes.git
   cd humble-notes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Google Authentication
   - Create a Firestore database
   - Copy your Firebase config

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Set up Firestore Security Rules**
   Deploy the security rules from `firestore.rules` to your Firebase project.

6. **Create Firestore Index**
   Create a composite index for the notes collection:
   - Collection: `notes`
   - Fields: `userId` (Ascending), `updatedAt` (Descending)

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to add all Firebase environment variables to your production environment.

## Security

- All Firebase configuration is handled through environment variables
- Firestore security rules ensure users can only access their own notes
- No sensitive data is logged or exposed in the client

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
