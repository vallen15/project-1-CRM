import { supabase, apiTasks, apiNotifications } from '../lib/supabase';
import { notificationService } from './notificationService';

export const taskService = {
  normalizeStatus(statusStr) {
    if (!statusStr) return 'todo';
    const s = statusStr.toLowerCase();
    if (s === 'done' || s === 'completed') return 'completed';
    if (s === 'in progress' || s === 'in_progress') return 'in_progress';
    if (s === 'cancelled' || s === 'canceled') return 'cancelled';
    return 'todo';
  },

  async fetchAll() {
    return await apiTasks.fetchAll();
  },

  async create(taskData) {
    const normStatus = this.normalizeStatus(taskData.status);
    const created = await apiTasks.insert({
      title: taskData.title,
      description: taskData.description || '',
      company_id: taskData.company_id || null,
      assigned_to: taskData.assigned_to || null,
      department_id: taskData.department_id || null,
      team: taskData.team || "Marketing",
      priority: taskData.priority || 'Medium',
      status: normStatus,
      start_date: taskData.start_date || new Date().toISOString().split('T')[0],
      due_date: taskData.due_date || taskData.date || new Date().toISOString().split('T')[0]
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
    const normStatus = this.normalizeStatus(newStatus);
    const updated = await apiTasks.updateStatus(id, normStatus);

    // Auto-create notification when task is completed
    if (normStatus === 'completed') {
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
    try {
      await notificationService.deleteByReference('task', id);
    } catch (e) {
      console.warn("Notification auto-delete for task notice:", e.message);
    }
    return await apiTasks.delete(id);
  }
};
