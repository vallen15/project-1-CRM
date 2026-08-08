import { apiCalendarEvents, apiTasks, apiNotifications } from '../lib/supabase';

export const calendarService = {
  async fetchUnifiedCalendarEvents() {
    const manualEvents = await apiCalendarEvents.fetchAll();
    const tasks = await apiTasks.fetchAll();

    const formattedManual = (manualEvents || []).map(e => ({
      id: `cal-${e.id}`,
      title: e.title,
      day: e.day_of_month || (e.event_date ? parseInt(e.event_date.split('-')[2]) : 8),
      team: e.team || 'Marketing Teams',
      time: e.time_range || '10:00 AM',
      type: e.event_type || 'Meeting',
      isTask: false
    }));

    const formattedTasks = (tasks || [])
      .filter(t => t.due_date || t.date)
      .map(t => {
        const dateStr = t.due_date || t.date;
        const dayNum = parseInt(dateStr.split('-')[2]) || 8;
        return {
          id: `task-${t.id}`,
          title: `[Task] ${t.title}`,
          day: dayNum,
          team: t.team || 'Marketing Teams',
          time: 'Due EOD',
          type: 'Task',
          isTask: true,
          status: t.status
        };
      });

    return [...formattedManual, ...formattedTasks];
  },

  async createEvent(eventData) {
    const created = await apiCalendarEvents.insert({
      title: eventData.title,
      day_of_month: parseInt(eventData.day || 8),
      event_date: eventData.date || '2026-08-08',
      team: eventData.team || 'Marketing Teams',
      time_range: eventData.time || '10:00 AM - 11:00 AM',
      event_type: eventData.type || 'Meeting'
    });

    // Auto-create notification for calendar event
    try {
      await apiNotifications.insert({
        type: 'calendar',
        title: 'Calendar Meeting Scheduled',
        message: `Meeting "${eventData.title}" scheduled for day ${eventData.day || 8}.`,
        reference_type: 'calendar',
        reference_id: created?.id || null
      });
    } catch (e) {
      console.warn("Auto notification calendar trigger warning:", e.message);
    }

    return created;
  }
};
