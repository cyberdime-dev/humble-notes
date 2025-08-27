'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

export default function HomePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // If not authenticated, redirect to login
  if (!loading && !user) {
    router.push('/');
    return null;
  }

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
    <div className="min-h-screen bg-gradient-custom">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-custom-primary">Humble Notes</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {/* User menu */}
          <div className="flex items-center gap-3">
            {user?.photoURL && (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-custom-primary">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-custom-secondary">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-custom-button hover:bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary text-sm font-medium transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-custom-primary mb-4">
            Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
          </h2>
          <p className="text-lg text-custom-secondary">
            Ready to capture your thoughts and ideas?
          </p>
        </div>

        {/* Placeholder for notes */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick note card */}
          <div className="p-6 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-custom-primary">Quick Note</h3>
            </div>
            <p className="text-custom-secondary text-sm">
              Start writing your thoughts...
            </p>
          </div>

          {/* Recent notes placeholder */}
          <div className="p-6 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-custom-primary mb-4">Recent Notes</h3>
            <div className="space-y-3">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-1/2"></div>
            </div>
          </div>

          {/* Stats placeholder */}
          <div className="p-6 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-custom-primary mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-custom-secondary text-sm">Total Notes</span>
                <span className="text-custom-primary font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-custom-secondary text-sm">This Week</span>
                <span className="text-custom-primary font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
