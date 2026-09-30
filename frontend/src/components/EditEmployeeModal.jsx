import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api';
import TasksList from './TasksList';

function EditEmployeeModal({ isOpen, onClose, onSuccess, initialData }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '', position: '', department: '', status: 'Active', salary: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        firstName: initialData.first_name || '',
        lastName: initialData.last_name || '',
        email: initialData.email || '',
        phoneNumber: initialData.phone_number || '',
        position: initialData.position || '',
        department: initialData.department || '',
        status: initialData.status || 'Active',
        salary: initialData.salary || ''
      });
      setError('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        position: formData.position,
        department: formData.department,
        status: formData.status,
        salary: formData.salary
      };
      
      await api.put(`/employees/${initialData.id}`, payload);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Failed to update employee details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-8 bg-white border-b border-gray-100 pb-0">
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold text-[#1e293b] tracking-tight mb-6">Edit Employee</h2>
            <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                Profile Details
              </button>
              <button 
                onClick={() => setActiveTab('tasks')} 
                className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'tasks' ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                Tasks
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition cursor-pointer self-start">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {activeTab === 'profile' ? (
          <>
            <div className="p-8 overflow-y-auto">
              {error && <div className="text-red-500 mb-6 text-sm font-bold bg-red-50 py-3 px-4 rounded-xl border border-red-100">{error}</div>}
              
              <form id="editForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                    <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-gray-200 focus:bg-white font-bold transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                    <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-gray-200 focus:bg-white font-bold transition" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-gray-200 focus:bg-white font-bold transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input type="text" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-gray-200 focus:bg-white font-bold transition" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Department</label>
                    <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-gray-200 focus:bg-white font-bold transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Position</label>
                    <input required type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-gray-200 focus:bg-white font-bold transition" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Salary (Annual)</label>
                    <input required type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-gray-200 focus:bg-white font-bold transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-gray-200 focus:bg-white font-bold transition appearance-none">
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-8 bg-gray-50 flex justify-end gap-4 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-8 py-4 font-bold text-gray-500 hover:text-black transition">
                Cancel
              </button>
              <button form="editForm" type="submit" disabled={saving} className="px-10 py-4 bg-[#1e293b] text-white font-extrabold rounded-2xl shadow-lg hover:bg-black transition cursor-pointer disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 overflow-y-auto min-h-[500px] flex flex-col relative bg-gray-50/50">
            {initialData?.id && (
              <TasksList employeeId={initialData.id} isAdmin={true} employeeName={initialData.first_name} />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default EditEmployeeModal;
