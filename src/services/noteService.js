import { apiNotes, apiNotifications } from '../lib/supabase';
import { notificationService } from './notificationService';

export const noteService = {
  async fetchAll() {
    return await apiNotes.fetchAll();
  },

  async create(noteData) {
    const cleanNote = {
      title: noteData.title,
      content: noteData.content || ''
    };

    const createdNote = await apiNotes.insert(cleanNote);

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
    try {
      await notificationService.deleteByReference('note', id);
    } catch (e) {
      console.warn("Notification auto-delete for note notice:", e.message);
    }
    return await apiNotes.delete(id);
  }
};
