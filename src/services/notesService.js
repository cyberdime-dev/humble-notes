import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Collection name for notes
const NOTES_COLLECTION = 'notes';

/**
 * Create a new note
 * @param {string} userId - The authenticated user's ID
 * @param {Object} noteData - The note data (title, content)
 * @returns {Promise<Object>} The created note with ID
 */
export const createNote = async (userId, noteData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to create a note');
    }

    const noteToCreate = {
      ...noteData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, NOTES_COLLECTION), noteToCreate);
    
    return {
      id: docRef.id,
      ...noteToCreate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error creating note:', error);
    throw error;
  }
};

/**
 * Get all notes for a specific user
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Array>} Array of notes
 */
export const getUserNotes = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch notes');
    }

    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const notes = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });

    return notes;
  } catch (error) {
    console.error('❌ Error fetching notes:', error);
    throw error;
  }
};

/**
 * Get a specific note by ID
 * @param {string} noteId - The note ID
 * @param {string} userId - The authenticated user's ID (for security)
 * @returns {Promise<Object>} The note data
 */
export const getNote = async (noteId, userId) => {
  try {
    if (!noteId || !userId) {
      throw new Error('Note ID and User ID are required');
    }

    const docRef = doc(db, NOTES_COLLECTION, noteId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Note not found');
    }

    const data = docSnap.data();
    
    // Security check: ensure user can only access their own notes
    if (data.userId !== userId) {
      throw new Error('Access denied: You can only access your own notes');
    }

    const note = {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    };

    return note;
  } catch (error) {
    console.error('❌ Error fetching note:', error);
    throw error;
  }
};

/**
 * Update a note
 * @param {string} noteId - The note ID
 * @param {string} userId - The authenticated user's ID (for security)
 * @param {Object} updateData - The data to update (title, content)
 * @returns {Promise<Object>} The updated note
 */
export const updateNote = async (noteId, userId, updateData) => {
  try {
    if (!noteId || !userId) {
      throw new Error('Note ID and User ID are required');
    }

    // First, verify the note exists and belongs to the user
    await getNote(noteId, userId);

    const updatePayload = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    const docRef = doc(db, NOTES_COLLECTION, noteId);
    await updateDoc(docRef, updatePayload);

    const updatedNote = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return updatedNote;
  } catch (error) {
    console.error('❌ Error updating note:', error);
    throw error;
  }
};

/**
 * Delete a note
 * @param {string} noteId - The note ID
 * @param {string} userId - The authenticated user's ID (for security)
 * @returns {Promise<void>}
 */
export const deleteNote = async (noteId, userId) => {
  try {
    if (!noteId || !userId) {
      throw new Error('Note ID and User ID are required');
    }

    // First, verify the note exists and belongs to the user
    await getNote(noteId, userId);

    const docRef = doc(db, NOTES_COLLECTION, noteId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('❌ Error deleting note:', error);
    throw error;
  }
};
