import { apiNotes, apiNotifications } from '../lib/supabase';

export const noteService = {
  async fetchAll() {
    return await apiNotes.fetchAll();
  },

  async create(noteData) {
    const createdNote = await apiNotes.insert(noteData);

    // Auto-create notification for new note creation
    try {
      await apiNotifications.insert({
        type: 'note',
        title: 'New Note Created',
        message: `Note "${noteData.title}" was added to workspace.`,
        reference_type: 'note',
        reference_id: createdNote?.id || null
      });
    } catch (e) {
      console.warn("Auto notification note trigger warning:", e.message);
    }

    return createdNote;
  },

  async delete(id) {
    return await apiNotes.delete(id);
  }
};
