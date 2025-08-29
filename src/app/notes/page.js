'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { createNote, getUserNotes, updateNote, deleteNote } from '../../services/notesService';

export default function HomePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [quickNoteContent, setQuickNoteContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);

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

  // Load notes from Firestore
  useEffect(() => {
    const loadNotes = async () => {
      if (!user?.uid) return;
      
      setNotesLoading(true);
      setNotesError(null);
      
      try {
        const userNotes = await getUserNotes(user.uid);
        setNotes(userNotes);
      } catch (error) {
        console.error('❌ Error loading notes:', error);
        setNotesError(error.message);
      } finally {
        setNotesLoading(false);
      }
    };

    loadNotes();
  }, [user?.uid]);



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

  // Auto-close sidebar on mobile when navigating to a note
  const closeSidebarOnMobile = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setSidebarOpen(false);
    }
  };

  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setShowQuickNote(false);
    closeSidebarOnMobile();
  };

  const saveNote = async (noteId, title, content) => {
    if (!user?.uid) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Check if this is a new note (temporary ID) or existing note
      const isNewNote = noteId.startsWith('temp_') || noteId.length < 10;
      
      if (isNewNote) {
        // Create new note in Firestore
        const newNoteData = { title, content };
        const createdNote = await createNote(user.uid, newNoteData);
        
        // Update local state with the real note from Firestore
        const updatedNotes = notes.map(note => 
          note.id === noteId 
            ? createdNote
            : note
        );
        setNotes(updatedNotes);
        
        // Update selectedNote if it matches
        if (selectedNote && selectedNote.id === noteId) {
          setSelectedNote(createdNote);
        }
        
      } else {
        // Update existing note
        const updatedNotes = notes.map(note => 
          note.id === noteId 
            ? { ...note, title, content, updatedAt: new Date().toISOString() }
            : note
        );
        setNotes(updatedNotes);
        
        // Update selectedNote if it matches
        if (selectedNote && selectedNote.id === noteId) {
          setSelectedNote({ ...selectedNote, title, content, updatedAt: new Date().toISOString() });
        }
        
        // Save to Firestore
        await updateNote(noteId, user.uid, { title, content });
      }
    } catch (error) {
      console.error('❌ Error saving note:', error);
      alert('Failed to save note: ' + error.message);
    }
  };

  const handleDeleteClick = (noteId) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete || !user?.uid) {
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
      return;
    }

    try {
      // Delete from Firestore
      await deleteNote(noteToDelete, user.uid);
      
      // Update local state
      const updatedNotes = notes.filter(note => note.id !== noteToDelete);
      setNotes(updatedNotes);
      
      if (selectedNote?.id === noteToDelete) {
        setSelectedNote(null);
      }
      
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      alert('Failed to delete note: ' + error.message);
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  const handleQuickNote = () => {
    setShowQuickNote(true);
    setSelectedNote(null);
  };

  const saveQuickNote = async () => {
    if (!quickNoteContent.trim() || !user?.uid) {
      return;
    }

    try {
      const newNoteData = {
        title: quickNoteContent.split('\n')[0].slice(0, 50) || 'Quick Note',
        content: quickNoteContent
      };
      
      const createdNote = await createNote(user.uid, newNoteData);
      setNotes([createdNote, ...notes]);
      setQuickNoteContent('');
      setShowQuickNote(false);
    } catch (error) {
      console.error('❌ Error saving quick note:', error);
      alert('Failed to save quick note: ' + error.message);
    }
  };

  // Helper function to generate title from content
  const generateTitleFromContent = (content) => {
    if (!content || !content.trim()) return 'Untitled Note';
    const firstLine = content.split('\n')[0].trim();
    return firstLine.length > 0 ? firstLine.slice(0, 50) : 'Untitled Note';
  };

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

  const recentNotes = notes.slice(0, 3);
  const totalNotes = notes.length;
  const thisWeekNotes = notes.filter(note => {
    const noteDate = new Date(note.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return noteDate > weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-custom">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.svg"
            alt="Humble Notes"
            className="w-10 h-10 rounded-2xl cursor-pointer md:cursor-default select-none"
            onClick={() => setSidebarOpen(prev => !prev)}
          />
          <h1 className="hidden sm:block text-2xl font-bold text-custom-primary">Humble Notes</h1>
        </div>
        
        <div className="hidden md:flex items-center gap-2 md:gap-4">
          {/* Mobile: Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 transition-all duration-200 shadow-sm md:hidden"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5 text-custom-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* New Note Button */}
          <button
            onClick={createNewNote}
            className="p-3 rounded-2xl bg-custom-button hover:bg-custom-button backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 transition-all duration-200 shadow-sm"
            aria-label="Create new note"
          >
            <svg className="w-5 h-5 text-custom-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-custom-button hover:bg-custom-button backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 transition-all duration-200 shadow-sm"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          {/* User menu */}
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center" style={{ display: user?.photoURL ? 'none' : 'flex' }}>
              <span className="text-white text-sm font-medium">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            
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
              className="px-4 py-2 rounded-xl bg-custom-button hover:bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary text-sm font-medium transition-all duration-200 whitespace-nowrap"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-96px)] md:h-[calc(100vh-120px)]">
        {/* Left Sidebar */}
        {/* Mobile overlay to close sidebar by tapping outside */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-40 top-[72px] md:top-auto left-0 w-72 md:w-80 h-[calc(100vh-72px)] md:h-auto bg-custom-button border-r border-zinc-200 dark:border-zinc-700 flex flex-col transition-transform duration-200`}>
          {/* New Note Button */}
          {/* Mobile header inside sidebar */}
          <div className="p-3 md:hidden flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700">
            <span className="text-sm font-semibold text-custom-primary">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700"
              aria-label="Close menu"
            >
              <svg className="w-4 h-4 text-custom-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-3 md:p-4 border-b border-zinc-200 dark:border-zinc-700">
            <button
              onClick={createNewNote}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Humble Note
            </button>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            {/* Search */}
            <div className="mb-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <input
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-custom-secondary mb-3">Your Notes</h3>
            
            {/* Loading State */}
            {notesLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-custom-secondary">
                  <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading notes...</span>
                </div>
              </div>
            )}
            
            {/* Error State */}
            {notesError && !notesLoading && (
              <div className="text-center py-8">
                <div className="text-red-500 dark:text-red-400 mb-2">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium">Failed to load notes</p>
                </div>
                <p className="text-xs text-custom-secondary mb-3">{notesError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* Empty State */}
            {!notesLoading && !notesError && notes.length === 0 && (
              <p className="text-sm text-custom-muted text-center py-8">
                No notes yet. Create your first note!
              </p>
            )}
            
            {/* Notes List */}
            {!notesLoading && !notesError && notes.length > 0 && (
              <div className="space-y-2">
                {notes
                  .filter(n =>
                    sidebarSearch.trim() === ''
                      ? true
                      : (n.title || '').toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                        (n.content || '').toLowerCase().includes(sidebarSearch.toLowerCase())
                  )
                  .map(note => (
                  <div
                    key={note.id}
                    onClick={() => { setSelectedNote(note); closeSidebarOnMobile(); }}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ring-offset-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      selectedNote?.id === note.id
                        ? 'bg-sky-100 dark:bg-sky-900 border border-sky-200 dark:border-sky-700'
                        : 'bg-note-card hover:bg-note-card border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <h4 className="font-medium text-custom-primary text-sm truncate">
                      {note.title}
                    </h4>
                    <p className="text-xs text-custom-secondary mt-1 truncate">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile-only: user controls at bottom */}
          <div className="md:hidden mt-auto border-t pt-4 pb-4 px-3 border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user?.displayName || 'User'} 
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center" style={{ display: user?.photoURL ? 'none' : 'flex' }}>
                  <span className="text-white text-sm font-medium">{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: isDark ? 'white' : 'black' }}>{user?.displayName || 'User'}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-medium transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {showQuickNote ? (
            /* Quick Note Editor */
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {generateTitleFromContent(quickNoteContent)}
                </h2>
              </div>
              <textarea
                value={quickNoteContent}
                onChange={(e) => setQuickNoteContent(e.target.value)}
                placeholder="Start writing your thoughts..."
                className="w-full h-[50vh] md:h-96 p-4 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary placeholder-custom-secondary resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={saveQuickNote}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-all duration-200"
                >
                  Create Note
                </button>
                <button
                  onClick={() => setShowQuickNote(false)}
                  className="px-4 py-2 rounded-xl bg-custom-button hover:bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary text-sm font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedNote ? (
            /* Note Editor */
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {generateTitleFromContent(selectedNote.content)}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="px-4 py-2 rounded-xl bg-custom-button hover:bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary text-sm font-medium transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedNote.id)}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <textarea
                value={selectedNote.content}
                onChange={(e) => saveNote(selectedNote.id, selectedNote.title, e.target.value)}
                placeholder="Start writing your note..."
                className="w-full h-[55vh] md:h-96 p-4 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary placeholder-custom-secondary resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          ) : (
            /* Dashboard */
            <div>
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-custom-primary mb-4">
                  Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
                </h2>
                <p className="text-base md:text-lg text-custom-secondary">
                  Ready to capture your thoughts and ideas?
                </p>
              </div>

              <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Create Note Button */}
                <button 
                  onClick={handleQuickNote}
                  className="p-4 md:p-6 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create a Humble Note
                </button>

                {/* Recent Notes */}
                <div className="p-6 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700">
                  <h3 className="font-semibold text-custom-primary mb-4">Recent Notes</h3>
                  {recentNotes.length === 0 ? (
                    <p className="text-custom-secondary text-sm">No notes yet</p>
                  ) : (
                    <div className="space-y-3">
                      {recentNotes.map(note => (
                        <div
                          key={note.id}
                          onClick={() => setSelectedNote(note)}
                          className="p-3 rounded-xl bg-note-card hover:bg-note-card cursor-pointer transition-all duration-200 border border-gray-200 dark:border-gray-600"
                        >
                          <h4 className="font-medium text-custom-primary text-sm truncate">
                            {note.title}
                          </h4>
                          <p className="text-xs text-custom-secondary mt-1">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="p-6 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700">
                  <h3 className="font-semibold text-custom-primary mb-4">Your Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-custom-secondary text-sm">Total Notes</span>
                      <span className="text-custom-primary font-medium">{totalNotes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-custom-secondary text-sm">This Week</span>
                      <span className="text-custom-primary font-medium">{thisWeekNotes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-modal-overlay flex items-center justify-center z-50">
          <div className="bg-modal rounded-2xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-custom-primary mb-4">Delete Note</h3>
            <p className="text-custom-secondary mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-xl bg-modal-button hover:bg-modal-button border border-zinc-200 dark:border-zinc-700 text-custom-primary text-sm font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
