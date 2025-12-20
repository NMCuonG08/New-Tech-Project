import apiClient from '../configs/apiClient';

// Notes API Service
export const notesService = {
  // Get all user notes
  async getNotes() {
    const response = await apiClient.get('/notes');
    return response.data;
  },

  // Get note by ID
  async getNoteById(id) {
    const response = await apiClient.get(`/notes/${id}`);
    return response.data;
  },

  // Get notes by location
  async getNotesByLocation(locationId) {
    const response = await apiClient.get(`/notes/location/${locationId}`);
    return response.data;
  },

  // Get notes by date range
  async getNotesByDateRange(startDate, endDate) {
    const response = await apiClient.get('/notes/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Create a new note
  async createNote(noteData) {
    const response = await apiClient.post('/notes', noteData);
    return response.data;
  },

  // Update a note
  async updateNote(id, updates) {
    const response = await apiClient.put(`/notes/${id}`, updates);
    return response.data;
  },

  // Delete a note
  async deleteNote(id) {
    await apiClient.delete(`/notes/${id}`);
  }
};

export default notesService;
