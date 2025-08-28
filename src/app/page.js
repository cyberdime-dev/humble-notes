'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Home() {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword, user, loading } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  // Theme management
  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      setError('');
      await signInWithGoogle();
      router.push('/notes');
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setError('');

      if (isResetPassword) {
        await resetPassword(email);
        setError('Password reset email sent! Check your inbox.');
        setIsResetPassword(false);
        return;
      }

      if (isSignUp) {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }

      router.push('/notes');
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setAuthLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setIsResetPassword(false);
    setError('');
  };

  const toggleResetPassword = () => {
    setIsResetPassword(!isResetPassword);
    setError('');
  };

  // Redirect to notes if user is already signed in
  useEffect(() => {
    if (user && !loading) {
      router.push('/notes');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-custom flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-custom-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-custom flex items-center justify-center p-4">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-custom-button hover:bg-custom-button backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 transition-all duration-200 shadow-sm"
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-lg mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center text-custom-primary mb-4">
          Humble Notes
        </h1>

        <p className="text-lg text-center text-custom-secondary mb-8 leading-relaxed">
          {isResetPassword ? 'Reset your password' : isSignUp ? 'Create your account' : 'Welcome back'}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Email/Password Form */}
        {!isResetPassword && (
          <form onSubmit={handleEmailAuth} className="mb-6">
            {isSignUp && (
              <div className="mb-4">
                <label htmlFor="displayName" className="block text-sm font-medium text-custom-primary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary placeholder-custom-secondary focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                  placeholder="Enter your full name"
                  required={isSignUp}
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-custom-primary mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary placeholder-custom-secondary focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-custom-primary mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary placeholder-custom-secondary focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:bg-sky-400 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              <span>{authLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            </button>
          </form>
        )}

        {/* Reset Password Form */}
        {isResetPassword && (
          <form onSubmit={handleEmailAuth} className="mb-6">
            <div className="mb-6">
              <label htmlFor="resetEmail" className="block text-sm font-medium text-custom-primary mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="resetEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary placeholder-custom-secondary focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:bg-sky-400 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              <span>{authLoading ? 'Sending...' : 'Send Reset Email'}</span>
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-custom text-custom-secondary">or</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={authLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-custom-button hover:bg-custom-button border border-zinc-200 dark:border-zinc-700 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium text-custom-primary group-hover:text-custom-secondary">
            Continue with Google
          </span>
        </button>

        {/* Toggle Links */}
        <div className="text-center mt-6 space-y-2">
          <button
            onClick={toggleMode}
            className="text-sm text-sky-500 hover:text-sky-600 transition-colors duration-200"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>

          {!isSignUp && !isResetPassword && (
            <div>
              <button
                onClick={toggleResetPassword}
                className="text-sm text-custom-secondary hover:text-custom-primary transition-colors duration-200"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {isResetPassword && (
            <button
              onClick={toggleResetPassword}
              className="text-sm text-custom-secondary hover:text-custom-primary transition-colors duration-200"
            >
              Back to sign in
            </button>
          )}
        </div>

        <p className="text-xs text-center text-custom-muted mt-8 opacity-60">
          Please disable any pop-up blockers.
        </p>
      </div>
    </div>
  );
}