import { apiEmails, apiNotifications } from '../lib/supabase';
import { notificationService } from './notificationService';

const isValidUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const emailService = {
  async fetchAll() {
    return await apiEmails.fetchAll();
  },

  async sendEmail(emailData) {
    const created = await apiEmails.insert({
      folder: 'sent',
      sender: emailData.sender || 'Sender',
      email: emailData.email || 'sender@company.com',
      recipient: emailData.recipient,
      subject: emailData.subject,
      snippet: emailData.body?.slice(0, 80) || '',
      body: emailData.body,
      is_read: true
    });

    // Auto-create notification for recipient's isolated inbox feed
    try {
      await apiNotifications.insert({
        type: 'email',
        title: 'New Email Received',
        message: `New message from ${emailData.sender || emailData.email}: "${emailData.subject}"`,
        target_email: emailData.recipient,
        reference_type: 'email',
        reference_id: created?.id && isValidUuid(created.id) ? created.id : null
      });
    } catch (e) {
      console.warn("Auto notification trigger error:", e.message);
    }

    return created;
  },

  async receiveEmail(emailData) {
    const created = await apiEmails.insert({
      folder: 'inbox',
      sender: emailData.sender,
      email: emailData.email,
      recipient: emailData.recipient || 'admin@gmail.com',
      subject: emailData.subject,
      snippet: emailData.body?.slice(0, 80) || '',
      body: emailData.body,
      is_read: false
    });

    // Auto-create notification for incoming email
    try {
      await apiNotifications.insert({
        type: 'email',
        title: 'New Email Received',
        message: `New email from ${emailData.sender}: "${emailData.subject}"`,
        target_email: emailData.recipient || 'admin@gmail.com',
        reference_type: 'email',
        reference_id: created?.id && isValidUuid(created.id) ? created.id : null
      });
    } catch (e) {
      console.warn("Auto notification email trigger warning:", e.message);
    }

    return created;
  },

  async delete(id) {
    if (!isValidUuid(id)) return null;
    try {
      await notificationService.deleteByReference('email', id);
    } catch (e) {
      console.warn("Notification auto-delete for email notice:", e.message);
    }
    return await apiEmails.delete(id);
  }
};
