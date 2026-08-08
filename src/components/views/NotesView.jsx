import React, { useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';

export default function NotesView({ notes, onAddNote, onDeleteNote }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddNote({
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split('T')[0]
    });
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notes & Documentation</h1>
        <p className="text-xs text-gray-500 font-medium">Create notes and document team updates</p>
      </div>

      {/* Note Creator Form */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-black" />
          <span>New Note Entry</span>
        </h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Note Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black font-semibold"
          />
          <textarea
            rows="3"
            placeholder="Write your notes here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black font-normal"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((n) => (
          <div key={n.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs relative group">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-base font-bold text-gray-900">{n.title}</h4>
              <button
                onClick={() => onDeleteNote(n.id)}
                className="text-gray-300 hover:text-rose-600 transition-colors p-1"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">{n.content}</p>
            <span className="text-[10px] font-mono text-gray-400 block">{n.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
