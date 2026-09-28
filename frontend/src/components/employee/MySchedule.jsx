import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video, Plus, Edit2, Trash2, X } from 'lucide-react';

const INITIAL_SCHEDULE_TODAY = [
  { id: 1, time: '9:00 AM – 10:00 AM', title: 'Team Meeting', subtitle: 'Engineering', type: 'internal' },
  { id: 2, time: '11:30 AM – 12:00 PM', title: '1:1 with Manager', subtitle: 'Conference Room B', type: 'meeting' },
  { id: 3, time: '2:00 PM – 3:30 PM', title: 'Project Review', subtitle: 'Main Office', type: 'internal' }
];

const SCHEDULE_UPCOMING = [
  { date: 'Tomorrow 9:00 AM', title: 'Team Meeting', icon: Users },
  { date: 'Sep 23, 2:00 PM', title: 'Client Presentation', icon: Video },
  { date: 'Sep 25 – Sep 29', title: 'Vacation', icon: CalendarIcon }
];

const COMPANY_CALENDAR = [
  { date: 'Oct 6, 2026', title: 'Company Holiday (Armed Forces Day)' },
  { date: 'Oct 15, 2026', title: 'Q3 All-Hands Meeting' },
  { date: 'Nov 1, 2026', title: 'Engineering Workshop' },
  { date: 'Dec 15, 2026', title: 'End of Year Team Building Event' }
];

export default function MySchedule() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [todayEvents, setTodayEvents] = useState(INITIAL_SCHEDULE_TODAY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', time: '', subtitle: '' });

  const handleOpenCreate = () => {
    setFormData({ title: '', time: '', subtitle: '' });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setFormData({ title: event.title, time: event.time, subtitle: event.subtitle });
    setEditingId(event.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setTodayEvents(todayEvents.filter(e => e.id !== id));
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newEvent = {
        id: Date.now(),
        title: formData.title || 'New Event',
        time: formData.time || '12:00 PM',
        subtitle: formData.subtitle || '',
        type: 'internal'
      };
      setTodayEvents([...todayEvents, newEvent]);
    } else {
      setTodayEvents(todayEvents.map(e => e.id === editingId ? { ...e, ...formData } : e));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-8 custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827]">My Schedule</h1>
            <p className="text-gray-500 font-medium mt-1">What am I supposed to do and when?</p>
          </div>
          {activeTab === 'schedule' && (
            <button onClick={handleOpenCreate} className="px-5 py-2.5 bg-[#111827] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#1f2937] flex items-center gap-2">
              <Plus size={18} /> Add Event
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`pb-4 font-bold text-sm px-2 border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            My Schedule
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`pb-4 font-bold text-sm px-2 border-b-2 transition-colors ${activeTab === 'company' ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Company Calendar
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'schedule' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            
            {/* Today's Agenda */}
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                <Clock size={20} className="text-gray-400" /> Today's Agenda
              </h2>
              
              <div className="relative border-l-2 border-indigo-100 pl-6 pb-2 space-y-8">
                {todayEvents.map((item, idx) => (
                  <div key={item.id} className="relative group">
                    <div className={`absolute -left-[31px] w-3 h-3 rounded-full ring-4 ring-white ${idx === 1 ? 'bg-[#4f46e5]' : 'bg-gray-300'}`}></div>
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-bold mb-1 ${idx === 1 ? 'text-[#4f46e5]' : 'text-gray-500'}`}>{item.time}</p>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button onClick={() => handleOpenEdit(item)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 size={14}/></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl mt-1">
                      <p className="font-bold text-[#111827]">{item.title}</p>
                      <p className="text-sm font-medium text-gray-500">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-indigo-50/50 border border-indigo-50 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                <CalendarIcon size={20} className="text-indigo-400" /> Upcoming
              </h2>
              
              <div className="space-y-4">
                {SCHEDULE_UPCOMING.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 shrink-0">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-[#111827] text-[15px]">{item.title}</p>
                        <p className="text-sm font-bold text-indigo-500 mt-0.5">{item.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="max-w-3xl animate-fade-in">
            <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="p-8 bg-gray-50 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-[#111827]">Company Events & Holidays</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Company-wide events, holidays, meetings, and training.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {COMPANY_CALENDAR.map((event, idx) => (
                  <div key={idx} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl shrink-0">
                      <span className="text-xs font-bold text-gray-500 uppercase">{event.date.split(' ')[0]}</span>
                      <span className="text-lg font-black text-[#111827]">{event.date.split(' ')[1].replace(',', '')}</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#111827] text-lg">{event.title}</p>
                      <p className="text-sm font-medium text-gray-500 mt-1">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-xl font-extrabold text-[#111827] mb-6">
              {modalMode === 'create' ? 'Add Event' : 'Edit Event'}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-indigo-500" 
                  placeholder="e.g. Team Standup"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                <input 
                  type="text" 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-indigo-500" 
                  placeholder="e.g. 10:00 AM - 11:00 AM"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location / Subtitle</label>
                <input 
                  type="text" 
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-indigo-500" 
                  placeholder="e.g. Conference Room A"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-3 bg-[#4f46e5] text-white rounded-xl font-bold hover:bg-[#4338ca] transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
