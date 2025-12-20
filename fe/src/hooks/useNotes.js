import { useNotesStore } from '../store/notesStore';
import { useEffect, useRef } from 'react';

export const useNotes = () => {
  const store = useNotesStore();
  const autoSaveTimeout = useRef(null);

  // Fetch notes on mount
  useEffect(() => {
    store.fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft
  const autoSaveDraft = (content, locationId, noteDate) => {
    // Clear existing timeout
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    // Set new timeout
    autoSaveTimeout.current = setTimeout(() => {
      store.saveDraft({ content, locationId, noteDate });
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  // Save or update note
  const saveNote = async (locationId, date, title, content) => {
    if (!content || !content.trim()) {
      store.setError('Note content cannot be empty');
      return false;
    }

    if (!title || !title.trim()) {
      store.setError('Note title cannot be empty');
      return false;
    }

    const existingNote = store.notes.find(n => 
      n.locationId === locationId && 
      new Date(n.date).toDateString() === new Date(date).toDateString()
    );

    if (existingNote) {
      // Update existing note
      await store.updateNote(existingNote.id, { title, content, date });
    } else {
      // Add new note
      await store.addNote({
        locationId,
        date,
        title,
        content
      });
    }

    store.clearError();
    return true;
  };

  // Get notes grouped by date
  const getNotesGroupedByDate = () => {
    const grouped = {};
    
    store.notes.forEach(note => {
      const date = new Date(note.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(note);
    });

    return grouped;
  };

  // Get notes grouped by location
  const getNotesGroupedByLocation = () => {
    const grouped = {};
    
    store.notes.forEach(note => {
      const locationId = note.locationId;
      if (!grouped[locationId]) {
        grouped[locationId] = [];
      }
      grouped[locationId].push(note);
    });

    return grouped;
  };

  // Get notes for date range
  const getNotesInRange = async (startDate, endDate) => {
    return await store.fetchNotesByDateRange(startDate, endDate);
  };

  // Get notes by location
  const getNotesByLocation = async (locationId) => {
    return await store.fetchNotesByLocation(locationId);
  };

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, []);

  return {
    ...store,
    autoSaveDraft,
    saveNote,
    getNotesGroupedByDate,
    getNotesGroupedByLocation,
    getNotesInRange,
    getNotesByLocation
  };
};
