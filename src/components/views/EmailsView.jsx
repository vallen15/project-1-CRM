import React, { useState, useEffect } from 'react';
import { Mail, Send, Star, Trash2, Search, Plus, X, Paperclip, Reply, ArrowLeft, UserCheck } from 'lucide-react';
import { emailService } from '../../services/emailService';
import { notificationService } from '../../services/notificationService';

export default function EmailsView({ activeTab, setActiveTab, currentUser }) {
  const initialFolder = activeTab === 'sent' ? 'sent' : 'inbox';
  const [folder, setFolder] = useState(initialFolder);

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);

  const currentEmail = currentUser?.email || 'admin@gmail.com';
  const currentName = currentUser?.full_name || 'System Admin';

  useEffect(() => {
    if (activeTab === 'sent') {
      setFolder('sent');
      setSelectedEmail(null);
    } else if (activeTab === 'inbox' || activeTab === 'emails') {
      setFolder('inbox');
      setSelectedEmail(null);
    }
  }, [activeTab]);

  const initialEmails = [
    {
      id: '1',
      folder: 'inbox',
      sender: 'Sarah Connor',
      email: 'sarah@acme.org',
      recipient: 'john.d@company.com',
      subject: 'Q3 Product Design Proposal & Timeline',
      snippet: 'Hi John, I reviewed the latest design mockups for Product Design...',
      body: `Hi John,\n\nI reviewed the latest design mockups for Product Design. We would like to schedule a call on Monday to discuss the rollout schedule and Supabase database indexing setup.\n\nBest regards,\nSarah Connor\nProduct Manager | Acme Corp`,
      date: '2026-08-07',
      starred: true,
      read: false,
    },
    {
      id: '2',
      folder: 'inbox',
      sender: 'System Admin',
      email: 'admin@gmail.com',
      recipient: 'john.d@company.com',
      subject: 'Welcome to System Workspace',
      snippet: 'Welcome John! Your account has been assigned to Design Team\'s...',
      body: `Hi John d.,\n\nWelcome to the CRM Workspace. Your account has been assigned to Design Team's by System Administrator.\n\nBest regards,\nSystem Admin`,
      date: '2026-08-08',
      starred: false,
      read: false,
    },
    {
      id: '3',
      folder: 'sent',
      sender: 'System Admin',
      email: 'admin@gmail.com',
      recipient: 'john.d@company.com',
      subject: 'Welcome to System Workspace',
      snippet: 'Welcome John! Your account has been assigned to Design Team\'s...',
      body: `Hi John d.,\n\nWelcome to the CRM Workspace. Your account has been assigned to Design Team's by System Administrator.\n\nBest regards,\nSystem Admin`,
      date: '2026-08-08',
      starred: false,
      read: true,
    },
    {
      id: '4',
      folder: 'sent',
      sender: 'John Doe',
      email: 'john.d@company.com',
      recipient: 'sarah@acme.org',
      subject: 'Re: Q3 Product Design Proposal',
      snippet: 'Hi Sarah, Thanks for reaching out! Monday 2 PM works great for our team.',
      body: `Hi Sarah,\n\nThanks for reaching out! Monday 2 PM works great for our team. I will send out the Calendar invite shortly.\n\nBest,\nJohn d.`,
      date: '2026-08-07',
      starred: false,
      read: true,
    },
  ];

  const [emails, setEmails] = useState(initialEmails);

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      const data = await emailService.fetchAll();
      if (data && data.length > 0) {
        setEmails(data.map(m => ({
          id: m.id,
          folder: m.folder || 'inbox',
          sender: m.sender || 'Sender',
          email: m.email || 'user@company.com',
          recipient: m.recipient || 'Recipient',
          subject: m.subject || 'Subject',
          snippet: m.snippet || m.body?.slice(0, 80) || '',
          body: m.body || '',
          date: m.created_at?.split('T')[0] || '2026-08-08',
          starred: m.starred || false,
          read: m.is_read || m.read || false
        })));
      }
    } catch (err) {
      console.warn("Email service fetch fallback:", err.message);
    }
  };

  const toggleStar = (id, e) => {
    e.stopPropagation();
    setEmails(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
  };

  const deleteEmail = (id, e) => {
    e.stopPropagation();
    setEmails(prev => prev.filter(m => m.id !== id));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!to.trim() || !subject.trim()) return;

    const recipientEmail = to.trim();
    const currentDateStr = new Date().toISOString().split('T')[0];

    // 1. Sent Folder Entry (For Sender)
    const sentMsg = {
      id: Date.now().toString(),
      folder: 'sent',
      sender: currentName,
      email: currentEmail,
      recipient: recipientEmail,
      subject: subject.trim(),
      snippet: message.substring(0, 80) + '...',
      body: message,
      date: currentDateStr,
      starred: false,
      read: true,
    };

    // 2. Inbox Folder Entry (For Recipient User)
    const inboxMsg = {
      id: (Date.now() + 1).toString(),
      folder: 'inbox',
      sender: currentName,
      email: currentEmail,
      recipient: recipientEmail,
      subject: subject.trim(),
      snippet: message.substring(0, 80) + '...',
      body: message,
      date: currentDateStr,
      starred: false,
      read: false,
    };

    // 3. Immediately update local email state
    setEmails(prev => [sentMsg, inboxMsg, ...prev]);

    // 4. Trigger Automatic In-App Notification for Recipient
    const newNotification = {
      id: Date.now().toString(),
      title: 'New Email Received',
      message: `${currentName} (${currentEmail}) sent you an email: "${subject.trim()}"`,
      type: 'email',
      read: false,
      time: 'Just now',
      target_email: recipientEmail
    };

    notificationService.create(newNotification).catch(err => {
      console.warn("Background notification create error:", err);
    });

    // 5. Close compose modal & open sent message in reader pane
    setShowComposeModal(false);
    setTo('');
    setSubject('');
    setMessage('');

    setFolder('sent');
    setSelectedEmail(sentMsg);
    if (setActiveTab) setActiveTab('sent');

    // 6. Send to Supabase PostgreSQL database
    emailService.sendEmail(sentMsg).catch(err => {
      console.warn("Background email send service error:", err);
    });
  };

  const handleSwitchFolder = (targetFolder) => {
    setFolder(targetFolder);
    setSelectedEmail(null);
    if (setActiveTab) setActiveTab(targetFolder);
  };

  // PER-USER EMAIL FILTERING ENGINE (Filters emails based on logged-in user email)
  const filtered = emails
    .filter(m => {
      if (folder === 'inbox') {
        return m.folder === 'inbox' && (m.recipient === currentEmail || m.recipient === 'admin@gmail.com' || currentEmail === 'admin@gmail.com' || !m.recipient);
      } else {
        return m.folder === 'sent' && (m.email === currentEmail || m.sender?.includes(currentName) || currentEmail === 'admin@gmail.com');
      }
    })
    .filter(m =>
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title & Compose */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Emails Client</h1>
          <p className="text-xs text-gray-500 font-medium font-sans">
            Logged in as: <span className="font-bold text-black">{currentName}</span> ({currentEmail})
          </p>
        </div>

        <button
          onClick={() => setShowComposeModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Compose Email</span>
        </button>
      </div>

      {/* Subnav & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSwitchFolder('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              folder === 'inbox' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Inbox ({emails.filter(m => m.folder === 'inbox' && (m.recipient === currentEmail || currentEmail === 'admin@gmail.com')).length})</span>
          </button>

          <button
            onClick={() => handleSwitchFolder('sent')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              folder === 'sent' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sent ({emails.filter(m => m.folder === 'sent' && (m.email === currentEmail || currentEmail === 'admin@gmail.com')).length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search ${folder}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-black shadow-2xs"
          />
        </div>
      </div>

      {/* Email Workspace (List + Reader Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden min-h-[500px]">
        {/* Email List Column */}
        <div className={`lg:col-span-5 border-r border-gray-100 divide-y divide-gray-100 ${selectedEmail ? 'hidden lg:block' : 'block'}`}>
          <div className="p-3 bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
            {folder === 'inbox' ? 'Inbox Messages' : 'Sent Messages'}
          </div>
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedEmail(item);
                  setEmails(prev => prev.map(m => m.id === item.id ? { ...m, read: true } : m));
                }}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedEmail?.id === item.id ? 'bg-gray-100/80 font-semibold' : item.read ? 'bg-white' : 'bg-gray-50/60 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-5 h-5 rounded-full bg-black text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
                      {item.sender.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-900 truncate">{item.sender}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => toggleStar(item.id, e)} className="text-gray-300 hover:text-amber-500">
                      <Star className={`w-3.5 h-3.5 ${item.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button onClick={(e) => deleteEmail(item.id, e)} className="text-gray-300 hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-gray-900 truncate mb-1">{item.subject}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{item.snippet}</p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400 font-mono">
                  <span>From: {item.email}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">No emails found in {folder}.</div>
          )}
        </div>

        {/* Reader Pane Column */}
        <div className={`lg:col-span-7 p-6 ${selectedEmail ? 'block' : 'hidden lg:flex items-center justify-center'}`}>
          {selectedEmail ? (
            <div className="space-y-6 w-full">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="lg:hidden text-xs text-gray-500 hover:text-black mb-2 flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to list
                  </button>
                  <h3 className="text-lg font-bold text-gray-900">{selectedEmail.subject}</h3>
                  
                  {/* EXPLICIT SENDER IDENTITY BADGE & METADATA */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center border border-gray-300">
                      {selectedEmail.sender.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{selectedEmail.sender}</span>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-mono px-2 py-0.5 rounded-full border border-gray-200">
                          {selectedEmail.email}
                        </span>
                      </div>
                      {selectedEmail.recipient && (
                        <p className="text-[11px] text-gray-500 font-medium">To: <span className="font-semibold text-gray-800">{selectedEmail.recipient}</span></p>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-mono">{selectedEmail.date}</span>
              </div>

              <div className="prose prose-sm max-w-none text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                {selectedEmail.body}
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => {
                    setTo(selectedEmail.email);
                    setSubject(`Re: ${selectedEmail.subject}`);
                    setShowComposeModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply to Sender ({selectedEmail.sender})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 text-xs">
              <Mail className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              Select an email from the list to view sender details and message body
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">New Message</h3>
                <p className="text-[11px] text-gray-500">From: <span className="font-bold text-gray-800">{currentName}</span> ({currentEmail})</p>
              </div>
              <button onClick={() => setShowComposeModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSend} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">To (Recipient Email)</label>
                <input
                  type="email"
                  required
                  placeholder="john.d@company.com or sarah@acme.org"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Subject line..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message Body</label>
                <textarea
                  rows="5"
                  required
                  placeholder="Write your email here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-normal"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button type="button" className="text-gray-400 hover:text-black">
                  <Paperclip className="w-4 h-4" />
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComposeModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email & Trigger Notification</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
