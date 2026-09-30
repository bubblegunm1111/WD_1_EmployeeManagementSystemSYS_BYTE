import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, Paperclip, X, Plus, Edit2, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function TasksList({ employeeId, isAdmin, employeeName }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ title: '', due: '', priority: 'Medium', description: '' });
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!employeeId) return;
    try {
      const res = await api.get(`/tasks/${employeeId}`);
      setTasks(res.data);
      if (selectedTask) {
        const updatedSelected = res.data.find(t => t.id === selectedTask.id);
        if (updatedSelected) setSelectedTask(updatedSelected);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [employeeId]);

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const dueToday = pendingTasks.filter(t => t.due === 'Today' || t.due === new Date().toISOString().split('T')[0]).length;

  const handleComplete = async (id) => {
    try {
      await api.put(`/tasks/${id}`, { status: 'Completed' });
      toast.success('Task marked as completed');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      if (selectedTask?.id === id) setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const openCreateModal = () => {
    setFormData({ title: '', due: '', priority: 'Medium', description: '' });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setFormData({ title: task.title, due: task.due, priority: task.priority, description: task.description });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    try {
      if (modalMode === 'create') {
        await api.post('/tasks', {
          employee_id: employeeId,
          ...formData,
          assigned_by: isAdmin ? 'Admin' : 'Self',
          project: 'General'
        });
        toast.success('Task created successfully');
      } else {
        await api.put(`/tasks/${selectedTask.id}`, {
          ...selectedTask,
          ...formData
        });
        toast.success('Task updated successfully');
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to save task');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;
    try {
      await api.post(`/tasks/${selectedTask.id}/comments`, {
        author: isAdmin ? 'Admin' : employeeName || 'Employee',
        text: newComment
      });
      setNewComment('');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-500 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed') return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span>;
    if (status === 'In Progress') return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">In Progress</span>;
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">To Do</span>;
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center p-8 text-gray-500 font-bold">Loading tasks...</div>;
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* Header & Today Summary */}
      {!isAdmin && (
        <>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#111827]">My Tasks</h1>
              <p className="text-gray-500 font-medium mt-1">Manage and track your assigned work.</p>
            </div>
            <button onClick={openCreateModal} className="px-5 py-2.5 bg-[#111827] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#1f2937] flex items-center gap-2">
              <Plus size={18} /> New Task
            </button>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 mb-8 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-indigo-900 mb-1">Today</h2>
              <p className="text-indigo-700 font-medium">You have <span className="font-extrabold">{dueToday} tasks</span> due today.</p>
            </div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle size={28} className="text-indigo-500" />
            </div>
          </div>
        </>
      )}

      {isAdmin && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-extrabold text-gray-900">Assigned Tasks</h3>
          <button onClick={openCreateModal} className="px-4 py-2 bg-[#4f46e5] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#4338ca] flex items-center gap-2">
            <Plus size={16} /> Assign Task
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task Table */}
        <div className="flex-1 overflow-y-auto p-6 transition-all duration-300">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
                <CheckCircle size={32} className="text-gray-300" />
              </div>
              <h3 className="text-[#111827] font-extrabold text-xl mb-2">No tasks right now</h3>
              <p className="text-gray-500 font-medium max-w-sm">
                {isAdmin ? "Assign a task to this employee to get them started." : "You're all caught up! Enjoy your free time."}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#fcfcfc] border-b border-gray-200 text-[10px] font-extrabold text-gray-500 tracking-widest uppercase">
                    <th className="py-4 px-6">Task</th>
                    <th className="py-4 px-6">Due</th>
                    <th className="py-4 px-6">Priority</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map(task => (
                    <tr 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedTask?.id === task.id ? 'bg-indigo-50/50' : ''}`}
                    >
                      <td className="py-4 px-6">
                        <p className={`font-bold text-[15px] ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-[#111827]'}`}>
                          {task.title}
                        </p>
                      </td>
                      <td className="py-4 px-6 font-medium text-sm text-gray-600">
                        {task.due === 'Today' ? <span className="text-red-500 font-bold">Today</span> : task.due}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                          {getPriorityDot(task.priority)} {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(task.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Slide-out Detail Panel */}
        {selectedTask && (
          <div className={`${isAdmin ? 'w-80' : 'w-96'} flex-shrink-0 bg-white border-l border-gray-200 shadow-2xl flex flex-col z-20 animate-fade-in`}>
          
          <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
            <div>
              <h2 className="text-lg font-extrabold text-[#111827] pr-6">{selectedTask.title}</h2>
              <p className="text-xs font-bold text-gray-500 mt-1">Assigned by: <span className="text-gray-900">{selectedTask.assigned_by}</span></p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEditModal(selectedTask)} className="p-1.5 bg-white rounded-full text-blue-500 hover:text-blue-700 shadow-sm border border-gray-200 transition-colors" title="Edit">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(selectedTask.id)} className="p-1.5 bg-white rounded-full text-red-500 hover:text-red-700 shadow-sm border border-gray-200 transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 bg-white rounded-full text-gray-400 hover:text-gray-800 shadow-sm border border-gray-200 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Due Date</p>
                <p className="font-bold text-sm text-[#111827] flex items-center gap-1.5"><Calendar size={12} className="text-gray-400" /> {selectedTask.due}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Priority</p>
                <p className="font-bold text-sm text-[#111827] flex items-center gap-1.5">{getPriorityDot(selectedTask.priority)} {selectedTask.priority}</p>
              </div>
            </div>

            {selectedTask.description && (
              <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-700 text-sm leading-relaxed bg-blue-50/30 p-3 rounded-xl border border-blue-100/50">{selectedTask.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Comments</h3>
              <div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedTask.comments?.length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium italic">No comments yet.</p>
                ) : (
                  selectedTask.comments?.map((comment) => (
                    <div key={comment.id} className={`flex flex-col ${comment.author === 'Admin' && !isAdmin ? 'items-start' : (comment.author === 'Admin' && isAdmin ? 'items-end' : (isAdmin ? 'items-start' : 'items-end'))}`}>
                      <span className="text-[10px] font-bold text-gray-400 mb-0.5 mx-1">{comment.author}</span>
                      <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] ${
                          (comment.author === 'Admin' && isAdmin) || (comment.author !== 'Admin' && !isAdmin)
                            ? 'bg-[#4f46e5] text-white rounded-tr-sm'
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        }`}>
                        {comment.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b8cf8]"
                />
                <button onClick={handleAddComment} className="p-2 bg-[#111827] text-white rounded-full hover:bg-black transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </div>

          </div>

          <div className="p-5 border-t border-gray-200 bg-white">
            <button 
              disabled={selectedTask.status === 'Completed'}
              onClick={() => handleComplete(selectedTask.id)}
              className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm text-sm
                ${selectedTask.status === 'Completed' 
                  ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                  : 'bg-[#1e293b] text-white hover:bg-black'}
              `}
            >
              <CheckCircle size={16} />
              {selectedTask.status === 'Completed' ? 'Completed' : 'Mark as Complete'}
            </button>
          </div>

        </div>
      )}
      
      </div>

      {/* Task Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-[#111827]">
                {modalMode === 'create' ? 'New Task' : 'Edit Task'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Task Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 outline-none focus:border-gray-200 focus:bg-white transition" 
                  placeholder="What needs to be done?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Due Date</label>
                  <input 
                    type="text" 
                    value={formData.due}
                    onChange={(e) => setFormData({...formData, due: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-900 outline-none focus:border-gray-200 focus:bg-white transition" 
                    placeholder="e.g. Today, Sep 21"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-bold text-gray-700 outline-none focus:border-gray-200 focus:bg-white transition appearance-none"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  rows="3" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-medium text-gray-900 outline-none focus:border-gray-200 focus:bg-white transition resize-none" 
                  placeholder="Task details..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-white text-gray-600 font-bold hover:text-black transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveTask} className="px-8 py-3 bg-[#4f46e5] text-white rounded-xl font-bold shadow-md hover:bg-[#4338ca] transition-colors">
                {modalMode === 'create' ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
