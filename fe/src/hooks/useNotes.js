import { useNotesStore } from '../store/notesStore';
import { useEffect, useRef } from 'react';

export const useNotes = () => {
  const store = useNotesStore();
  const autoSaveTimeout = useRef(null);

  // Auto-save draft
  const autoSaveDraft = (content, cityName, noteDate) => {
    // Clear existing timeout
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    // Set new timeout
    autoSaveTimeout.current = setTimeout(() => {
      store.saveDraft({ content, cityName, noteDate });
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  // Save or update note
  const saveNote = (cityName, noteDate, content) => {
    if (!content || !content.trim()) {
      store.setError('Note content cannot be empty');
      return false;
    }

    const existingNote = store.getNote(cityName, noteDate);

    if (existingNote) {
      // Update existing note
      store.updateNote(existingNote.id, { content });
    } else {
      // Add new note
      store.addNote({
        cityName,
        noteDate,
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
      const date = new Date(note.noteDate).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(note);
    });

    return grouped;
  };

  // Get notes grouped by city
  const getNotesGroupedByCity = () => {
    const grouped = {};
    
    store.notes.forEach(note => {
      const city = note.cityName;
      if (!grouped[city]) {
        grouped[city] = [];
      }
      grouped[city].push(note);
    });

    return grouped;
  };

  // Get notes for date range
  const getNotesInRange = (startDate, endDate) => {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    return store.notes.filter(note => {
      const noteTime = new Date(note.noteDate).getTime();
      return noteTime >= start && noteTime <= end;
    });
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
    getNotesGroupedByCity,
    getNotesInRange
  };
};
