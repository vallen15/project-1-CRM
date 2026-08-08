import React, { useState, useEffect } from 'react';
import { Bell, CheckSquare, FileText, Mail, ShieldAlert, CheckCircle2, Trash2, Building2, AlertCircle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export default function NotificationsView({ currentUser }) {
  const [filter, setFilter] = useState('all');
  const [warningMsg, setWarningMsg] = useState('');

  const currentEmail = currentUser?.email || 'admin@gmail.com';
  
  const initialNotifications = [
    {
      id: '1',
      title: 'New Task Assigned',
      message: 'John Doe assigned you to "Design New Landing Page V2"',
      type: 'task',
      read: false,
      time: '10 mins ago',
      target_email: 'john.d@company.com'
    },
    {
      id: '2',
      title: 'Supabase Database Sync',
      message: 'Database schema 6.0 active and synced with cloud project',
      type: 'system',
      read: false,
      time: '1 hour ago',
    },
    {
      id: '3',
      title: 'Design Sprint Note Added',
      message: 'Sarah Connor added a new note to Q3 Marketing Campaign',
      type: 'note',
      read: true,
      time: '3 hours ago',
      target_email: 'admin@gmail.com'
    },
  ];

  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.fetchAll();
      if (data && data.length > 0) {
        setNotifications(data.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type || 'system',
          read: n.is_read || n.read || false,
          time: n.created_at?.split('T')[0] || 'Just now',
          target_email: n.target_email || null
        })));
      }
    } catch (err) {
      console.warn("Notifications service fetch fallback:", err.message);
    }
  };

  const toggleRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    );
    setWarningMsg('');
    await notificationService.markAsRead(id);
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => {
      if (!n.target_email || n.target_email.toLowerCase() === currentEmail.toLowerCase()) {
        return { ...n, read: true };
      }
      return n;
    }));
    setWarningMsg('');
    await notificationService.markAllAsRead();
  };

  // CONDITIONAL DELETE ACTION ENGINE (Requires read === true before deletion)
  const handleDeleteNotification = async (item) => {
    if (!item.read) {
      setWarningMsg(`Notifikasi "${item.title}" belum dibaca! Syarat hapus: Tandai "Sudah Dibaca" terlebih dahulu.`);
      setTimeout(() => setWarningMsg(''), 4000);
      return;
    }

    setWarningMsg('');
    setNotifications(prev => prev.filter(n => n.id !== item.id));
    await notificationService.delete(item.id);
  };

  // STRICT PER-ACCOUNT NOTIFICATION ISOLATION ENGINE
  const userFiltered = notifications.filter(n => {
    if (n.target_email) {
      return n.target_email.toLowerCase() === currentEmail.toLowerCase();
    }
    // Global system notifications apply to all accounts
    return true;
  });

  const filtered = userFiltered.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  const unreadCount = userFiltered.filter(n => !n.read).length;

  const getIcon = (type) => {
    if (type === 'task') return CheckSquare;
    if (type === 'note') return FileText;
    if (type === 'email') return Mail;
    if (type === 'company') return Building2;
    return ShieldAlert;
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl font-sans">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-black text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Supabase PostgreSQL Notification Inbox for <span className="font-bold text-black font-mono">{currentEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-all"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Conditional Delete Warning Toast / Alert */}
      {warningMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{warningMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'unread', 'task', 'email', 'system', 'note'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const IconComponent = getIcon(item.type);
            return (
              <div
                key={item.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  item.read ? 'bg-white' : 'bg-gray-50/70 font-semibold'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    item.read ? 'bg-gray-100 text-gray-600' : 'bg-black text-white'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] font-mono text-gray-400 mt-2 block">{item.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Mark as Read Toggle */}
                  <button
                    onClick={() => toggleRead(item.id)}
                    className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
                    title={item.read ? "Mark as unread" : "Mark as read"}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${item.read ? 'text-emerald-600' : 'text-gray-300'}`} />
                  </button>

                  {/* CONDITIONAL DELETE BUTTON (REQUIRES READ === TRUE FIRST) */}
                  <button
                    onClick={() => handleDeleteNotification(item)}
                    className={`p-1.5 rounded-lg transition-all ${
                      item.read
                        ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                        : 'text-gray-200 cursor-not-allowed opacity-40'
                    }`}
                    title={
                      item.read
                        ? "Hapus Notifikasi (Sudah Dibaca)"
                        : "Syarat Hapus: Tandai 'Sudah Dibaca' terlebih dahulu!"
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-gray-400 text-xs font-medium">
            No notifications found for {currentEmail}.
          </div>
        )}
      </div>
    </div>
  );
}
