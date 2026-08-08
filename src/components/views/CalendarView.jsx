import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, X, Check, RotateCcw, User } from 'lucide-react';
import { calendarService } from '../../services/calendarService';

export default function CalendarView({ currentUser }) {
  // Real Date Engine (defaults to August 2026 target period)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 8)); // Month is 0-indexed (7 = August)
  const [selectedDay, setSelectedDay] = useState(8);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentEmail = currentUser?.email || 'admin@gmail.com';
  const isAdmin = (currentUser?.role || currentUser?.user_metadata?.role || '').toLowerCase() === 'admin';

  const realToday = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const monthYearLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const [events, setEvents] = useState([
    { id: '1', title: 'Design Landing Page Review', day: 1, month: 7, year: 2026, date: '2026-08-01', team: 'Design Teams', time: '10:00 AM - 11:30 AM', type: 'Meeting', user_email: 'john.d@company.com' },
    { id: '2', title: 'Marketing Campaign Launch', day: 4, month: 7, year: 2026, date: '2026-08-04', team: 'Marketing Teams', time: '02:00 PM - 03:00 PM', type: 'Event', user_email: 'sarah@acme.org' },
    { id: '3', title: 'Server Infrastructure Maintenance', day: 5, month: 7, year: 2026, date: '2026-08-05', team: 'Production Teams', time: '09:00 AM - 10:00 AM', type: 'Task', user_email: 'alex@techlabs.io' },
    { id: '4', title: 'Supabase Database Indexing & Audit', day: 7, month: 7, year: 2026, date: '2026-08-07', team: 'Production Teams', time: '04:00 PM - 05:00 PM', type: 'Task', user_email: 'admin@gmail.com' },
    { id: '5', title: 'Real-Time Sync & Team Standup', day: 8, month: 7, year: 2026, date: '2026-08-08', team: 'Management', time: '10:00 AM - 11:00 AM', type: 'Meeting', user_email: 'admin@gmail.com' },
    { id: '6', title: 'Q3 Product Roadmap Planning', day: 15, month: 8, year: 2026, date: '2026-09-15', team: 'Marketing Teams', time: '01:00 PM - 02:30 PM', type: 'Meeting', user_email: 'john.d@company.com' },
    { id: '7', title: 'Security Patch & Infrastructure Upgrade', day: 10, month: 6, year: 2026, date: '2026-07-10', team: 'Production Teams', time: '11:00 AM - 12:00 PM', type: 'Task', user_email: 'alex@techlabs.io' },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState(8);
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newTeam, setNewTeam] = useState('Marketing Teams');

  useEffect(() => {
    loadUnifiedEvents();
  }, []);

  const loadUnifiedEvents = async () => {
    setIsLoading(true);
    try {
      const unified = await calendarService.fetchUnifiedCalendarEvents();
      if (unified && unified.length > 0) {
        setEvents(unified);
      }
    } catch (err) {
      console.warn("Unified calendar service fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // STRICT PER-ACCOUNT CALENDAR EVENT ISOLATION ENGINE
  const userEvents = events.filter(e => {
    if (!e.user_email) return true; // Global team event
    if (isAdmin) return true; // Admin can view all calendar agendas
    return e.user_email.toLowerCase() === currentEmail.toLowerCase();
  });

  // DYNAMIC CALENDAR GRID ENGINE FOR ANY MONTH AND YEAR
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Month Switchers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(1);
  };

  const handleResetToToday = () => {
    setCurrentDate(new Date(2026, 7, 8));
    setSelectedDay(8);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dayNum = parseInt(newDay) || 1;
    const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const newEv = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      day: dayNum,
      month: month,
      year: year,
      date: dateStr,
      team: newTeam,
      time: newTime,
      type: 'Meeting',
      user_email: currentEmail,
      created_by: currentUser?.id || currentUser?.user_id || null
    };

    setEvents(prev => [...prev, newEv]);
    await calendarService.createEvent(newEv);
    setShowAddEventModal(false);
    setNewTitle('');
  };

  const getEventBadge = (team) => {
    if (team.includes('Marketing')) return 'bg-black text-white';
    if (team.includes('Design')) return 'bg-gray-700 text-white';
    return 'bg-gray-300 text-gray-900';
  };

  // Filter events for the currently selected day & month
  const selectedEvents = userEvents.filter(e => {
    if (e.date) {
      const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
      const formattedDay = selectedDay < 10 ? `0${selectedDay}` : `${selectedDay}`;
      return e.date === `${year}-${formattedMonth}-${formattedDay}`;
    }
    return e.day === selectedDay && (e.month === undefined || e.month === month);
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Personal & Team Calendar</h1>
            <span className="bg-black text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-400" />
              {currentEmail}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Per-account isolated schedule events and task due dates</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Switcher Controls */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-gray-600 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-gray-900 px-3 min-w-[130px] text-center">{monthYearLabel}</span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-gray-600 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleResetToToday}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:text-black rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
            title="Reset to August 2026 Target"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>

          <button
            onClick={() => setShowAddEventModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid + Selected Day Events Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Calendar Grid */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs">
          <div className="grid grid-cols-7 gap-2 mb-4 text-center">
            {weekDays.map(wd => (
              <span key={wd} className="text-xs font-bold text-gray-400 uppercase tracking-wider">{wd}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Previous Month Padding Days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
              const prevDayNum = prevMonthTotalDays - firstDayOfWeek + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="min-h-[72px] p-2 rounded-xl border border-gray-100 bg-gray-50/40 text-gray-300 pointer-events-none"
                >
                  <span className="text-xs font-bold">{prevDayNum}</span>
                </div>
              );
            })}

            {/* Current Month Active Days */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const d = i + 1;
              const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
              const formattedDay = d < 10 ? `0${d}` : `${d}`;
              const targetDateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const dayEvents = userEvents.filter(e => {
                if (e.date) return e.date === targetDateStr;
                return e.day === d && (e.month === undefined || e.month === month);
              });

              const isSelected = selectedDay === d;
              const isToday = realToday.getDate() === d && realToday.getMonth() === month && realToday.getFullYear() === year;

              return (
                <div
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`min-h-[72px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-black bg-gray-50 ring-1 ring-black shadow-xs'
                      : isToday
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                      : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-black font-extrabold' : isToday ? 'text-emerald-700' : 'text-gray-700'}`}>
                      {d}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-1.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${getEventBadge(ev.team)}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-gray-100 pb-4 mb-4">
              <span className="text-xs font-semibold text-gray-400 block mb-1">Agenda for {currentEmail}</span>
              <h3 className="text-xl font-bold text-gray-900">
                {monthName} {selectedDay}, {year}
              </h3>
            </div>

            <div className="space-y-3">
              {selectedEvents.length > 0 ? (
                selectedEvents.map(ev => (
                  <div key={ev.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block ${getEventBadge(ev.team)}`}>
                        {ev.team}
                      </span>
                      {ev.user_email && (
                        <span className="text-[9px] font-mono text-gray-400">
                          {ev.user_email}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-gray-900">{ev.title}</h4>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{ev.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs font-medium">
                  No events scheduled for {currentEmail} on {monthName} {selectedDay}, {year}.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => { setNewDay(selectedDay); setShowAddEventModal(true); }}
            className="w-full mt-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-xs font-bold transition-all text-center"
          >
            + Add event for {monthName.slice(0, 3)} {selectedDay}
          </button>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Schedule Event for {currentEmail}</h3>
              <button onClick={() => setShowAddEventModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Review Meeting"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Day of {monthName}</label>
                  <input
                    type="number"
                    min="1"
                    max={totalDaysInMonth}
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Team</label>
                <select
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                >
                  <option value="Marketing Teams">Marketing Teams</option>
                  <option value="Design Teams">Design Teams</option>
                  <option value="Production Teams">Production Teams</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
