import { apiEmails, apiNotifications } from '../lib/supabase';

export const emailService = {
  async fetchAll() {
    return await apiEmails.fetchAll();
  },

  async sendEmail(emailData) {
    const created = await apiEmails.insert({
      folder: 'sent',
      sender: emailData.sender || 'Me (John d.)',
      email: emailData.email || 'john.d@company.com',
      recipient: emailData.recipient,
      subject: emailData.subject,
      snippet: emailData.body?.slice(0, 80) || '',
      body: emailData.body,
      is_read: true
    });

    return created;
  },

  async receiveEmail(emailData) {
    const created = await apiEmails.insert({
      folder: 'inbox',
      sender: emailData.sender,
      email: emailData.email,
      recipient: 'john.d@company.com',
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
        reference_type: 'email',
        reference_id: created?.id || null
      });
    } catch (e) {
      console.warn("Auto notification email trigger warning:", e.message);
    }

    return created;
  }
};
