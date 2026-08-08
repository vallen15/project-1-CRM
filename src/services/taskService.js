import { supabase, apiTasks, apiNotifications } from '../lib/supabase';

export const taskService = {
  async fetchAll() {
    return await apiTasks.fetchAll();
  },

  async create(taskData) {
    const created = await apiTasks.insert({
      title: taskData.title,
      description: taskData.description || '',
      company_id: taskData.company_id || null,
      assigned_to: taskData.assigned_to || null,
      department_id: taskData.department_id || null,
      team: taskData.team || "Marketing Team's",
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'Todo',
      start_date: taskData.start_date || '2026-08-01',
      due_date: taskData.due_date || taskData.date || '2026-08-31'
    });

    // Auto-create notification for assigned task
    try {
      await apiNotifications.insert({
        type: 'task',
        title: 'New Task Assigned',
        message: `Task "${taskData.title}" was added to ${taskData.team || 'your workspace'}.`,
        reference_type: 'task',
        reference_id: created?.id || null
      });
    } catch (e) {
      console.warn("Auto notification trigger warning:", e.message);
    }

    return created;
  },

  async updateStatus(id, newStatus, taskTitle = 'Task') {
    const updated = await apiTasks.updateStatus(id, newStatus);

    // Auto-create notification when task is completed
    if (newStatus === 'Done' || newStatus === 'Completed' || newStatus === 'completed') {
      try {
        await apiNotifications.insert({
          type: 'task',
          title: 'Task Completed',
          message: `Task "${taskTitle}" has been marked as Completed!`,
          reference_type: 'task',
          reference_id: id
        });
      } catch (e) {
        console.warn("Auto notification completion trigger warning:", e.message);
      }
    }

    return updated;
  },

  async delete(id) {
    return await apiTasks.delete(id);
  }
};
