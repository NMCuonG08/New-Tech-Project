import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotesStore = create(
  persist(
    (set, get) => ({
      notes: [],
      isLoading: false,
      error: null,
      draft: null, // Auto-save draft

      // Add note
      addNote: (note) => set((state) => ({
        notes: [
          ...state.notes,
          {
            ...note,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        draft: null
      })),

      // Update note
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(n =>
          n.id === id
            ? { ...n, ...updates, updatedAt: new Date().toISOString() }
            : n
        ),
        draft: null
      })),

      // Delete note
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      })),

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
