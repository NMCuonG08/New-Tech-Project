import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import notesService from '../services/notesService';

export const useNotesStore = create(
  persist(
    (set, get) => ({
      notes: [],
      isLoading: false,
      error: null,
      draft: null, // Auto-save draft

      // ========== Fetch from Backend ==========

      // Fetch all notes
      fetchNotes: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await notesService.getNotes();
          set({ notes: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch notes',
            isLoading: false 
          });
        }
      },

      // Fetch notes by location
      fetchNotesByLocation: async (locationId) => {
        set({ isLoading: true, error: null });
        try {
          const data = await notesService.getNotesByLocation(locationId);
          return data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch location notes',
            isLoading: false 
          });
          return [];
        }
      },

      // Fetch notes by date range
      fetchNotesByDateRange: async (startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
          const data = await notesService.getNotesByDateRange(startDate, endDate);
          return data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch notes by date range',
            isLoading: false 
          });
          return [];
        }
      },

      // Add note
      addNote: async (note) => {
        set({ isLoading: true, error: null });
        try {
          const newNote = await notesService.createNote(note);
          set((state) => ({
            notes: [...state.notes, newNote],
            isLoading: false,
            draft: null
          }));
          return newNote;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to create note',
            isLoading: false 
          });
          return null;
        }
      },

      // Update note
      updateNote: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedNote = await notesService.updateNote(id, updates);
          set((state) => ({
            notes: state.notes.map(n => n.id === id ? updatedNote : n),
            isLoading: false,
            draft: null
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to update note',
            isLoading: false 
          });
        }
      },

      // Delete note
      deleteNote: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await notesService.deleteNote(id);
          set((state) => ({
            notes: state.notes.filter(n => n.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to delete note',
            isLoading: false 
          });
        }
      },

      // Get notes by city
      getNotesByCity: (cityName) => {
        const { notes } = get();
        return notes.filter(n => 
          n.cityName.toLowerCase() === cityName.toLowerCase()
        );
      },

      // Get notes by date
      getNotesByDate: (date) => {
        const { notes } = get();
        const targetDate = new Date(date).toDateString();
        return notes.filter(n => 
          new Date(n.noteDate).toDateString() === targetDate
        );
      },

      // Get note for specific city and date
      getNote: (cityName, date) => {
        const { notes } = get();
        const targetDate = new Date(date).toDateString();
        return notes.find(n =>
          n.cityName.toLowerCase() === cityName.toLowerCase() &&
          new Date(n.noteDate).toDateString() === targetDate
        );
      },

      // Check if note exists
      hasNote: (cityName, date) => {
        return !!get().getNote(cityName, date);
      },

      // Save draft (auto-save)
      saveDraft: (draft) => set({ draft }),

      // Clear draft
      clearDraft: () => set({ draft: null }),

      // Search notes
      searchNotes: (query) => {
        const { notes } = get();
        const lowerQuery = query.toLowerCase();
        return notes.filter(n =>
          n.content.toLowerCase().includes(lowerQuery) ||
          n.cityName.toLowerCase().includes(lowerQuery)
        );
      },

      // Clear all notes
      clearNotes: () => set({ notes: [], draft: null }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'notes-storage',
      partialize: (state) => ({ notes: state.notes, draft: state.draft })
    }
  )
);
