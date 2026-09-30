import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, MoreHorizontal, Mail, DollarSign, Clock, Briefcase } from 'lucide-react';
import api from '../api';
import EmployeeProfileSlideOver from './EmployeeProfileSlideOver';

function EmployeeList({ refreshTrigger, searchQuery, departmentFilter, statusFilter, onStatusClick, viewMode, onEmployeesLoaded, onEditEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
      if (onEmployeesLoaded) onEmployeesLoaded(response.data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
        setSelectedEmployeeIds(prev => prev.filter(empId => empId !== id));
      } catch (error) {
        console.error('Failed to delete', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedEmployeeIds.length} employees?`)) {
      try {
        await Promise.all(selectedEmployeeIds.map(id => api.delete(`/employees/${id}`)));
        fetchEmployees();
        setSelectedEmployeeIds([]);
      } catch (error) {
        console.error('Failed to delete employees', error);
        alert('Failed to delete some employees.');
      }
    }
  };

  const openProfile = (emp) => {
    setSelectedEmployee(emp);
    setIsSlideOverOpen(true);
    setActionMenuOpenId(null);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery?.toLowerCase() || '') || 
                          emp.email.toLowerCase().includes(searchQuery?.toLowerCase() || '');
    const matchesDept = departmentFilter ? emp.department === departmentFilter : true;
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (status === 'Active') return 'bg-[#dcfce7] text-[#16a34a]';
    if (status === 'On Leave') return 'bg-[#ffedd5] text-[#ea580c]';
    return 'bg-[#fee2e2] text-[#dc2626]';
  };
  
  const getStatusDot = (status) => {
    if (status === 'Active') return 'bg-[#16a34a]';
    if (status === 'On Leave') return 'bg-[#ea580c]';
    return 'bg-[#dc2626]';
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployeeIds(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  const toggleSelectEmployee = (id) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
  };

  if (viewMode === 'list') {
    return (
      <>
        {selectedEmployeeIds.length > 0 && (
          <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between z-20">
            <span className="text-sm font-bold text-gray-700">{selectedEmployeeIds.length} selected</span>
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition cursor-pointer"
            >
              <Trash2 size={16} /> Delete Selected
            </button>
          </div>
        )}
        <div className="overflow-x-auto h-full rounded-3xl">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <tr className="border-b border-gray-100 text-[10px] uppercase font-extrabold tracking-widest text-gray-400">
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll}
                    checked={filteredEmployees.length > 0 && selectedEmployeeIds.length === filteredEmployees.length}
                    className="rounded border-gray-300 text-[#4f46e5] focus:ring-[#4f46e5] cursor-pointer" 
                  />
                </th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#f8f9fc] transition cursor-pointer group" onClick={() => openProfile(emp)}>
                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedEmployeeIds.includes(emp.id)}
                      onChange={() => toggleSelectEmployee(emp.id)}
                      className="rounded border-gray-300 text-[#4f46e5] focus:ring-[#4f46e5] cursor-pointer" 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#f3e8ff] flex items-center justify-center text-[#9333ea] font-extrabold text-sm shadow-sm">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[#1e293b] group-hover:text-[#8b8cf8] transition">{emp.first_name} {emp.last_name}</span>
                        <span className="text-xs font-bold text-gray-400">{emp.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-700">{emp.position}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-500">{emp.department}</span>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); if (onStatusClick) onStatusClick(emp.status); }}>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 transition ${getStatusColor(emp.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(emp.status)}`}></span> {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-500">{new Date(emp.hire_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </td>
                  <td className="px-6 py-4 text-right relative" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => setActionMenuOpenId(actionMenuOpenId === emp.id ? null : emp.id)}
                      className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {actionMenuOpenId === emp.id && (
                      <div className="absolute right-8 top-10 bg-white border border-gray-100 rounded-2xl shadow-xl w-48 py-2 z-20 flex flex-col items-start overflow-hidden">
                        <button onClick={() => openProfile(emp)} className="w-full text-left px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#8b8cf8] transition cursor-pointer">View Profile</button>
                        <button onClick={() => onEditEmployee(emp)} className="w-full text-left px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#8b8cf8] transition cursor-pointer">Edit Employee</button>
                        <div className="border-t border-gray-100 w-full"></div>
                        <button onClick={() => handleDelete(emp.id)} className="w-full text-left px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition cursor-pointer">Delete Employee</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EmployeeProfileSlideOver isOpen={isSlideOverOpen} onClose={() => setIsSlideOverOpen(false)} employee={selectedEmployee} onEditEmployee={onEditEmployee} />
      </>
    );
  }

  // CARD VIEW
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 h-full overflow-y-auto bg-transparent">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md cursor-pointer group hover:-translate-y-1" onClick={() => openProfile(emp)}>
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#f3e8ff] flex items-center justify-center text-[#9333ea] font-extrabold text-lg shadow-sm">
                  {emp.first_name[0]}{emp.last_name[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#1e293b] group-hover:text-[#8b8cf8] transition leading-tight">
                    {emp.first_name} {emp.last_name}
                  </h3>
                  <p className="text-xs font-bold text-gray-400">{emp.position}</p>
                </div>
              </div>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setActionMenuOpenId(actionMenuOpenId === emp.id ? null : emp.id)}
                  className="text-gray-400 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-50 cursor-pointer"
                >
                  <MoreHorizontal size={20} />
                </button>
                {actionMenuOpenId === emp.id && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-2xl shadow-xl w-40 py-2 z-20 flex flex-col items-start overflow-hidden">
                    <button onClick={() => openProfile(emp)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition">View Profile</button>
                    <button onClick={() => onEditEmployee(emp)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition">Edit</button>
                    <button onClick={() => handleDelete(emp.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 cursor-pointer transition">Delete</button>
                  </div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2 mb-6">
              <span className="bg-[#f8f9fc] text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{emp.department}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(emp.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(emp.status)}`}></span> {emp.status}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-[#f8f9fc] rounded-2xl p-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Salary</span>
                <span className="text-sm font-bold text-[#1e293b]">${emp.salary.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Joined</span>
                <span className="text-sm font-bold text-[#1e293b]">{new Date(emp.hire_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
              </div>
            </div>
            
            <div className="mt-auto pt-2 text-xs font-bold text-gray-400 flex items-center gap-2">
              <Mail size={14} className="text-gray-300" /> {emp.email}
            </div>
          </div>
        ))}
      </div>
      <EmployeeProfileSlideOver isOpen={isSlideOverOpen} onClose={() => setIsSlideOverOpen(false)} employee={selectedEmployee} onEditEmployee={onEditEmployee} />
    </>
  );
}

export default EmployeeList;
