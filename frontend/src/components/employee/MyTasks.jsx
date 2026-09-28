import React, { useState } from 'react';
import { CheckCircle, Clock, Calendar, MessageSquare, Paperclip, X, Plus, Edit2, Trash2 } from 'lucide-react';

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Complete monthly report',
    due: 'Today',
    priority: 'High',
    status: 'In Progress',
    assignedBy: 'Sarah Johnson',
    description: 'Prepare the September performance report and upload the final version.',
    project: 'Q3 Operations',
    comments: [{ author: 'Sarah', text: 'Please have this ready before 4 PM.' }],
    attachments: ['September-data.xlsx']
  },
  {
    id: 2,
    title: 'Update client presentation',
    due: 'Today',
    priority: 'Medium',
    status: 'To Do',
    assignedBy: 'David Lee',
    description: 'Update the slides for the Acme Corp pitch tomorrow morning.',
    project: 'Client Acquisition',
    comments: [],
    attachments: ['Acme-Pitch-Draft.pptx']
  },
  {
    id: 3,
    title: 'Review design feedback',
    due: 'Sep 21',
    priority: 'Low',
    status: 'To Do',
    assignedBy: 'UX Team',
    description: 'Review the latest Figma comments on the new dashboard layout.',
    project: 'V2 App Design',
    comments: [],
    attachments: []
  }
];

export default function MyTasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({ title: '', due: '', priority: 'Medium', description: '' });

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const dueToday = pendingTasks.filter(t => t.due === 'Today').length;

  const handleComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'Completed' } : t));
    if (selectedTask?.id === id) {
      setSelectedTask({ ...selectedTask, status: 'Completed' });
    }
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
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

  const handleSaveTask = () => {
    if (modalMode === 'create') {
      const newTask = {
        id: Date.now(),
        title: formData.title || 'New Task',
        due: formData.due || 'Upcoming',
        priority: formData.priority,
        status: 'To Do',
        assignedBy: 'Self',
        description: formData.description,
        project: 'Personal',
        comments: [],
        attachments: []
      };
      setTasks([...tasks, newTask]);
    } else {
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, ...formData } : t));
      setSelectedTask({ ...selectedTask, ...formData });
    }
    setIsModalOpen(false);
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

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      
      {/* Main Task List */}
      <div className={`flex-1 flex flex-col overflow-y-auto px-8 py-8 custom-scrollbar transition-all ${selectedTask ? 'mr-96' : ''}`}>
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827]">My Tasks</h1>
            <p className="text-gray-500 font-medium mt-1">Manage and track your assigned work.</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#111827] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#1f2937] flex items-center gap-2"
          >
            <Plus size={18} /> New Task
          </button>
        </div>

        {/* Today Summary */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 mb-8 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-indigo-900 mb-1">Today</h2>
            <p className="text-indigo-700 font-medium">You have <span className="font-extrabold">{dueToday} tasks</span> due today.</p>
          </div>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle size={28} className="text-indigo-500" />
          </div>
        </div>

        {/* Task Table */}
        <div className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Task</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Due</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
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
      </div>

      {/* Slide-out Detail Panel */}
      {selectedTask && (
        <div className="w-96 bg-white border-l border-gray-200 shadow-2xl flex flex-col fixed right-0 top-0 bottom-0 z-20 animate-fade-in">
          
          <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
            <div>
              <h2 className="text-xl font-extrabold text-[#111827] pr-8">{selectedTask.title}</h2>
              <p className="text-sm font-bold text-gray-500 mt-2">Assigned by: <span className="text-gray-900">{selectedTask.assignedBy}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEditModal(selectedTask)} className="p-2 bg-white rounded-full text-blue-500 hover:text-blue-700 shadow-sm border border-gray-200 transition-colors" title="Edit">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(selectedTask.id)} className="p-2 bg-white rounded-full text-red-500 hover:text-red-700 shadow-sm border border-gray-200 transition-colors" title="Delete">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setSelectedTask(null)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-800 shadow-sm border border-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Due Date</p>
                <p className="font-bold text-[#111827] flex items-center gap-2"><Calendar size={14} className="text-gray-400" /> {selectedTask.due}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Priority</p>
                <p className="font-bold text-[#111827] flex items-center gap-2">{getPriorityDot(selectedTask.priority)} {selectedTask.priority}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">{selectedTask.description}</p>
            </div>

            {selectedTask.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Attachments</h3>
                <div className="space-y-2">
                  {selectedTask.attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <Paperclip size={16} className="text-[#4f46e5]" />
                      <span className="text-sm font-medium text-[#111827]">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTask.comments.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Comments</h3>
                <div className="space-y-4">
                  {selectedTask.comments.map((comment, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                        {comment.author[0]}
                      </div>
                      <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-800">
                        <span className="font-bold block mb-1">{comment.author}</span>
                        {comment.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="p-6 border-t border-gray-200 bg-white">
            <button 
              disabled={selectedTask.status === 'Completed'}
              onClick={() => handleComplete(selectedTask.id)}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md
                ${selectedTask.status === 'Completed' 
                  ? 'bg-green-100 text-green-700 cursor-not-allowed opacity-80' 
                  : 'bg-[#4f46e5] text-white hover:bg-[#4338ca]'}
              `}
            >
              <CheckCircle size={18} />
              {selectedTask.status === 'Completed' ? 'Completed' : 'Mark as Complete'}
            </button>
          </div>

        </div>
      )}

      {/* Task Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-xl font-extrabold text-[#111827] mb-6">
              {modalMode === 'create' ? 'Create New Task' : 'Edit Task'}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Task Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-indigo-500" 
                  placeholder="What needs to be done?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
                  <input 
                    type="text" 
                    value={formData.due}
                    onChange={(e) => setFormData({...formData, due: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-indigo-500" 
                    placeholder="e.g. Today, Sep 21"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-indigo-500"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  rows="3" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-indigo-500 resize-none" 
                  placeholder="Task details..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveTask} className="flex-1 py-3 bg-[#4f46e5] text-white rounded-xl font-bold hover:bg-[#4338ca] transition-colors">
                {modalMode === 'create' ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
