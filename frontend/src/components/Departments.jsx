import React, { useState, useEffect } from 'react';
import { Building, Users, MoreHorizontal, Plus, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Departments() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    description: '',
    color: 'bg-[#e0e7ff]',
    text_color: 'text-[#4f46e5]'
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (e, id) => {
    e.stopPropagation(); // prevent navigation
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      alert("Failed to delete department");
    }
  };

  const [formError, setFormError] = useState('');

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/departments', formData);
      setIsModalOpen(false);
      setFormData({ name: '', code: '', location: '', description: '', color: 'bg-[#e0e7ff]', text_color: 'text-[#4f46e5]' });
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error || "Failed to create department");
    }
  };

  const colors = [
    { bg: 'bg-[#e0e7ff]', text: 'text-[#4f46e5]' },
    { bg: 'bg-[#fce7f3]', text: 'text-[#db2777]' },
    { bg: 'bg-[#dcfce7]', text: 'text-[#16a34a]' },
    { bg: 'bg-[#ffedd5]', text: 'text-[#ea580c]' },
    { bg: 'bg-[#f3e8ff]', text: 'text-[#9333ea]' }
  ];

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-6 max-w-[1600px] mx-auto">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Departments</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage company structure, teams, and assignments.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#333333] transition flex items-center gap-2">
            <Plus size={18} /> Add Department
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-[#8b8cf8] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((d) => (
              <div 
                key={d.id} 
                onClick={() => navigate(`/admin/departments/${d.id}`)}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col transition hover:shadow-md cursor-pointer relative group"
              >
                {/* Overflow Menu */}
                <div className="absolute top-6 right-6 flex gap-2">
                  <div className="relative group/menu">
                    <button onClick={(e) => e.stopPropagation()} className="p-1 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition">
                      <MoreHorizontal size={20} />
                    </button>
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 hidden group-hover/menu:block z-10">
                      <button onClick={(e) => { e.stopPropagation(); /* edit logic */ }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Edit Department</button>
                      <button onClick={(e) => deleteDepartment(e, d.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete Department</button>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-2xl ${d.color || 'bg-[#e0e7ff]'} ${d.text_color || 'text-[#4f46e5]'}`}>
                      <Building size={20} />
                    </div>
                    <h3 className="font-extrabold text-lg text-[#1e293b]">{d.name}</h3>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">Manager</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-[10px] font-bold">
                      {d.manager_first_name ? d.manager_first_name.charAt(0) : '?'}
                    </div>
                    <span className="font-bold text-sm text-[#1e293b]">
                      {d.manager_first_name ? `${d.manager_first_name} ${d.manager_last_name}` : 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-auto">
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                    <Users size={14} />
                    <span className="font-bold text-xs">{d.employee_count} Employees</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100">
                    <Users2 size={14} />
                    <span className="font-bold text-xs">{d.team_count} Teams</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-extrabold text-[#1e293b] mb-6">Create New Department</h2>
            
            {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold">{formError}</div>}

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Department Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none" placeholder="e.g. Engineering" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Code</label>
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none" placeholder="e.g. ENG-001" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none" placeholder="e.g. Cairo Office" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none min-h-[80px]" placeholder="Brief description of the department's role..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Theme Color</label>
                <div className="flex gap-3">
                  {colors.map((c, i) => (
                    <button type="button" key={i} onClick={() => setFormData({...formData, color: c.bg, text_color: c.text})} className={`w-8 h-8 rounded-full ${c.bg} border-2 ${formData.color === c.bg ? 'border-gray-800' : 'border-transparent'}`} />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#4f46e5] text-white font-bold rounded-xl shadow-sm hover:bg-[#4338ca] transition">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;
