# 📝 Humble Notes

A modern, beautiful note-taking application built with Next.js and Firebase. Simple, secure, and designed for productivity.

🌐 **Live Demo**: [humble-notes.vercel.app](https://humble-notes.vercel.app)

![Humble Notes](https://img.shields.io/badge/Next.js-15.5.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12.1.0-orange?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-blue?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎨 **Beautiful User Experience**
- **Modern UI/UX** - Clean, intuitive interface inspired by modern design principles
- **Dark/Light Mode** - Automatic theme detection with manual toggle
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Real-time Updates** - Instant UI feedback as you type

### 🔐 **Security & Authentication**
- **Triple Authentication** - Google, GitHub, or Email/Password
- **User Data Isolation** - Each user can only access their own notes
- **Firestore Security Rules** - Server-side data protection
- **Password Reset** - Secure password recovery functionality
- **Environment Variables** - No hardcoded secrets

### 📝 **Note Management**
- **Auto-generated Titles** - Titles automatically created from note content
- **Real-time Auto-save** - Notes save automatically as you type
- **Quick Notes** - Fast note creation from dashboard
- **Recent Notes** - Easy access to your latest work
- **Note Statistics** - Track your note-taking activity

### 🚀 **Performance & Reliability**
- **Next.js 15** - Latest framework with App Router
- **Vercel Speed Insights** - Built-in performance monitoring
- **Optimized Loading** - Fast page loads and smooth interactions
- **Error Handling** - Graceful error states and user feedback

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.0 | React framework with App Router |
| **React** | 19.1.0 | UI library |
| **Firebase** | 12.1.0 | Authentication & Database |
| **Firestore** | - | NoSQL cloud database |
| **Tailwind CSS** | 4.0 | Utility-first CSS framework |
| **Vercel** | - | Deployment & hosting |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase project with Authentication and Firestore
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/cyberdime-dev/humble-notes.git
cd humble-notes
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Firebase

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Google Authentication** in Authentication → Sign-in method
4. Enable **GitHub Authentication** in Authentication → Sign-in method
5. Enable **Email/Password** in Authentication → Sign-in method
6. Create a **Firestore Database** in production mode

#### Get Firebase Configuration
1. Go to Project Settings → General
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Copy the configuration object

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Set Up Firestore Security Rules
Deploy the security rules from `firestore.rules` to your Firebase project:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, write, delete: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 6. Create Firestore Index
Create a composite index in Firebase Console:
- **Collection**: `notes`
- **Fields**: 
  - `userId` (Ascending)
  - `updatedAt` (Descending)

### 7. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## 📱 Usage

### Getting Started
1. **Sign In/Sign Up** - Choose Google, GitHub, or create an email/password account
2. **Create Notes** - Use the "+" button or "Quick Note" feature
3. **Start Writing** - Type in the textarea, titles auto-generate from first line
4. **Organize** - View recent notes and track your activity

### Features Overview
- **Dashboard** - Overview of your notes and quick actions
- **Note Editor** - Full-featured editor with auto-save
- **Sidebar** - Quick access to all your notes
- **Theme Toggle** - Switch between light and dark modes
- **Authentication** - Google OAuth, GitHub OAuth, or Email/Password with password reset

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

### Environment Variables for Production
Make sure to add all Firebase environment variables to your production environment in Vercel.

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure
```
humble-notes/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.js         # Landing page
│   │   ├── notes/          # Notes application
│   │   └── layout.js       # Root layout
│   ├── contexts/           # React contexts
│   ├── services/           # Firebase services
│   └── lib/               # Utilities
├── public/                # Static assets
└── firestore.rules       # Firestore security rules
```

## 🔒 Security

- **Authentication Required** - All operations require valid user session
- **Data Isolation** - Users can only access their own notes
- **Server-side Validation** - Firestore security rules enforce access control

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Team Treehouse](https://teamtreehouse.com/about)** - For providing the excellent tutorial that inspired this project
- **[John Norris](https://teamtreehouse.com/profiles/johnnorris)** - Student of Treehouse and creator of Humble Notes
- **[Next.js Team](https://nextjs.org/)** - For the amazing React framework
- **[Firebase Team](https://firebase.google.com/)** - For the powerful backend services
- **[Tailwind CSS](https://tailwindcss.com/)** - For the utility-first CSS framework
- **[Vercel](https://vercel.com/)** - For seamless deployment and hosting

## 📞 Support

- **Issues** - [GitHub Issues](https://github.com/cyberdime-dev/humble-notes/issues)
- **Discussions** - [GitHub Discussions](https://github.com/cyberdime-dev/humble-notes/discussions)
- **Email** - info@cyberdime.io

---

<div align="center">
  <p>Made with ❤️ by John Norris @ Cyberdime</p>
  <p>
    <a href="https://github.com/cyberdime-dev/humble-notes/stargazers">
      <img src="https://img.shields.io/github/stars/cyberdime-dev/humble-notes" alt="Stars">
    </a>
    <a href="https://github.com/cyberdime-dev/humble-notes/network">
      <img src="https://img.shields.io/github/forks/cyberdime-dev/humble-notes" alt="Forks">
    </a>
    <a href="https://github.com/cyberdime-dev/humble-notes/issues">
      <img src="https://img.shields.io/github/issues/cyberdime-dev/humble-notes" alt="Issues">
    </a>
  </p>
</div>
