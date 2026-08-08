import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function TasksView({ tasks, onAddTask, onUpdateStatus, onEditTask, onDeleteTask, teams }) {
  const [filterTeam, setFilterTeam] = useState('All');
  
  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTeam, setNewTeam] = useState("Marketing Team's");
  const [newStatus, setNewStatus] = useState('Todo');

  // Edit Modal State
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTeam, setEditTeam] = useState("Marketing Team's");
  const [editStatus, setEditStatus] = useState('Todo');

  const filteredTasks = tasks.filter(t => filterTeam === 'All' || t.team === filterTeam);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      id: Date.now().toString(),
      title: newTitle.trim(),
      team: newTeam,
      status: newStatus,
      date: new Date().toISOString().split('T')[0]
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleEditOpen = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditTeam(task.team);
    setEditStatus(task.status);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;
    if (onEditTask) {
      onEditTask(editingTask.id, {
        title: editTitle.trim(),
        team: editTeam,
        status: editStatus
      });
    } else {
      onUpdateStatus(editingTask.id, editStatus);
    }
    setEditingTask(null);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tasks Management</h1>
          <p className="text-xs text-gray-500 font-medium">Track, create, and edit team work progress in real-time</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterTeam('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterTeam === 'All' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All Teams ({tasks.length})
        </button>
        {teams.map(t => (
          <button
            key={t.id}
            onClick={() => setFilterTeam(t.name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTeam === t.name ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Tasks Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Task Title</th>
                <th className="p-4">Assigned Team</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{t.title}</td>
                    <td className="p-4 text-gray-600">{t.team}</td>
                    <td className="p-4">
                      <select
                        value={t.status}
                        onChange={(e) => onUpdateStatus(t.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border outline-none cursor-pointer ${getStatusBadge(t.status)}`}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-400 font-mono text-[11px]">{t.date}</td>
                    <td className="p-4 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditOpen(t)}
                        className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No tasks found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Create New Task</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Redesign Navigation Bar"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Team</label>
                <select
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Edit Task</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Team</label>
                <select
                  value={editTeam}
                  onChange={(e) => setEditTeam(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black font-semibold"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black font-semibold"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
