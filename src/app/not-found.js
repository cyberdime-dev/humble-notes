'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-custom flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-custom-button border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
            <svg className="w-12 h-12 text-custom-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-6xl font-bold text-custom-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-custom-primary mb-4">Page Not Found</h2>
        <p className="text-custom-secondary mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl bg-custom-button hover:bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-custom-secondary mb-2">Need help?</p>
          <Link
            href="/notes"
            className="text-sky-500 hover:text-sky-600 text-sm font-medium transition-colors duration-200"
          >
            Access your notes →
          </Link>
        </div>
      </div>
    </div>
  );
}
