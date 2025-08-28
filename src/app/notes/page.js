'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [quickNoteContent, setQuickNoteContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Theme management
  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    console.log('Theme detection:', { savedTheme, systemPrefersDark });
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      console.log('Setting dark mode');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      console.log('Setting light mode');
    }
  }, []);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_${user?.uid}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, [user?.uid]);

  // Save notes to localStorage
  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem(`notes_${user.uid}`, JSON.stringify(notes));
    }
  }, [notes, user?.uid]);

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
  };

  const saveNote = (noteId, title, content) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, title, content, updatedAt: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    
    // Also update selectedNote if it matches the edited note
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote({ ...selectedNote, title, content, updatedAt: new Date().toISOString() });
    }
  };

  const handleDeleteClick = (noteId) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      setNotes(notes.filter(note => note.id !== noteToDelete));
      localStorage.setItem('humble-notes', JSON.stringify(notes.filter(note => note.id !== noteToDelete)));
      if (selectedNote?.id === noteToDelete) {
        setSelectedNote(null);
      }
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

  const saveQuickNote = () => {
    if (quickNoteContent.trim()) {
      const newNote = {
        id: Date.now().toString(),
        title: quickNoteContent.split('\n')[0].slice(0, 50) || 'Quick Note',
        content: quickNoteContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
      setQuickNoteContent('');
      setShowQuickNote(false);
    }
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
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
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
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-custom-button border-r border-zinc-200 dark:border-zinc-700 flex flex-col">
          {/* New Note Button */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
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
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-custom-secondary mb-3">Your Notes</h3>
            {notes.length === 0 ? (
              <p className="text-sm text-custom-muted text-center py-8">
                No notes yet. Create your first note!
              </p>
            ) : (
              <div className="space-y-2">
                {notes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
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
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {showQuickNote ? (
            /* Quick Note Editor */
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-custom-primary">Quick Note</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQuickNote(false)}
                    className="px-4 py-2 rounded-xl bg-custom-button hover:bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary text-sm font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveQuickNote}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-all duration-200"
                  >
                    Save Note
                  </button>
                </div>
              </div>
              <textarea
                value={quickNoteContent}
                onChange={(e) => setQuickNoteContent(e.target.value)}
                placeholder="Start writing your thoughts..."
                className="w-full h-96 p-4 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary placeholder-custom-secondary resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          ) : selectedNote ? (
            /* Note Editor */
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <input
                  value={selectedNote.title}
                  onChange={(e) => saveNote(selectedNote.id, e.target.value, selectedNote.content)}
                  className="text-2xl font-bold text-custom-primary bg-transparent border-none outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-700 focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 rounded-lg px-3 py-2 transition-all duration-200 w-full"
                  placeholder="Note title" title="Click to edit title"
                />
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
                className="w-full h-96 p-4 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 text-custom-primary placeholder-custom-secondary resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          ) : (
            /* Dashboard */
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-custom-primary mb-4">
                  Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
                </h2>
                <p className="text-lg text-custom-secondary">
                  Ready to capture your thoughts and ideas?
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Note Card */}
                <div 
                  onClick={handleQuickNote}
                  className="p-6 rounded-2xl bg-custom-button border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
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
